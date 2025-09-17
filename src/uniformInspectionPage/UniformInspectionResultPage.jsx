import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styles from './uniformInspectionResultPage.module.scss'
import { db } from '../firebase'
import { getDoc, collection, query, orderBy, getDocs, doc, where } from '@firebase/firestore'
import Loading from '../general/Loading'

// To facilitate uniform inspection by officers / primers
const UniformInspectionResultPage = () => {
	const [components, setComponents] = useState([]);
	const [currentInspection, setCurrentInspection] = useState()
	const [inspections, setInspections] = useState([]);
	const [loading, setLoading] = useState(true);
	const [boy, setBoy] = useState();
	const { id } = useParams()

	console.log(styles)

	useEffect(() => {
		const init = async () => {
			const componentsSnap = await getDocs(query(collection(db, "uniform_categories"), orderBy("order")));
			const components = componentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
			setComponents(components);

			const usersDoc = await getDoc(doc(db, "users", id));
			setBoy(usersDoc.data().account_name);

			const inspections = await getDocs(query(collection(db, "uniform_inspections"), where("boy", "==", doc(db, "users", id)), orderBy("assessed_date", "desc")));
			const inspectionsList = await Promise.all(
				inspections.docs.map(async d => {
					const data = d.data();
					const assessorSnap = await getDoc(data.assessor); // ✅ await works here

					return {
						...data,
						id: d.id,
						assessed_date: data.assessed_date.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
						assessor: { id: assessorSnap.id, ...assessorSnap.data() }
					};
				})
			);

			setInspections(inspectionsList);
			setLoading(false);
		}

		init();
	}, [])

	const selectInspection = (e) => {
		const inspectionId = e.target.value;
		const obj = inspections.find(item => item.id === inspectionId);
		setCurrentInspection(obj);
	}

	if (loading) return <Loading />

	return (
		<div className={styles['uniform-inspection-result-page']}>
			<h2>Past Inspection Results</h2>

			<div>
				<div>
					<label htmlFor='inspection-select'>Viewing Results of {boy} on:</label>
					<select id='inspection-select' onChange={selectInspection} defaultValue={""}>
						<option value='' disabled hidden>Select Date</option>
						{inspections.map(inspection => <option key={inspection.id} value={inspection.id}>{inspection.assessed_date}</option>)}
					</select>
				</div>

				<div>
					{currentInspection != null && <>
						<p>Assessor: {currentInspection.assessor?.rank} {currentInspection.assessor?.account_name}</p>
						<p>Score: {currentInspection.score}</p>
					</>}
				</div>
			</div>

			{currentInspection != null && components.map(component => (
				<div key={component.id}>
					<h3>{component.component_name}</h3>
					<ul>
						{component.components_fields.map((field, index) => (
							<li key={`${component.id}-field${index}`}>
								<input type='checkbox' disabled className={`${component.id}-field-selector ${field.field_description.toLowerCase().includes("missing") ? styles["field-missing"] : ""}`} id={`${component.id}-field${index}`} checked={currentInspection.fields.includes(`${component.id}-field${index}`)}></input>
								<label htmlFor={`${component.id}-field${index}`}>{field.field_description}</label>
							</li>
						))}
					</ul>
					<textarea name={`${component.component_name}-remarks`} value={currentInspection.remarks[component.id] ?? 'No Remarks Given'} disabled></textarea>
				</div>
			))}
		</div>
	)
}

export default UniformInspectionResultPage
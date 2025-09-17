import { Fragment, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { showMessage } from '../general/handleServerError'
import { where, collection, getDocs, query, orderBy, doc, Timestamp, writeBatch } from '@firebase/firestore'
import { db } from '../firebase'
import Loading from '../general/Loading'
import styles from './uniformInspectionForm.module.scss'
import { getAuth, onAuthStateChanged } from "@firebase/auth";

// To facilitate uniform inspection by Officers / Primers
const UniformInspectionForm = () => {
	const navigate = useNavigate();
	const auth = getAuth();
	const [boyAccounts, setBoyAccounts] = useState([]); 			// All Boys
	const [boys, setBoys] = useState([]); 							// Selected Boys
	const [components, setComponents] = useState([]);				// Sections
	const [selectedContents, setSelectedContents] = useState({});	// Checked Fields Per Section Per Boy
	const [currentForm, setCurrentForm] = useState();				// Selected Boy ID else undefined
	const [sectionCollapse, setSectionCollapse] = useState(false)   // Name List Section Collapse State
	const [remarks, setRemarks] = useState({})						// Remarks Per Section Per Boy

	const [loading, setLoading] = useState(true);
	const [uid, setUid] = useState(null);

	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			if (user) setUid(user.uid)
		});

		const init = async () => {
			try {
				const componentsSnap = await getDocs(query(collection(db, "uniform_categories"), orderBy("order")));
				const components = componentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
				console.log(components);
				setComponents(components);

				const usersSnap = await getDocs(query(collection(db, "users"), where("account_type", "==", "Boy")));
				const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
				setBoyAccounts(users);

				setLoading(false);
			} catch (err) {
				console.error(err)
				showMessage("Failed to get awards")
			}
		}

		init();
	}, [])

	function selectBoy(e) {
		const id = e.target.id;
		const isChecked = e.target.checked;

		setBoys(prev => {
			let updated;
			if (isChecked) {
				updated = [...prev, boyAccounts.find(boy => boy.id === id)];
			} else {
				updated = prev.filter(boy => boy.id !== id);
			}

			const accounts = updated.map(account => account.id);

			setSelectedContents(prevContents => {
				const updatedContents = { ...prevContents };
				accounts.forEach(accountId => {
					if (!updatedContents[accountId]) updatedContents[accountId] = [];
				});
				return updatedContents;
			});

			return updated;
		});
	}


	function selectField(e) {
		setSelectedContents(prev => {
			const updated = { ...prev };
			const id = e.target.id;
			const arr = updated[currentForm] ? [...updated[currentForm]] : [];
			updated[currentForm] = arr.includes(id) ? arr.filter(item => item !== id) : [...arr, id];
			return updated;
		})
	}

	async function submitInspection(e) {
		try {
			e.preventDefault()

			const confirmed = window.confirm("Are you sure you have finished inspecting? Ensure that all boys selected have been inspected before submission.")
			if (!confirmed) return;

			const batch = writeBatch(db);
			boys.map(boy => {
				const total = selectedContents[boy.id].reduce((sum, fieldId) => {
					const [componentId, fieldPart] = fieldId.split("-field");
					const fieldIndex = parseInt(fieldPart, 10);

					const component = components.find(c => c.id === componentId);
					const fieldScore = component?.components_fields?.[fieldIndex]?.field_score || 0;

					return sum + fieldScore;
				}, 0);

				const data = {
					boy: doc(db, "users", boy.id),
					fields: selectedContents[boy.id],
					remarks: remarks[boy.id] || [],
					score: total,
					assessed_date: Timestamp.fromDate(new Date()),
					assessor: doc(db, "users", uid)
				}

				const newInspectionRef = doc(collection(db, "uniform_inspections"));
				batch.set(newInspectionRef, data);
			})

			await batch.commit();
			showMessage("Inspection has been submitted", "success")
			navigate("/uniform_inspection")
		} catch (err) {
			console.error(err);
			showMessage("Failed to submit inspection")
		}
	}

	if (loading) return <Loading></Loading>

	return (
		<div className={styles['uniform-inspection-form']}>
			<div className={styles['form-selection']}>
				<label htmlFor='boy-selector'>Inspecting:</label>
				<select id='boy-selector' onChange={e => setCurrentForm(e.target.value)} value={currentForm ? currentForm : ''}>
					<option value='' disabled hidden>Select a boy</option>
					{boys.map(boy => <option key={boy.id} value={boy.id}>{boy.rank} {boy.account_name}</option>)}
				</select>
			</div>

			<div className={styles['page-container']}>
				<h2>Uniform Inspection</h2>
				<div>
					<p>Pick the boys to inspect:</p>
					<i className='fa-solid fa-chevron-right' onClick={() => setSectionCollapse(!sectionCollapse)} style={{ transform: !sectionCollapse ? 'rotate(90deg)' : 'rotate(0deg)' }}></i>
				</div>

				<div className={styles['boy-selector']} style={{ height: sectionCollapse ? 0 : 'max-content' }}>
					{boyAccounts.map(boyAccount => (
						<Fragment key={boyAccount.id}>
							<input type='checkbox' className={styles['boy-account-selector']} id={boyAccount.id} onChange={e => selectBoy(e)}></input>
							<label htmlFor={boyAccount.id}>
								<p>Sec {boyAccount.level} {boyAccount.rank} {boyAccount.account_name}</p>
							</label>
						</Fragment>
					))}
				</div>

				<form onSubmit={submitInspection}>
					{currentForm != null && components.map(component => (
						<div key={component.id}>
							<h3>{component.component_name}</h3>
							<ul>
								{component.components_fields.map((field, index) => (
									<li key={`${component.id}-field${index}-${currentForm}`}>
										<input type='checkbox' className={`${component.id}-field-selector ${field.field_description.toLowerCase().includes("missing") ? styles["field-missing"] : ""}`} id={`${component.id}-field${index}`} onChange={(e) => selectField(e)} defaultChecked={selectedContents[currentForm].includes(`${component.id}-field${index}`)}></input>
										<label htmlFor={`${component.id}-field${index}`}>{field.field_description}</label>
									</li>
								))}
							</ul>
							<textarea key={`${currentForm}-${component.id}`} name={`${component.component_name}-remarks`} placeholder='Remarks (Optional)' defaultValue={remarks[currentForm]?.[component.id]} onChange={(e) => setRemarks(prev => ({ ...prev, [currentForm]: { ...prev[currentForm], [component.id]: e.target.value } }))}></textarea>
						</div>
					))}
					<button>Finish Inspection</button>
				</form>
			</div>
		</div>
	)
}

export default UniformInspectionForm
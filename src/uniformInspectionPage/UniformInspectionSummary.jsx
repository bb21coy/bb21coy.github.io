import { useEffect, useState, useRef, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { showMessage } from '../general/handleServerError'
import styles from './uniformInspectionSummary.module.scss'
import Loading from '../general/Loading'
import { db } from "../firebase";
import { getDocs, collection, query, where, getDoc } from '@firebase/firestore'

// To facilitate uniform inspection by officers / primers
const UniformInspectionPage = () => {
	const navigate = useNavigate()
	const [inspections, setInspections] = useState([]);
	const [boys, setBoys] = useState([]);
	const [loading, setLoading] = useState(true);
	const search = useRef();
	const [filters, setFilters] = useState({ sec1: true, sec2: true, sec3: true, sec4: true, sec5: true })

	useEffect(() => {
		const init = async () => {
			try {
				const inspectionsSnap = await getDocs(collection(db, "uniform_inspections"));
				const inspections = await Promise.all(
					inspectionsSnap.docs.map(async d => {
						const data = d.data();
						const boySnap = await getDoc(data.boy);
						const assessorSnap = await getDoc(data.assessor);
						const formattedDate = data.assessed_date.toDate().toLocaleDateString("en-US");
						return {
							id: d.id,
							...data,
							boy: { id: boySnap.id, ...boySnap.data() },
							assessor: { id: assessorSnap.id, ...assessorSnap.data() },
							assessed_date: formattedDate
						};
					})
				);
				setInspections(inspections);

				const usersSnap = await getDocs(query(collection(db, "users"), where("account_type", "==", "Boy")));
				const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
				setBoys(users);

				setLoading(false);
			} catch (err) {
				console.error(err)
				showMessage("Failed to get awards")
			}
		}

		init();
	}, [navigate])

	function filter() {
		document.querySelectorAll(".uniform-inspection-list-table div").forEach(row => {
			const columns = Array.from(row.children).slice(1, -1)
			const matchesSearch = columns.some(col => col.textContent.toLowerCase().includes(search.current.value.toLowerCase()));
			const matchesSection = filters[row.getAttribute("data-sec")] === true
			row.style.display = matchesSearch && matchesSection ? "contents" : "none";
		})
	}

	useEffect(() => {
		filter()
	}, [filters])

	if (loading) return <Loading />

	return (
		<div className={styles['uniform-inspection-page']}>
			<div className={styles['uniform-inspection-filter']}>
				<div>
					<label htmlFor="search">
						<i className='fa-solid fa-magnifying-glass'></i>
					</label>
					<input type="search" id="search" placeholder="Search Boy" onInput={filter} ref={search} />
				</div>

				<div>
					{Array.from({ length: 5 }).map((_, i) => (
						<Fragment key={i}>
							<input type="checkbox" id={`sec${i + 1}-filter`} defaultChecked={filters[`sec${i + 1}`]} onChange={e => setFilters({ ...filters, [e.target.id.split('-')[0]]: !filters[e.target.id.split('-')[0]] })} />
							<label htmlFor={`sec${i + 1}-filter`}>Sec {i + 1}</label>
						</Fragment>
					))}
				</div>
			</div>

			<h2>Latest Uniform Inspection</h2>
			<div className={styles['uniform-inspection-list-table']}>
				<p>No.</p>
				<p>Name</p>
				<p>Score</p>
				<p>Date</p>
				<p>Assessor</p>
				<p>Records</p>

				{boys.map((boy, index) => {
					const inspection = inspections.find(inspection => inspection.boy.id === boy.id);

					return (
						<div key={boy._id || boy.account_name} data-sec={`sec${boy.level}`} id={boy.id}>
							<p>{index + 1}</p>
							<p>{boy.account_name}</p>
							<p>{inspection ? inspection.score : '-'}</p>
							<p>{inspection ? inspection.assessed_date : '-'}</p>
							<p>{inspection ? inspection.assessor.account_name : '-'}</p>
							<p aria-label="View Uniform Inspection Record">
								{inspection && <i className="fa-solid fa-up-right-from-square" onClick={() => navigate(`/view_uniform_inspection/${boy.id}`)}></i>}
							</p>
						</div>
					);
				})}
			</div>

			<button onClick={() => navigate('/uniform_inspection_form')} id={styles['conduct-inspection-button']}>Conduct Inspection</button>
		</div>
	)
}

export default UniformInspectionPage
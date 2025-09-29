import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import ParadeNoticePDF from './ParadeNoticePDF'
import ParadeAttendance from './ParadeAttendance'
import ParadeForm from './ParadeForm'
import Loading from '../general/Loading'
import { db } from '../firebase'
import { collection, getDocs, query, orderBy, doc, onSnapshot } from '@firebase/firestore'
import { useUser } from '../general/UserContext'
import styles from './paradeInformation.module.scss'

// To access attendance records and take new attendance
const ParadeInformation = ({ id }) => {
	const [loading, setLoading] = useState(true)
	const [showParadeNotice, setShowParadeNotice] = useState(true)
	const [showParadeEditor, setShowParadeEditor] = useState(false)
	const [parade, setParade] = useState({})
	const [allUsers, setAllUsers] = useState([])
	const { user } = useUser()

	useEffect(() => {
		let loading1 = false
		let loading2 = false
		const init = async () => {
			const usersSnap = await getDocs(query(collection(db, "users"), orderBy("account_name", "asc")))
			const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
			setAllUsers(usersData)		}

		const unsubscribe = onSnapshot(doc(db, "parades", id), (paradeSnap) => {
			if (paradeSnap.exists()) {
				setParade({ id: paradeSnap.id, ...paradeSnap.data() });
				loading2 = true
			}
		});

		init()
		if (loading1 && loading2) setLoading(false)
		return () => unsubscribe()
	}, [])

	function toggleParadeNotice() {
		setShowParadeEditor(false);
		setShowParadeNotice((prev) => !prev);
	}

	function toggleEditor() {
		setShowParadeNotice(false);
		setShowParadeEditor((prev) => !prev);
	}

	if (!loading) return <Loading />

	return (
		<div className={styles['parade-information']}>
			<div className={styles['button-container']}>
				<button onClick={toggleParadeNotice} name={showParadeNotice ? 'hide' : 'show'}>{showParadeNotice ? 'Hide' : 'Show'}</button>
				<button onClick={() => window.print()} name='download'>Download</button>

				{(['Admin', 'Officer', 'Primer'].includes(user.account_type) || ['CSM', 'DY CSM', 'Admin Sergeant'].includes(user.appointment)) && (
					<button onClick={toggleEditor} name='edit'>Edit</button>
				)}
			</div>

			{showParadeNotice && Object.keys(parade).length > 0 && <ParadeNoticePDF parade={parade} users={allUsers}/>}
			{showParadeEditor && <ParadeForm paradeData={parade} />}

			<ParadeAttendance parade={parade} users={allUsers} />
		</div>
	)
}

ParadeInformation.propTypes = {
	id: PropTypes.number.isRequired,
}

export default ParadeInformation
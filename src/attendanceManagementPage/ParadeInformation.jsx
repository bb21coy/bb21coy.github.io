import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import ParadeNoticePDF from './ParadeNoticePDF'
import { ParadeAttendance } from './ParadeAttendance'
import ParadeForm from './ParadeForm'
import Loading from '../general/Loading'
import { db } from '../firebase'
import { collection, getDocs, query, orderBy, doc, onSnapshot } from '@firebase/firestore'
import { useUser } from '../general/UserContext'

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
			setAllUsers(usersData)
			loading1 = true
		}

		const unsubscribe = onSnapshot(doc(db, "parades", id), (paradeSnap) => {
				if (paradeSnap.exists()) {
					setParade(paradeSnap.data());
					loading2 = true
				}
			});

		init()
		if (loading1 && loading2) setLoading(false)
		return () => unsubscribe()
	}, [])

	const groupedUsers = useMemo(() => {
		const boys = []
		const primers = []
		const officers = []

		allUsers.forEach(user => {
			if (user.account_type === "Boy") boys.push(user)
			else if (user.account_type === "Primer") primers.push(user)
			else if (user.account_type === "Officer") officers.push(user)
		})

		return { boys, primers, officers }
	}, [allUsers])

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
		<div className='parade-information'>
			<div>
				{!showParadeNotice && <button onClick={toggleParadeNotice} aria-label='Show Parade Notice' name='show-parade-notice'>Show</button>}
				{showParadeNotice && <button onClick={toggleParadeNotice} aria-label='Hide Parade Notice' name='hide-parade-notice'>Hide</button>}
				<button onClick={() => window.print()} name='download-parade-notice'>Download</button>

				{(['Admin', 'Officer', 'Primer'].includes(user.account_type) || ['CSM', 'DY CSM', 'Admin Sergeant'].includes(user.appointment)) && (
					<button onClick={toggleEditor} name='edit-parade-notice'>Edit</button>
				)}
			</div>

			{showParadeNotice && Object.keys(parade).length > 0 && <ParadeNoticePDF parade={parade} />}
			{showParadeEditor && <ParadeForm paradeId={id} />}

			{/* <ParadeAttendance accountName={accountName} appointment={appointment} parade={parade} boys={boys} primers={primers} officers={officers} setReload={setReload} /> */}
		</div>
	)
}

ParadeInformation.propTypes = {
	id: PropTypes.number.isRequired,
}

export default ParadeInformation
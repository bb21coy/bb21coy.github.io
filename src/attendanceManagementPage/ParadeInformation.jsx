import { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import ParadeNoticePDF from './ParadeNoticePDF'
import { ParadeAttendance } from './ParadeAttendance'
import { ParadeEditor } from './ParadeEditor'
import Loading from '../general/Loading'
import { db } from '../firebase'
import { getDoc, collection, getDocs, query, orderBy, doc } from '@firebase/firestore'
import { useUser } from '../general/UserContext'

// To access attendance records and take new attendance
const ParadeInformation = ({ id, setPageState, setReload }) => {
	const [loading, setLoading] = useState(true)
	const [showParadeNotice, setShowParadeNotice] = useState(true)
	const [showParadeEditor, setShowParadeEditor] = useState(false)
	const [parade, setParade] = useState({})
	const [allUsers, setAllUsers] = useState([])
	const { user } = useUser()

	useEffect(() => {
		const init = async () => {
			const usersSnap = await getDocs(query(collection(db, "users"), orderBy("account_name", "asc")))
			const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
			setAllUsers(usersData)

			const paradeRef = doc(db, "parades", id)
			const paradeSnap = await getDoc(paradeRef)
			const paradeData = paradeSnap.data()
			setParade(paradeData)

			setLoading(true)
		}

		init()
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
		setShowParadeNotice((prev) => {
			if (!prev) {
				setShowParadeEditor(false)
				return true
			} else {
				return false
			}
		})
	}

	function toggleEditor() {
		setShowParadeEditor((prev) => {
			if (prev == false) {
				setShowParadeNotice(false)
				return true
			} else {
				return false
			}
		})
	}

	if (!loading) return <Loading />

	return (
		<div className='parade-information'>
			<div>
				{!showParadeNotice && <button onClick={toggleParadeNotice} aria-label='Show Parade Notice' name='show-parade-notice'>Show Parade Notice</button>}
				{showParadeNotice && <button onClick={toggleParadeNotice} aria-label='Hide Parade Notice' name='hide-parade-notice'>Hide Parade Notice</button>}
				<button onClick={() => window.print()} name='download-parade-notice'>Download Parade Notice</button>

				{(['Admin', 'Officer', 'Primer'].includes(user.account_type) || ['CSM', 'DY CSM', 'Admin Sergeant'].includes(user.appointment)) && (
					<button onClick={toggleEditor} name='edit-parade-notice'>Edit Parade Notice</button>
				)}
			</div>

			{showParadeNotice && Object.keys(parade).length > 0 && <ParadeNoticePDF parade={parade} />}
			{showParadeEditor && <ParadeEditor parade={parade} boys={groupedUsers.boys} primers={groupedUsers.primers} officers={groupedUsers.officers} setReload={setReload} setPageState={setPageState} />}

			{/* <ParadeAttendance accountName={accountName} appointment={appointment} parade={parade} boys={boys} primers={primers} officers={officers} setReload={setReload} /> */}
		</div>
	)
}

ParadeInformation.propTypes = {
	id: PropTypes.number.isRequired,
	setPageState: PropTypes.func.isRequired,
	setReload: PropTypes.func.isRequired
}

export { ParadeInformation }
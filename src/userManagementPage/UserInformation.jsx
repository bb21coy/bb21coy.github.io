import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import BASE_URL from '../Constants'
import UserSchema from '../schema/Users'
import { showMessage } from '../general/handleServerError'
import { useUser } from '../general/UserContext'
import { getAuth } from "@firebase/auth";
import { updateDoc, deleteDoc, getDoc } from '@firebase/firestore'
import { doc } from '@firebase/firestore'
import { db } from '../firebase'
import styles from './userInformation.module.scss'
import Loading from '../general/Loading'

// To view users information and delete user accounts
const UserInformation = ({ userInfo, showForm }) => {
	const { user } = useUser();
	const auth = getAuth();
	const form = useRef();
	const currentUser = auth.currentUser;
	const [adminId, setAdminId] = useState();

	const [email, setEmail] = useState();
	const [password, setPassword] = useState();
	const [appointment, setAppointment] = useState();
	const [accountRank, setAccountRank] = useState();
	const [accountLevel, setAccountLevel] = useState();
	const [accountClass, setAccountClass] = useState();
	const [accountGraduated, setAccountGraduated] = useState(false);
	const [accountHonorific, setAccountHonorific] = useState();
	const [accountRollCall, setAccountRollCall] = useState("");
	const [accountPastRank, setAccountPastRank] = useState({ 1: null, 2: null, 3: null, 4: null, 5: null })

	useEffect(() => {
		if (form.current) form.current.reset()
		if (!userInfo) return
		setEmail(undefined)
		setAccountRank(userInfo.rank ?? null)
		setAccountLevel(userInfo.level)
		setAccountClass(userInfo.class1)
		setAccountGraduated(userInfo.graduated)
		setAccountHonorific(userInfo.honorifics)
		setAccountRollCall(userInfo.roll_call)
		setAccountPastRank((prev) => {
			let next = { ...prev }
			for (let i = 1; i <= 5; i++) {
				next[i] = userInfo[`rank${i}`]
			}
			return next
		})

		const fetchAdminData = async () => {
			try {
				const idToken = await currentUser.getIdToken(true)
				setAdminId(idToken)
				const resp = await axios.get(`${BASE_URL}/admin?id=${userInfo.id}`, { headers: { Authorization: `Bearer ${idToken}` } })
				setEmail(resp.data.email)
			} catch (err) {
				console.error("Failed to fetch admin data:", err)
				showMessage("Failed to fetch email")
			}
		}

		const fetchAppointmentData = async () => {
			try {
				const apptRef = doc(db, "appointments", "HJbxljYligJkryXpA7sh");
				const docSnap = await getDoc(apptRef);

				const data = docSnap.data();
				const apptName = Object.keys(data).find((key) => data[key].id === userInfo.id);
				setAppointment(apptName);
			} catch (err) {
				console.error("Failed to fetch admin data:", err)
			}
		}

		if (userInfo) fetchAdminData()
		if (userInfo) fetchAppointmentData()
	}, [userInfo])

	function setRank(e) {
		setAccountRank(e.target.value !== "NIL" ? e.target.value : null)
		if (userInfo.account_type === 'Boy') {
			setAccountPastRank((prev) => {
				let next = { ...prev }
				next[accountLevel] = e.target.value
				return next
			})
		}
	}

	function setPastRank(level, e) {
		setAccountPastRank((prev) => {
			let next = { ...prev }
			next[level] = e.target.value
			return next
		})
	}

	function setLevel(e) {
		setAccountLevel(e.target.value)
		if (userInfo.account_type === 'Boy') {
			setAccountPastRank((prev) => {
				let next = { ...prev }
				next[parseInt(e.target.value)] = accountRank
				for (let i = parseInt(e.target.value) + 1; i <= 5; i++) {
					next[i] = null
				}
				return next
			})
		}
	}

	function setGraduated(e) {
		setAccountGraduated(e.target.value === "Yes")
		setAccountRollCall(!userInfo.roll_call)
	}

	async function editAccount(e) {
		try {
			e.preventDefault()
			let submit = true
			let emailInput = e.target.elements['email'].value

			const formData = new FormData(e.target);
			const values = Object.fromEntries(formData.entries());
			delete values.email
			delete values.password
			values.account_type = userInfo.account_type
			values.graduated = accountGraduated
			values.level = parseInt(values.level) || accountLevel
			values.roll_call = accountRollCall
			for (let i = 1; i <= 5; i++) {
				if (values[`class${i}`] === '') values[`class${i}`] = null
				if (values[`rank${i}`] === '') values[`rank${i}`] = null
			}

			const result = UserSchema.safeParse(values);
			if (!result.success || !submit) return showMessage(`${result.error.issues[0].path[0].replace("_", " ")}: ${result.error.issues[0].message}`)

			if (submit) {
				await updateDoc(doc(db, "users", userInfo.id), result.data);

				if ((emailInput && emailInput !== email) || password) {
					await axios.put(`${BASE_URL}/admin`, { email: emailInput, password, uid: userInfo.id }, { headers: { Authorization: `Bearer ${adminId}` } })
				}

				showMessage("Account has been updated", "success")
			}
		} catch (err) {
			console.error(err)
			showMessage("Failed to update account")
		}
	}

	async function deleteAccount() {
		try {
			await deleteDoc(doc(db, "users", userInfo.id));
			await axios.delete(`${BASE_URL}/admin?id=${userInfo.id}`, { headers: { Authorization: `Bearer ${adminId}` } })
			showMessage("Account has been deleted", "success")
			showForm()
		} catch (err) {
			console.error(err)
			showMessage("Failed to delete account")
		}
	}

	if (!userInfo) return <Loading />

	return (
		<div className={styles.userInformation}>
			<h2>User - {userInfo.account_name}</h2>

			<form id='edit-account-form' onSubmit={editAccount} ref={form} key={userInfo.id}>
				<label htmlFor='name-input'>Full Name:</label>
				<input id='name-input' name="account_name" defaultValue={userInfo.account_name} placeholder='Enter Full Name' />

				{["Officer", "Admin"].includes(user.account_type) && <>
					<label htmlFor="email">Email</label>
					<input id="email" name="email" defaultValue={email} autoComplete='email' placeholder='Enter Email' />

					<label htmlFor="password">Password</label>
					<input id="password" name="password" type="password" autoComplete='new-password' placeholder='Enter New Password (Keep blank if not changing)' onChange={(e) => setPassword(e.target.value)} />
				</>}

				<label htmlFor='account-type-input'>Account Type:</label>
				<select id="account-type-input" defaultValue={userInfo.account_type} disabled>
					<option value={userInfo.account_type}>{userInfo.account_type}</option>
				</select>

				<label htmlFor='rank-input'>Rank:</label>
				<select id="rank-input" name='rank' defaultValue={userInfo.rank || "NIL"} onChange={setRank}>
					{userInfo.account_type === "Officer" && <>
						<option value="NIL">Not Applicable</option>
						<option value="OCT">OCT</option>
						<option value="2LT">2LT</option>
						<option value="LTA">LTA</option>
					</>}
					{userInfo.account_type === "Primer" && <>
						<option value="NIL">Not Applicable</option>
						<option value="CLT">CLT</option>
						<option value="SCL">SCL</option>
					</>}
					{userInfo.account_type === "Boy" && <>
						<option value="REC">REC</option>
						<option value="PTE">PTE</option>
						<option value="LCP">LCP</option>
						<option value="CPL">CPL</option>
						<option value="SGT">SGT</option>
						<option value="SSG">SSG</option>
						<option value="WO">WO</option>
					</>}
				</select>

				{(["Admin", "Officer"].includes(user.account_type) || userInfo.appointment === 'CSM') && userInfo.graduated === false && <>
					<label htmlFor='attendance-appearance'>Attendance Appearance:</label>
					<select id="attendance-appearance" name='roll_call' value={accountRollCall === true ? "Yes" : "No"} data-s={accountRollCall === true ? "Yes" : "No"} onChange={(e) => setAccountRollCall(e.target.value === 'Yes')}>
						<option value="" disabled hidden>Select Attendance Appearance</option>
						<option value="Yes">Yes</option>
						<option value="No">No</option>
					</select>
				</>}

				{userInfo.account_type === "Boy" && <>
					<label htmlFor='member-id-input'>Member ID:</label>
					<input name="member_id" id='member-id-input' defaultValue={userInfo.member_id} placeholder='Enter Member ID' />
				</>}

				{userInfo.account_type === "Boy" && !accountGraduated && <>
					<label htmlFor='secondary-input'>Secondary:</label>
					<select id="secondary-input" name='level' onChange={setLevel} defaultValue={userInfo.level || ""}>
						<option value="" disabled hidden>Select Level</option>
						<option value="5">5</option>
						<option value="4">4</option>
						<option value="3">3</option>
						<option value="2">2</option>
						<option value="1">1</option>
					</select>
				</>}

				{userInfo.account_type === "Boy" && (() => {
					const level = parseInt(accountLevel);
					if (!isNaN(level)) {
						return Array.from({ length: level }, (_, i) => (
							<React.Fragment key={i}>
								<label htmlFor={`sec-${i + 1}-class`}>Sec {i + 1} Class:</label>
								<input id={`sec-${i + 1}-class`} name={"class" + (i + 1)} defaultValue={userInfo[`class${i + 1}`] || ""} placeholder={`Enter Sec ${i + 1} Class`} />
							</React.Fragment>
						))
					}
				})()}

				{userInfo.account_type === "Boy" && (() => {
					const level = parseInt(accountLevel);
					if (!isNaN(level)) {
						return Array.from({ length: level - 1 }, (_, i) => (
							<React.Fragment key={i}>
								<label htmlFor={`sec-${i + 1}-rank`}>End of Sec {i + 1} Rank:</label>
								<select id={`sec-${i + 1}-rank`} name={"rank" + (i + 1)} onChange={(e) => setPastRank(i + 1, e)} defaultValue={accountPastRank[i + 1] || ""}>
									<option value="">-</option>
									<option value="REC">REC</option>
									<option value="PTE">PTE</option>
									<option value="LCP">LCP</option>
									<option value="CPL">CPL</option>
									<option value="SGT">SGT</option>
									<option value="SSG">SSG</option>
									<option value="WO">WO</option>
								</select>
							</React.Fragment>
						))
					}
				})()}

				{userInfo.account_type === "Boy" && <>
					<label htmlFor='graduated-input'>Graduated:</label>
					<select id="graduated-input" name='graduated' defaultValue={userInfo.graduated ? "Yes" : "No"} onChange={setGraduated}>
						<option value="Yes">Yes</option>
						<option value="No">No</option>
					</select>
				</>}

				{appointment && <>
					<label htmlFor='appointment-input'>Appointment:</label>
					<input type="text" name='appointment' id='appointment-input' disabled defaultValue={appointment} />
				</>}

				{(userInfo.class_1?.toLowerCase() === "staff" || accountRank === null) && <>
					<label htmlFor='honorific-input'>Honorifics:</label>
					<select id="honorific-input" name='honorifics' onChange={(e) => setAccountHonorific(e.target.value)} defaultValue={accountHonorific}>
						<option value="">-</option>
						<option value="Mr">Mr</option>
						<option value="Ms">Ms</option>
						<option value="Mrs">Mrs</option>
					</select>
				</>}

				{((userInfo.account_type === "Primer" && userInfo.rank === null) || userInfo.account_type === "Officer") && <>
					<label htmlFor='class-input'>Class:</label>
					<select id="class-input" name='class_1' onChange={(e) => setAccountClass(e.target.value)} defaultValue={accountClass} placeholder='Enter Class'>
						<option value="VAL">VAL</option>
						<option value="STAFF">STAFF</option>
						<option value="UNI">UNI</option>
						<option value="POLY">POLY</option>
					</select>
				</>}

				{userInfo.account_type !== "Boy" && <>
					<label htmlFor='credentials-input'>Credentials (For 32A results):</label>
					<input name="credentials" defaultValue={userInfo.credentials} id='credentials-input' placeholder='Enter Credentials (Optional)' />
				</>}
			</form>

			<div>
				<button type='submit' form='edit-account-form'>Save Changes</button>
				<button type='button' onClick={deleteAccount}>Delete Account</button>
			</div>
		</div>
	)
}

UserInformation.propTypes = {
	userInfo: PropTypes.shape(),
	showForm: PropTypes.func
}

export default UserInformation
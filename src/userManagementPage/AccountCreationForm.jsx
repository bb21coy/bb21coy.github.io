import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { showMessage } from '../general/handleServerError'
import UserSchema from '../schema/Users'
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { doc, setDoc } from "@firebase/firestore";
import { db } from "../firebase";
import axios from 'axios';
import BASE_URL from '../Constants';
import styles from './accountCreationForm.module.scss'

// To create new accounts
const AccountCreationForm = ({ account_type, appointment }) => {
	const [accountType, setAccountType] = useState('Boy');
	const [accountRank, setAccountRank] = useState('REC');
	const [accountClass, setAccountClass] = useState("VAL");
	const [adminId, setAdminId] = useState();

	useEffect(() => {
		const auth = getAuth();
		const fetchAdminData = async () => {
			try {
				const currentUser = auth.currentUser;
				const idToken = await currentUser.getIdToken(true)
				setAdminId(idToken)
			} catch (err) {
				console.error("Failed to fetch admin data:", err)
			}
		}

		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				fetchAdminData()
			}
		})

		return () => unsubscribe()
	}, [])

	function setType(e) {
		setAccountType(e.target.value)
		document.getElementById('account-type-input').value = e.target.value
		if (e.target.value === "Primer") setAccountRank('NIL')
		else if (e.target.value === 'Officer') setAccountRank("NIL")
	}

	async function submitForm(e) {
		try {
			e.preventDefault()
			let submit = true

			if (accountType !== "Boy" && e.target.elements['credentials'].value === '') submit = false
			if (e.target.elements['password'].value === '' || e.target.elements['password'].value.length < 6) submit = false

			const formData = new FormData(e.target);
			const values = Object.fromEntries(formData.entries());

			const email = values.email;
			const password = values.password;
			delete values.email
			delete values.password

			const dataForValidation = {
				...values,
				roll_call: values.roll_call === "true",
				rank: values.rank === "NIL" ? null : values.rank,
				credentials: values.credentials === "" ? null : values.credentials,
				level: parseInt(values.level) || null
			};

			const result = UserSchema.safeParse(dataForValidation);
			if (!result.success || !submit) return showMessage(`${result.error.issues[0].path[0].replace("_", " ")}: ${result.error.issues[0].message}`)

			const newUser = await axios.post(`${BASE_URL}/admin`, { email, password }, { headers: { Authorization: `Bearer ${adminId}` } })
			await setDoc(doc(db, "users", newUser.data.uid), result.data);
			showMessage("Account has been created", "success");
			e.target.reset()
		} catch (err) {
			console.error(err)
			showMessage("Failed to create account" + err.message)
		}
	}

	return (
		<form className={styles.account_creation} onSubmit={submitForm}>
			<h2>Account Creation</h2>

			<div>
				<label htmlFor='full-name-input'>Full Name:</label>
				<input name={'account_name'} placeholder='Enter Full Name' id='full-name-input' />

				<label htmlFor='user-name-input'>Email:</label>
				<input name={"email"} placeholder='Enter Email' id='user-name-input' autoComplete='email' />

				<label htmlFor='password-input'>Password:</label>
				<input type='text' name={'password'} placeholder='Enter Password' autoComplete='new-password' id='password-input' />

				<label htmlFor='account-type-input'>Account Type: </label>
				<select name="account_type" id="account-type-input" onChange={(e) => setType(e)} defaultValue="Boy">
					{["Admin", "Officer"].includes(account_type) && <option value="Officer">Officer</option>}
					{["Admin", "Officer", "Primer"].includes(account_type) && <option value="Primer">Primer</option>}
					<option value="Boy">Boy</option>
				</select>

				{accountType && <label htmlFor="rank-input">Rank: </label>}
				{["Officer", "Primer", "Boy"].includes(accountType) && (
					<select id="rank-input" name="rank" defaultValue={accountType === "Boy" ? "REC" : "NIL"} onChange={(e) => setAccountRank(e.target.value)}>
						{accountType === "Officer" && (<>
							<option value="NIL">Not Applicable</option>
							<option value="OCT">OCT</option>
							<option value="2LT">2LT</option>
							<option value="LTA">LTA</option>
						</>)}
						{accountType === "Primer" && (<>
							<option value="NIL">Not Applicable</option>
							<option value="CLT">CLT</option>
							<option value="SCL">SCL</option>
						</>)}
						{accountType === "Boy" && (<>
							<option value="REC">REC</option>
							<option value="PTE">PTE</option>
							<option value="LCP">LCP</option>
							<option value="CPL">CPL</option>
							<option value="SGT">SGT</option>
							<option value="SSG">SSG</option>
							<option value="WO">WO</option>
						</>)}
					</select>
				)}

				{(["Admin", "Officer"].includes(account_type) || appointment === 'CSM') && <>
					<label htmlFor='roll-call-input'>Attendance Appearance:</label>
					<select id="roll-call-input" name="roll_call" defaultValue="Yes">
						<option value="Yes">Yes</option>
						<option value="No">No</option>
					</select>
				</>}

				{((accountClass === "STAFF" || accountRank === "NIL") && accountType === "Officer") && <>
					<label htmlFor='honorific-input'>Honorifics:</label>
					<select id="honorific-input" name="honorifics" defaultValue="Mr">
						<option value="Mr">Mr</option>
						<option value="Ms">Ms</option>
						<option value="Mrs">Mrs</option>
					</select>
				</>}

				{accountType === "Boy" && <>
					<label htmlFor='level-input'>Level:</label>
					<select id="level-input" name="level" defaultValue="1">
						<option value="1">Secondary 1</option>
						<option value="2">Secondary 2</option>
						<option value="3">Secondary 3</option>
						<option value="4">Secondary 4</option>
						<option value="5">Secondary 5</option>
					</select>
				</>}

				{accountType === "Officer" && <>
					<label htmlFor='class-input'>Class:</label>
					<select id="class-input" name="class1" defaultValue="VAL" onChange={(e) => setAccountClass(e.target.value)}>
						<option value="VAL">VAL</option>
						<option value="STAFF">STAFF</option>
						<option value="UNI">UNI</option>
						<option value="POLY">POLY</option>
					</select>
				</>}

				{(["Officer", "Primer"].includes(accountType)) && <>
					<label htmlFor='credentials-input'>Credentials (For 32A results): </label>
					<input className='account-credentials' name='credentials' placeholder='Enter Credentials' id='credentials-input' />
				</>}
			</div>

			<button>Create Account</button>
		</form>
	)
}

AccountCreationForm.propTypes = {
	account_type: PropTypes.string,
	appointment: PropTypes.string,
}

export default AccountCreationForm
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { BASE_URL } from '../Constants'
import { handleServerError, showMessage } from '../general/handleServerError'

// To view users information and delete user accounts
const UserInformation = ({ accountType, appointment, userId, showForm, reLoad }) => {
	const [account, setAccount] = useState();
	const [accountRank, setAccountRank] = useState();
	const [accountLevel, setAccountLevel] = useState();
	const [accountClass, setAccountClass] = useState();
	const [accountGraduated, setAccountGraduated] = useState(false);
	const [accountHonorific, setAccountHonorific] = useState();
	const [accountRollCall, setAccountRollCall] = useState(true);
	const [accountPastRank, setAccountPastRank] = useState({ 1: null, 2: null, 3: null, 4: null, 5: null })

	useEffect(() => {
		setAccount(null)
		axios.get(`${BASE_URL}/account/?id=${userId}`, { headers: { "x-route": "/get_account" }, withCredentials: true })
		.then(resp => {
			setAccount(resp.data)
			setAccountRank(resp.data.rank ?? null)
			setAccountLevel(resp.data.level)
			setAccountClass(resp.data.class_1)
			setAccountGraduated(resp.data.graduated)
			setAccountHonorific(resp.data.honorifics)
			setAccountRollCall(resp.data.roll_call)
			setAccountPastRank((prev) => {
				let next = { ...prev }
				for (let i = 1; i <= 5; i++) {
					next[i] = resp.data[`rank${i}`]
				}
				return next
			})
		})
		.catch(err => {
			console.error(err.response.data);
			handleServerError(err.response.status);
		})
	}, [userId])

	function setRank(e) {
		setAccountRank(e.target.value !== "NIL" ? e.target.value : null)
		if (account.account_type == 'Boy') {
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
		if (account.account_type == 'Boy') {
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
		setAccountRollCall(account.roll_call)
	}

	function editAccount(e) {
		e.preventDefault()
		let level = null
		let credentials = null
		let submit = true
		if (account.account_type == "Boy") {
			level = accountLevel
			if (isNaN(parseInt(level))) submit = false
		} else {
			credentials = e.target.elements['credentials'].value
			if (credentials == '') submit = false
		}
		if (e.target.elements['account_name'].value == '') submit = false

		const formData = new FormData(e.target);
		formData.append('id', account._id);

		if (submit) {
			axios.put(`${BASE_URL}/account`, formData, { headers: { 'x-route': '/update_account' }, withCredentials: true })
			.then(() => {
				showMessage("Account has been updated", "success")
				reLoad()
			})
			.catch(resp => {
				console.error(resp.response.data); 
				handleServerError(resp.response.status);
			})
		}
		else showMessage("Please fill in all fields first")
	}

	function deleteAccount(e) {
		axios.delete(`${BASE_URL}/account?id=${account._id}`, { headers: { "x-route": "/delete_account" }, withCredentials: true })
		.then(() => {
			showMessage("Account has been deleted", "success")
			showForm()
			reLoad()
		})
		.catch(resp => {
			reLoad()
			console.error(resp.response.data); 
			handleServerError(resp.response.status)
		})
	}

	return (
		<div className='user-information'>
			<h2>User - {account ? account.account_name : ''}</h2>

			{account != null &&
				<form className="edit-account-form" id='edit-account-form' onSubmit={editAccount} data-testid='user-information-form'>
					<label htmlFor='name-input'>Name:</label>
					<input id='name-input' name={"account_name"} defaultValue={account.account_name} placeholder='Enter Name' />

					{accountType == 'Admin' && <>
						<label htmlFor='user-name-input'>User Name:</label>
						<input id='user-name-input' name={"user_name"} defaultValue={account.user_name} placeholder='Enter User Name' />
					</>}

					<label htmlFor='abb-name-input'>Abbreviated Name:</label>
					<input id='abb-name-input' name={"abbreviated_name"} defaultValue={account.abbreviated_name} placeholder='Enter Abbreviated Name' />

					{accountType == 'Admin' && <>
						<label htmlFor='password-input'>New Password:</label>
						<input name={"password"} defaultValue={account.password_digest} id='password-input' placeholder='Enter Password' />
					</>}

					<label htmlFor='account-type-input'>Account Type:</label>
					<select id="account-type-input" defaultValue={account.account_type} disabled>
						<option value={account.account_type}>{account.account_type}</option>
					</select>
					<input type="hidden" name="account_type" value={account.account_type} />

					<label htmlFor='rank-input'>Rank:</label>
					<select id="rank-input" name='rank' defaultValue={account.rank} onChange={setRank}>
						{account.account_type === "Officer" && <>
							<option value="NIL">Not Applicable</option>
							<option value="OCT">OCT</option>
							<option value="2LT">2LT</option>
							<option value="LTA">LTA</option>
						</>}
						{account.account_type === "Primer" && <>
							<option value="NIL">Not Applicable</option>
							<option value="CLT">CLT</option>
							<option value="SCL">SCL</option>
						</>}
						{account.account_type === "Boy" && <>
							<option value="REC">REC</option>
							<option value="PTE">PTE</option>
							<option value="LCP">LCP</option>
							<option value="CPL">CPL</option>
							<option value="SGT">SGT</option>
							<option value="SSG">SSG</option>
							<option value="WO">WO</option>
						</>}
					</select>

					{(["Admin", "Officer"].includes(accountType) || appointment == 'CSM') && !accountGraduated && <>
						<label htmlFor='attendance-appearance'>Attendance Appearance:</label>
						<select id="attendance-appearance" name='roll_call' defaultValue={accountRollCall ? "Yes" : "No"} onChange={(e) => setAccountRollCall(e.target.value === 'Yes')}>
							<option value="Yes">Yes</option>
							<option value="No">No</option>
						</select>
					</>}

					{account.account_type == "Boy" && <>
						<label htmlFor='member-id-input'>Member ID:</label>
						<input name="member_id" id='member-id-input' defaultValue={account.member_id} placeholder='Enter Member ID' />
					</>}

					{account.account_type == "Boy" && !accountGraduated && <>
						<label htmlFor='secondary-input'>Secondary:</label>
						<select id="secondary-input" name='level' onChange={setLevel} defaultValue={account.level}>
							<option value="5">5</option>
							<option value="4">4</option>
							<option value="3">3</option>
							<option value="2">2</option>
							<option value="1">1</option>
						</select>
					</>}

					{account.account_type == "Boy" && (() => {
						const level = parseInt(accountLevel);
						if (!isNaN(level)) {
							return Array.from({ length: level }, (_, i) => (
								<React.Fragment key={i}>
									<label htmlFor={`sec-${i + 1}-class`}>Sec {i + 1} Class:</label>
									<input id={`sec-${i + 1}-class`} name={"class" + (i + 1)} defaultValue={account[`class${i + 1}`] || ""} placeholder={`Enter Sec ${i + 1} Class`} />
								</React.Fragment>
							))
						}
					})()}

					{account.account_type == "Boy" && (() => {
						const level = parseInt(accountLevel);
						if (!isNaN(level)) {
							return Array.from({ length: level - 1 }, (_, i) => (
								<React.Fragment key={i}>
									<label htmlFor={`sec-${i + 1}-rank`}>End of Sec {i + 1} Rank:</label>
									<select id={`sec-${i + 1}-rank`} name={"rank" + (i + 1)} onChange={(e) => setPastRank(i + 1, e)} defaultValue={accountPastRank[i + 1] || ""}>
										<option value="" disabled>-</option>
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

					{account.account_type == "Boy" && <>
						<label htmlFor='graduated-input'>Graduated:</label>
						<select id="graduated-input" name='graduated' defaultValue={account.graduated ? "Yes" : "No"} onChange={setGraduated}>
							<option value="Yes">Yes</option>
							<option value="No">No</option>
						</select>
					</>}

					{account.appointment != null && <>
						<label htmlFor='appointment-input'>Appointment:</label>
						<input type="text" name='appointment' id='appointment-input' disabled defaultValue={account.appointment} />
					</>}

					{(account.class_1?.	toLowerCase() == "staff" || accountRank == null) && <>
						<label htmlFor='honorific-input'>Honorifics:</label>
						<select id="honorific-input" name='honorifics' onChange={(e) => setAccountHonorific(e.target.value)} defaultValue={accountHonorific}>
							<option value="">-</option>
							<option value="Mr">Mr</option>
							<option value="Ms">Ms</option>
							<option value="Mrs">Mrs</option>
						</select>
					</>}

					{((account.account_type == "Primer" && account.rank == null) || account.account_type == "Officer") && <>
						<label htmlFor='class-input'>Class:</label>
						<select id="class-input" name='class_1' onChange={(e) => setAccountClass(e.target.value)} defaultValue={accountClass} placeholder='Enter Class'>
							<option value="VAL">VAL</option>
							<option value="STAFF">STAFF</option>
							<option value="UNI">UNI</option>
							<option value="POLY">POLY</option>
						</select>
					</>}

					{account.account_type != "Boy" && <>
						<label htmlFor='credentials-input'>Credentials (For 32A results):</label>
						<input name="credentials" defaultValue={account.credentials} id='credentials-input' />
					</>}
				</form>}

			<div>
				<button className="edit-button" type='submit' form='edit-account-form'>Save Changes</button>
				<button className="delete-button" type='button' onClick={deleteAccount}>Delete Account</button>
			</div>
		</div>
	)
}

UserInformation.propTypes = {
	accountType: PropTypes.string,
	appointment: PropTypes.string,
	userId: PropTypes.string.isRequired,
	showForm: PropTypes.func,
	reLoad: PropTypes.func
}

export { UserInformation }
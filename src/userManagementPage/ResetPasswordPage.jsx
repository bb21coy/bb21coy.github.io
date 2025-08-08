import { useEffect, useState } from 'react'
import BASE_URL from '../Constants'
import axios from 'axios'
import { handleServerError, showMessage } from '../general/handleServerError'
import '../styles/resetPasswordPage.scss'

// To allow boys to reset their password
const ResetPasswordPage = () => {
	const [account, setAccount] = useState();
	const [passwordType, setPasswordType] = useState("password");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");

	useEffect(() => {
		async function init() {
			try {
				const account = await axios.get(`${BASE_URL}/account`, { headers: { "x-route": "/get_own_account" }, withCredentials: true })
				setAccount(account.data);
				setUsername(account.data.user_name);
			} catch (err) {
				handleServerError(err.response.status);
			}
		}

		init()
	}, [])

	async function editAccount(e) {
		try {
			e.preventDefault()
			if (username === "" || password === "") return showMessage("Please fill in all fields")
			if (!e.target.checkValidity()) return;

			await axios.put(`${BASE_URL}/account`, { username, password }, { headers: { "x-route": '/update_username_password' }, withCredentials: true })
			showMessage("Account updated successfully", "success")
		} catch (err) {
			console.error(err)
			handleServerError(err.response.status)
		}
	}

	return (
		<div className='reset-password-page'>
			<div className='user-information'>
				<h1>Reset Username and Password</h1>
				{account != null && <form className="edit-account-form" onSubmit={editAccount} noValidate>
					<label htmlFor='user_name'>Username:</label>
					<input className='edit-field' type="text" required defaultValue={account.user_name} id='user_name' autoComplete='username' onChange={(e) => setUsername(e.target.value)}></input>
					<span></span>

					<label htmlFor='password'>New Password:</label>
					<input type={passwordType} className='edit-field' required id='password' placeholder='Enter New Password' autoComplete='new-password' onChange={(e) => setPassword(e.target.value)}></input>
					<i className={`fa-solid ${passwordType === "password" ? "fa-eye" : "fa-eye-slash"}`} onClick={() => setPasswordType(passwordType === 'password' ? 'text' : 'password')}></i>

					<button className="edit-button">Save Changes</button>
				</form>}
			</div>
		</div>
	)
}

export default ResetPasswordPage
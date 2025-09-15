import { useEffect, useState } from 'react'
import { showMessage } from '../general/handleServerError'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../general/UserContext'
import styles from './resetPasswordPage.module.scss'
import { getAuth, updatePassword, updateEmail, onAuthStateChanged, signOut } from "@firebase/auth";

// To allow boys to reset their password
const ResetPasswordPage = () => {
	const auth = getAuth();
	const [passwordType, setPasswordType] = useState("password");
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState();
	const navigate = useNavigate();
	const { setLoggedIn, setNavigationViewable, setUser } = useUser();

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (user) => {
			if (user) {
				setEmail(user.email)
			};
		})

		return () => unsub();
	}, [])

	async function editAccount(e) {
		try {
			e.preventDefault()
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (email === "" || password === "") return showMessage("Please fill in all fields");
			if (!emailRegex.test(email)) return showMessage("Please enter a valid email address");
			if (password.length < 6) return showMessage("Password must be at least 6 characters long");
			if (!e.target.checkValidity()) return;

			await updateEmail(auth.currentUser, email);
			await updatePassword(auth.currentUser, password);
			showMessage("Account updated successfully", "success")
		} catch (err) {
			console.error(err)
			if (err.code === "auth/email-already-in-use") return showMessage("Email already in use");
			else if (err.code === "auth/requires-recent-login") {
				await signOut(auth);
				showMessage("Reset password requires recent login. Please login again.")
				setLoggedIn(false);
				setUser({});
				setNavigationViewable(false);
				navigate('/login?next=/reset_password')
			}
			else showMessage(err.code)
		}
	}

	return (
		<div className={styles['reset-password-page']}>
			<h2>Reset Username and Password</h2>
			<form className="edit-account-form" onSubmit={editAccount} noValidate>
				<label htmlFor='email'>Email:</label>
				<input type="text" required defaultValue={email} id='email' autoComplete='email' onChange={(e) => setEmail(e.target.value)}></input>
				<span></span>

				<label htmlFor='password'>New Password:</label>
				<input type={passwordType} className='edit-field' required id='password' placeholder='Enter New Password' autoComplete='new-password' onChange={(e) => setPassword(e.target.value)}></input>
				<i className={`fa-solid ${passwordType === "password" ? "fa-eye" : "fa-eye-slash"}`} onClick={() => setPasswordType(passwordType === 'password' ? 'text' : 'password')}></i>

				<button>Save Changes</button>
			</form>
		</div>
	)
}

export default ResetPasswordPage
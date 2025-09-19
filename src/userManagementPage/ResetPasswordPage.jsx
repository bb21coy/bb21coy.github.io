import { useEffect, useState } from 'react'
import { showMessage } from '../general/handleServerError'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../general/UserContext'
import styles from './resetPasswordPage.module.scss'
import { getAuth, updatePassword, updateEmail, onAuthStateChanged, signOut, linkWithPopup, OAuthProvider, unlink, GoogleAuthProvider } from "@firebase/auth";

// To allow boys to reset their password
const ResetPasswordPage = () => {
	const auth = getAuth();
	const [passwordType, setPasswordType] = useState("password");
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState();
	const [linkedWithMicrosoft, setLinkedWithMicrosoft] = useState(false);
	const navigate = useNavigate();
	const { setLoggedIn, setNavigationViewable, setUser } = useUser();

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, async (user) => {
			if (user) {
				setEmail(user.email)

				try {
					await user.reload();
					const refreshedUser = auth.currentUser;

					const providers = refreshedUser.providerData.map(p => p.providerId);
					setLinkedWithMicrosoft(providers.includes("microsoft.com"));
				} catch (err) {
					console.error("Failed to reload user", err);
				}
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
				navigate('/login?next=/manage_login')
			}
			else showMessage(err.code)
		}
	}

	async function linkMicrosoft() {
		const user = auth.currentUser;
		const microsoftProvider = new OAuthProvider('microsoft.com');
		const result = await linkWithPopup(user, microsoftProvider);
		const microsoftEmail = result?._tokenResponse?.email || null;

		if (microsoftEmail?.toLowerCase() !== user.email?.toLowerCase()) {
			await unlink(user, 'microsoft.com');
			return showMessage("The Microsoft account email must match your current email.");
		}

		showMessage("Microsoft account has been linked", "success");
		setLinkedWithMicrosoft(true);
	}

	async function unlinkMicrosoft() {
		const user = auth.currentUser;
		await unlink(user, "microsoft.com");
		setLinkedWithMicrosoft(false);
		showMessage("Microsoft account has been unlinked", "success");
		setLinkedWithMicrosoft(false);
	}

	return (
		<div className={styles['reset-password-page']}>
			<h2>Reset Username and Password</h2>
			<form className="edit-account-form" onSubmit={editAccount} noValidate>
				<label htmlFor='email'>Email:</label>
				<input type="text" required defaultValue={email} id='email' autoComplete='email' onChange={(e) => setEmail(e.target.value)}></input>
				<span></span>

				<label htmlFor='password'>New Password:</label>
				<input type={passwordType} required id='password' placeholder='Enter New Password' autoComplete='new-password' onChange={(e) => setPassword(e.target.value)}></input>
				<i className={`fa-solid ${passwordType === "password" ? "fa-eye" : "fa-eye-slash"}`} onClick={() => setPasswordType(passwordType === 'password' ? 'text' : 'password')}></i>

				<button>Save Changes</button>
			</form>

			<div>
				<h2>Link Microsoft Account</h2>
				<p>Linking your Microsoft account will allow you to sign in using your password and Microsoft account.</p>
				<p>You can only link to the Microsoft account that have the same email as your current email.</p>
				{!linkedWithMicrosoft ? <button onClick={linkMicrosoft}>Link Microsoft Account</button> : <button data-state="unlink" onClick={unlinkMicrosoft}>Unlink Microsoft Account</button>}
			</div>

			<div>
				<h2>Link Google Account</h2>
				<p>Linking your Google account will allow you to sign in using your password and Google account.</p>
				<p>By default, this is enabled and cannot be disabled.</p>
			</div>
		</div>
	)
}

export default ResetPasswordPage
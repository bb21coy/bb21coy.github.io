import { useEffect, useState } from 'react'
import { showMessage } from '../general/handleServerError'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../general/UserContext'
import styles from './resetPasswordPage.module.scss'
import { updatePassword, updateEmail, onAuthStateChanged, signOut, linkWithPopup, OAuthProvider, unlink, GoogleAuthProvider } from "@firebase/auth";
import { auth } from "../firebase";

// To allow boys to reset their password
const ResetPasswordPage = () => {
	const [passwordType, setPasswordType] = useState("password");
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState();
	const [linkedWithMicrosoft, setLinkedWithMicrosoft] = useState(false);
	const [linkedWithGoogle, setLinkedWithGoogle] = useState(false);
	const navigate = useNavigate();
	const { setLoggedIn, setNavigationViewable, setUser } = useUser();
	const [linkedEmails, setLinkedEmails] = useState({});

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, async (user) => {
			if (user) {
				setEmail(user.email)

				const providers = user.providerData.map(provider => provider.providerId);
				setLinkedWithMicrosoft(providers.includes("microsoft.com"));
				setLinkedWithGoogle(providers.includes("google.com"));
				setLinkedEmails(user.providerData.reduce((acc, provider) => {
					acc[provider.providerId] = provider.email;
					return acc
				}, {}));
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
		try {
			const user = auth.currentUser;
			const microsoftProvider = new OAuthProvider('microsoft.com');
			await linkWithPopup(user, microsoftProvider);
			showMessage("Microsoft account has been linked", "success");
			setLinkedWithMicrosoft(true);
		} catch (err) {
			if (err.code === "auth/credential-already-in-use") return showMessage("This Microsoft account is already linked with another user.");
			console.error("Failed to link Microsoft:", err);
			showMessage("Error linking Microsoft: " + err.message);
		}
	}

	async function unlinkMicrosoft() {
		const user = auth.currentUser;
		await unlink(user, "microsoft.com");
		setLinkedWithMicrosoft(false);
		showMessage("Microsoft account has been unlinked", "success");
		setLinkedWithMicrosoft(false);
	}

	const linkGoogle = async () => {
		try {
			const user = auth.currentUser;
			const googleProvider = new GoogleAuthProvider();
			await linkWithPopup(user, googleProvider);
			showMessage("Google account has been linked", "success");
			setLinkedWithGoogle(true);
		} catch (err) {
			if (err.code === "auth/credential-already-in-use") return showMessage("This Google account is already linked with another user.");
			console.error("Failed to link Google:", err);
			showMessage("Error linking Google: " + err.message);
		}
	}

	const unlinkGoogle = async () => {
		try {
			const user = auth.currentUser;
			await unlink(user, "google.com");
			setLinkedWithGoogle(false);
			showMessage("Google account has been unlinked", "success");
		} catch (err) {
			console.error("Failed to unlink Google:", err);
			showMessage("Error unlinking Google: " + err.message);
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
				<input type={passwordType} required id='password' placeholder='Enter New Password' autoComplete='new-password' onChange={(e) => setPassword(e.target.value)}></input>
				<i className={`fa-solid ${passwordType === "password" ? "fa-eye" : "fa-eye-slash"}`} onClick={() => setPasswordType(passwordType === 'password' ? 'text' : 'password')}></i>

				<button>Save Changes</button>
			</form>

			<div>
				<h2>Linked Accounts</h2>
				<p>Linking adds another login option for your account. Once linked, you can sign in with either your password or this account. You can only link one account of each provider at a time, but you can unlink any account at any time.</p>
			</div>

			<div>
				<h3>Link Microsoft Account</h3>
				<div>
					{!linkedWithMicrosoft ? <button onClick={linkMicrosoft}>Link Microsoft Account</button> : <button data-state="unlink" onClick={unlinkMicrosoft}>Unlink Microsoft Account</button>}
					{linkedWithMicrosoft && <p>Currently linked to: {linkedEmails["microsoft.com"]}</p>}
				</div>
			</div>

			<div>
				<h3>Link Google Account</h3>
				<div>
					{!linkedWithGoogle ? <button onClick={linkGoogle}>Link Google Account</button> : <button data-state="unlink" onClick={unlinkGoogle}>Unlink Google Account</button>}
					{linkedWithGoogle && <p>Currently linked to: {linkedEmails["google.com"]}</p>}
				</div>
			</div>
		</div>
	)
}

export default ResetPasswordPage
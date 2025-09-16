import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { showMessage } from '../general/handleServerError';
import styles from './logInPage.module.scss'
import { auth } from "../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signInWithPopup, OAuthProvider, GoogleAuthProvider, signOut } from "@firebase/auth";

// To log in, accounts can only be created by existing users
const LogInPage = () => {
	const { search } = useLocation()
	const searchParams = new URLSearchParams(search)
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (user) => {
			if (user) navigate('/home')
		})

		return () => unsub();
	}, [navigate])

	useEffect(() => {
		const link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'image';
		link.href = "/slide 2.webp";
		document.head.appendChild(link);
	}, []);

	async function submitForm(e) {
		e.preventDefault()
		if (!email || !password) return showMessage("Please enter both email and password");
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) return showMessage("Please enter a valid email address");

		signInWithEmailAndPassword(auth, email, password)
			.then(() => {
				if (searchParams.get('next')) navigate(searchParams.get('next'));
				else navigate('/home');
			})
			.catch(() => showMessage("Incorrect email or password"))
	}

	const signinWithMicrosoft = async () => {
		try {
			const microsoftProvider = new OAuthProvider('microsoft.com');
			const result = await signInWithPopup(auth, microsoftProvider);
			await result.user.reload();
			const providers = result.user.providerData.map(p => p.providerId);
			if (!providers.includes("password")) {
				await signOut(auth);
				return showMessage("This email is not registered with us. Please login with another account.");
			}
		} catch (err) {
			console.error(err)
			if (err.code === "auth/account-exists-with-different-credential") return showMessage("You have not signed up with Microsoft. Please login and link.");
			showMessage("Failed to sign in with Microsoft")
		}
	}

	const signinWithGoogle = async () => {
		try {
			const googleProvider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, googleProvider);
			await result.user.reload();
			const providers = result.user.providerData.map(p => p.providerId);
			if (!providers.includes("password")) {
				await signOut(auth);
				return showMessage("This email is not registered with us. Please login with another account.");
			}
		} catch (err) {
			console.error(err)
			if (err.code === "auth/account-exists-with-different-credential") return showMessage("You have not signed up with Google. Please login and link.");
			showMessage("Failed to sign in with Google")
		}
	}

	return (
		<div className={styles.login}>
			<form onSubmit={submitForm} noValidate>
				<label htmlFor="email">Email:</label>
				<input type='email' name="email" id='email' placeholder='Enter Email' required autoComplete='email' onChange={e => setEmail(e.target.value)} />

				<label htmlFor="password">Password:</label>
				<input type='password' name="password" id='password' placeholder='Enter Password' required autoComplete='current-password' onChange={e => setPassword(e.target.value)} />
				<button>Login</button>

				<div>
					<button type='button' onClick={signinWithMicrosoft}>
						<i className="fa-brands fa-microsoft"></i>
						Microsoft
					</button>

					<button type='button' onClick={signinWithGoogle}>
						<i className="fa-brands fa-google"></i>
						Google
					</button>
				</div>
			</form>
		</div>
	)
}

export default LogInPage
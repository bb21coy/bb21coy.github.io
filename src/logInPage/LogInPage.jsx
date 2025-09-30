import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { showMessage } from '../general/handleServerError';
import styles from './logInPage.module.scss'
import { auth } from "../firebase";
import axios from 'redaxios';
import { signInWithEmailAndPassword, onAuthStateChanged, fetchSignInMethodsForEmail, signInWithCredential, signInWithPopup, OAuthProvider, GoogleAuthProvider } from "@firebase/auth";

// To log in, accounts can only be created by existing users
const LogInPage = () => {
	const { search } = useLocation()
	const searchParams = new URLSearchParams(search)
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const clientRef = useRef(null);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (user) => {
			if (user) navigate('/home')
		})

		const link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'image';
		link.href = "/slide 2.webp";
		document.head.appendChild(link);

		clientRef.current = window.google.accounts.oauth2.initTokenClient({
			client_id: "788369154043-ksf02t5m4loi87o8svgfpdqmr79aq4tj.apps.googleusercontent.com",
			scope: "email openid",
			response_type: "id_token",
			callback: handleGoogleResponse,
		});

		return () => unsub();
	}, [navigate])

	const handleClick = () => {
		clientRef.current.requestAccessToken({ prompt: "consent" });
	};

	async function handleGoogleResponse(response) {
		try {
			const userData = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", { headers: { Authorization: `Bearer ${response.access_token}` } });
			const email = userData.data.email;
			const providers = await fetchSignInMethodsForEmail(auth, email);
			if (!(providers.includes("password") && providers.includes("google.com"))) return showMessage("This email is not registered with us. Please login with another account.");
			const credential = GoogleAuthProvider.credential(null, response.access_token);
			await signInWithCredential(auth, credential);
		} catch (err) {
			console.error(err)
			showMessage("Failed to sign in with Google")
		}
	}


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
		} catch (err) {
			console.error(err)
			if (err.code === "auth/account-exists-with-different-credential") return showMessage("You have not signed up with Microsoft. Please login and link.");
			if (err.code === "auth/admin-restricted-operation") return showMessage("This email is not registered with us. Please login with another account.");
			showMessage("Failed to sign in with Microsoft")
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

					<button type='button' onClick={handleClick}>
						<i className="fa-brands fa-google"></i>
						Google
					</button>
				</div>
			</form>
		</div>
	)
}

export default LogInPage
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { showMessage } from '../general/handleServerError';
import styles from './logInPage.module.scss'
import "../general/general.scss";
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
		const vids = document.querySelectorAll("video");
		vids.forEach(v => v.playbackRate = 0.7);

		const unsub = onAuthStateChanged(auth, (user) => {
			if (user) navigate('/home')
		})

		const link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'image';
		link.href = "/slide 2.webp";
		document.head.appendChild(link);

		if (!window.google) return;
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
		<>
			<div className='error-container'></div>
			<div className={styles.login}>

				<div className={styles.video_container}>
					<img src="slide 2.webp" alt="Background Image" />
					<video autoPlay muted loop playsInline className={styles.video_main}>
						<source src="/vid.mp4" type="video/mp4" />
					</video>
					<video autoPlay muted loop playsInline className={styles.video_overlay}>
						<source src="/vid.mp4" type="video/mp4" />
					</video>
				</div>
				<form onSubmit={submitForm} noValidate>
					<img src="coy logo.webp" alt='BB Logo' width={"120px"} height={"120px"} />

					<label htmlFor="email">Email:</label>
					<input type='email' name="email" id='email' placeholder='your.email@example.com' required autoComplete='email' onChange={e => setEmail(e.target.value)} />

					<label htmlFor="password">Password:</label>
					<input type='password' name="password" id='password' placeholder='Enter Your Password' required autoComplete='current-password' onChange={e => setPassword(e.target.value)} />
					<button>Login</button>

					<div>
						<button type='button' onClick={signinWithMicrosoft}>
							<svg width="32" height="32" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
								<rect x="1" y="1" width="9" height="9" fill="#F25022" />
								<rect x="12" y="1" width="9" height="9" fill="#7FBA00" />
								<rect x="1" y="12" width="9" height="9" fill="#00A4EF" />
								<rect x="12" y="12" width="9" height="9" fill="#FFB900" />
							</svg>
							Microsoft
						</button>

						<button type='button' onClick={handleClick}>
							<svg class="w-5 h-5" viewBox="0 0 24 24">
								<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
								<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
								<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
								<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
							</svg>
							Google
						</button>
					</div>
					<p onClick={() => navigate('/parade_notice')}>View Parade Notice <i className='fa-solid fa-arrow-right'></i></p>
				</form>
			</div>
		</>
	)
}

export default LogInPage
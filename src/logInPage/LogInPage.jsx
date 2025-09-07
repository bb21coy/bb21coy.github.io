import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { showMessage } from '../general/handleServerError';
import styles from './logInPage.module.scss'
import { auth } from "../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

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

	async function submitForm(e) {
		e.preventDefault()
		if (!email || !password) return showMessage("Please enter both email and password");
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) return showMessage("Please enter a valid email address");

		signInWithEmailAndPassword(auth, email, password)
		.then(userCredential => {
			console.log(userCredential);
			localStorage.setItem('email', email);
			localStorage.setItem('password', password);
			if (searchParams.get('next')) navigate(searchParams.get('next'));
			else navigate('/home');
		})
		.catch(() => showMessage("Incorrect username or password"))
	}

	return (
		<div className={styles.login}>
			<form onSubmit={submitForm} noValidate>
				<label htmlFor="email">Email:</label>
				<input type='email' name="email" id='email' placeholder='Enter Email' required autoComplete='email' onChange={e => setEmail(e.target.value)} />

				<label htmlFor="password">Password:</label>
				<input type='password' name="password" id='password' placeholder='Enter Password' required autoComplete='current-password' onChange={e => setPassword(e.target.value)} />
				<button>Login</button>
			</form>
		</div>
	)
}

export default LogInPage
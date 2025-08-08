import { useState, useEffect } from 'react';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../Constants'
import { showMessage, handleServerError } from '../general/handleServerError';
import '../styles/logInPage.scss'

// To log in, accounts can only be created by existing users
const LogInPage = () => {
	const navigate = useNavigate();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	useEffect(() => {
		axios.get(`${BASE_URL}/auth`, { headers: { "x-route": "/check_session" }, withCredentials: true })
			.then(response => {
				if (response.data.valid) navigate('/home')
			})
			.catch(err => {
				console.log(err.response.data)
				handleServerError(err.response.data.status)
			})
	}, [navigate])

	function submitForm(e) {
		e.preventDefault()
		if (!username || !password) return showMessage("Please enter both username and password");

		axios.post(`${BASE_URL}/auth`, { username, password }, { headers: { "x-route": "/login" }, withCredentials: true })
			.then(resp => {
				if (resp.data.message) showMessage(resp.data.message, 'success');
				navigate('/home');
			})
			.catch(err => {
				if (err.response.status === 401) showMessage("Incorrect username or password")
				else handleServerError(err.response.status)
			})
	}

	return (
		<div className='log-in-page' style={{ 'background': 'url("slide 2.webp") center/cover no-repeat' }}>
			<form className='log-in-form' onSubmit={submitForm} noValidate>
				<h2>BB 21<sup>st</sup> Portal</h2>

				<label htmlFor="username">Username:</label>
				<input type='text' name="username" id='username' placeholder='Enter Username' required autoComplete='username' onChange={e => setUsername(e.target.value)} />

				<label htmlFor="password">Password:</label>
				<input type='password' name="password" id='password' placeholder='Enter Password' required autoComplete='current-password' onChange={e => setPassword(e.target.value)} />
				<br />
				<button>Log In</button>
			</form>
		</div>
	)
}

export default LogInPage
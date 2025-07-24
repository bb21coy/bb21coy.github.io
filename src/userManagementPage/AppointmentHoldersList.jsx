import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { handleServerError, showMessage } from '../general/handleServerError'
import { AppointmentInformation } from './AppointmentInformation';
import { BASE_URL } from '../Constants';

// To manage permissions for appointment holders
const AppointmentHoldersList = ({ account_type, load, reLoad }) => {
	const [appointments, setAppointments] = useState([])
	const [appointmentHolders, setAppointmentHolders] = useState({})
	const [boyList, setBoyList] = useState([])
	const [primerList, setPrimerList] = useState([])
	const [officerList, setOfficerList] = useState([])
	const [accountType, setAccountType] = useState()
	const [accountId, setAccountId] = useState()

	useEffect(() => {
		axios.get(`${BASE_URL}/appointment`, { headers: { 'x-route': '/get_appointments' }, withCredentials: true })
		.then(resp => {
			setAppointments(resp.data.appointments)
			setAppointmentHolders(resp.data.appointment_to_accounts)
		})
		.catch(resp => {
			console.error("Error fetching appointments:", resp.data);
			handleServerError(resp.response.status)
		})

		axios.get(`${BASE_URL}/account?type=Boy`, { headers: { 'x-route': '/get_accounts_by_type' }, withCredentials: true })
		.then(resp => setBoyList(resp.data))
		.catch(resp => handleServerError(resp.response.status))
		
		axios.get(`${BASE_URL}/account?type=Primer`, { headers: { 'x-route': '/get_accounts_by_type' }, withCredentials: true })
		.then(resp => setPrimerList(resp.data))
		.catch(resp => handleServerError(resp.response.status))

		axios.get(`${BASE_URL}/account?type=Officer`, { headers: { 'x-route': '/get_accounts_by_type' }, withCredentials: true })
		.then(resp => setOfficerList(resp.data))
		.catch(resp => handleServerError(resp.response.status))
	}, [load])

	function createAppointment(e) {
		e.preventDefault()
		if (!e.target.checkValidity()) return showMessage("Please fill in all fields")

		const formData = new FormData(e.target);
		
		axios.post(`${BASE_URL}/appointment`, formData, { headers: { "x-route": "/create_appointment" }, withCredentials: true })
		.then(() => reLoad())
		.catch(resp => handleServerError(resp.response.status))
	}

	return (
		<div className='appointment-holders-list'>
			<h2>Appointment Holders</h2>

			<div className='appointment-holders-users'>
				{appointments.map((appointment) =>
					<AppointmentInformation accountType={account_type} key={appointment.id} appointment={appointment} appointmentHolders={appointmentHolders} boyList={boyList} primerList={primerList} officerList={officerList} />
				)}
			</div>

			{(account_type == "Officer" || account_type == "Admin") && <form onSubmit={createAppointment} noValidate>
				<h3>Add Appointment</h3>

				<label htmlFor='name'>Appointment Name:</label>
				<input placeholder='Enter Appointment Name' type='text' id='name' autoComplete='off' required></input>
				
				<label htmlFor='account-type'>Account Type: </label>
				<select id="account-type" defaultValue={""} required onChange={e => setAccountType(e.target.value)}>
					<option value="" disabled hidden>Select Account Type</option>
					<option value="Officer">Officer</option>
					<option value="Primer">Primer</option>
					<option value="Boy">Boy</option>
				</select>
		
				{accountType && <>
					<label htmlFor='holder'>Appointment Holder:</label>
					<select id="holder" defaultValue={""} required>
						<option value="" disabled hidden>Select Appointment Holder</option>
						{window[`${accountType.toLowerCase()}List`].map(user => (
							<option key={user.id} value={user.id}>{user.account_name}</option>
						))}
					</select>
				</>}
			
				<button>Add New Appointment</button>
			</form>}
		</div>
	)
}

AppointmentHoldersList.propTypes = {
	account_type: PropTypes.string,
	load: PropTypes.bool.isRequired,
	reLoad: PropTypes.func.isRequired
}

export { AppointmentHoldersList }
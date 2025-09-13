import { useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { handleServerError, showMessage } from '../general/handleServerError'
import BASE_URL from '../Constants'
import { doc, updateDoc, deleteField } from 'firebase/firestore'
import { db } from '../firebase'

// To manage permissions for appointment holders
const AppointmentInformation = ({ accountType, appointment, boyList, primerList, officerList, appointment_name }) => {
	const coreAppointments = ['Captain', 'CSM', 'DY CSM', 'Sec 4/5 PS', 'Sec 3 PS', 'Sec 2 PS', 'Sec 1 PS']
	const [accountId, setAccountId] = useState()

	function updateAppointmentHolder() {
		if (accountId === appointment.account_id || accountId == null) return;

		axios.put(`${BASE_URL}/appointment`, { appointment_id: appointment._id, account_id: accountId }, { headers: { 'x-route': '/update_appointment' }, withCredentials: true })
			.then(() => {
				reLoad();
				showMessage("Appointment holder has been updated.", "success");
			})
			.catch(err => {
				console.log(err.response.data);
				handleServerError(err.response.status);
			})
	}

	async function deleteAppointment() {
		try {
			const appointmentRef = doc(db, "appointments", "HJbxljYligJkryXpA7sh");
			await updateDoc(appointmentRef, {
				[appointment_name]: deleteField()
			})
		} catch (err) {
			console.error(err)
			showMessage("Failed to delete appointment")
		}
	}

	return (
		<>
			<label htmlFor={`${appointment.id}_${appointment_name}`}>{appointment_name}:</label>
			<select id={appointment.id} defaultValue={appointment.id} onChange={(e) => setAccountId(e.target.value)}>
				<option value={appointment.id}>{appointment.account_name}</option>
				{["Officer", "Admin"].includes(accountType) && (appointment.account_type === 'Officer' ? officerList : (appointment.account_type === "Primer" ? primerList : boyList)).filter(user => user._id !== appointment.account_id).map(user => (
					<option key={user._id} value={user._id}>{user.account_name}</option>
				))}
			</select>

			<div>
				{["Officer", "Admin"].includes(accountType) && <button id={appointment.id} onClick={updateAppointmentHolder}>Update</button>}
				{["Officer", "Admin"].includes(accountType) && !(coreAppointments.includes(appointment_name)) && <button onClick={deleteAppointment}>Remove</button>}
			</div>
		</>
	)
}

AppointmentInformation.propTypes = {
	accountType: PropTypes.string,
	appointment: PropTypes.shape(),
	boyList: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.number,
			account_name: PropTypes.string
		})
	),
	primerList: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.number,
			account_name: PropTypes.string
		})
	),
	officerList: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.number,
			account_name: PropTypes.string
		})
	)
}

export default AppointmentInformation
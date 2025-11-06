import { useState } from 'react'
import PropTypes from 'prop-types'
import { showMessage } from '../general/handleServerError'
import { doc, updateDoc, deleteField } from '@firebase/firestore'
import { db } from '../firebase'

// To manage permissions for appointment holders
const AppointmentInformation = ({ accountType, appointment, appointment_name, usersList }) => {
	const coreAppointments = ['Captain', 'CSM', 'DY CSM', 'Sec 4&5 PS', 'Sec 3 PS', 'Sec 2 PS', 'Sec 1 PS']
	const [accountId, setAccountId] = useState()
	const appointmentRef = doc(db, "appointments", "HJbxljYligJkryXpA7sh");

	async function updateAppointmentHolder() {
		if (accountId === appointment.id || !accountId) return;

		await updateDoc(appointmentRef, {
			[appointment_name]: doc(db, "users", accountId)
		})

		showMessage("Appointment holder has been updated.", "success");
	}

	async function deleteAppointment() {
		try {
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
			<select id={`${appointment.id}_${appointment_name}`} defaultValue={appointment.id} onChange={(e) => setAccountId(e.target.value)}>
				<option value={appointment.id}>{appointment.n}</option>
				{["Officer", "Admin"].includes(accountType) && usersList.filter(user => user.account_type === appointment.account_type && user.id !== appointment.id).map(user => (
					<option key={user.id} value={user.id}>{user.n}</option>
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
	appointment_name: PropTypes.string,
	usersList: PropTypes.arrayOf(PropTypes.shape())
}

export default AppointmentInformation
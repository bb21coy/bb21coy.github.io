import { useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { handleServerError, showMessage } from '../general/handleServerError'
import BASE_URL from '../Constants'

// To manage permissions for appointment holders
const AppointmentInformation = ({ accountType, appointment, reLoad, boyList, primerList, officerList }) => {
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

	function deleteAppointment() {
		axios.delete(`${BASE_URL}/appointment?id=${appointment._id}`, { headers: { 'x-route': '/delete_appointment' }, withCredentials: true })
			.then(() => {
				reLoad();
				showMessage("Appointment has been removed.", "success");
			})
			.catch(err => {
				console.error(err.response.data);
				handleServerError(err.response.status);
			})
	}

	return (
		<>
			<label htmlFor={appointment._id}>{appointment.appointment_name}:</label>
			<select id={appointment._id} defaultValue={appointment.account_id} onChange={(e) => setAccountId(e.target.value)}>
				<option value={appointment.account_id}>{appointment.account_name}</option>
				{["Officer", "Admin"].includes(accountType) && (appointment.account_type === 'Officer' ? officerList : (appointment.account_type === "Primer" ? primerList : boyList)).filter(user => user._id !== appointment.account_id).map(user => (
					<option key={user._id} value={user._id}>{user.account_name}</option>
				))}
			</select>

			<div>
				{["Officer", "Admin"].includes(accountType) && <button id={appointment.id} className={appointment.appointment_name} onClick={updateAppointmentHolder}>Update</button>}
				{["Officer", "Admin"].includes(accountType) && !(coreAppointments.includes(appointment.appointment_name)) && <button onClick={deleteAppointment}>Remove</button>}
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
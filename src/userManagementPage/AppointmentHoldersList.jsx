import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { showMessage } from '../general/handleServerError'
import AppointmentInformation from './AppointmentInformation';
import { collection, getDoc, updateDoc, doc, onSnapshot } from "@firebase/firestore";
import { db } from "../firebase";
import styles from './appointmentHoldersList.module.scss'

// To manage permissions for appointment holders
const AppointmentHoldersList = ({ account_type, usersList }) => {
	const [appointments, setAppointments] = useState([])
	const [accountType, setAccountType] = useState()

	useEffect(() => {
		const unsubscribe = onSnapshot(collection(db, "appointments"), async (querySnapshot) => {
			if (querySnapshot.empty) return;
			const firstDoc = querySnapshot.docs[0];
			const data = firstDoc.data();
			const appts = {};

			for (const [key, ref] of Object.entries(data)) {
				const refSnap = await getDoc(ref);
				if (refSnap.exists()) {
					appts[key] = { id: refSnap.id, ...refSnap.data() };
				}
			}

			setAppointments(appts);
		});

		return () => unsubscribe();
	}, []);

	async function createAppointment(e) {
		try {
			e.preventDefault()

			const formData = new FormData(e.target);
			const formJson = Object.fromEntries(formData.entries());
			if (!formJson.appointment_name) return showMessage("Please fill in all fields")
			const appointmentRef = doc(db, "appointments", "HJbxljYligJkryXpA7sh");
			const newApptDoc = doc(db, "users", formJson.account_id);

			await updateDoc(appointmentRef, {
				[formJson.appointment_name]: newApptDoc
			});

			showMessage("Appointment has been created", "success")
			e.target.reset()
		} catch (err) {
			console.error(err)
			showMessage("Failed to create appointment")
		}
	}

	return (
		<div className={styles['appointment-holders-list']}>
			<h2>Appointment Holders</h2>

			<div className={styles['appointment-holders-users']}>
				{Object.entries(appointments).map(([key, appointment], index) =>
					<AppointmentInformation accountType={account_type} key={index} appointment={appointment} appointment_name={key} usersList={usersList} />
				)}
			</div>

			{(["Admin", "Officer"].includes(account_type)) && <form onSubmit={createAppointment} noValidate>
				<h3>New Appointment</h3>

				<label htmlFor='name'>Appointment Name:</label>
				<input placeholder='Enter Appointment Name' type='text' id='name' autoComplete='off' required name='appointment_name' />

				<label htmlFor='account-type'>Account Type: </label>
				<select id="account-type" defaultValue={""} required onChange={e => setAccountType(e.target.value)} name='account_type'>
					<option value="" disabled hidden>Select Account Type</option>
					<option value="Officer">Officer</option>
					<option value="Primer">Primer</option>
					<option value="Boy">Boy</option>
				</select>

				{accountType && <>
					<label htmlFor='holder'>Appointment Holder:</label>
					<select id="holder" defaultValue={""} required name='account_id'>
						<option value="" disabled hidden>Select Appointment Holder</option>
						{usersList.filter(user => user.account_type === accountType).map(user => (
							<option key={user.id} value={user.id}>{user.account_name}</option>
						))}
					</select>
				</>}

				<button>Add</button>
			</form>}
		</div>
	)
}

AppointmentHoldersList.propTypes = {
	account_type: PropTypes.string,
	usersList: PropTypes.array
}

export default AppointmentHoldersList
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AccountCreationForm from './AccountCreationForm'
import AppointmentHoldersList from './AppointmentHoldersList'
import UserInformation from './UserInformation'
import UserAccountsList from './UserAccountsList'
import "../styles/userManagementPage.scss"
import { useUser } from '../general/UserContext'

// To access current users and create new accounts
const UserManagementPage = () => {
	const navigate = useNavigate()
	const { user } = useUser();
	const accountType = user.account_type;
	const appointment = user.appointment;
	const [pageState, setPageState] = useState("form");
	const [usersList, setUsersList] = useState([])
	const [pageSize, setPageSize] = useState(window.innerWidth > 800);

	useEffect(() => {
		window.addEventListener("resize", () => setPageSize(window.innerWidth > 800))
		// if (user.account_type === 'Boy' && user.appointment === null) navigate('/home')
	}, [navigate])

	// Show the form to create new accounts
	function showForm() {
		pageSize ? setPageState("form") : navigate("/user_management/0");
	}

	const showForm1 = () => setPageState("form")
	const showAppointments = () => setPageState("appointments")

	function showUser(id) {
		if (pageSize) {
			setPageState(id)
		} else {
			navigate("/user_management/" + encodeURIComponent(id))
		}
	}

	function filter() {
		const search = document.getElementById('search').value.toLowerCase()

		document.querySelectorAll("#all-users label").forEach(label => {
			const name = label.textContent.toLowerCase()
			label.style.display = name.includes(search) ? "block" : "none";
		})
	}

	return (
		<div className='user-management-page'>
			<div className='toggle-buttons'>
				<input type="radio" name="toggle-buttons" id="users" onChange={showForm1} checked={pageState !== "appointments"} />
				<label htmlFor="users">Users</label>
				<input type="radio" name="toggle-buttons" id="appt" onChange={showAppointments} checked={pageState === "appointments"} />
				<label htmlFor="appt">Appointments</label>
			</div>

			<div className='users'>
				{pageState !== "appointments" && <>
					<div className='users-list'>
						<div>
							<i className='fa-solid fa-magnifying-glass'></i>
							<input type="search" id="search" placeholder='Find someone' onInput={filter} />
							<i onClick={showForm} className='fa-solid fa-user-plus'></i>
						</div>

						<div id='all-users'>
							<UserAccountsList setUsersList={setUsersList} usersList={usersList} showUser={showUser} pageState={pageState} />
						</div>
					</div>
					<hr />
				</>}

				<div className='main-block'>
					{pageState === "form" && <AccountCreationForm account_type={accountType} appointment={appointment} />}
					{pageState === "appointments" && <AppointmentHoldersList account_type={accountType} />}
					{pageState !== "form" && pageState !== "appointments" && <UserInformation userInfo={usersList.find(user => user.id === pageState)} showForm={showForm} />}
				</div>
			</div>
		</div>
	)
}

export default UserManagementPage
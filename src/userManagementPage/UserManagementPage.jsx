import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { AccountCreationForm } from './AccountCreationForm'
import { AppointmentHoldersList } from './AppointmentHoldersList'
import { UserInformation } from './UserInformation'
import { OfficerAccountsList } from './OfficerAccountsList'
import { PrimerAccountsList } from './PrimerAccountsList'
import { BoyAccountsList } from './BoyAccountsList'
import { GraduatedBoyAccountsList } from './GraduatedBoyAccountsList'
import "../styles/userManagementPage.scss"
import { showMessage } from '../general/handleServerError'
import { BASE_URL } from '../Constants'

// To access current users and create new accounts
const UserManagementPage = () => {
	const navigate = useNavigate()
	const [renderPage, setRenderPage] = useState(false)
	const [load, setLoad] = useState(true);
	const [pageState, setPageState] = useState("form");
	const [user, setUser] = useState(null);
	const [pageSize,] = useState(window.innerWidth > 800);
	const [accountType, setAccountType] = useState()
	const [appointment, setAppointment] = useState()

	useEffect(() => {
		axios.get(`${BASE_URL}/account`, { headers: { "x-route": "/get_own_account" }, withCredentials: true })
		.then(response => {
			if (response.data.account_type == 'Boy' && response.data.appointment == null) navigate('/home')
			setAccountType(response.data.account_type)
			setAppointment(response.data.appointment)
			setRenderPage(true)
		})
		.catch(err => {
			console.error("Error fetching user information: ", err.response.data);
			showMessage("Failed to load user information")
		})
	}, [])

	// Show the form to create new accounts
	function showForm() {
		pageSize ? setPageState("form") : navigate("/user_management/0");
	}

	function showForm1() {
		setPageState("form")
	}

	function showAppointments() {
		setPageState("appointments")
	}

	function showUser(id) {
		if (pageSize) {
			setPageState("user")
			setUser(id)
		} else {
			window.location.href = "/user_management/" + encodeURIComponent(id)
		}
	}

	function reLoad() {
		setLoad((prevLoad) => {
			return !prevLoad
		})
	}

	function filter() {
		const search = document.getElementById('search').value.toLowerCase()

		document.querySelectorAll("#all-users label").forEach(label => {
			const name = label.textContent.toLowerCase()
			label.style.display = name.includes(search) ? "block" : "none";
		})
	}

	if (!renderPage) return null

	return (
		<div className='user-management-page'>
			<div className='page-container'>
				<div className='toggle-buttons'>
					<input type="radio" name="toggle-buttons" id="users" onChange={showForm1} checked={pageState != "appointments"} />
					<label htmlFor="users">Users</label>
					<input type="radio" name="toggle-buttons" id="appt" onChange={showAppointments} checked={pageState == "appointments"} />
					<label htmlFor="appt">Appointment Holders</label>
				</div>

				<div className='users'>
					{pageState != "appointments" && <>
						<div className='users-list'>
							<div>
								<div>
									<label htmlFor="search">
										<i className='fa-solid fa-magnifying-glass'></i>
										Search
									</label>
									<input type="search" name="search" id="search" placeholder='Search by Name' onInput={filter} />
								</div>
								<button onClick={showForm}>Create New Account</button>
							</div>

							<div id='all-users'>
								<p>Current Users</p>
								{["Admin", "Officer"].includes(accountType) && <OfficerAccountsList setPageState={showUser} load={load} />}
								{accountType != "Boy" && <PrimerAccountsList setPageState={showUser} load={load} />}
								<BoyAccountsList setPageState={showUser} load={load} />

								<p>Graduated Boys</p>
								<GraduatedBoyAccountsList setPageState={showUser} load={load} />
							</div>
						</div>
						<hr />
					</>}

					<div className='main-block'>
						{pageState == "form" && <AccountCreationForm account_type={accountType} appointment={appointment} reLoad={reLoad} />}
						{pageState == "appointments" && <AppointmentHoldersList account_type={accountType} load={load} reLoad={reLoad} />}
						{pageState == "user" && <UserInformation accountType={accountType} appointment={appointment} userId={user} showForm={showForm} reLoad={reLoad} />}
					</div>
				</div>
			</div>
		</div>
	)
}

export { UserManagementPage }
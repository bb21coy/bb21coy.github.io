import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { handleServerError } from './handleServerError'
import { BASE_URL } from '../Constants'

const Header = () => {
	const navigate = useNavigate();
	const [loggedIn, setLoggedIn] = useState(false)
	const [navigationViewable, setNavigationViewable] = useState(false)
	const [buttons, setButtons] = useState(2);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [user, setUser] = useState({});
	const [currentPage, setCurrentPage] = useState(window.location.hash);

	useEffect(() => {
		async function checkSession() {
			try {
				const response = await axios.get(`${BASE_URL}/auth`, { headers: { "x-route": "/check_session" }, withCredentials: true })
				if (response.data.valid) {
					const ownAccount = await axios.get(`${BASE_URL}/account`, { headers: { "x-route": "/get_own_account" }, withCredentials: true })
					setUser(ownAccount.data)
					setLoggedIn(!!ownAccount.data)

					if (response.data) {
						let count = 4;
						if (response.data.account_type === "Boy") count += 1
						if (response.data.account_type === "Admin") count += 1;
						if ((response.data.account_type !== "Boy") || (response.data.account_type === "Boy" && response.data.appointment !== null)) count += 3
						if (response.data.account_type !== "Boy") count += 1
						setButtons(count);
					}
				} else {
					navigate('/log_in');
				}
			} catch (err) {
				console.error("Error checking session:", err);
				handleServerError(err.response.status);
			}
		}

		checkSession();
		setCurrentPage(window.location.hash);
	}, [navigate])

	const toggleUserMenu = () => {
		setNavigationViewable(prevState => !prevState);
	};

	const toggleSidebar = () => {
		setSidebarOpen(prevState => !prevState);
	}

	const logOut = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/auth`, {}, { headers: { "x-route": "/logout" }, withCredentials: true })
            if (response.data) navigate('/log_in');
        } catch (err) {
            console.error("Error logging out:", err);
            handleServerError(err.response.status)
        }
    }

	return (
		<header>
			<div>
				<button className="menu-button" onClick={toggleUserMenu} aria-label='Menu'>
					<i className="fa-solid fa-bars"></i>
				</button>

				<img src="/images/coy logo.webp" alt='BB Logo' width={"90px"} height={"90px"} onClick={() => { navigate('/home') }} />
			</div>

			<div data-state={navigationViewable} style={{ height: (40 * buttons) + "px" }} data-header-type={loggedIn ? "home" : "public"}>
				{!loggedIn && <>
					<button className="log-in--button" onClick={() => { navigate('/parade_notice') }}>Parade Notice</button>
					<button className="log-in--button" onClick={() => { navigate('/log_in') }}>Members Log In</button>
				</>}

				{loggedIn &&
					<>
						{user.account_type === "Admin" &&
							<button className="admin--button" onClick={() => { navigate('/admin') }}>Admin Page</button>}

						{(user.account_type !== "Boy" || user.appointment !== null) &&
							<button className="user-management--button" onClick={() => { navigate('/user_management') }}>Users Management</button>}

						{(user.account_type === "Officer" || user.appointment?.toLowerCase().includes("tech")) &&
							<button className="award-management--button" onClick={() => { navigate('/home_editor') }}>Home Page Editor</button>}

						<button className="attendance-management--button" onClick={() => { navigate('/attendance_management') }}>Parades & Attendance</button>

						{(user.account_type === "Boy") &&
							<button className="user-management--button" onClick={() => { navigate('/user_awards') }}>My Awards</button>}

						{(user.account_type === "Boy") &&
							<button className="user-management--button" onClick={() => { navigate('/user_inspections') }}>My Inspection Results</button>}

						{(user.account_type !== "Boy" || user.appointment !== null) &&
							<button className="award-management--button" onClick={() => { navigate('/awards') }}>Award Management</button>}

						{(user.account_type !== "Boy" || user.appointment !== null) &&
							<button className="result-generation--button" onClick={() => { navigate('/generate_result') }}>Result Generation</button>}

						{user.account_type !== "Boy" &&
							<button className="uniform-inspection--button" onClick={() => { navigate('/uniform_inspection_results') }}>Uniform Inspection</button>}

						<button onClick={() => { navigate('/reset_password') }}>Reset Log In Information</button>
						<button onClick={() => { navigate('/help') }}>Help</button>
						<button className="log-out--button" onClick={logOut}>Log Out</button>

						<button aria-label='Open Sidebar' onClick={toggleSidebar}>
							<i className='fa-solid fa-bars'></i>
						</button>
					</>
				}
			</div>

			<div className='sidebar' data-open={sidebarOpen}>
				<div>
					<h2>Menu</h2>
					<button aria-label='Close Sidebar' onClick={toggleSidebar}>
						<i className='fa-solid fa-xmark'></i>
					</button>
				</div>

				<div>
					{!loggedIn ? <>
						<button onClick={() => navigate('/parade_notice')}>Parade Notice</button>
						<button onClick={() => navigate('/log_in')}>Members Log In</button>
					</> : <>
						<button onClick={() => navigate('/home')} className={currentPage === '#/home' ? 'active' : ''}>
							<i className='fa-solid fa-house'></i>
							Dashboard
						</button>

						{user.account_type === "Admin" &&
							<button onClick={() => navigate('/admin')} className={currentPage === '#/admin' ? 'active' : ''}>
								<i className='fa-solid fa-gear'></i>
								Admin Page
							</button>}

						{(user.account_type !== "Boy" || user.appointment !== null) &&
							<button onClick={() => navigate('/user_management')} className={currentPage === '#/user_management' ? 'active' : ''}>
								<i className='fa-solid fa-users'></i>
								Users Management
							</button>}

						{(user.account_type === "Officer" || user.appointment?.toLowerCase().includes("tech")) &&
							<button onClick={() => navigate('/home_editor')} className={currentPage === '#/home_editor' ? 'active' : ''}>
								<i className='fa-solid fa-edit'></i>
								Home Page Editor
							</button>}

						<button onClick={() => navigate('/attendance_management')} className={currentPage === '#/attendance_management' ? 'active' : ''}>
							<i className='fa-solid fa-file'></i>
							Parades & Attendance
						</button>

						{(user.account_type === "Boy") && <>
							<button onClick={() => navigate('/user_awards')} className={currentPage === '#/user_awards' ? 'active' : ''}>
								<i className='fa-solid fa-award'></i>
								My Awards
							</button>
							<button onClick={() => navigate('/user_inspections')} className={currentPage === '#/user_inspections' ? 'active' : ''}>
								<i className='fa-solid fa-shirt-long-sleeve'></i>
								My Inspection Results
							</button>
						</>}

						{(user.account_type !== "Boy" || user.appointment !== null) && <>
							<button onClick={() => navigate('/awards')} className={currentPage === '#/awards' ? 'active' : ''}>
								<img src="images/awards_tracker.webp" alt="Awards Management Icon" />
								Awards Management
							</button>
							<button onClick={() => navigate('/generate_result')} className={currentPage === '#/generate_result' ? 'active' : ''}>
								<i className='fa-solid fa-file-invoice'></i>
								Result Generation
							</button>
						</>}

						{user.account_type !== "Boy" &&
							<button onClick={() => navigate('/uniform_inspection_results')} className={currentPage === '#/uniform_inspection_results' ? 'active' : ''}>
								<i className='fa-solid fa-shirt-long-sleeve'></i>
								Uniform Inspection
							</button>}

						<button onClick={() => navigate('/reset_password')} className={currentPage === '#/reset_password' ? 'active' : ''}>
							<i className='fa-solid fa-rotate-right'></i>
							Reset Log In Information
						</button>
						<button onClick={() => navigate('/help')} className={currentPage === '#/help' ? 'active' : ''}>
							<i className='fa-solid fa-question'></i>
							Help
						</button>
						<button onClick={logOut} className='log-out--button'>
							<i className='fa-solid fa-lock'></i>
							Log Out
						</button>
					</>}
				</div>
			</div>
		</header>
	)
}

export default Header

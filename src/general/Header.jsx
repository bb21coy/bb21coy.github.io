import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { handleServerError } from './handleServerError'
import { useUser } from './UserContext'
import { signOut, onAuthStateChanged } from "@firebase/auth";
import { doc, getDoc } from "@firebase/firestore";
import { auth, db } from "../firebase";
import styles from './header.module.scss'

const Header = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { user, setUser, loggedIn, setLoggedIn, navigationViewable, setNavigationViewable } = useUser();
	const [buttons, setButtons] = useState(2);
	const [currentPage, setCurrentPage] = useState(window.location.hash);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (user) => {
			if (!user) {
				if (!["/", "/login", "/parade_notice"].includes(location.pathname)) return navigate('/login?next=' + location.pathname);
			} else {
				setLoggedIn(!!user);
				getData(user);
			}
		})

		async function getData(user) {
			const ref = doc(db, "users", user.uid);
			const snap = await getDoc(ref);
			const data = snap.data();
			if (snap.exists()) setUser(data);
			else return

			let count = 5;
			if (data.account_type === "Boy") count += 1
			if ((data.account_type !== "Boy") || (data.account_type === "Boy" && data.appointment !== null)) count += 3
			if (data.account_type !== "Boy") count += 1
			setButtons(count);
		}

		setCurrentPage(window.location.hash);
		return () => unsub();
	}, [navigate, location])

	useEffect(() => {
		console.log(acsiiArt);
	}, [])

	const logOut = async () => {
		try {
			await signOut(auth);
			setLoggedIn(false);
			setUser({});
			setNavigationViewable(false);
			navigate('/login')
		} catch (err) {
			console.error("Error logging out:", err);
			handleServerError(err.response.status)
		}
	}

	return (
		<header>
			<div>
				<button className={styles["menu-button"]} onClick={() => setNavigationViewable(prevState => !prevState)} aria-label='Menu'>
					<i className="fa-solid fa-bars"></i>
				</button>

				<img src="coy logo.webp" alt='BB Logo' width={"90px"} height={"90px"} onClick={() => navigate(loggedIn ? '/home' : '/login')} />
			</div>

			<div data-state={navigationViewable} style={{ height: (40 * buttons) + "px" }} data-header-type={loggedIn ? "home" : "public"}>
				{!loggedIn && <>
					<button className={styles.login} onClick={() => navigate('/parade_notice')}>Parade Notice</button>
					<button className={styles.login} onClick={() => navigate('/login')}>Login</button>
				</>}

				{loggedIn &&
					<>
						{(user.account_type !== "Boy" || user.appointment !== null) &&
							<button onClick={() => navigate('/user_management')}>Users Management</button>}

						{(user.account_type === "Officer" || user.appointment?.toLowerCase().includes("tech")) &&
							<button onClick={() => navigate('/home_editor')}>Home Page Editor</button>}

						<button onClick={() => navigate('/attendance_management')}>Parades & Attendance</button>

						{(user.account_type === "Boy") &&
							<button onClick={() => navigate('/user_awards')}>My Awards</button>}

						{(user.account_type === "Boy") &&
							<button onClick={() => navigate('/user_inspections')}>My Inspection Results</button>}

						{(user.account_type !== "Boy" || user.appointment !== null) &&
							<button onClick={() => navigate('/awards')}>Award Management</button>}

						{(user.account_type !== "Boy" || user.appointment !== null) &&
							<button onClick={() => navigate('/generate_result')}>Result Generation</button>}

						{user.account_type !== "Boy" &&
							<button onClick={() => navigate('/uniform_inspection_results')}>Uniform Inspection</button>}

						<button onClick={() => navigate('/user_awards')}>Resources</button>
						<button onClick={() => navigate('/manage_login')}>Manage Login</button>
						<button onClick={() => navigate('/help')}>Help</button>
						<button onClick={logOut}>Logout</button>

						<button aria-label='Open Sidebar' onClick={() => setNavigationViewable(prevState => !prevState)}>
							<i className='fa-solid fa-bars'></i>
						</button>
					</>
				}
			</div>

			<div className={styles.sidebar} data-open={navigationViewable}>
				<div>
					<h2>Menu</h2>
					<button aria-label='Close Sidebar' onClick={() => setNavigationViewable(prevState => !prevState)}>
						<i className='fa-solid fa-xmark'></i>
					</button>
				</div>

				<div>
					{!loggedIn ? <>
						<button onClick={() => navigate('/parade_notice')}>Parade Notice</button>
						<button onClick={() => navigate('/login')}>Members Log In</button>
					</> : <>
						<button onClick={() => navigate('/home')} className={currentPage === '#/home' ? styles.active : ''}>
							<i className='fa-solid fa-house'></i>
							Dashboard
						</button>

						{(user.account_type !== "Boy" || user.appointment !== null) &&
							<button onClick={() => navigate('/user_management')} className={currentPage === '#/user_management' ? styles.active : ''}>
								<i className='fa-solid fa-users'></i>
								Users Management
							</button>}

						{(user.account_type === "Officer" || user.appointment?.toLowerCase().includes("tech")) &&
							<button onClick={() => navigate('/home_editor')} className={currentPage === '#/home_editor' ? styles.active : ''}>
								<i className='fa-solid fa-edit'></i>
								Home Page Editor
							</button>}

						<button onClick={() => navigate('/attendance_management')} className={currentPage === '#/attendance_management' ? styles.active : ''}>
							<i className='fa-solid fa-file'></i>
							Parades & Attendance
						</button>

						{(user.account_type === "Boy") && <>
							<button onClick={() => navigate('/user_awards')} className={currentPage === '#/user_awards' ? styles.active : ''}>
								<i className='fa-solid fa-award'></i>
								My Awards
							</button>
							<button onClick={() => navigate('/user_inspections')} className={currentPage === '#/user_inspections' ? styles.active : ''}>
								<i className='fa-solid fa-shirt-long-sleeve'></i>
								My Inspection Results
							</button>
						</>}

						{(user.account_type !== "Boy" || user.appointment !== null) && <>
							<button onClick={() => navigate('/awards')} className={currentPage === '#/awards' ? styles.active : ''}>
								<img src="awards_tracker.webp" alt="Awards Management Icon" />
								Awards Management
							</button>
							<button onClick={() => navigate('/generate_result')} className={currentPage === '#/generate_result' ? styles.active : ''}>
								<i className='fa-solid fa-file-invoice'></i>
								Result Generation
							</button>
						</>}

						{user.account_type !== "Boy" &&
							<button onClick={() => navigate('/uniform_inspection')} className={currentPage === '#/uniform_inspection' ? styles.active : ''}>
								<i className='fa-solid fa-shirt-long-sleeve'></i>
								Uniform Inspection
							</button>}

						<button onClick={() => navigate('/resources')} className={currentPage === '#/resources' ? styles.active : ''}>
							<i className='fa-solid fa-book'></i>
							Resources
						</button>

						<button onClick={() => navigate('/manage_login')} className={currentPage === '#/manage_login' ? styles.active : ''}>
							<i className='fa-solid fa-lock'></i>
							Manage Login
						</button>
						<button onClick={() => navigate('/help')} className={currentPage === '#/help' ? styles.active : ''}>
							<i className='fa-solid fa-question'></i>
							Help
						</button>
						<button onClick={logOut} className='log-out--button'>
							<i className='fa-solid fa-right-from-bracket'></i>
							Logout
						</button>
					</>}
				</div>
			</div>
		</header>
	)
}

const acsiiArt = `
 mmmmmm    mmmmmm     mmmmm      mmm    
 ##""""##  ##""""##  #""""##m   #"##    
 ##    ##  ##    ##        ##     ##    
 #######   #######       m#"      ##    
 ##    ##  ##    ##    m#"        ##    
 ##mmmm##  ##mmmm##  m##mmmmm  mmm##mmm 
 """""""   """""""   """"""""  """""""" 
`

export default Header

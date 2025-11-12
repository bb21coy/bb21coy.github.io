import { useState, useEffect, Fragment } from 'react'
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
	const [userImage, setUserImage] = useState(null);
	const { user, setUser, loggedIn, setLoggedIn, navigationViewable, setNavigationViewable } = useUser();
	const [buttons, setButtons] = useState(2);
	const [currentPage, setCurrentPage] = useState(window.location.pathname);
	
	const [submenuPos, setSubmenuPos] = useState({ x: 0, y: 0 });
	const [activeMenu, setActiveMenu] = useState(null);
	const baseTabs = {
		"statistics": { "My Attendance": ["/user_attendance", "'\\f4fd'"], "My Awards": ["/user_awards", "'\\f559'"], "My Inspection Results": ["/user_inspections", "'\\e3c7'"] },
		"management": { "User Management": ["/user_management", "'\\f0c0'"], "Parades & Attendance": ["/attendance_management", "'\\f15b'"], "Awards Management": ["/awards_management", "'\\f5f3'"], "Result Generation": ["/generate_result", "'\\f570'"], "Uniform Inspection": ["/uniform_inspection", "'\\e3c7'"] },
		"others": { "Resources": ["/resources", "'\\f02d'"], "Manage Login": ["/manage_login", "'\\f023'"], "Help": ["/help", "'\\003f'"], "Parade Notice": ["/parade_notice", "'\\f15b'"], "Calendar": ["/calendar", "'\\f133'"] }
	}
	const [tabs, setTabs] = useState(baseTabs);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
			if (!firebaseUser) {
				if (!["/", "/login", "/parade_notice"].includes(location.pathname)) {
					return navigate('/login?next=' + location.pathname);
				}
				return;
			}

			setUserImage(firebaseUser.photoURL === "" ? null : firebaseUser.photoURL);
			setLoggedIn(true);
			const tokenResult = await firebaseUser.getIdTokenResult();
			const claims = tokenResult.claims;
			const ref = doc(db, "users", firebaseUser.uid);
			const snap = await getDoc(ref);
			if (!snap.exists()) return;
			const data = snap.data();

			const fullUser = {
				uid: firebaseUser.uid,
				...data,
				appointment: claims.appt
			};

			setUser(fullUser);

			const updatedTabs = JSON.parse(JSON.stringify(baseTabs));
			if (fullUser.t !== "Boy" && fullUser.t !== "Admin") {
				delete updatedTabs.statistics["My Awards"]
				delete updatedTabs.statistics["My Inspection Results"]
			}

			if (fullUser.t === "Boy" && fullUser.appointment) delete updatedTabs.management["Uniform Inspection"]
			if (fullUser.t === "Boy" && !fullUser.appointment) delete updatedTabs.management;
			setTabs(updatedTabs);
		});

		setCurrentPage(window.location.pathname);
		return () => unsub();
	}, [navigate, location]);

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

	const handleSubmenuClick = (e, menuKey) => {
		if (activeMenu === menuKey) {
			setActiveMenu(null);
			return;
		}

		const rect = e.currentTarget.getBoundingClientRect();
		setSubmenuPos({
			x: rect.left,
			y: rect.bottom
		});
		setActiveMenu(menuKey);
	};

	return (
		<>
			<header>
				<div className={styles.logo} onClick={() => navigate(loggedIn ? '/home' : '/login')}>
					<img src="/bb-crest.png" alt='BB Logo' width={"60px"} height={"60px"} />
					<div>
						<p>The boys' brigade</p>
						<span>21st Singapore Company</span>
					</div>
				</div>

				<div className={styles.topbar}>
					{!loggedIn ? <>
						<div onClick={() => navigate('/calendar')}>Calendar</div>
						<div onClick={() => navigate('/parade_notice')}>Parade Notice</div>
						<div onClick={() => navigate('/login')}>Login</div>
					</> : <>
						<div data-home onClick={() => { navigate('/home'); setActiveMenu(null) }}>Dashboard</div>
						{Object.keys(tabs).map((menuKey) => (
							<div key={menuKey} data-submenu onClick={(e) => handleSubmenuClick(e, menuKey)}>
								{menuKey.charAt(0).toUpperCase() + menuKey.slice(1)}
							</div>
						))}

						<div data-image={!!userImage} style={{ background: `url(${userImage}) center/cover no-repeat` }} onClick={() => navigate("/user_profile")}></div>
						<div data-logout onClick={logOut}>Logout</div>
					</>}
					<i className='fa-solid fa-bars' onClick={() => setNavigationViewable(prevState => !prevState)}></i>
				</div>
			</header>

			{activeMenu && <div className={styles.sub_menu} style={{ left: submenuPos.x, top: submenuPos.y + 10, height: `${4 + (tabs[activeMenu].length * 10) + (tabs[activeMenu].length * 30)}px` }}>
				{Object.keys(tabs[activeMenu]).map((tab, index) => <button key={index} style={{ "--icon": tabs[activeMenu][tab][1] }} onClick={() => navigate(tabs[activeMenu][tab][0])}>{tab}</button>)}
			</div>}

			<div className={styles.sidebar_background} style={{ opacity: navigationViewable ? "1" : "0" }}></div>
			<div className={styles.sidebar} style={{ right: navigationViewable ? '0' : "-110vw" }}>
				<div>
					{loggedIn && <div data-image={!!userImage} style={{ background: `url(${userImage}) center/cover no-repeat` }} onClick={() => navigate("/user_profile")}></div>}
					<i className='fa-solid fa-xmark' onClick={() => setNavigationViewable(prevState => !prevState)}></i>
				</div>

				<div>
					{!loggedIn ? <>
						<button onClick={() => navigate('/parade_notice')} style={{ "--icon": '"\\f15b"' }}>Parade Notice</button>
						<button onClick={() => navigate('/calendar')} style={{ "--icon": '"\\f133"' }}>Calendar</button>
						<hr />
						<button data-main-button onClick={() => navigate('/login')}>Login</button>
					</> : <>
						<button onClick={() => navigate('/home')} style={{ "--icon": '"\\f015"' }} className={currentPage === '/home' ? styles.active : ''}>Dashboard</button>

						{Object.keys(tabs).map((tab, index) => (
							<Fragment key={index}>
								<p>{tab.charAt(0).toUpperCase() + tab.slice(1)}</p>
								{Object.keys(tabs[tab]).map((t, index) => <button data-sub-button className={currentPage === tabs[tab][t][0] ? styles.active : ''} style={{ "--icon": tabs[tab][t][1] }} key={index} onClick={() => navigate(tabs[tab][t][0])}>{t}</button>)}
							</Fragment>
						))}

						<hr />
						<button data-main-button onClick={logOut}>Logout</button>
					</>}
				</div>
			</div>
		</>
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

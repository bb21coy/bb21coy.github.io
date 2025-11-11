import { useEffect, useState } from 'react'
import Loading from '../general/Loading'
import { PendingTasks } from './pendingTasks'
import DashboardOptions from './dashboardOptions'
import { handleServerError } from '../general/handleServerError'
import styles from './dashboardPage.module.scss'
import { useUser } from '../general/UserContext'
import { signOut } from "@firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from 'react-router-dom'

const DashboardPage = () => {
    const navigate = useNavigate()
    const [userId, setUserId] = useState(null)
    const [paradesAfterToday, setParadesAfterToday] = useState([])
    const { user, setLoggedIn, setNavigationViewable } = useUser();
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user && user.n !== null) setLoading(false)

        // const parades = await axios.get(`${BASE_URL}/parades`, { headers: { "x-route": "/get_parades_after_today" }, withCredentials: true })
        // setParadesAfterToday(parades.data)
    }, [user])

    const logOut = async () => {
        try {
            await signOut(auth);
            setLoggedIn(false);
            setNavigationViewable(false);
            navigate('/login')
        } catch (err) {
            console.error("Error logging out:", err);
            handleServerError(err.response.status)
        }
    }

    const filter = (searchTerm) => {
        const routes = document.querySelectorAll(`.${styles.route}`);
        const lower = searchTerm.toLowerCase();

        routes.forEach(route => {
            const text = route.textContent.toLowerCase();
            route.style.display = text.includes(lower) ? "flex" : "none";
        });
    };

    const convert = (rank, type) => {
        const OFFICER_RANK_MAP = { O: "OCT", J: "2LT", L: "LTA" };
		const PRIMER_RANK_MAP = { C: "CLT", S: "SCL" };
		const BOY_RANK_MAP = { R: "REC", P: "PTE", L: "LCP", C: "CPL", S: "SGT", W: "SSG", O: "WO" };

        if (type === "Officer") return OFFICER_RANK_MAP[rank];
        if (type === "Primer") return PRIMER_RANK_MAP[rank];
        if (type === "Boy") return BOY_RANK_MAP[rank];
    }

    if (loading) return <Loading />

    return (
        <div className={styles.dashboard}>
            <div className={styles['dashboard-routes']}>
                <DashboardOptions title="My Attendance" icon="user-clock" url="/user_attendance" color="C1876B" description='View your parade attendance and attendance percentages' />
                {(user.t === "Boy" || user.t === "Admin") && <>
                    <DashboardOptions title="My Awards" icon="award" url="/user_awards" color="C1876B" description='Manage your awards, and track your progress to Special Awards' />
                    <DashboardOptions title="My Inspection Results" icon="shirt-long-sleeve" url="/user_inspections" color="C1876B" description='View your results from recent inspections' />
                </>}

                {/* {(user.t === "Officer" || user.appointment?.toLowerCase().includes("tech")) && <DashboardOptions title="Home Page Editor" icon="edit" url="home_editor" color='DC9D00' />} */}
                {user.t !== "Boy" && <DashboardOptions title="Uniform Inspection" icon="shirt-long-sleeve" url="/uniform_inspection" color="D53032" description='Record uniform inspection results for Boys' />}

                {(user.t !== "Boy" || (user.t === "Boy" && user.appointment)) && <>
                    <DashboardOptions title="User Management" icon="users" url="/user_management" color="252850" description='View and Edit Portal Members, as well update Appointment Holders' />
                    <DashboardOptions title="Awards Management" icon="file-certificate" url="/awards" color="252850" description="Manage Boys' awards, eligibility, and find award requirements all in one place" />
                    <DashboardOptions title="Results Generation" icon="file-invoice" url="/generate_result" color="252850" description='Make 32A Submissions easier by automatically generating results' />
                    <DashboardOptions title="Parade & Attendance" icon="file" url="/attendance_management" color="252850" description='Manage parade schedules and record attendance seamlessly' />
                </>}

                <DashboardOptions title="Resources" icon="book" url="/resources" color="1E5945" description='View Resources for Badgeworks that you are studying for' />
                <DashboardOptions title="Manage Login" icon="lock" url="/manage_login" color="1E5945" description='Change your password, and link with 3rd Party Providers' />
                <DashboardOptions title="Help" icon="question" url="/help" color="1E5945" description='Need help? We provides a Step By Step Guide to achieveing your task' />
                <DashboardOptions title="Logout" icon="right-from-bracket" func={logOut} color="1E5945" />
            </div>

            <div className={styles['others']}>
                <div>
                    <input type="search" name="search" placeholder='What are you looking for?' onChange={(e) => filter(e.target.value)} />
                </div>

                <div>
                    <p>Welcome back,</p>
                    <h2>{!user ? "" : `${(user.t !== "Admin" && user.r === null) ? user.h : (user.t == "Admin" ? "" : convert(user.r, user.t))} ${user.n}`}</h2>

                    <br />
                    <p>{user?.t} {user?.t === "Boy" ? ("| " + (user?.appointment ?? "Member")) : ""}</p>
                </div>

                <PendingTasks accountType={user.t} appointment={user.appointment} userId={userId} paradesAfterToday={paradesAfterToday} styles={styles} />

                <div className={styles['access_levels']}>
                    {/* <div style={{ '--legend': '#DC9D00' }}></div> */}
                    {/* <p>Officers Only</p> */}
                    <div style={{ '--legend': '#D53032' }}></div>
                    <p>Officers and Primers</p>
                    <div style={{ '--legend': '#252850' }}></div>
                    <p>Boys with Appointment(s) and Above</p>
                    <div style={{ '--legend': '#C1876B' }}></div>
                    <p>Boys Only</p>
                    <div style={{ '--legend': '#1E5945' }}></div>
                    <p>All Users</p>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
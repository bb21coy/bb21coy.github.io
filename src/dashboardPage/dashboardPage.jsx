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
import AdminUsageAnalytics from './UsageAnalytics'

const DashboardPage = () => {
    const navigate = useNavigate()
    const [userId, setUserId] = useState(null)
    const [paradesAfterToday, setParadesAfterToday] = useState([])
    const { user, setLoggedIn, setNavigationViewable } = useUser();
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user && user.account_name !== null) setLoading(false)

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

    if (loading) return <Loading />

    return (
        <div className={styles.dashboard}>
            <h2>Hello, {!user ? "" : `${(user.account_type !== "Admin" && user.rank === null) ? user.honorifics : (user.account_type == "Admin" ? "" : user.rank)} ${user.account_name}`}</h2>

            <div className={styles['dashboard-routes']}>
                <DashboardOptions title="My Attendance" icon="user-clock" url="/user_attendance" />
                {user.account_type === "Boy" && <>
                    <DashboardOptions title="My Awards" icon="award" url="/user_awards" />
                    <DashboardOptions title="My Inspections Results" icon="shirt-long-sleeve" url="/user_inspections" />
                </>}

                {(user.account_type !== "Boy" || user.appointment !== null) && <DashboardOptions title="User Management" icon="users" url="/user_management" />}

                {(user.account_type === "Officer" || user.appointment?.toLowerCase().includes("tech")) && <DashboardOptions title="Home Page Editor" icon="edit" url="home_editor" />}

                <DashboardOptions title="Parade & Attendance" icon="file" url="/attendance_management" />

                {(user.account_type !== "Boy" || user.appointment !== null) && <>
                    <DashboardOptions title="Awards Management" url="/awards" image="awards_tracker.webp" />
                    <DashboardOptions title="Results Generation" icon="file-invoice" url="/generate_result" />
                </>}

                {user.account_type !== "Boy" && <DashboardOptions title="Uniform Inspection" icon="shirt-long-sleeve" url="/uniform_inspection" />}
                <DashboardOptions title="Resources" icon="book" url="/resources" />
                <DashboardOptions title="Manage Login" icon="lock" url="/manage_login" />
                <DashboardOptions title="Help" icon="question" url="/help" />
                <DashboardOptions title="Logout" icon="right-from-bracket" func={logOut} />
            </div>

            <PendingTasks accountType={user.account_type} appointment={user.appointment} userId={userId} paradesAfterToday={paradesAfterToday} styles={styles} />

            {user.account_type === "Admin" && <AdminUsageAnalytics></AdminUsageAnalytics>}
        </div>
    )
}

export default DashboardPage
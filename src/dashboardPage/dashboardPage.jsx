import { useEffect, useState } from 'react'
import Loading from '../general/Loading'
import { PendingTasks } from './pendingTasks'
import DashboardOptions from './dashboardOptions'
import styles from './dashboardPage.module.scss'
import { useUser } from '../general/UserContext'
import { useNavigate } from 'react-router-dom'

const DashboardPage = () => {
    const navigate = useNavigate()
    const [userId, setUserId] = useState(null)
    const [paradesAfterToday, setParadesAfterToday] = useState([])
    const { user } = useUser();
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user && user.n !== null) setLoading(false)
    }, [user])

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
                <DashboardOptions title="My Attendance" icon="user-clock" url="/user_attendance" color="C1876B" description='View your attendance and percentages' />
                {(user.t === "Boy" || user.t === "Admin") && <>
                    <DashboardOptions title="My Awards" icon="award" url="/user_awards" color="C1876B" description='View and Track your awards' migrating />
                    <DashboardOptions title="My Inspection Results" icon="shirt-long-sleeve" url="/user_inspections" color="C1876B" description='View your inspection results' migrating />
                </>}

                {user.t !== "Boy" && <DashboardOptions title="Uniform Inspection" icon="shirt-long-sleeve" url="/uniform_inspection" color="D53032" description='Conduct uniform inspection for Boys' migrating />}

                {(user.t !== "Boy" || (user.t === "Boy" && user.appointment)) && <>
                    <DashboardOptions title="User Management" icon="users" url="/user_management" color="252850" description='View and Edit Users and Appointments' migrating />
                    <DashboardOptions title="Awards Management" icon="file-certificate" url="/award_management" color="252850" description="Awards, eligibility, and Requirements" migrating />
                    <DashboardOptions title="Results Generation" icon="file-invoice" url="/result_generation" color="252850" description='Automatically generate 32A Results' migrating />
                    <DashboardOptions title="Parade & Attendance" icon="file" url="/attendance_management" color="252850" description='Manage parades and its attendance' />
                </>}

                <DashboardOptions title="Resources" icon="book" url="/resources" color="1E5945" description='View Resources for Badgeworks' migrating />
                <DashboardOptions title="Manage Login" icon="lock" url="/manage_login" color="1E5945" description='Change your password and link 3rd Party Providers' />
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
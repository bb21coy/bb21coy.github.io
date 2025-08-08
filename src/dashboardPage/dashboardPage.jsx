import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { PendingTasks } from './pendingTasks'
import DashboardOptions from './dashboardOptions'
import { handleServerError } from '../general/handleServerError'
import { BASE_URL } from '../Constants'
import '../styles/dashboardPage.scss'

const DashboardPage = () => {
    const navigate = useNavigate()
    const [userId, setUserId] = useState(null)
    const [paradesAfterToday, setParadesAfterToday] = useState([])
    const [account, setAccount] = useState({ account_name: '', account_type: 'Boy', appointment: null })

    useEffect(() => {
        async function init() {
            try {
                const account = await axios.get(`${BASE_URL}/account`, { headers: { "x-route": "/get_own_account" }, withCredentials: true })
                setAccount(account.data)
                setUserId(account.data.id)

                // const parades = await axios.get(`${BASE_URL}/parades`, { headers: { "x-route": "/get_parades_after_today" }, withCredentials: true })
                // setParadesAfterToday(parades.data)
            } catch (err) {
                handleServerError(err.response.status)
            }
        }

        init()
    }, [setAccount])

    const logOut = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/auth`, {}, { headers: { "x-route": "/logout" }, withCredentials: true })
            if (response.data) navigate("/")
        } catch (err) {
            console.error("Error logging out:", err);
            handleServerError(err.response.status)
        }
    }

    return (
        <div className='dashboard'>
            <h2>Hello, {!account ? "" : `${(account.account_type !== "Admin" && account.rank === null) ? account.honorifics : (account.account_type == "Admin" ? "" : account.rank)} ${account.account_name}`}</h2>

            <div className='dashboard-routes'>
                {account?.account_type === "Admin" && <DashboardOptions title="Admin Page" icon="gear" url="/admin" />}

                {account?.account_type === "Boy" && <>
                    <DashboardOptions title="My Awards" icon="award" url="/user_awards" />
                    <DashboardOptions title="My Inspections Results" icon="shirt-long-sleeve" url="/user_inspections" />
                </>}

                {(account?.account_type !== "Boy" || account?.appointment !== null) && <DashboardOptions title="User Management" icon="users" url="/user_management" />}

                {(account.account_type === "Officer" || account.appointment?.toLowerCase().includes("tech")) && <DashboardOptions title="Home Page Editor" icon="edit" url="home_editor" />}

                <DashboardOptions title="Parade & Attendance" icon="file" url="/attendance_management" />

                {(account?.account_type !== "Boy" || account?.appointment !== null) && <>
                    <DashboardOptions title="Awards Management" url="/awards" image="awards_tracker.webp" />
                    <DashboardOptions title="Results Generation" icon="file-invoice" url="/generate_result" />
                </>}

                {account?.account_type !== "Boy" && <DashboardOptions title="Uniform Inspection" icon="shirt-long-sleeve" url="/uniform_inspection" />}

                <DashboardOptions title="Change Password" icon="rotate-right" url="/reset_password" />
                <DashboardOptions title="Help" icon="question" url="/help" />
                <DashboardOptions title="Log Out" icon="lock" func={logOut} />
            </div>

            <PendingTasks accountType={account.account_type} appointment={account.appointment} userId={userId} paradesAfterToday={paradesAfterToday} />
        </div>
    )
}

export default DashboardPage
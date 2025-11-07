import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from "react-router-dom"
import AccountCreationForm from './AccountCreationForm'
import UserInformation from './UserInformation'
import { useUser } from '../general/UserContext'
import styles from "./userManagementPage.module.scss"

// To access current users and create new accounts
// This page should only be visible for mobile screens
const UserManagementSmallPage = () => {
    const navigate = useNavigate()
    const location = useLocation();
    const { userId } = useParams();
    const { user } = useUser();
    const accountType = user.t;
    const appointment = user.appointment;
    const [, setPageState] = useState("form");

    // Check if the screen is below 800px
    useEffect(() => {
        let hasNavigated = false;

        const checkAndNavigate = () => {
            if (!hasNavigated && window.innerWidth > 800) {
                hasNavigated = true;
                navigate("/user_management");
            }
        };

        checkAndNavigate();
        window.addEventListener("resize", checkAndNavigate);
        return () => window.removeEventListener("resize", checkAndNavigate);
    }, [navigate]);

    return (
        <div className={styles['user-management-page']}>
            <div className={styles.users}>
                <button aria-label='Go Back' onClick={() => navigate('/user_management')} className={styles['back-button']}>
                    <i className='fa-solid fa-arrow-left'></i>
                    Back
                </button>

                {parseInt(userId) === 0 ? <AccountCreationForm accountType={accountType} appointment={appointment} /> : <UserInformation userInfo={location.state} showForm={() => setPageState("form")} />}
            </div>
        </div>
    )
}

export default UserManagementSmallPage
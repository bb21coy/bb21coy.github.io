import { useState, useEffect } from 'react'
import { useParams, useNavigate } from "react-router-dom"
import AccountCreationForm from './AccountCreationForm'
import UserInformation from './UserInformation'

// To access current users and create new accounts
// This page should only be visible for mobile screens
const UserManagementSmallPage = () => {
    const navigate = useNavigate()
    const { userId } = useParams();
    const [, setPageState] = useState("form");

    // Check if the screen is below 800px
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 800) navigate('/user_management')
        };

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [navigate]);

    const reLoad = () => { };

    return (
        <div className='user-management-page'>
            <div className='page-container'>
                <div className='users'>
                    <div className='main-block'>
                        <button aria-label='Go Back' onClick={() => navigate('/user_management')} className='back-button'>
                            <i className='fa-solid fa-arrow-left'></i>
                            Back
                        </button>

                        {userId === 0 ? <AccountCreationForm reLoad={reLoad} /> : <UserInformation userId={userId} showForm={() => setPageState("form")} reLoad={reLoad} />}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserManagementSmallPage
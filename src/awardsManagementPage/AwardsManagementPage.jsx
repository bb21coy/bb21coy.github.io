import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../general/UserContext'
import { AwardTracker } from './AwardTracker'
import AwardRequirements from './AwardRequirements'
import styles from './awardsManagementPage.module.scss'

// To access current users and create new accounts
const AwardsManagementPage = () => {
	const navigate = useNavigate();
	const { user } = useUser();
	const [pageState, setPageState] = useState("tracker");

	useEffect(() => {
		if (user.account_name !== null && user.account_type === 'Boy' && user.appointment === null) navigate('/home')
	}, [navigate, user])

	return (
		<div className={styles['award-management-page']}>
			<div className={styles['toggle-buttons']}>
				<input type="radio" id="tracker" onChange={() => setPageState('tracker')} checked={pageState == "tracker"} role='Switch to Awards Tracker' />
				<label htmlFor="tracker">Tracker</label>
				<input type="radio" id="requirements" onChange={() => setPageState('requirements')} checked={pageState == "requirements"} role='Switch to Award Requirements' />
				<label htmlFor="requirements">Requirements</label>
			</div>

			{pageState == "tracker" ? <AwardTracker /> : <AwardRequirements />}
		</div>
	)
}

export default AwardsManagementPage
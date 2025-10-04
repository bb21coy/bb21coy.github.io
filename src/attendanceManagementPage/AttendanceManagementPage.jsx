import { useState } from 'react'
import ParadeList from './ParadeList'
import ParadeForm from './ParadeForm'
import ParadeInformation from './ParadeInformation'
import './attendanceManagementPage.scss'

// To access attendance records and take new attendance
const AttendanceManagementPage = () => {
	const [pageState, setPageState] = useState('form')

	return (
		<div className='attendance-management-page'>
			<ParadeList setPageState={setPageState} pageState={pageState} />
			{pageState == 'form' ? <ParadeForm /> : <ParadeInformation id={pageState} />}
		</div>
	)
}

export default AttendanceManagementPage
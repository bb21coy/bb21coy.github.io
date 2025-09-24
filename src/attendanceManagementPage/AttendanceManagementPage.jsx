import { useState } from 'react'
import { ParadeList } from './ParadeList'
import { NewParadeForm } from './NewParadeForm'
import { ParadeInformation } from './ParadeInformation'
import './AttendanceManagementPage.scss'

// To access attendance records and take new attendance
const AttendanceManagementPage = () => {
	const [pageState, setPageState] = useState('form')
	const [reload, setReload] = useState(false)

	return (
		<div className='attendance-management-page'>
			<ParadeList reload={reload} setPageState={setPageState} />

			{pageState == 'form' && <NewParadeForm setReload={setReload} />}
			{pageState != 'list' && pageState != 'form' && !(pageState.includes('Y')) && <ParadeInformation id={Number(pageState)} setPageState={setPageState} reload={reload} setReload={setReload} />}
		</div>
	)
}

export default AttendanceManagementPage
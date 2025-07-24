import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { handleServerError } from '../general/handleServerError'
import { BASE_URL } from '../Constants'

// Display list of all officer Accounts
const OfficerAccountsList = ({ setPageState, load }) => {
	const [officerList, setOfficerList] = useState([])

	useEffect(() => {
		axios.get(`${BASE_URL}/account?type=Officer`, { headers: { "x-route": "/get_accounts_by_type" }, withCredentials: true })
		.then(resp => setOfficerList(resp.data))
		.catch(err => {
			console.error("Error fetching officers:", err.response.data);
			handleServerError(err.response.status)
		})
	}, [load])

	return (
		<>
			{officerList.map((officer) => {
				return (
					<React.Fragment key={officer._id}>
						<input type="radio" name="users-list" id={officer._id} onChange={(e) => setPageState(e.target.id)} />
						<label htmlFor={officer._id}>{officer.account_type} {officer.rank} {officer.account_name}</label>
					</React.Fragment>
				)
			})}
		</>
	)
}

OfficerAccountsList.propTypes = {
	setPageState: PropTypes.func.isRequired,
	load: PropTypes.bool.isRequired
}

export { OfficerAccountsList }
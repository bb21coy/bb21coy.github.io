import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { handleServerError } from '../general/handleServerError'
import BASE_URL from '../Constants'

// Display list of Boy Accounts
const BoyAccountsList = ({ setPageState, load }) => {
	const [boyList, setBoyList] = useState([])

	useEffect(() => {
		axios.get(`${BASE_URL}/account?type=Boy`, { headers: { "x-route": "/get_accounts_by_type" }, withCredentials: true })
			.then(resp => setBoyList(resp.data))
			.catch(err => {
				console.error("Error fetching boys:", err.response.data);
				handleServerError(err.response.status)
			})
	}, [load])

	return (
		<>
			{boyList.filter((boy) => boy.graduated !== true).map((boy) => {
				return (
					<React.Fragment key={boy._id}>
						<input type="radio" name="users-list" id={boy._id} onChange={(e) => setPageState(e.target.id)} />
						<label htmlFor={boy._id}>{boy.account_type} Sec {boy.level} {boy.rank} {boy.account_name}</label>
					</React.Fragment>
				)
			})}
		</>
	)
}

BoyAccountsList.propTypes = {
	setPageState: PropTypes.func.isRequired,
	load: PropTypes.bool.isRequired
}

export { BoyAccountsList }
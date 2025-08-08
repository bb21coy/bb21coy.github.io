import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { handleServerError } from '../general/handleServerError'
import BASE_URL from '../Constants'

// Display list of all primer Accounts
const PrimerAccountsList = ({ setPageState, load }) => {
	const [primerList, setPrimerList] = useState([])

	useEffect(() => {
		axios.get(`${BASE_URL}/account?type=Primer`, { headers: { "x-route": "/get_accounts_by_type" }, withCredentials: true })
			.then(resp => setPrimerList(resp.data))
			.catch(err => {
				console.error("Error fetching primers:", err.response.data);
				handleServerError(err.response.status)
			})
	}, [load])

	return (
		<>
			{primerList.map((primer) => {
				return (
					<React.Fragment key={primer._id}>
						<input type="radio" name="users-list" id={primer._id} onChange={(e) => setPageState(e.target.id)} />
						<label htmlFor={primer._id}>{primer.account_type} {primer.rank} {primer.account_name}</label>
					</React.Fragment>
				)
			})}
		</>
	)
}

PrimerAccountsList.propTypes = {
	setPageState: PropTypes.func.isRequired,
	load: PropTypes.bool.isRequired
}

export { PrimerAccountsList }
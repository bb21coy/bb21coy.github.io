import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from '../general/UserContext';

// Display list of Boy Accounts
const UserAccountsList = ({ usersList, setUsersList, showUser, pageState }) => {
	const { user } = useUser();
	const accountTypes = ["Officer", "Primer", "Boy"];

	useEffect(() => {
		const ref = collection(db, "users");
		const unsub = onSnapshot(ref, (snapshot) => {
			const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			let newList = [...usersList];
			const index = newList.indexOf(user.account_type);
			newList.slice(index);
			if (user.account_type === "Admin") newList = accountTypes;
			data.filter(user => newList.includes(user.account_type));

			setUsersList(data)
		})

		return () => unsub();
	}, [])

	return (
		<>
			<p>Current Users</p>
			{usersList.filter(user => user.graduated !== true).filter(user => user.account_type !== "Admin").map(user => (
				<React.Fragment key={user.id}>
					<input type="radio" name="users-list" id={user.id} onChange={(e) => showUser(user.id)} checked={pageState === user.id} />
					<label htmlFor={user.id}>{user.account_type} Sec {user.level} {user.rank} {user.account_name}</label>
				</React.Fragment>
			))}
			
			<p>Graduated Boys</p>
			{usersList.filter(user => user.graduated === true).map(user => (
				<React.Fragment key={user.id}>
					<input type="radio" name="users-list" id={user.id} onChange={(e) => showUser(user.id)} checked={pageState === user.id} />
					<label htmlFor={user.id}>{user.account_type} Sec {user.level} {user.rank} {user.account_name}</label>
				</React.Fragment>
			))}
		</>
	)
}

UserAccountsList.propTypes = {
	usersList: PropTypes.array,
	setUsersList: PropTypes.func
}

export default UserAccountsList
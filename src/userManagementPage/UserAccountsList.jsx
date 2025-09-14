import React, { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useUser } from '../general/UserContext';

// Display list of Boy Accounts
const UserAccountsList = ({ usersList, setUsersList, showUser, pageState }) => {
	const { user } = useUser();

	useEffect(() => {
		const ref = collection(db, "users");
		const unsub = onSnapshot(ref, (snapshot) => {
			const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
			setUsersList(data)
		})

		return () => unsub();
	}, [])

	const groupedUsers = useMemo(() => {
		const officers = [];
		const primers = [];
		const boys = [];
		const graduated = [];

		for (const u of usersList) {
			if (u.graduated === true) graduated.push(u);
			else if (u.account_type === "Officer") officers.push(u);
			else if (u.account_type === "Primer") primers.push(u);
			else if (u.account_type === "Boy") boys.push(u);
		}

		return { officers, primers, boys, graduated };
	}, [usersList]);

	return (
		<div id='all-users'>
			<p>Current Users</p>
			{["Admin", "Officer"].includes(user.account_type) && groupedUsers.officers.map(user => (
				<React.Fragment key={user.id}>
					<input type="radio" name="users-list" id={user.id} onChange={(e) => showUser(user.id)} />
					<label htmlFor={user.id}>{user.account_type} {user.rank} {user.account_name}</label>
				</React.Fragment>
			))}

			{["Admin", "Officer", "Primer"].includes(user.account_type) && groupedUsers.primers.map(user => (
				<React.Fragment key={user.id}>
					<input type="radio" name="users-list" id={user.id} onChange={(e) => showUser(user.id)} />
					<label htmlFor={user.id}>{user.account_type} {user.rank} {user.account_name}</label>
				</React.Fragment>
			))}

			{groupedUsers.boys.map(user => (
				<React.Fragment key={user.id}>
					<input type="radio" name="users-list" id={user.id} onChange={(e) => showUser(user.id)} checked={pageState === user.id} />
					<label htmlFor={user.id}>{user.account_type} Sec {user.level} {user.rank} {user.account_name}</label>
				</React.Fragment>
			))}

			<p>Graduated Boys</p>
			{groupedUsers.graduated.map(user => (
				<React.Fragment key={user.id}>
					<input type="radio" name="users-list" id={user.id} onChange={(e) => showUser(user.id)} checked={pageState === user.id} />
					<label htmlFor={user.id}>{user.account_type} Sec {user.level} {user.rank} {user.account_name}</label>
				</React.Fragment>
			))}
		</div>
	)
}

UserAccountsList.propTypes = {
	usersList: PropTypes.array,
	setUsersList: PropTypes.func,
	showUser: PropTypes.func,
	pageState: PropTypes.string
}

export default UserAccountsList
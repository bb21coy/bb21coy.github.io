import React, { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { collection, onSnapshot } from "@firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
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
		let boys = [];
		const graduated = [];

		for (const u of usersList) {
			if (u.g === true) graduated.push(u);
			else if (u.t === "Officer") officers.push(u);
			else if (u.t === "Primer") primers.push(u);
			else if (u.t === "Boy") boys.push(u);
		}

		boys.sort((a, b) => {
			if (a.l !== b.l) return a.l - b.l;
			return a.n.localeCompare(b.n);
		});

		if (user.appointment && user.appointment.includes("PS") && user.account_type === "Boy") {
			const parts = user.appointment.split(" ");
			const secLevel = parts.at(-2);

			let level = [secLevel];
			if (secLevel === "4") level = ["4", "5"];
			boys = boys.filter(b => level.includes(String(b.l)));
		}

		return { officers, primers, boys, graduated };
	}, [usersList]);

	const convertRank = (rank, type) => {
		const OFFICER_RANK_MAP = { O: "OCT", J: "2LT", L: "LTA" };
		const PRIMER_RANK_MAP = { C: "CLT", S: "SCL" };
		const BOY_RANK_MAP = { R: "REC", P: "PTE", L: "LCP", C: "CPL", S: "SGT", W: "SSG", O: "WO" };

		if (type === "Officer") return OFFICER_RANK_MAP[rank];
		if (type === "Primer") return PRIMER_RANK_MAP[rank];
		if (type === "Boy") return BOY_RANK_MAP[rank];
	}

	return (
		<div id='all-users'>
			<p>Current Users</p>
			{["Admin", "Officer"].includes(user.account_type) && groupedUsers.officers.map(user => (
				<React.Fragment key={user.id}>
					<input type="radio" name="users-list" id={user.id} onChange={() => showUser(user.id)} />
					<label htmlFor={user.id}>{user.account_type} {user.rank} {user.account_name}</label>
				</React.Fragment>
			))}

			{["Admin", "Officer", "Primer"].includes(user.account_type) && groupedUsers.primers.map(user => (
				<React.Fragment key={user.id}>
					<input type="radio" name="users-list" id={user.id} onChange={() => showUser(user.id)} />
					<label htmlFor={user.id}>{user.t} {convertRank(user.r, "Primer")} {user.n}</label>
				</React.Fragment>
			))}

			{groupedUsers.boys.map(user => (
				<React.Fragment key={user.id}>
					<input type="radio" name="users-list" id={user.id} onChange={() => showUser(user.id)} checked={pageState === user.id} />
					<label htmlFor={user.id}>{user.t} Sec {user.l} {convertRank(user.r, "Boy")} {user.n}</label>
				</React.Fragment>
			))}

			<p>Graduated Boys</p>
			{groupedUsers.graduated.map(user => (
				<React.Fragment key={user.id}>
					<input type="radio" name="users-list" id={user.id} onChange={() => showUser(user.id)} checked={pageState === user.id} />
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
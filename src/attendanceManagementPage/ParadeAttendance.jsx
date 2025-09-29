import { useState, useEffect, useMemo, useRef } from 'react'
import { showMessage } from '../general/handleServerError'
import { useUser } from '../general/UserContext'
import { db } from '../firebase'
import { doc, getDoc, onSnapshot, updateDoc, deleteField, query, limit, collection, where, documentId } from '@firebase/firestore'
import styles from './paradeAttendance.module.scss'

// To access attendance records and take new attendance
const ParadeAttendance = ({ parade, users }) => {
	const { user } = useUser()
	const [paradeAppointment, setParadeAppointment] = useState()
	const [takingAttendance, setTakingAttendance] = useState(false)
	const [currentAttendance, setCurrentAttendance] = useState({})
	const levels = { 'Sec 1': [1], 'Sec 2': [2], 'Sec 3': [3], 'Sec 4/5': [4, 5], 'Primer': ['Primer'], 'Officer/VAL': ['Officer'] }
	const ROLE_RANK = { PS: 1, COS: 2, CSM: 3, DO: 4, Captain: 5 };

	const attendanceOrder = useRef([]);
	const [selectedInput, setSelectedInput] = useState();

	async function canTakeAttendance(parade) {
		if (user.account_name == null || !parade || !parade.date) return setTakingAttendance(false);
		if (parade.date.toDate().getFullYear() !== new Date().getFullYear()) return setTakingAttendance(false);

		const appointments = (await getDoc(doc(db, "appointments", "HJbxljYligJkryXpA7sh"))).data();
		const userAppt = Object.entries(appointments).find(([_, v]) => v?.id === user.id);
		let rank = null;

		const ROLE_MAP = [
			{ match: () => user.appointment?.includes("PS"), role: "PS", rank: ROLE_RANK.PS },
			{ match: () => user.id === parade.appointments?.COS?.id, role: "COS", rank: ROLE_RANK.COS },
			{ match: () => user.id === parade.appointments?.CSM?.id, role: "CSM", rank: ROLE_RANK.CSM },
			{ match: () => user.id === parade.appointments?.DO?.id, role: "DO", rank: ROLE_RANK.DO },
			{ match: () => userAppt?.toLowerCase() === "captain", role: "Captain", rank: ROLE_RANK.Captain },
		];

		for (const r of ROLE_MAP) {
			if (r.match()) {
				rank = r.rank;
				setParadeAppointment(r.role.toLowerCase());
				break;
			}
		}
		if (!rank) return setTakingAttendance(false)

		if (parade.captain_finalized && rank < ROLE_RANK.Captain) return setTakingAttendance(false);
		if (parade.do_finalized && rank < ROLE_RANK.DO) return setTakingAttendance(false);
		if (parade.csm_finalized && rank < ROLE_RANK.CSM) return setTakingAttendance(false);
		if (parade.cos_finalized && rank < ROLE_RANK.COS) return setTakingAttendance(false);

		return setTakingAttendance(true);
	}

	useEffect(() => {
		if (!parade || !parade.id) return;
		canTakeAttendance(parade)
		const unsub = onSnapshot(query(collection(db, "attendance"), where(documentId(), "==", parade.id), limit(1)), (paradeSnap) => {
			setCurrentAttendance({ ...paradeSnap.docs[0].data() })
		})

		const unsub1 = onSnapshot(query(collection(db, "parades"), where("parade_id", "==", parade.id)), (paradeSnap) => {
			setPositions(paradeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
		})

		return () => {
			unsub();
			unsub1();
		}
	}, [parade])

	const platoonTotals = useMemo(() => {
		return users
			.filter(user => (!takingAttendance ? user.id in currentAttendance : user.roll_call))
			.reduce((acc, user) => {
				let platoon = user.level === '5' ? 'Sec 4' : `Sec ${user.level}`;
				if (platoon === 'Sec null') platoon = user.account_type;
				if (platoon === "Officer") platoon = "Officer/VAL";

				const isPresent = currentAttendance[user.id] === '1';

				if (!acc[platoon]) acc[platoon] = { total: 0, current: 0 };
				acc[platoon].total += 1;
				if (isPresent) acc[platoon].current += 1;
				acc.totalStrength += 1;
				if (isPresent) acc.totalCurrent += 1;

				return acc;
			}, { totalStrength: 0, totalCurrent: 0 });
	}, [currentAttendance, takingAttendance, paradeAppointment, users]);

	async function setAttendance(id, attendance) {
		try {
			await updateDoc(doc(db, "attendance", parade.id), { [id]: attendance === "" ? deleteField() : attendance })
		} catch (e) {
			console.error(e)
			if (e.code === "permission-denied") showMessage("This parade has already been finalised. Approach this person for changes")
			else showMessage("An error occurred. Please try again.")
		}
	}

	async function sendFinalizeAttendance(finalized, appt) {
		try {
			if (!['cos', 'csm', 'do', 'captain'].includes(appt)) return
			await updateDoc(doc(db, "parades", parade.id), { [`${appt}_finalized`]: finalized })
			showMessage(`Attendance ${finalized ? 'Finalised' : 'Unfinalised'}`, 'success')
		} catch (e) {
			console.error(e)
			showMessage("Failed to finalise attendance")
		}
	}

	function handleKeyDown(e, boyId) {
		e.preventDefault();
		if (!takingAttendance) return;
		const currentIndex = attendanceOrder.current.indexOf(boyId);
		
		let nextId;
		if (e.key === "a") {
			nextId = attendanceOrder.current[(currentIndex - 1 + attendanceOrder.current.length) % attendanceOrder.current.length];
		} else if (e.key === "d") {
			nextId = attendanceOrder.current[(currentIndex + 1) % attendanceOrder.current.length];
		}

		setSelectedInput(nextId);
		document.getElementById(nextId).focus();
	}

	return (
		<div className={styles['parade-attendance']}>
			<div className={styles["flex-block"]}>
				{Object.keys(levels).map(level => (
					<table key={level} style={{ "--tablename": `'${level} Attendance:'` }}>
						<tbody>
							{users.filter(boy => levels[level].includes(level.includes("Sec") ? boy.level : boy.account_type)).filter(boy => (!takingAttendance ? boy.id in currentAttendance : boy.roll_call)).map((boy) => {
								attendanceOrder.current.push(boy.id);
								return <tr key={boy.id}>
									<td>{boy.rank != 'Teacher' ? boy.rank : boy.honorifics} {boy.account_name}</td>
									{!takingAttendance ?
										<td>{currentAttendance[boy.id] || "-"}</td> :
										<td>
											<select name="attendance" id={boy.id} value={currentAttendance[boy.id] || ''} onChange={(e) => setAttendance(boy.id, e.target.value)} onClick={() => console.log(boy.id)} onFocus={() => setSelectedInput(boy.id)} onKeyDown={e => handleKeyDown(e, boy.id)} style={{ backgroundColor: selectedInput === boy.id ? "lightgrey" : "white" }} >
												<option value="">-</option>
												<option value="1">1</option>
												<option value="S">S</option>
												<option value="E">E</option>
												<option value="0">0</option>
											</select>
										</td>
									}
								</tr>
							})}
							<tr className='total-strength'>
								<td>{level.includes("Sec") ? "Platoon" : level} Strength</td>
								<td>{platoonTotals[level == '4/5' ? '4' : level]?.current || "0"} / {platoonTotals[level == '4/5' ? '4' : level]?.total || "0"}</td>
							</tr>
						</tbody>
					</table>
				))}

				<table style={{ "--tablename": `'Total Attendance:'` }}>
					<tbody>
						{Object.keys(levels).map(level => (
							<tr key={level}>
								<td>{level} Strength</td>
								<td>{platoonTotals[level == '4/5' ? '4' : level]?.current || "0"} / {platoonTotals[level == '4/5' ? '4' : level]?.total || "0"}</td>
							</tr>
						))}
						<tr>
							<td>Total Strength</td>
							<td>{platoonTotals.totalCurrent || "0"} / {platoonTotals.totalStrength || "0"}</td>
						</tr>
					</tbody>
				</table>
			</div>

			{(() => {
				const finalized = ['COS', 'CSM', 'DO', 'Captain'].filter(role => parade[`${role.toLowerCase()}_finalized`]);

				return finalized.length > 0 ? (<>
					<hr />
					<h4 style={{ width: '100%' }}>{finalized.join(' | ')} Finalized</h4>
				</>) : null;
			})()}

			{['cos', 'csm', 'do', 'captain'].includes(paradeAppointment) && (
				<button onClick={() => sendFinalizeAttendance(!parade[`${paradeAppointment}_finalized`], paradeAppointment)}>
					{parade[`${paradeAppointment}_finalized`] ? 'Unfinalize Attendance' : 'Finalize Attendance'}
				</button>
			)}
		</div>
	)
}

export default ParadeAttendance
import { useState, useEffect, useMemo } from 'react'
import { showMessage } from '../general/handleServerError'
import { useUser } from '../general/UserContext'
import { db } from '../firebase'
import { doc, getDoc, onSnapshot, updateDoc, deleteField, query, limit, collection, where, documentId } from '@firebase/firestore'
import styles from './paradeAttendance.module.scss'

// To access attendance records and take new attendance
const ParadeAttendance = ({ parade, users }) => {
	const { user } = useUser()
	const [paradeAppointment, setParadeAppointment] = useState(null)
	const [takingAttendance, setTakingAttendance] = useState(false)
	const [currentAttendance, setCurrentAttendance] = useState({})
	const levels = { 'Sec 1': [1], 'Sec 2': [2], 'Sec 3': [3], 'Sec 4/5': [4, 5], 'Primer': ['Primer'], 'Officer/VAL': ['Officer'] }
	const ROLE_RANK = { PS: 1, COS: 2, CSM: 3, DO: 4, Captain: 5 };

	const [selectedInput, setSelectedInput] = useState();

	async function canTakeAttendance(parade) {
		if (user.n == null || !parade || !parade.date) return setTakingAttendance(false);
		if (parade.date.toDate().getFullYear() !== new Date().getFullYear()) return setTakingAttendance(false);

		const appointments = (await getDoc(doc(db, "appointments", "HJbxljYligJkryXpA7sh"))).data();
		const userAppt = Object.entries(appointments).find(([, v]) => v?.id === user.id);
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

		if (!rank && user.t !== "Admin") {
			setParadeAppointment(null);
			return setTakingAttendance(false)
		}

		if (parade.captain_finalized && rank < ROLE_RANK.Captain) return setTakingAttendance(false);
		if (parade.do_finalized && rank < ROLE_RANK.DO) return setTakingAttendance(false);
		if (parade.csm_finalized && rank < ROLE_RANK.CSM) return setTakingAttendance(false);
		if (parade.cos_finalized && rank < ROLE_RANK.COS) return setTakingAttendance(false);

		return setTakingAttendance(true);
	}

	useEffect(() => {
		if (!parade || !parade.id) return;
		setParadeAppointment(null);
		canTakeAttendance(parade)
		const unsub = onSnapshot(query(collection(db, "attendance"), where(documentId(), "==", parade.id), limit(1)), (paradeSnap) => {
			setCurrentAttendance({ ...paradeSnap.docs[0].data() })
		})

		return () => unsub();
	}, [parade])

	const platoonTotals = useMemo(() => {
		return users
			.filter(user => (!takingAttendance ? user.id in currentAttendance : user.a))
			.reduce((acc, user) => {
				let platoon = user.l === '5' ? 'Sec 4' : `Sec ${user.l}`;
				if (platoon === 'Sec null') platoon = user.t;
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
		if (!takingAttendance) return;
		const attendanceOrder = Array.from(document.querySelectorAll("select")).map(s => s.id);
		const currentIndex = attendanceOrder.indexOf(boyId);

		if (e.key === "a" || e.key === "d") e.preventDefault();
		let nextId;
		if (e.key === "a") {
			nextId = attendanceOrder[(currentIndex - 1 + attendanceOrder.length) % attendanceOrder.length];
		} else if (e.key === "d") {
			nextId = attendanceOrder[(currentIndex + 1) % attendanceOrder.length];
		}

		setSelectedInput(nextId);
		document.getElementById(nextId)?.focus();
	}

	const convertRank = (rank, type) => {
        const OFFICER_RANK_MAP = { O: "OCT", J: "2LT", L: "LTA" };
        const PRIMER_RANK_MAP = { C: "CLT", S: "SCL" };
        const BOY_RANK_MAP = { R: "REC", P: "PTE", L: "LCP", C: "CPL", S: "SGT", W: "SSG", O: "WO" };

        if (type === "Officer") return OFFICER_RANK_MAP[rank];
        if (type === "Primer") return PRIMER_RANK_MAP[rank];
        if (type === "Boy") return BOY_RANK_MAP[rank];
    }

	return (
		<div className={styles['parade-attendance']}>
			<div className={styles["flex-block"]}>
				{Object.keys(levels).flatMap(level => (
					<table key={level} style={{ "--tablename": `'${level} Attendance:'` }}>
						<tbody>
							{users.filter(user => levels[level].includes(level.includes("Sec") ? parseInt(user.l) : user.t)).filter(boy => (!takingAttendance ? boy.id in currentAttendance : boy.a)).map(boy => (
								<tr key={boy.id}>
									<td>{convertRank(boy.rank, boy.t) != 'Teacher' ? convertRank(boy.rank, boy.t) : boy.h} {boy.n}</td>
									{!takingAttendance ?
										<td>{currentAttendance[boy.id] || "-"}</td> :
										<td>
											<select name="attendance" id={boy.id} value={currentAttendance[boy.id] || ''} onChange={(e) => setAttendance(boy.id, e.target.value)} onFocus={() => setSelectedInput(boy.id)} onKeyDown={e => handleKeyDown(e, boy.id)} style={{ backgroundColor: selectedInput === boy.id ? "lightgrey" : "white" }} >
												<option value="">-</option>
												<option value="1">1</option>
												<option value="S">S</option>
												<option value="E">E</option>
												<option value="0">0</option>
											</select>
										</td>
									}
								</tr>
							))}
							<tr className='total-strength'>
								<td>{level.includes("Sec") ? "Platoon" : level} Strength</td>
								<td>
									{level === "Sec 4/5"
										? `${(platoonTotals["Sec 4"]?.current || 0) + (platoonTotals["Sec 5"]?.current || 0)} / ${(platoonTotals["Sec 4"]?.total || 0) + (platoonTotals["Sec 5"]?.total || 0)}`
										: `${platoonTotals[level]?.current || 0} / ${platoonTotals[level]?.total || 0}`}
								</td>

							</tr>
						</tbody>
					</table>
				))}

				<table style={{ "--tablename": `'Total Attendance:'` }}>
					<tbody>
						{Object.keys(levels).map(level => (
							<tr key={level}>
								<td>{level} Strength</td>
								<td title='This number may differ depending on whether on can take attendance'>
									{level === "Sec 4/5"
										? `${(platoonTotals["Sec 4"]?.current || 0) + (platoonTotals["Sec 5"]?.current || 0)} / ${(platoonTotals["Sec 4"]?.total || 0) + (platoonTotals["Sec 5"]?.total || 0)}`
										: `${platoonTotals[level]?.current || 0} / ${platoonTotals[level]?.total || 0}`}
								</td>
							</tr>
						))}
						<tr>
							<td>Total Strength</td>
							<td title='This number may differ depending on whether on can take attendance'>{platoonTotals.totalCurrent || "0"} / {platoonTotals.totalStrength || "0"}</td>
						</tr>
					</tbody>
				</table>
			</div>

			{(() => {
				const finalized = ['COS', 'CSM', 'DO', 'Captain'].filter(role => parade[`${role.toLowerCase()}_finalized`] === true);
				return finalized.length > 0 ? (<>
					<hr />
					<h4 style={{ width: '100%' }}>{finalized.join(' | ')} Finalised</h4>
				</>) : null;
			})()}

			{['cos', 'csm', 'do', 'captain'].includes(paradeAppointment) && (
				<button onClick={() => sendFinalizeAttendance(!parade[`${paradeAppointment}_finalized`], paradeAppointment)}>
					{parade[`${paradeAppointment}_finalized`] ? 'Unfinalise Attendance' : 'Finalise Attendance'}
				</button>
			)}
		</div>
	)
}

export default ParadeAttendance
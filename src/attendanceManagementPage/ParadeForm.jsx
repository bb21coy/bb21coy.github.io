import { useState, useEffect, useMemo, Fragment } from 'react'
import { showMessage } from '../general/handleServerError'
import { db } from '../firebase'
import styles from './paradeForm.module.scss'
import { getDocs, collection, query, orderBy, doc, getDoc, where, Timestamp, addDoc, setDoc } from '@firebase/firestore'
import ParadeSchema from '../schema/Parade'
import { ZodError } from 'zod'

// To access attendance records and take new attendance
const ParadeForm = ({ paradeData = null }) => {
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
	const levels = ['1', '2', '3', '4/5']
	const [allUsers, setAllUsers] = useState([])
	const [paradeType, setParadeType] = useState("")
	const [appointmentHolders, setAppointmentHolders] = useState({ DT: null, DO: null, COS: null, 'Flag Bearer': null, CSM: null, 'CE Sergeant': null })

	function makeId() {
		if (crypto.randomUUID) return crypto.randomUUID();
		return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
	}

	const convertDate = (dateObject) => {
		const year = dateObject.getFullYear();
		const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
		const day = dateObject.getDate().toString().padStart(2, '0');
		const hours = dateObject.getHours().toString().padStart(2, '0');
		const minutes = dateObject.getMinutes().toString().padStart(2, '0');

		return `${year}-${month}-${day}T${hours}:${minutes}`;
	}

	function convertPrograms(programs = []) {
		return programs.map((p) => ({
			...p,
			start_time: convertDate(p.start_time.toDate()),
			end_time: convertDate(p.end_time?.toDate())
		}));
	}

	const makeEmptyAnnouncement = () => ({ id: makeId(), announcement: "" })
	const [companyAnnouncements, setCompanyAnnouncements] = useState([makeEmptyAnnouncement()])
	const [platoonAnnouncements, setPlatoonAnnouncements] = useState({
		'1': [makeEmptyAnnouncement()],
		'2': [makeEmptyAnnouncement()],
		'3': [makeEmptyAnnouncement()],
		'4/5': [makeEmptyAnnouncement()]
	})

	const makeEmptyProgram = () => ({ id: makeId(), start_time: "", end_time: "", program: "" })
	const [platoonPrograms, setPlatoonPrograms] = useState({
		'1': [makeEmptyProgram()],
		'2': [makeEmptyProgram()],
		'3': [makeEmptyProgram()],
		'4/5': [makeEmptyProgram()]
	})

	useEffect(() => {
		const init = async () => {
			const userDocs = await getDocs(query(collection(db, 'users'), orderBy('account_name')))
			const users = userDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
			setAllUsers(users)

			const appointmentDoc = await getDoc(doc(db, "appointments", "HJbxljYligJkryXpA7sh"));
			Object.entries(appointmentDoc.data()).map(([appt, id]) => {
				if (["CE Sergeant", "CSM"].includes(appt)) setAppointmentHolders(prev => ({ ...prev, [appt]: id.id }))
			})

			if (paradeData) {
				setParadeType(paradeData.parade_type)
				document.getElementById('date-input').value = convertDate(paradeData.date.toDate()).split('T')[0]
				document.getElementById('reporting-time-input').value = convertDate(paradeData.reporting_time.toDate())
				document.getElementById('dismissal-time-input').value = convertDate(paradeData.dismissal_time.toDate())

				Object.entries(paradeData.appointments).map(([appointment, ref]) => {
					setAppointmentHolders(prev => ({ ...prev, [appointment]: ref.id }))
				})

				setCompanyAnnouncements([...paradeData.company_announcements, makeEmptyAnnouncement()])
				setPlatoonPrograms({
					'1': [...convertPrograms(paradeData.platoon_programs["1"]), makeEmptyProgram()],
					'2': [...convertPrograms(paradeData.platoon_programs["2"]), makeEmptyProgram()],
					'3': [...convertPrograms(paradeData.platoon_programs["3"]), makeEmptyProgram()],
					'4/5': [...convertPrograms(paradeData.platoon_programs["4/5"]), makeEmptyProgram()],
				})
				setPlatoonAnnouncements({
					'1': [...paradeData.platoon_announcements['1'], makeEmptyAnnouncement()],
					'2': [...paradeData.platoon_announcements['2'], makeEmptyAnnouncement()],
					'3': [...paradeData.platoon_announcements['3'], makeEmptyAnnouncement()],
					'4/5': [...paradeData.platoon_announcements['4/5'], makeEmptyAnnouncement()],
				})

				levels.map(level => {
					document.getElementById(`sec-${level}-attire`).value = paradeData[`sec-${level}-attire`] || ""
				})

				document.getElementById('venue-input').value = paradeData.venue || ""
				document.getElementById('description').value = paradeData.description || ""
			}
		}

		init()
	}, [])

	const setDefaultData = (type) => {
		setParadeType(type)
		const date = document.getElementById('date-input').value;
		const month = new Date(date).getMonth();
		document.getElementById('reporting-time-input').value = `${date}T08:30`
		document.getElementById('dismissal-time-input').value = `${date}T12:30`

		if (type === 'Parade') {
			setCompanyAnnouncements([{ announcement: 'All to bring PT Kit', id: makeId() }, makeEmptyAnnouncement()])
			const makeDefaultPlatoonSchedule = (date) => [
				{ id: makeId(), start_time: `${date}T08:30`, end_time: `${date}T08:45`, program: "Opening Parade" },
				{ id: makeId(), start_time: `${date}T08:45`, end_time: `${date}T09:45`, program: "CE and Worship" },
				{ id: makeId(), start_time: `${date}T09:45`, end_time: `${date}T11:00`, program: "" },
				{ id: makeId(), start_time: `${date}T11:00`, end_time: `${date}T12:00`, program: "" },
				{ id: makeId(), start_time: `${date}T12:00`, end_time: `${date}T12:15`, program: "Closing Parade" },
				makeEmptyProgram()
			];

			setPlatoonPrograms({
				'1': makeDefaultPlatoonSchedule(date),
				'2': makeDefaultPlatoonSchedule(date),
				'3': makeDefaultPlatoonSchedule(date),
				'4/5': month <= 3 ? makeDefaultPlatoonSchedule(date) : [makeEmptyProgram()]
			})
		} else {
			setCompanyAnnouncements([makeEmptyAnnouncement()])
			setPlatoonPrograms({
				'1': [makeEmptyAnnouncement()],
				'2': [makeEmptyAnnouncement()],
				'3': [makeEmptyAnnouncement()],
				'4/5': [makeEmptyAnnouncement()]
			})
			setPlatoonAnnouncements({
				'1': [makeEmptyProgram()],
				'2': [makeEmptyProgram()],
				'3': [makeEmptyProgram()],
				'4/5': [makeEmptyProgram()]
			})
		}
	}

	const users = useMemo(() =>
		allUsers.reduce((acc, user) => {
			if (user.account_type === "Boy") acc.boys.push(user);
			else if (user.account_type === "Primer") acc.primers.push(user);
			else if (user.account_type === "Officer") acc.officers.push(user);
			return acc;
		}, { boys: [], primers: [], officers: [] })
		, [allUsers])

	const nextSaturday = d => new Date(d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7)));
	const setAppt = (appointment, value) => setAppointmentHolders(prev => ({ ...prev, [appointment]: value.target.value }))

	const updateCompanyAnnouncement = (e, id) => {
		const value = e.target.value;
		setCompanyAnnouncements(prev => {
			const updated = prev.map((item) => item.id === id ? { ...item, announcement: value } : item);
			const last = updated[updated.length - 1]
			if (last.announcement) updated.push(makeEmptyAnnouncement())
			return updated;
		});
	}

	const deleteCompanyAnnouncement = (index) => {
		setCompanyAnnouncements(prev => {
			const updated = prev.filter((_, i) => i !== index)
			if (updated.length === 0) updated.push(makeEmptyAnnouncement())
			return updated
		})
	};

	const updatePlatoonProgram = (e, level, id, field) => {
		const value = e.target.value
		setPlatoonPrograms((prev) => {
			const updated = prev[level].map((program) => program.id === id ? { ...program, [field]: value } : program)
			const last = updated[updated.length - 1]
			if (last.start_time && last.end_time && last.program) updated.push(makeEmptyProgram())
			return { ...prev, [level]: updated }
		})
	}

	const deletePlatoonProgram = (level, index) => {
		setPlatoonPrograms((prev) => {
			const updated = prev[level].filter((_, i) => i !== index)
			if (updated.length === 0) updated.push(makeEmptyProgram())
			return { ...prev, [level]: updated }
		})
	}

	const updatePlatoonAnnouncement = (e, level, id) => {
		const value = e.target.value;
		setPlatoonAnnouncements(prev => {
			const updated = prev[level].map((item) => item.id === id ? { ...item, announcement: value } : item);
			const last = updated[updated.length - 1]
			if (last.announcement) updated.push(makeEmptyAnnouncement())
			return { ...prev, [level]: updated };
		});
	}

	function deletePlatoonAnnouncement(level, index) {
		setPlatoonAnnouncements((prev) => {
			const updated = prev[level].filter((_, i) => i !== index)
			if (updated.length === 0) updated.push(makeEmptyAnnouncement())
			return { ...prev, [level]: updated }
		})
	}

	async function submitForm(e) {
		try {
			e.preventDefault()

			const form = new FormData(e.target);
			const data = Object.fromEntries(form.entries());
			data.company_announcements = companyAnnouncements;
			data.platoon_programs = platoonPrograms;
			data.platoon_announcements = platoonAnnouncements;
			data.appointments = appointmentHolders;

			if (data.reporting_time == "") return showMessage("Please select a date and reporting time.");
			const findDoc = await getDocs(query(collection(db, "parades"), where("date", "==", Timestamp.fromDate(new Date(data.reporting_time)))));
			if (findDoc.docs.length) return showMessage("A parade has already been scheduled for that day.");

			const result = await ParadeSchema(db).parseAsync(data);
			if (paradeData == null) {
				result.cos_finalized = false;
				result.csm_finalized = false;
				result.do_finalized = false;
				result.captain_finalized = false;

				const paradeData = await addDoc(collection(db, "parades"), result);
				await setDoc(doc(db, "parades", paradeData.id), {});
				showMessage("Parade created successfully", "success");
			} else {
				await setDoc(doc(db, "parades", paradeData.id), result, { merge: true });
				showMessage("Parade updated successfully", "success");
			}
		} catch (e) {
			console.error(e)
			if (e instanceof ZodError) {
				const issue = e.issues[0];
				const path = issue.path;
				if (path[0] === "platoon_programs") {
					const platoon = path[1];
					const index = (path[2] ?? 0) + 1;
					const field = path[3];

					showMessage(`Sec ${platoon} Platoon Programs → Program #${index} → ${field}: ${issue.message}`);
				} else {
					showMessage(`Error at ${path.join(" → ")}: ${issue.message}`);
				}
			} else {
				showMessage("Failed to create parade");
			}
		}
	}

	return (
		<form onSubmit={submitForm} className={styles['new-parade-form']}>
			<h2>New Parade Notice</h2>

			<div className={styles['parade-selection']}>
				<label htmlFor='parade-type-select'>Parade Type:</label>
				<select name="parade_type" id="parade-type-select" value={paradeType || ""} onChange={e => setDefaultData(e.target.value)}>
					<option value="" hidden disabled>Select Parade Type</option>
					<option value="Parade">Parade</option>
					<option value="Camp">Camp</option>
					<option value="Others">Others</option>
				</select>
			</div>

			<div className={styles['flex-block']}>
				<div>
					<label htmlFor='date-input'>Date: </label>
					<input type='date' name='date' defaultValue={nextSaturday(new Date()).toISOString().split('T')[0]} onMouseDown={e => (!isIOS) ? e.preventDefault() : null} onClick={e => e.currentTarget.showPicker()} id='date-input'></input>

					<label htmlFor='venue-input'>Venue: </label>
					<input name='venue' defaultValue='School, GMSS' id='venue-input' placeholder='Enter Parade Venue'></input>

					{["1", "2", "3", "4/5"].map(level => (
						<Fragment key={level}>
							<label htmlFor={`sec-${level}-attire`}>Sec {level} Attire:</label>
							<input name={`sec-${level}-attire`} id={`sec-${level}-attire`} placeholder={`Enter Sec ${level} Attire`} />
						</Fragment>
					))}

					<label htmlFor='reporting-time-input'>Reporting Time: </label>
					<input name='reporting_time' onMouseDown={e => (!isIOS) ? e.preventDefault() : null} onClick={e => e.currentTarget.showPicker()} className='reporting-time-input' type='datetime-local' id='reporting-time-input'></input>

					<label htmlFor='dismissal-time-input'>Dismissal Time: </label>
					<input name='dismissal_time' onMouseDown={e => (!isIOS) ? e.preventDefault() : null} onClick={e => e.currentTarget.showPicker()} className='dismissal-time-input' type='datetime-local' id='dismissal-time-input'></input>
				</div>

				<div>
					<label htmlFor='dt-select'>Duty Teacher:</label>
					<select id="dt-select" value={appointmentHolders.DT || ""} onChange={(e) => setAppt('DT', e)}>
						<option value='' disabled hidden>Select Duty Teacher</option>
						{users.officers.map(officer => <option key={officer.id} value={officer.id}>{officer.account_name}</option>)}
					</select>

					<label htmlFor='do-select'>Duty Officer:</label>
					<select id="do-select" value={appointmentHolders.DO || ""} onChange={(e) => setAppt('DO', e)}>
						<option value='' disabled hidden>Select Duty Officer</option>
						{users.officers.map(officer => <option key={officer.id} value={officer.id}>{officer.account_name}</option>)}
						{users.primers.map(primer => <option key={primer.id} value={primer.id}>{primer.account_name}</option>)}
					</select>

					{["COS", "Flag Bearer", "CSM", "CE Sergeant"].map(holder => (
						<Fragment key={holder}>
							<label htmlFor={`${holder.toLowerCase()}-select`}>{holder}:</label>
							<select id={`${holder.toLowerCase()}-select`} value={appointmentHolders[holder] || ""} onChange={(e) => setAppt(holder, e)}>
								<option value='' disabled>Select {holder}</option>
								{users.boys.map(boy => <option key={boy.id} value={boy.id}>{boy.account_name}</option>)}
							</select>
						</Fragment>
					))}
				</div>
			</div>

			<div>
				<label htmlFor='description'>Description: </label>
				<textarea name='description' placeholder='Enter Remarks (Optional)' id='description'></textarea>
			</div>

			<div>
				<h3>Company Announcements:</h3>
				<ol className={styles['announcement-container']}>
					{companyAnnouncements.map((announcement, index) => (
						<li key={`company-${index}`}>
							<input value={announcement.announcement} onChange={e => updateCompanyAnnouncement(e, announcement.id)} id={`company-announcement-${index}`} placeholder='Enter Announcement' />
							{index !== companyAnnouncements.length - 1 && <i className='fa-solid fa-xmark' onClick={() => deleteCompanyAnnouncement(index)} aria-label='Remove Company Announcment'></i>}
						</li>
					))}
				</ol>
			</div>

			<div>
				{levels.map((level) => (
					<div key={level}>
						<h3>Programs:</h3>
						<div>
							{platoonPrograms[level].map((program, index) => (
								<div key={`sec-${level}-program-${program.id}`} className={styles['platoon-program-container']}>
									<input type='datetime-local' onMouseDown={e => (!isIOS) ? e.preventDefault() : null} onClick={e => e.currentTarget.showPicker()} value={program.start_time} onChange={(e) => updatePlatoonProgram(e, level, program.id, 'start_time')} />
									<p>-</p>
									<input type='datetime-local' onMouseDown={e => (!isIOS) ? e.preventDefault() : null} onClick={e => e.currentTarget.showPicker()} value={program.end_time} onChange={(e) => updatePlatoonProgram(e, level, program.id, 'end_time')} />

									<input type='text' defaultValue={program.program} onChange={(e) => updatePlatoonProgram(e, level, program.id, 'program')} placeholder='Enter Program' id={`sec-${level}-program-${program.id}`} />
									{index !== platoonPrograms[level].length - 1 && <i className='fa-solid fa-xmark' aria-label='Remove Platoon Program' onClick={() => deletePlatoonProgram(level, index)}></i>}
								</div>
							))}
						</div>

						<h3>Platoon Announcements:</h3>
						<ol className={styles['announcement-container']}>
							{platoonAnnouncements[level].map((announcement, index) => (
								<li key={level + announcement.id}>
									<input value={announcement.announcement} onChange={e => updatePlatoonAnnouncement(e, level, announcement.id)} placeholder='Enter Announcement' id={`sec-${level}-announcement-${announcement.id}`} />
									{index !== platoonAnnouncements[level].length - 1 && <i className='fa-solid fa-xmark' onClick={() => deletePlatoonAnnouncement(level, index)} aria-label='Remove Platoon Announcement'></i>}
								</li>
							))}
						</ol>
					</div>
				))}
			</div>

			<button>{paradeData !== null ? "Update" : "Create"} Parade</button>
		</form>
	)
}

export default ParadeForm
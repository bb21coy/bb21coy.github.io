import { useEffect, useState, useMemo, Fragment } from 'react'
import Loading from '../general/Loading'
import { showMessage } from '../general/handleServerError'
import ResultPage from './ResultPage'
import styles from './resultGenerationPage.module.scss'
import { getDocs, collection, orderBy, query } from '@firebase/firestore'
import { db } from '../firebase'
const ResultGenerationPage = () => {
	const [allUsers, setAllUsers] = useState([])
	const [awards, setAwards] = useState([]) // awards list with masteries
	const [award, setAward] = useState(); // selected award
	const [mastery, setMastery] = useState(); // selected mastery
	const [boys, setBoys] = useState([]); // selected boys id
	const [instructor, setInstructor] = useState({}); // selected instructor

	const [descriptionHint, setDescriptionHint] = useState();
	const [descriptionInput, setDescriptionInput] = useState();

	const [loading, setLoading] = useState(true);
	const [isApple, setIsApple] = useState(false);

	useEffect(() => {
		const init = async () => {
			try {
				const awardsSnap = await getDocs(query(collection(db, "awards"), orderBy("badge_name")));
				const awards = awardsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
				awards.sort((a, b) => {
					if (a.badge_name.toLowerCase() === "target") return -1;
					if (b.badge_name.toLowerCase() === "target") return 1;
					return 0;
				});
				setAwards(awards);

				const usersSnap = await getDocs(collection(db, "users"));
				const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
				setAllUsers(users);

				setLoading(false);
			} catch (err) {
				console.error(err)
				showMessage("Failed to get awards")
			}
		}

		setIsApple(/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent));

		init();
	}, [])

	const groupedUsers = useMemo(() => {
		const officers = [];
		const primers = [];
		const boys = [];

		for (const u of allUsers) {
			if (u.t === "Officer") officers.push(u);
			else if (u.t === "Primer") primers.push(u);
			else if (u.t === "Boy" && u.g === false) boys.push(u);
		}

		return { officers, primers, boys };
	}, [allUsers]);

	function selectAward(e) {
		const parts = e.target.value.split('-badge-selector-');
		const award = awards.find((award) => award.badge_name === parts[0]);

		setAward(award)
		if (parts[1] !== "") {
			const mastery = award?.badge_masteries.find(mastery => mastery.mastery_name === parts[1]);
			setMastery(mastery);
			setDescriptionHint(mastery.mastery_description_hint)
		} else {
			setMastery(null);
			setDescriptionHint(award?.badge_description)
		}
	}

	function selectBoy(e) {
		const id = e.target.id;
		setBoys(prev => {
			if (e.target.checked) {
				return [...prev, groupedUsers.boys.find(boy => boy.id === id)];
			} else {
				return prev.filter(boy => boy.id !== id);
			}
		});
	}

	function selectInstructor(id) {
		setInstructor(null);
		const user = groupedUsers.officers.find(officer => officer.id === id) || groupedUsers.primers.find(primer => primer.id === id)
		if (!user) return;
		if (user.c === "" || !user.c) return showMessage("Instructor must have credentials.");
		else setInstructor(user);
	}

	const convert = (rank, type) => {
        const OFFICER_RANK_MAP = { O: "OCT", J: "2LT", L: "LTA" };
		const PRIMER_RANK_MAP = { C: "CLT", S: "SCL" };
		const BOY_RANK_MAP = { R: "REC", P: "PTE", L: "LCP", C: "CPL", S: "SGT", W: "SSG", O: "WO" };

        if (type === "Officer") return OFFICER_RANK_MAP[rank];
        if (type === "Primer") return PRIMER_RANK_MAP[rank];
        if (type === "Boy") return BOY_RANK_MAP[rank];
    }

	if (loading) return <Loading />

	return (
		<div className={styles['result-generation-page']}>
			<h2>Generate Results</h2>

			<form className={styles['generate-results-form']} id='generate-results-form'>
				<label htmlFor='results-badge'>Select a badge to view results:</label>
				<select onChange={selectAward} id='results-badge' defaultValue={""}>
					<option value="" hidden>Select an Award</option>
					{awards.map(award => {
						if (["swimming", "first aid", "kayaking"].includes(award.badge_name.toLowerCase())) return [];

						return award.badge_masteries.length > 0
							? award.badge_masteries.map((mastery, index) => (
								<option key={`${award.id}-${index}`} value={`${award.badge_name}-badge-selector-${mastery.mastery_name}`}>{award.badge_name} {mastery.mastery_name}</option>
							))
							: [<option key={award.id} value={`${award.badge_name}-badge-selector-`}>{award.badge_name}</option>];
					})}
				</select>

				<label htmlFor="results-instructor">Select the instructor for the badgework:</label>
				<select onChange={(e) => selectInstructor(e.target.value)} defaultValue={""} id='results-instructor'>
					<option value="" hidden>Select an Instructor</option>
					{groupedUsers.primers.map((primerAccount) => {
						return (<option key={primerAccount.id + "-primer-instructor"} value={primerAccount.id}>{convert(primerAccount.r, primerAccount.t)} {primerAccount.n}</option>)
					})}
					{groupedUsers.officers.map((officerAccount) => {
						return (<option key={officerAccount.id + "-officer-instructor"} value={officerAccount.id}>{convert(officerAccount.r, officerAccount.t)} {officerAccount.n}</option>)
					})}
				</select>

				<p>Select the Boys to include in the results:</p>
				<div className={styles['boy-accounts']}>
					{groupedUsers.boys.map(boyAccount => (
						<div key={boyAccount.id + "-display"}>
							<input type='checkbox' id={boyAccount.id} onChange={selectBoy}></input>
							<label htmlFor={boyAccount.id}><span>Sec {boyAccount.l} {convert(boyAccount.r, boyAccount.t)} {boyAccount.n}</span></label>
						</div>
					))}
				</div>

				{(award != null && mastery != null && descriptionHint) && <Fragment>
					<label htmlFor='results-description'>Description of Badgework:</label>
					<textarea id='results-description' onChange={(e) => setDescriptionInput(e.target.value)} defaultValue={descriptionInput || award.results_description} placeholder={descriptionHint}></textarea>
				</Fragment>}
			</form>

			{award != null && ((award.badge_masteries.length > 0 && mastery != null) || (award.badge_masteries.length === 0 && mastery == null)) && instructor?.n != null && boys.length > 0 && <>
				<button onClick={() => window.print()}>Generate Results</button>
				{isApple && <p className={styles['apple-warning']}>It looks like you are using an Apple Device. Please press Share &gt; Print to generate results. Note that format might differ from other browsers.</p>}
				<ResultPage
					award={award}
					mastery={mastery}
					instructor={instructor}
					boys={boys}
					description={descriptionInput}
				/>
			</>}
		</div>
	);
}

export default ResultGenerationPage
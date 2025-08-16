import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { handleServerError, showMessage } from '../general/handleServerError'
import ResultPage from './ResultPage'
import '../styles/ResultGenerationPage.scss'
import BASE_URL from '../Constants'

// To manually create 32A results
const ResultGenerationPage = () => {
	const [awards, setAwards] = useState([]) // awards list with masteries
	const [award, setAward] = useState(); // selected award
	const [mastery, setMastery] = useState(); // selected mastery
	const [boys, setBoys] = useState([]); // selected boys id
	const [instructor, setInstructor] = useState({}); // selected instructor

	// get accounts
	const [boyAccounts, setBoyAccounts] = useState([])
	const [primerAccounts, setPrimerAccounts] = useState([])
	const [officerAccounts, setOfficerAccounts] = useState([])

	const [pdfLoading, setPdfLoading] = useState(false);
	const [pdf, setPdf] = useState(false)
	const [pdfurl, setPdfurl] = useState('')
	const [descriptionHint, setDescriptionHint] = useState();
	const [descriptionInput, setDescriptionInput] = useState();

	useEffect(() => {
		const init = async () => {
			try {
				let resp = await axios.get(`${BASE_URL}/account?type=Boy`, { headers: { "x-route": "/get_accounts_by_type" }, withCredentials: true })
				setBoyAccounts(resp.data);

				resp = await axios.get(`${BASE_URL}/account?type=Primer`, { headers: { "x-route": "/get_accounts_by_type" }, withCredentials: true })
				setPrimerAccounts(resp.data);

				resp = await axios.get(`${BASE_URL}/account?type=Officer`, { headers: { "x-route": "/get_accounts_by_type" }, withCredentials: true })
				setOfficerAccounts(resp.data)

				resp = await axios.get(`${BASE_URL}/awards`, { headers: { "x-route": "/get_awards" }, withCredentials: true })
				setAwards(resp.data)
			} catch (err) {
				handleServerError(err.response.status)
			}
		}

		init();
	}, [])

	function selectAward(e) {
		const parts = e.target.value.split('-badge-selector-');
		const award = awards.find((award) => award.badge_name === parts[0]);
		let mastery;

		setAward(award)
		setMastery(award?.badge_masteries.find((mastery) => mastery.mastery_name === parts[1]));
		setDescriptionHint(award?.badge_description_hint)

		if (award?.badge_masteries.length > 0) {
			mastery = award.badge_masteries.find((mastery) => mastery.mastery_name === parts[1]);
			setDescriptionHint(mastery.mastery_description_hint)
		}
	}

	function selectBoy() {
		let boyAccountSelector = document.getElementsByClassName('boy-account-selector')
		let accounts = []
		for (let account of boyAccountSelector) {
			if (account.checked) accounts.push(boyAccounts.find(boy => boy._id == account.id))
		}

		setBoys(accounts);
	}

	function selectInstructor(instructorId) {
		let account = primerAccounts.find(account => account._id == instructorId);
		if (!account) account = officerAccounts.find(account => account._id == instructorId);
		setInstructor(account)
	}

	function generateResult(e) {
		e.preventDefault()
		setPdf(false)

		if (award == null) return showMessage("Results cannot be generated without an Award.")
		if (instructor == null) return showMessage("Results cannot be generated without any Primers or Officers.")
		if (boys.length == 0) return showMessage("Results cannot be generated without any Boys.")

		boys.map(boy => {
			boyAccounts.find(account => account._id == boy)
		})

		if (pdfLoading) return;
		console.log(boys)
		setPdf(true);
	}

	return (
		<div className='result-generation-page'>
			<div className='page-container'>
				<div className='main-block'>
					<form className='fields generate-results-form' onSubmit={generateResult} id='generate-results-form'>
						<h1>Generate Results</h1>

						<label htmlFor='results-badge'>Select a badge to view results:</label>
						<select onChange={selectAward} id='results-badge' defaultValue={""}>
							<option value="" hidden>Select an Award</option>
							{awards.map(award => {
								const options = award.badge_masteries.length > 0
									? award.badge_masteries.map(mastery => (
										<option key={mastery._id} value={`${award.badge_name}-badge-selector-${mastery.mastery_name}`}>{award.badge_name} {mastery.mastery_name}</option>
									))
									: [<option key={award._id} value={`${award.badge_name}-badge-selector-`}>{award.badge_name}</option>];

								if (!["swimming", "first aid"].includes(award.badge_name)) return options;
							})}
						</select>

						<label htmlFor="results-instructor">Select the instructor for the badgework:</label>
						<select onChange={(e) => selectInstructor(e.target.value)} defaultValue={""} id='results-instructor'>
							<option value="" hidden>Select an Instructor</option>
							{primerAccounts.map((primerAccount) => {
								return (<option key={primerAccount._id + "-primer-instructor"} value={primerAccount._id}>{primerAccount.rank} {primerAccount.account_name}</option>)
							})}
							{officerAccounts.map((officerAccount) => {
								return (<option key={officerAccount._id + "-officer-instructor"} value={officerAccount._id}>{officerAccount.rank} {officerAccount.account_name}</option>)
							})}
						</select>

						<p>Select the Boys to include in the results:</p>
						<div className='boy-accounts'>
							{boyAccounts.map(boyAccount => (
								<div key={boyAccount._id + "-display"}>
									<input type='checkbox' id={boyAccount._id} onChange={selectBoy} className='boy-account-selector'></input>
									<label htmlFor={boyAccount._id}><span>Sec {boyAccount.level} {boyAccount.rank} {boyAccount.account_name}</span></label>
								</div>
							))}
						</div>

						{(award != null && mastery != null && descriptionHint) && <React.Fragment>
							<label htmlFor='results-description'>Description of badgework:</label>
							<p>{descriptionHint}</p>
							<textarea className='result-description' id='results-description' onChange={(e) => setDescriptionInput(e.target.value)} defaultValue={descriptionInput || award.results_description} placeholder='Description of badgework'></textarea>
						</React.Fragment>}
					</form>

					{pdf && pdfurl ? <iframe src={pdfurl} width="100%" height="500" style={{ border: 'none' }} />
					: (
						<div style={{ display: 'none' }}>
							<ResultPage
								award={award}
								mastery={mastery}
								instructor={instructor}
								boys={boys}
								description={descriptionInput}
								setPdfUrl={setPdfurl}
								setIsLoading={setPdfLoading}
							/>
						</div>
					)}

					<button type='submit' form='generate-results-form' disabled={pdfLoading}>Generate Results</button>
				</div>
			</div>
		</div>
	)
}

export default ResultGenerationPage
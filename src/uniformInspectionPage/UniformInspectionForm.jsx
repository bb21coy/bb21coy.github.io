import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { handleServerError } from '../general/handleServerError'
import BASE_URL from '../Constants'

// To facilitate uniform inspection by Officers / Primers
const UniformInspectionForm = () => {
	const navigate = useNavigate()
	const [boyAccounts, setBoyAccounts] = useState([]); 			// All Boys
	const [boys, setBoys] = useState([]); 							// Selected Boys
	const [components, setComponents] = useState([]);				// Sections
	const [selectedContents, setSelectedContents] = useState({});	// Checked Fields Per Section Per Boy
	const [currentForm, setCurrentForm] = useState();				// Selected Boy ID else undefined
	const [sectionCollapse, setSectionCollapse] = useState(false)   // Name List Section Collapse State
	const [remarks, setRemarks] = useState({})						// Remarks Per Section Per Boy

	useEffect(() => {
		axios.get(`${BASE_URL}/uniform_inspection`, { headers: { "x-route": "/get_inspection_components" }, withCredentials: true })
			.then(resp => setComponents(resp.data))
			.catch(error => handleServerError(error.response.status))

		axios.get(`${BASE_URL}/account?type=Boy`, { headers: { "x-route": "/get_accounts_by_type" }, withCredentials: true })
			.then(resp => setBoyAccounts(resp.data))
			.catch(resp => handleServerError(resp.response.status))
	}, [])

	function selectBoy() {
		let boyAccountSelector = document.querySelectorAll('.boy-account-selector:checked')
		let accounts = Array.from(boyAccountSelector, account => account.id)

		setSelectedContents(prevContents => {
			const updatedContents = { ...prevContents };
			accounts.map(account => {
				if (!updatedContents[account]) updatedContents[account] = [];
			});
			return updatedContents;
		});

		let boys = []
		boyAccountSelector.forEach(account => {
			const acc = boyAccounts.find(boy => boy._id == account.id)
			boys.push(acc)
		})

		setBoys(boys)
	}

	function selectField(e) {
		setSelectedContents(prev => {
			const updated = { ...prev };
			const id = e.target.id;
			const arr = updated[currentForm] ? [...updated[currentForm]] : [];
			updated[currentForm] = arr.includes(id) ? arr.filter(item => item !== id) : [...arr, id];
			return updated;
		})
	}

	function submitInspection(e) {
		e.preventDefault()

		const confirmed = window.confirm("Are you sure you have finished inspecting? Ensure that all boys selected have been inspected before submission.")
		if (!confirmed) return

		const result = {};
		const allKeys = new Set([...Object.keys(selectedContents), ...Object.keys(remarks)]);
		allKeys.forEach(key => {
			result[key] = {
				fields: fields[key] || [],
				remarks: remarks[key] || {}
			};
		});

		// const formattedDate = date.toLocaleDateString('en-GB');
		axios.post('/api/uniform_inspection/0/create_uniform_inspection', { data: result }, { withCredentials: true })
		.then(() => navigate('/uniform_inspection_results'))
		.catch(resp => handleServerError(resp.response?.status))
	}

	return (
		<div className='uniform-inspection-form'>
			<div className='form-selection'>
				<label htmlFor='boy-selector'>Inspecting:</label>
				<select id='boy-selector' onChange={e => setCurrentForm(e.target.value)} value={currentForm ? currentForm : ''}>
					<option value='' disabled={true}>Select a boy</option>
					{boys.map(boy => <option key={boy._id} value={boy._id}>{boy.rank} {boy.account_name}</option>)}
				</select>
			</div>

			<div className='page-container'>
				<h2>Uniform Inspection</h2>
				<div>
					<p>Pick the boys to inspect:</p>
					<i className='fa-solid fa-chevron-right' onClick={() => setSectionCollapse(!sectionCollapse)} style={{ transform: !sectionCollapse ? 'rotate(90deg)' : 'rotate(0deg)' }}></i>
				</div>

				<div className='boy-selector' style={{ height: sectionCollapse ? 0 : 'max-content' }}>
					{boyAccounts.map((boyAccount) => (
						<React.Fragment key={boyAccount._id}>
							<input type='checkbox' className='boy-account-selector' id={boyAccount._id} onChange={selectBoy}></input>
							<label htmlFor={boyAccount._id}>
								<p>Sec {boyAccount.level} {boyAccount.rank} {boyAccount.account_name}</p>
							</label>
						</React.Fragment>
					))}
				</div>

				<form onSubmit={submitInspection}>
					{currentForm != null && components.map(component => (
						<div key={component._id}>
							<h3>{component.component_name}</h3>
							<ul>
								{component.components_fields.map(field => (
									<li key={`${field._id}-${currentForm}`}>
										<input type='checkbox' className={`${component._id}-field-selector ${field.field_description.toLowerCase().includes("missing") ? "field-missing" : ""}`} id={`${field._id}`} name={component._id} onChange={(e) => selectField(e)} defaultChecked={selectedContents[currentForm].includes(field._id)}></input>
										<label htmlFor={`${field._id}`}>{field.field_description}</label>
									</li>
								))}
							</ul>
							<textarea key={`${currentForm}-${component._id}`} name={`${component.component_name}-remarks`} placeholder='Remarks (Optional)' defaultValue={remarks[currentForm]?.[component._id]} onChange={(e) => setRemarks(prev => ({ ...prev, [currentForm]: { ...prev[currentForm], [component._id]: e.target.value } }))}></textarea>
						</div>
					))}
					<button>Finish Inspection</button>
				</form>
			</div>
		</div>
	)
}

export default UniformInspectionForm
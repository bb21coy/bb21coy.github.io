import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { handleServerError } from '../general/handleServerError'
import BASE_URL from '../Constants'

// To facilitate uniform inspection by officers / primers
const UniformInspectionResultPage = () => {
	const [components, setComponents] = useState([]);
	const [currentInspection, setCurrentInspection] = useState()
	const [inspections, setInspections] = useState([]);
	const [boy, setBoy] = useState();
	const { id } = useParams()

	useEffect(() => {
		axios.get(`${BASE_URL}/uniform_inspection`, { headers: { "x-route": "/get_inspection_components" }, withCredentials: true })
			.then(resp => setComponents(resp.data))
			.catch(resp => handleServerError(resp.response.status))

		axios.get(`${BASE_URL}/uniform_inspection?id=${id}`, { headers: { "x-route": "/get_user_inspection" }, withCredentials: true })
			.then(resp => {
				setBoy(resp.data[0]['boy'].account_name)
				setInspections(resp.data)
				setCurrentInspection(resp.data[0])
			})
			.catch(resp => handleServerError(resp.response.status))
	}, [])

	const selectInspection = (e) => {
		const inspectionId = e.target.value;
		const obj = inspections.find(item => item._id === inspectionId);
		setCurrentInspection(obj);
	}

	return (
		<div className='uniform-inspection-result-page'>
			<div className='page-container'>
				<h2>Past Inspection Results</h2>

				<div>
					<div>
						<label htmlFor='inspection-select'>Viewing Results of: {boy} on</label>
						<select className='date-select' id='inspection-select' onChange={selectInspection}>
							{inspections.map(inspection => <option key={inspection._id} value={inspection._id}>{inspection.assessedDate.split("T")[0]}</option>)}
						</select>
					</div>

					<div>
						{currentInspection != null && <>
							<p>Assessor: {currentInspection.assessor?.rank} {currentInspection.assessor?.account_name}</p>
							<p>Score: {currentInspection.score}</p>
						</>}
					</div>
				</div>

				{currentInspection != null && components.map(component => (
					<div key={component._id}>
						<h3>{component.component_name}</h3>
						<ul>
							{component.components_fields.map(field => (
								<li key={`${field._id}-${currentInspection}`}>
									<input type='checkbox' disabled id={`${field._id}`} checked={currentInspection.fields.includes(field._id)} className={`${field.field_description.toLowerCase().includes("missing") ? "field-missing" : ""}`} />
									<label htmlFor={`${field._id}`}>{field.field_description}</label>
								</li>
							))}
						</ul>
						<textarea name={`${component.component_name}-remarks`} placeholder='Components Remarks (if any)' defaultValue={currentInspection.remarks[component._id] ?? 'No Remarks Given'} disabled></textarea>
					</div>
				))}
			</div>
		</div>
	)
}

export default UniformInspectionResultPage
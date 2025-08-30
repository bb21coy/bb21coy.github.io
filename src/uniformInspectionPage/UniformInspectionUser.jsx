import React, { useState, useEffect } from "react";
import axios from "axios";
import { handleServerError } from "../general/handleServerError";
import BASE_URL from "../Constants";
import '../styles/uniformInspectionUser.scss'

function UniformInspectionUser() {
    const [inspectionList, setInspectionList] = useState([]);
    const [selectedInspection, setSelectedInspection] = useState();
    const [components, setComponents] = useState([]);

    useEffect(() => {
        axios.get(`${BASE_URL}/uniform_inspection`, { headers: { "x-route": "/get_inspection_components" }, withCredentials: true })
			.then(resp => setComponents(resp.data))
			.catch(resp => handleServerError(resp.response.status))

		axios.get(`${BASE_URL}/uniform_inspection`, { headers: { "x-route": "/get_user_inspection" }, withCredentials: true })
			.then(resp => setInspectionList(resp.data))
			.catch(resp => handleServerError(resp.response.status))
    }, []);

    const getInspection = (id) => {
		const obj = inspectionList.find(item => item._id === id);
		setSelectedInspection(obj);
    }

    return (
        <div className="uniform-inspection-user">
            <h2>My Uniform Inspections Results</h2>

            <div>
                <section>
                    <div>
                        {inspectionList.length > 0 ? inspectionList.map(inspection => (
                        <React.Fragment key={inspection._id}>
                            <input type="radio" name="inspection_selection" id={inspection._id} onChange={() => getInspection(inspection._id)} />
                            <label htmlFor={inspection._id}>
                                <p title="Inspection Date">{inspection.assessedDate.split('T')[0]}</p>
                                <p title="Inspection Score">{inspection.score}</p>
                            </label>
                        </React.Fragment>)) : <p>No inspection results</p>}
                    </div>
                </section>

                <hr />

                <section>
                    {selectedInspection ? 
                        <>
                            <div>
                                <p>Date</p>
                                <p>{selectedInspection.assessedDate.split('T')[0]}</p>
                                <p>Assessor</p>
                                <p>{selectedInspection.assessor?.rank} {selectedInspection.assessor.account_name}</p>
                                <p>Score</p>
                                <p>{selectedInspection.score}</p>
                            </div>
                            
                            {components.map(component => (
                                <div key={component._id}>
                                    <h3>{component.component_name}</h3>
                                    <ul>
                                        {component.components_fields.map(field => (
                                            <li key={`${component._id}-${field._id}`}>
                                                <input type="checkbox" disabled id={`sub-${field._id}`} checked={selectedInspection.fields.includes(`${field._id}`)} className={`${field.field_description.toLowerCase().includes("missing") ? "field-missing" : ""}`} />
                                                <label htmlFor={`sub-${field._id}`}>{field.field_description}</label>
                                            </li>
                                        ))}
                                    </ul>
                                    <textarea name={`${component.component_name}-remarks`} placeholder='Components Remarks (if any)' defaultValue={selectedInspection.remarks[component._id] ?? 'No Remarks Given'} disabled></textarea>
                                </div>
                            ))}
                        </>
                    : <p>Click on an inspection to view results</p>}
                </section>
            </div>
        </div>
    )
}

export default UniformInspectionUser
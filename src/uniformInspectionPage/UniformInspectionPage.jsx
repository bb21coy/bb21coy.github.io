import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { handleServerError } from '../general/handleServerError'
import BASE_URL from '../Constants'
import '../styles/uniformInspectionPage.scss'

// To facilitate uniform inspection by officers / primers
const UniformInspectionPage = () => {
	const navigate = useNavigate()
	const [inspections, setInspections] = useState([]);
	const [boys, setBoys] = useState([]);
	const [filters, setFilters] = useState({sec1: true, sec2: true, sec3: true, sec4: true, sec5: true})

	useEffect(() => {
		const controller = new AbortController();
    	const signal = controller.signal;

		axios.get(`${BASE_URL}/uniform_inspection`, { headers: { 'x-route': '/get_inspection_summary' }, withCredentials: true, signal })
		.then(resp => {
			setInspections(resp.data.summary);
			setBoys(resp.data.boys);
		})
		.catch(err => {
			if (!axios.isCancel(err)) {
				console.error("Error fetching uniform inspections:", err?.response?.message);
				handleServerError(err?.response?.status);
			}
		})

		return () => controller.abort();
	}, [navigate])

	function uniformInspectionForm() {
		navigate('/uniform_inspection_form')
	}

	function filter() {
		const search = document.getElementById('search').value.toLowerCase()

		document.querySelectorAll(".uniform-inspection-list-table div").forEach(row => {
			const columns = Array.from(row.children).slice(1, -1)
			const matchesSearch = columns.some(col => col.textContent.toLowerCase().includes(search));
			const matchesSection = filters[row.getAttribute("data-sec")] === true
			row.style.display = matchesSearch && matchesSection ? "contents" : "none";
		})
	}

	function handleCheckboxChange(e) {
		setFilters({...filters, [e.target.id.split('-')[0]]: !filters[e.target.id.split('-')[0]]});
	};
	
	useEffect(() => {
		filter()
	}, [filters])

	return (
		<div className='uniform-inspection-page'>
			<div className='page-container'>
				<div className='uniform-inspection-filter'>
					<div>
						<label htmlFor="search">
							<i className='fa-solid fa-magnifying-glass'></i>
						</label>
						<input type="search" id="search" name="search" placeholder="Search Boy" onInput={filter} />
					</div>

					<div>					
						<input type="checkbox" id="sec1-filter" defaultChecked={filters.sec1} onChange={handleCheckboxChange} />
						<label htmlFor="sec1-filter">Sec 1</label>
						<input type="checkbox" id="sec2-filter" defaultChecked={filters.sec2} onChange={handleCheckboxChange} />
						<label htmlFor="sec2-filter">Sec 2</label>
						<input type="checkbox" id="sec3-filter" defaultChecked={filters.sec3} onChange={handleCheckboxChange} />
						<label htmlFor="sec3-filter">Sec 3</label>
						<input type="checkbox" id="sec4-filter" defaultChecked={filters.sec4} onChange={handleCheckboxChange} />
						<label htmlFor="sec4-filter">Sec 4</label>
						<input type="checkbox" id="sec5-filter" defaultChecked={filters.sec5} onChange={handleCheckboxChange} />
						<label htmlFor="sec5-filter">Sec 5</label>
					</div>
				</div>

				<h2>Latest Uniform Inspection</h2>
				<div className='uniform-inspection-list-table'>
					<p>No.</p>
					<p>Name</p>
					<p>Score</p>
					<p>Date</p>
					<p>Assessor</p>
					<p>Records</p>

					{boys.map((boy, index) => {
						const inspection = inspections.find(inspection => inspection.boy._id === boy._id);

						if (!inspection) {
							return (
								<div key={boy.account_name} data-sec={"sec" + boy.level}>
									<p>{index + 1}</p>
									<p>{boy.account_name}</p>
									<p>-</p>
									<p>-</p>
									<p>-</p>
									<p>-</p>
								</div>
							)
						} else {
							const formattedDate = inspection.assessedDate.split('T')[0];
							return (
								<div key={boy._id} id={boy._id} data-sec={"sec" + boy.level}>
									<p>{index + 1}</p>
									<p>{boy.account_name}</p>
									<p>{inspection.score}</p>
									<p>{formattedDate}</p>
									<p>{inspection.assessor.account_name}</p>
									<p aria-label='View Uniform Inspection Record'><i onClick={() => navigate(`/view_uniform_inspection/${inspection._id}`)} className='fa-solid fa-up-right-from-square'></i></p>
								</div>
							)
						}
					})}
				</div>
				
				<button onClick={uniformInspectionForm} id='conduct-inspection-button'>Conduct Inspection</button>
			</div>
		</div>
	)
}

export default UniformInspectionPage
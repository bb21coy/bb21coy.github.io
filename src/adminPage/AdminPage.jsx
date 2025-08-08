import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { handleServerError } from '../general/handleServerError';
import { DatabaseTable } from './DatabaseTable';
import AdminUsageAnalytics from './AdminUsageAnalytics';
import BASE_URL from '../Constants';
import '../styles/adminPage.scss'
import '../styles/general.scss'

// Only meant for admin to initialise the page
const AdminPage = () => {
	const [tableNames, setTableNames] = useState([]);
	const [selectedTable, setSelectedTable] = useState();
	const tableRef = useRef(null);
	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const [scrollLeft, setScrollLeft] = useState(0);

	useEffect(() => {
		axios.get(`${BASE_URL}/admin`, { headers: { 'x-route': '/get_table_names' }, withCredentials: true })
		.then(resp => {
			console.log(resp.data)
			setTableNames(resp.data)
			setSelectedTable(resp.data[0])
		})
		.catch(err => handleServerError(err.response.status))
	}, [])

	const onMouseDown = (e) => {
		setIsDragging(true);
		setStartX(e.clientX - tableRef.current.offsetLeft);
		setScrollLeft(tableRef.current.scrollLeft);
	};

	const onMouseLeave = () => {
		setIsDragging(false);
	};

	const onMouseUp = () => {
		setIsDragging(false);
	};

	const onMouseMove = (e) => {
		if (!isDragging) return;
		e.preventDefault();
		const x = e.clientX - tableRef.current.offsetLeft;
		const scroll = (startX - x) + scrollLeft;
		tableRef.current.scrollLeft = scroll;
	};

	return (
		<div className='admin-page'>
			<div className='admin-tables-list'>
				<div>
					<input type="radio" onChange={(e) => setSelectedTable('usage')} id={`db-radio-usage`} name='tables' />
					<label htmlFor={`db-radio-usage`}>
						<p>Usage</p>
					</label>
					{tableNames.map(tableName => (<React.Fragment key={tableName.info.uuid}>
						<input type='radio' onChange={(e) => setSelectedTable(tableName.name)} id={`db-radio-${tableName.info.uuid}`} name='tables' />
						<label htmlFor={`db-radio-${tableName.info.uuid}`}>
							<p>{tableName.name}</p>
						</label>
					</React.Fragment>))}
				</div>
			</div>
			<div className='page-container' ref={tableRef} onMouseDown={onMouseDown} onMouseLeave={onMouseLeave} onMouseUp={onMouseUp} onMouseMove={onMouseMove} style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
				{(selectedTable && selectedTable !== "usage") && <DatabaseTable table_name={selectedTable} />}
				{selectedTable === "usage" && <AdminUsageAnalytics/>}
			</div>
		</div>
	)
}

export default AdminPage
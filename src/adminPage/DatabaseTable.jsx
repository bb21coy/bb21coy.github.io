import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { handleServerError } from '../general/handleServerError';
import BASE_URL from '../Constants';

const EXCLUDED_COLUMNS = ['createdAt', 'updatedAt', '__v'];
const DatabaseTable = ({ table_name }) => {
	const [data, setData] = useState([]);
	const [columns, setColumns] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(`${BASE_URL}/admin?table_name=${table_name}`, {
					headers: { 'x-route': '/get_table' },
					withCredentials: true
				});

				const rawData = response.data;
				const uniqueKeys = new Set();

				rawData.forEach(obj => {
					Object.keys(obj).forEach(key => uniqueKeys.add(key));
				});

				console.log(response.data)

				setData(rawData);
				setColumns([...uniqueKeys]);
			} catch (err) {
				console.error(err);
				handleServerError(err?.response?.status);
			}
		};

		if (table_name != null && typeof table_name === 'string') fetchData();
	}, [table_name])

	return (
		<table>
			<thead>
				<tr>
					{columns.filter(column => !EXCLUDED_COLUMNS.includes(column)).map((column, index) => (
						<th key={column + index}>{column}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((row, index) => (
					<tr key={row._id}>
						{columns.filter(column => !EXCLUDED_COLUMNS.includes(column)).map((column) => (
							<td key={column + index} title={row[column] !== null ? String(row[column]) : '-'}>
								{(row[column] != null && row[column] !== "") ? String(row[column]) : '-'}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	)
}

DatabaseTable.propTypes = {
	table_name: PropTypes.string
}

export { DatabaseTable }
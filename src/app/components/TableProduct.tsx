'use client'
import DataTable from 'react-data-table-component';

interface DataRow {
    id: number;
    title: string;
    year: string;
  }
const columns = [
	{
		name: 'Title',
		selector:( row  : DataRow ) => row.title,
	},
	{
		name: 'Year',
		selector: (row : DataRow) => row.year,
	},
];

const data = [
  	{
		id: 1,
		title: 'Beetlejuice',
		year: '1988',
	},
	{
		id: 2,
		title: 'Ghostbusters',
		year: '1984',
	},
]

export  function TableProduct() {
	return (
		<DataTable
			columns={columns}
			data={data}
		/>
	);
};
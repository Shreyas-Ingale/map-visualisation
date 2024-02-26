import { useEffect, useState } from 'react';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import chartData from '@/util/data.json';

function DataVisualization({ location }) {
	const [data, setData] = useState(null);
	const [options, setOptions] = useState(null);

	useEffect(() => {
		// on component mount check if a feature is clicked by checking the value of location state.
		if (!location) return;
		// if yes then setup the chart.js instance
		ChartJS.register(
			CategoryScale,
			LinearScale,
			PointElement,
			LineElement,
			Title,
			Tooltip,
			Legend
		);

		// from the dataset get the data of selected location
		let locationData = chartData.find(
			(data) => data.location === location
		).data;

		// set x axis labels
		const labels = Object.keys(locationData);

		// set general options for the chart
		setOptions({
			responsive: true,
			plugins: {
				legend: {
					display: false,
				},
				title: {
					display: true,
					text: `${location} Forest Cover`,
				},
			},
			scales: {
				y: {
					title: {
						display: true,
						text: 'Sq. Kms.',
					},
				},
				x: {
					title: {
						display: true,
						text: 'Year',
					},
				},
			},
		});

		// set the overall data
		setData({
			labels,
			datasets: [
				{
					label: 'Forest Cover',
					data: labels.map((year) => locationData[year]),
					borderColor: 'rgb(53, 162, 235)',
					backgroundColor: 'rgba(53, 162, 235, 0.5)',
				},
			],
		});
	}, [location]);

	return <>{data && <Line options={options} data={data} />}</>;
}

export default DataVisualization;

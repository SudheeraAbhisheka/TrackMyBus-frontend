import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const EmptyPage = () => {
    const { id } = useParams();
    const [mapDetails, setMapDetails] = useState(null);
    const [locations, setLocations] = useState({});
    const [highlightedBusStopX, setHighlightedBusStopX] = useState(null);
    const [expectedTime, setExpectedTime] = useState(null);
    const [estimatedTime, setEstimatedTime] = useState(null);

    const INTERVAL_TIMEOUT = 500;

    useEffect(() => {
        const fetchMapDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/map/${id}`);
                setMapDetails(response.data);
            } catch (error) {
                console.error('Error fetching map details:', error);
            }
        };

        fetchMapDetails();
    }, [id]);

    useEffect(() => {
        const fetchGpsLocations = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/gps-location/${id}`);
                setLocations(response.data);
            } catch (error) {
                console.error('Error fetching GPS locations:', error);
            }
        };

        fetchGpsLocations();
        const intervalId = setInterval(fetchGpsLocations, INTERVAL_TIMEOUT);

        return () => clearInterval(intervalId);
    }, [id]);

    useEffect(() => {
        const fetchBusStops = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/bus-stops/${id}`);
                setHighlightedBusStopX(response.data.id.xcoordinate);
                setExpectedTime(response.data.secondsFromStart);
            } catch (error) {
                console.error('Error fetching GPS locations:', error);
            }
        };

        fetchBusStops();

    }, [id]);

    useEffect(() => {
        const fetchEstArrival = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/est-arrival/dl435`);
                setEstimatedTime(response.data);

            } catch (error) {
                console.error('Error fetching GPS locations:', error);
            }
        };

        fetchEstArrival();
        const intervalId = setInterval(fetchEstArrival, INTERVAL_TIMEOUT);

        return () => clearInterval(intervalId);
    }, [id]);

    const calculatePolynomial = (x) => {
        if (!mapDetails) return 0;
        try {
            return eval(mapDetails.root_function);
        } catch (error) {
            console.error("Error evaluating polynomial expression:", error);
            return 0;
        }
    };

    const generateChartData = () => {
        const xValues = Array.from({ length: mapDetails.ending_x + 1 }, (_, i) => i);
        const yValues = xValues.map((x) => calculatePolynomial(x));

        const highlightedPoints = Object.values(locations).map((location) => {
            const highlightedX = location.x;
            const highlightedY = calculatePolynomial(highlightedX);
            return { highlightedX, highlightedY };
        });

        const highlightedBusStopY = calculatePolynomial(highlightedBusStopX);

        const colors = [
            "rgba(255, 99, 132, 1)",   // Red
            "rgba(54, 162, 235, 1)",   // Blue
            "rgba(255, 206, 86, 1)",   // Yellow
            "rgba(75, 192, 192, 1)",   // Green
            "rgba(153, 102, 255, 1)",  // Purple
            "rgba(255, 159, 64, 1)",   // Orange
        ];

        const datasets = [
            {
                label: mapDetails.root_function,
                data: yValues,
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 2,
                fill: false,
            },
            ...highlightedPoints.map((point, index) => ({
                label: `Highlight at x = ${point.highlightedX}`,
                data: xValues.map((x) => (x === point.highlightedX ? point.highlightedY : null)),
                borderColor: colors[index % colors.length], // Cycle through the color array
                backgroundColor: colors[index % colors.length],
                pointRadius: 6,
                pointHoverRadius: 8,
                showLine: false,
            })),
            {
                label: `Highlight at x = ${highlightedBusStopX}`,
                data: xValues.map((x) => (x === highlightedBusStopX ? highlightedBusStopY : null)),
                borderColor: "rgb(48,214,33)",
                backgroundColor: "rgb(48,214,33)",
                pointRadius: 12,
                pointHoverRadius: 16,
                showLine: false, // Only show the point, not a line
            },
        ];

        return {
            labels: xValues,
            datasets: datasets,
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: {
                display: true,
                text: `Polynomial Graph\n${mapDetails?.root_function}`,
            },
        },
        scales: {
            x: { title: { display: true, text: "x" } },
            y: { title: { display: true, text: "y" } },
        },
        animation: { duration: 0 },
    };

    if (!mapDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div style={{width: "1000px", height: "600px"}}>
                <Line data={generateChartData()} options={chartOptions}/>
            </div>
            <div>
                <h1>GPS Locations</h1>
                <ul>
                    <li>
                        <strong>Expected time:</strong> {expectedTime} <br/>
                    </li>
                    <li>
                        <strong>Estimated time:</strong> {estimatedTime} <br/>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default EmptyPage;

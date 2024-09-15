import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const EmptyPage = () => {
    const { map_id } = useParams();
    const [mapDetails, setMapDetails] = useState(null);
    const [locations, setLocations] = useState({});
    const [highlightedBusStopX, setHighlightedBusStopX] = useState(null);
    const [expectedTime, setExpectedTime] = useState(null);
    const [estimatedTime, setEstimatedTime] = useState(null);
    const [busStops, setBusStops] = useState([]);
    const [selectedBusStop, setSelectedBusStop] = useState(null); // New state for selected bus stop

    const INTERVAL_TIMEOUT = 500;

    useEffect(() => {
        const fetchMapDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/map/${map_id}`);
                setMapDetails(response.data);
            } catch (error) {
                console.error('Error fetching map details:', error);
            }
        };

        fetchMapDetails();
    }, [map_id]);

    useEffect(() => {
        const fetchGpsLocations = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/gps-location/${map_id}`);
                setLocations(response.data);
            } catch (error) {
                console.error('Error fetching GPS locations:', error);
            }
        };

        fetchGpsLocations();
        const intervalId = setInterval(fetchGpsLocations, INTERVAL_TIMEOUT);

        return () => clearInterval(intervalId);
    }, [map_id]);

    useEffect(() => {
        const fetchBusStops = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/bus-stops/${map_id}`);
                setBusStops(response.data);

                if (response.data.length > 0) {
                    setSelectedBusStop(response.data[1]);
                } else {
                    console.warn('No bus stops found for this map_id.');
                }
            } catch (error) {
                console.error('Error fetching bus stops:', error);
            }
        };

        fetchBusStops();
    }, [map_id]);

    useEffect(() => {
        if (selectedBusStop) {
            // Update highlighted bus stop and expected time when bus stop is selected
            setHighlightedBusStopX(selectedBusStop.id.xcoordinate);
            setExpectedTime(selectedBusStop.secondsFromStart);
        }
    }, [selectedBusStop]);

    useEffect(() =>
    {
        const fetchEstArrival = async () => {
            try {
                const estimatedTimes = {};
                for (const sessionId in locations) {
                    if (Object.prototype.hasOwnProperty.call(locations, sessionId)) {
                        const busId = locations[sessionId].busId;
                        const response = await axios.get(`http://localhost:8080/est-arrival/${sessionId}`);
                        estimatedTimes[busId] = response.data;
                    }
                }
                setEstimatedTime(estimatedTimes);
            } catch (error) {
                console.error('Error fetching estimated arrival times:', error);
            }
        };

        fetchEstArrival();
        const intervalId = setInterval(fetchEstArrival, INTERVAL_TIMEOUT);

        return () => clearInterval(intervalId);
    }, [locations]);

    const handleRestart = async () => {
        try {
            await axios.post('http://localhost:8080/restart');
            alert('GPS tracking restarted');
        } catch (error) {
            console.error('Error restarting GPS tracking:', error);
            alert('Failed to restart GPS tracking');
        }
    };

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
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
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
                borderColor: colors[index % colors.length],
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
                showLine: false,
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

    const handleBusStopChange = (event) => {
        const selectedId = event.target.value;
        const selectedStop = busStops.find((stop) => serializeId(stop.id) === selectedId);
        setSelectedBusStop(selectedStop);
    };

// Function to serialize the composite ID into a string
    const serializeId = (id) => {
        return `${id.xcoordinate}-${id.ycoordinate}`; // Adjust based on the actual structure of your composite ID
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
                <label>Select Bus Stop: </label>
                <select onChange={handleBusStopChange} value={selectedBusStop ? serializeId(selectedBusStop.id) : ''}>
                    {busStops.map((stop) => (
                        <option key={serializeId(stop.id)} value={serializeId(stop.id)}>
                            Bus Stop {stop.id.xcoordinate}
                        </option>
                    ))}
                </select>
            </div>


            <div>
                <h1>GPS Locations</h1>
                <ul>
                    <li><strong>Expected time:</strong> {expectedTime} <br/></li>
                    {Object.keys(estimatedTime || {}).map((map_id) => (
                        <li key={map_id}>
                            <strong>Bus {map_id} estimated time:</strong> {estimatedTime[map_id]} <br/>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <button onClick={handleRestart}>Restart GPS Tracking</button>
            </div>
        </div>
    );
};

export default EmptyPage;

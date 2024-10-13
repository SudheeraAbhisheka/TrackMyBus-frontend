import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const { map_id } = useParams();
    const [mapDetails, setMapDetails] = useState(null);
    const [locations, setLocations] = useState({});
    const [highlightedBusStopX, setHighlightedBusStopX] = useState(null);
    const [expectedTime, setExpectedTime] = useState(null);
    const [estimatedTime, setEstimatedTime] = useState(null);
    const [busStops, setBusStops] = useState([]);
    const [selectedBusStop, setSelectedBusStop] = useState(null);
    const [delayedObjects, setDelayedObjects] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const eventSource = new EventSource("http://localhost:8080/notify-delay");

        eventSource.onmessage = function (event) {
            const delayedObject = JSON.parse(event.data);
            console.log(delayedObject); // Use this data to update your UI

            setDelayedObjects(prevObjects => {
                const newObjects = [...prevObjects, delayedObject];
                // Remove the delayed object after 5 seconds
                setTimeout(() => {
                    setDelayedObjects(currentObjects =>
                        currentObjects.filter(obj => obj !== delayedObject)
                    );
                }, 3000);
                return newObjects;
            });
        };

        eventSource.onerror = function (err) {
            console.error("EventSource failed:", err);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

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

            } catch (error) {
                console.error('Error fetching bus stops:', error);
            }
        };

        fetchBusStops();
    }, [map_id]);

    useEffect(() => {
        if (selectedBusStop) {
            setHighlightedBusStopX(selectedBusStop.id.xcoordinate);
            setExpectedTime(selectedBusStop.expectedTime);
        }
    }, [selectedBusStop]);


    useEffect(() => {
        const fetchEstArrival = async () => {
            if (!selectedBusStop) {
                return; // Do nothing if no bus stop is selected
            }

            try {
                const response = await axios.get(`http://localhost:8080/est-arrival/${selectedBusStop.id.xcoordinate}`);
                setEstimatedTime(response.data);
            } catch (error) {
                console.error('Error fetching estimated arrival times:', error);
            }
        };

        fetchEstArrival(); // Fetch the data when a bus stop is selected
        const intervalId = setInterval(fetchEstArrival, INTERVAL_TIMEOUT); // Set an interval for fetching updates

        return () => clearInterval(intervalId); // Clean up the interval on unmount
    }, [selectedBusStop]); // Re-run the effect only when selectedBusStop changes


    const handleRestart = async () => {
        try {
            await axios.post('http://localhost:8080/restart');
            console.log('GPS tracking restarted');
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
                display: false,
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
            <div>
                <button onClick={() => navigate('/')}>Home</button>
                <button onClick={() => navigate('/map-list')}>Back to Map List</button>
                <button onClick={handleRestart}>Restart GPS Tracking</button>
                <button onClick={() => navigate('/admin-console')}>Go to Admin Console</button>
            </div>


            {delayedObjects.length > 0 && (
                <div className="notification">
                    <h3>Bus Delay Information</h3>
                    {delayedObjects.map((obj, index) => (
                        <div key={index}>
                            <p>Session: {obj.session}</p>
                            <p>Expected in Next: {obj.expectedInNext} seconds</p>
                        </div>
                    ))}
                </div>
            )}

            <div style={{width: "1000px", height: "600px"}}>
                <Line data={generateChartData()} options={chartOptions}/>
            </div>

            <div>
                <label>Select Bus Stop: </label>
                <select onChange={handleBusStopChange} value={selectedBusStop ? serializeId(selectedBusStop.id) : ''}>
                    <option value="" disabled>Select a bus stop</option>
                    {busStops.map((stop) => (
                        <option key={serializeId(stop.id)} value={serializeId(stop.id)}>
                            Bus Stop {stop.id.xcoordinate}
                        </option>
                    ))}
                </select>
            </div>


            {expectedTime && (
                <div>
                    <h3>GPS Locations</h3>
                    <ul>
                        <li><strong>Expected time:</strong> {expectedTime} <br/></li>
                        {estimatedTime && Object.entries(estimatedTime).map(([busId, time]) => (
                            <li key={busId}>
                                <strong>Bus {busId} estimated time:</strong> {time.toFixed(2)} seconds<br/>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

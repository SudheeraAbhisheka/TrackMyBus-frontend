import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GpsLocationComponent = () => {
    const [locations, setLocations] = useState({});

    // Function to fetch GPS data from the backend
    const fetchGpsLocations = async () => {
        try {
            const response = await axios.get('http://localhost:8080/gps-location');
            setLocations(response.data); // Update the state with GPS location data
        } catch (error) {
            console.error('Error fetching GPS locations:', error);
        }
    };

    useEffect(() => {
        // Fetch data initially and set up polling at intervals (e.g., every 5 seconds)
        fetchGpsLocations();
        const interval = setInterval(fetchGpsLocations, 1000); // Poll every 5 seconds

        // Cleanup interval when component unmounts
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1>GPS Locations</h1>
            <ul>
                {Object.entries(locations).map(([key, location]) => (
                    <li key={key}>
                        <strong>Bus ID:</strong> {key} <br />
                        <strong>Latitude:</strong> {location.x} <br />
                        <strong>Longitude:</strong> {location.y}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GpsLocationComponent;

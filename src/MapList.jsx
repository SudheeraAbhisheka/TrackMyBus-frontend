import React, { useEffect, useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios'; // Import axios

const MapList = () => {
    const [maps, setMaps] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8080/select-map')
            .then(response => {
                setMaps(response.data);
            })
            .catch(error => {
                console.error('Error fetching maps:', error);
            });
    }, []);

    const handleRestart = async () => {
        try {
            await axios.post('http://localhost:8080/restart');
            window.location.reload();
        } catch (error) {
            console.error('Error restarting GPS tracking:', error);
            alert('Failed to restart GPS tracking');
        }
    };

    return (
        <div>
            <button className="home-button" onClick={() => navigate('/')}>
                Home
            </button>
            <div>
                <button onClick={handleRestart}>Restart GPS Tracking</button>
            </div>
            <div>
                <h1>Select a Map</h1>
                <ul>
                    {maps.map(map => (
                        <li key={map.root_id}>
                            <Link to={`/map/${map.root_id}`}>
                                Map ID: {map.root_id}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MapList;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import axios

const MapList = () => {
    const [maps, setMaps] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8080/select-map')
            .then(response => {
                setMaps(response.data);
            })
            .catch(error => {
                console.error('Error fetching maps:', error);
            });
    }, []);

    return (
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
    );
};

export default MapList;

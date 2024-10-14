// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapList from "./MapList.jsx";
import Dashboard from "./Dashboard.jsx";
import AdminConsole from "./AdminConsole.jsx";
import Home from "./Home.jsx";
import Layout from './Layout';
import axios from "axios";

function App() {
    const handleRestart = async () => {
        try {
            const response = await axios.post('http://localhost:8080/restart');
            const message = response.data;
            window.location.reload();
            alert(`Success: ${message}`);
        } catch (error) {
            console.error('Error restarting GPS tracking:', error);
            alert('Failed to restart GPS tracking');
        }
    };

    return (
        <Router>
            <Routes>
                {/* Routes without Layout */}
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />

                {/* Routes with Layout applied */}
                <Route element={<Layout handleRestart={handleRestart} />}>
                    <Route path="/map-list" element={<MapList />} />
                    <Route path="/map/:map_id" element={<Dashboard />} />
                    <Route path="/admin-console" element={<AdminConsole handleRestart={handleRestart} />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;

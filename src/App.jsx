// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapList from "./MapList.jsx";
import Dashboard from "./Dashboard.jsx";
import AdminConsole from "./AdminConsole.jsx";
import Home from "./Home.jsx"; // Import your component

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/map-list" element={<MapList />} />
                <Route path="/map/:map_id" element={<Dashboard />} />
                <Route path="/admin-console" element={<AdminConsole />} />
            </Routes>
        </Router>
    );
}

export default App;

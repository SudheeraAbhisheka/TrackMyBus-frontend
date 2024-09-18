// App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapList from "./MapList.jsx";
import EmptyPage from "./EmptyPage.jsx"; // Import your component

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MapList />} />
                <Route path="/map/:map_id" element={<EmptyPage />} />
            </Routes>
        </Router>
    );
}

export default App;

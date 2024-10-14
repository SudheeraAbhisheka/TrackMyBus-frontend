import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom'; // Import Outlet

const Layout = ({ handleRestart }) => {
    const navigate = useNavigate();

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f0f0f0', position: 'fixed', width: '100%', top: 0 }}>
                <button onClick={() => navigate('/')}>
                    Home
                </button>
                <button onClick={handleRestart}>Restart GPS Tracking</button>
            </header>
            <div style={{ paddingTop: '60px' }}>
                {/* This is where nested routes will be rendered */}
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;

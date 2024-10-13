import React from 'react';
import {useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Welcome to the Home Page</h1>
            <div style={{ margin: '20px' }}>
                <button style={{ padding: '10px 20px', margin: '10px' }} onClick={() => navigate('/admin-console')}>
                    Admin Panel
                </button>
                <button style={{ padding: '10px 20px', margin: '10px' }} onClick={() => navigate('/map-list')}>
                    User
                </button>
            </div>
        </div>
    );
};

export default Home;

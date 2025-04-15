import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import HandleTurf from '../components/HandleTurf';

const Dashboard = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext); // Use the logout function from AuthContext

    const handleLogout = () => {
        logout(); // Set authentication state to false
        navigate('/login'); // Redirect to the login page
    };

    const handleAdd = (newTurf) => {
        console.log('New Turf Added:', newTurf);
    };

    const handleUpdate = (updatedTurf) => {
        console.log('Turf Updated:', updatedTurf);
    };

    const handleDelete = (id) => {
        console.log('Turf Deleted:', id);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <button onClick={handleLogout} style={{ marginBottom: '20px' }}>
                Logout
            </button>
            <HandleTurf onAdd={handleAdd} onUpdate={handleUpdate} onDelete={handleDelete} />
        </div>
    );
};

export default Dashboard;
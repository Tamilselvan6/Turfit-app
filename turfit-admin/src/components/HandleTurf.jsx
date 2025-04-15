import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteTurf, fetchTurfs } from '../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import TurfCard from './TurfCard';
import '../styles/HandleTurf.css';

const HandleTurf = () => {
    const [turfs, setTurfs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllTurfs();
    }, []);

    const fetchAllTurfs = async () => {
        setIsLoading(true);
        try {
            const data = await fetchTurfs();
            setTurfs(data);
        } catch (error) {
            console.error('Error fetching turfs:', error);
            toast.error('Failed to fetch turfs.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        confirmAlert({
            title: 'Confirm Deletion',
            message: 'Are you sure you want to delete this turf?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        setIsLoading(true);
                        try {
                            await deleteTurf(id);
                            setTurfs((prev) => prev.filter((turf) => turf._id !== id));
                            toast.success('Turf deleted successfully!');
                        } catch (error) {
                            console.error('Error deleting turf:', error);
                            toast.error('Failed to delete turf.');
                        } finally {
                            setIsLoading(false);
                        }
                    }
                },
                {
                    label: 'No',
                    onClick: () => {}
                }
            ]
        });
    };

    const filteredTurfs = turfs.filter((turf) =>
        turf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        turf.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <ToastContainer />
            <div className="header">
                        <h1>Admin Dashboard</h1>
            </div>

            <button onClick={() => navigate('/turf-form')} className="add-turf-btn">
                Add Turf
            </button>

            <input
                type="text"
                placeholder="Search turfs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
            />

            {isLoading && <div className="loading-spinner"></div>}

            <h2>Turf List</h2>
            <div className="turf-card-container">
                {filteredTurfs.map((turf) => (
                    <TurfCard
                        key={turf._id}
                        turf={turf}
                        onEdit={() => navigate('/turf-form', { state: { turf } })}
                        onDelete={handleDelete}
                    />
                ))}
            </div>
        </div>
    );
};

export default HandleTurf;
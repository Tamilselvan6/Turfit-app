import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import TurfFormPage from './pages/TurfFormPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/turf-form"
                        element={
                            <ProtectedRoute>
                                <TurfFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<LoginPage />} /> {/* Redirect all other routes to login */}
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
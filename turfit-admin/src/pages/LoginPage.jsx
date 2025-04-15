import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Login from '../components/Login';
import '../styles/Login.css';

const LoginPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Use the login function from AuthContext

    const handleLogin = (username, password) => {
        setLoading(true);
        setError('');

        // Simulate an API call with a delay
        setTimeout(() => {
            const validUsername = 'Tamilselvan';
            const validPassword = '1305';

            if (username === validUsername && password === validPassword) {
                console.log('Logged in as:', username);
                login(); // Set authentication state to true
                navigate('/dashboard'); // Redirect to the dashboard
            } else {
                setError('Invalid username or password');
            }

            setLoading(false);
        }, 1000);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h1>Admin Login</h1>
                {error && <p className="error-message">{error}</p>}
                <Login onLogin={handleLogin} isLoading={loading} />
            </div>
        </div>
    );
};

export default LoginPage;
import { useState } from 'react';
import '../styles/Login.css';

const Login = ({ onLogin, isLoading }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(username, password); // Pass credentials to the parent component
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="login-button" disabled={isLoading}>
                {isLoading ? <div className="loading-spinner"></div> : 'Login'}
            </button>
        </form>
    );
};

export default Login;
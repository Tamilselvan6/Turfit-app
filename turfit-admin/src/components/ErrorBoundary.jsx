import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to an error reporting service
        console.error("Error caught by ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h1>Something went wrong.</h1>
                    <p>Please refresh the page or try again later.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
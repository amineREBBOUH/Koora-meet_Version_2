import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthService } from '../services/storage';

// --- Button Component ---
export const Button = ({ children, variant = 'primary', className = '', style = {}, ...props }) => {
    return (
        <button
            className={`btn btn-${variant} ${className}`}
            style={style}
            {...props}
        >
            {children}
        </button>
    );
};

// --- Input Component ---
export const Input = ({ label, id, error, ...props }) => {
    return (
        <div className="input-group">
            {label && <label htmlFor={id} style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</label>}
            <input
                id={id}
                className="input-field"
                {...props}
            />
            {error && <span style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>{error}</span>}
        </div>
    );
};

// --- ProtectedRoute Component ---
export const ProtectedRoute = ({ children }) => {
    const user = AuthService.getCurrentUser();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

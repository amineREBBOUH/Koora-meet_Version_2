import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/storage';
import { Button } from '../components/UI';
import { User, Bell, Volume2, Shield, LogOut, Moon, Sun, Globe, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [sound, setSound] = useState(true);

    const handleLogout = () => {
        AuthService.logout();
        navigate('/login');
    };

    const SettingSection = ({ title, children }) => (
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-[var(--text-muted)] font-bold uppercase text-xs tracking-wider mb-4 px-2">{title}</h3>
            <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
                {children}
            </div>
        </div>
    );

    const SettingItem = ({ icon: Icon, label, value, onClick, type = 'link', isDestructive = false }) => (
        <div
            onClick={onClick}
            className={`flex items-center justify-between p-4 border-b border-[var(--border-subtle)] last:border-0 cursor-pointer hover:bg-[var(--bg-glass)] transition-colors ${isDestructive ? 'text-red-500' : 'text-[var(--text-primary)]'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDestructive ? 'bg-red-500/10' : 'bg-[var(--bg-glass)]'}`}>
                    <Icon size={20} className={isDestructive ? 'text-red-500' : 'text-[var(--text-secondary)]'} />
                </div>
                <span className="font-medium">{label}</span>
            </div>

            {type === 'toggle' && (
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${value ? 'bg-green-500' : 'bg-gray-700'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
            )}

            {type === 'link' && <ChevronRight size={18} className="text-gray-500" />}

            {type === 'value' && <span className="text-gray-500 text-sm">{value}</span>}
        </div>
    );

    return (
        <div className="pb-24 pt-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-black mb-8 px-2">Settings</h1>

            {/* Profile Card */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-red-900/40 to-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-subtle)] mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="w-16 h-16 rounded-full bg-gray-700 border-2 border-white/20 overflow-hidden">
                    <img src={user?.photo || `https://i.pravatar.cc/150?u=${user?.id}`} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">{user?.prenom} {user?.nom}</h2>
                    <p className="text-[var(--text-muted)]">{user?.email}</p>
                </div>
                <Button variant="secondary" onClick={() => navigate('/profile/edit')} className="text-xs px-4 py-2">
                    Edit
                </Button>
            </div>

            <SettingSection title="Preferences">
                <SettingItem
                    icon={Bell}
                    label="Notifications"
                    type="toggle"
                    value={notifications}
                    onClick={() => setNotifications(!notifications)}
                />
                <SettingItem
                    icon={Volume2}
                    label="Sound Effects"
                    type="toggle"
                    value={sound}
                    onClick={() => setSound(!sound)}
                />
                <SettingItem
                    icon={theme === 'dark' ? Moon : Sun}
                    label="Appearance"
                    type="toggle"
                    value={theme === 'dark'}
                    onClick={toggleTheme}
                />
                <SettingItem
                    icon={Globe}
                    label="Language"
                    type="value"
                    value="English (US)"
                />
            </SettingSection>

            <SettingSection title="My Fandom">
                <SettingItem
                    icon={Shield}
                    label="My Team"
                    type="value"
                    value={user?.equipe || 'Not Selected'}
                    onClick={() => navigate('/profile/edit')}
                />
            </SettingSection>

            <SettingSection title="Account">
                <SettingItem
                    icon={LogOut}
                    label="Log Out"
                    isDestructive
                    onClick={handleLogout}
                />
                <SettingItem
                    icon={Shield}
                    label="Reset App Data (Demo)"
                    isDestructive
                    type="button"
                    onClick={() => {
                        if (confirm('Reset all data? This cannot be undone.')) {
                            import('../services/storage').then(m => m.SystemService.resetApp());
                        }
                    }}
                />
            </SettingSection>

            {/* Developer Options */}
            <SettingSection title="Developer Zone">
                <SettingItem
                    icon={Shield}
                    label="Toggle Admin Mode"
                    type="button"
                    onClick={() => {
                        const user = AuthService.getCurrentUser();
                        const newRole = user.role === 'admin' ? 'user' : 'admin';
                        user.role = newRole;
                        localStorage.setItem('koora_current_user', JSON.stringify(user));

                        // Update in users list too
                        const users = JSON.parse(localStorage.getItem('koora_users'));
                        const idx = users.findIndex(u => u.id === user.id);
                        if (idx !== -1) {
                            users[idx].role = newRole;
                            localStorage.setItem('koora_users', JSON.stringify(users));
                        }

                        alert(`Admin Mode: ${newRole === 'admin' ? 'ON ✅' : 'OFF ❌'}\nReloading app...`);
                        window.location.reload();
                    }}
                />
            </SettingSection>

            <p className="text-center text-[var(--text-muted)] text-xs mt-8">
                Koora Meet v1.0.0 (Beta) • World Cup 2030 Edition
            </p>
        </div>
    );
}

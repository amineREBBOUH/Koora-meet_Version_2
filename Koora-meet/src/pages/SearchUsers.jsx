
import React, { useState, useEffect } from 'react';
import { UserService, SecurityService, AuthService } from '../services/storage';
import { Search, MessageSquare, Ban, Flag, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/UI';

export default function SearchUsers() {
    const navigate = useNavigate();
    const currentUser = AuthService.getCurrentUser();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [msg, setMsg] = useState('');

    useEffect(() => {
        const allUsers = UserService.getAllUsers();
        // Filter out current user
        setUsers(allUsers.filter(u => u.id !== currentUser.id));
    }, []);

    const handleBlock = (userId) => {
        if (confirm("Are you sure you want to block this user?")) {
            SecurityService.blockUser(userId);
            setMsg("User blocked");
            setTimeout(() => setMsg(''), 2000);
        }
    };

    const handleReport = (userId) => {
        const reason = prompt("Reason for reporting:");
        if (reason) {
            SecurityService.reportUser(userId, reason);
            setMsg("User reported");
            setTimeout(() => setMsg(''), 2000);
        }
    };

    const filteredUsers = users.filter(u => 
        u.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pb-24 pt-8 px-4">
             <header className="mb-8">
                <h1 className="text-3xl font-black mb-4">Find Fans</h1>
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        className="w-full bg-[var(--bg-input)] border border-white/5 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {msg && <div className="p-4 mb-4 bg-green-500/20 text-green-400 rounded-xl border border-green-500/50">{msg}</div>}

            <div className="grid gap-4">
                {filteredUsers.map(user => (
                    <div key={user.id} className="bg-[var(--bg-card)] p-4 rounded-xl border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                                {user.photo ? (
                                    <img src={user.photo} alt={user.nom} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={24} />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{user.nom || 'Unknown'}</h3>
                                <div className="text-sm text-gray-400">{user.equipe || 'Fan'} • {user.type || 'Solo'}</div>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={() => navigate(`/chat/${user.id}`)}
                                className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40"
                                title="Chat"
                            >
                                <MessageSquare size={20} />
                            </button>
                            <button 
                                onClick={() => handleBlock(user.id)}
                                className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40"
                                title="Block"
                            >
                                <Ban size={20} />
                            </button>
                            <button 
                                onClick={() => handleReport(user.id)}
                                className="p-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/40"
                                title="Report"
                            >
                                <Flag size={20} />
                            </button>
                        </div>
                    </div>
                ))}
                {filteredUsers.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                        No users found.
                    </div>
                )}
            </div>
        </div>
    );
}

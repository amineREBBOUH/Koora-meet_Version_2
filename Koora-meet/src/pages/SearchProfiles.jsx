import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserService } from '../services/storage';
import { Search, MapPin, Shield, Users, Sparkles } from 'lucide-react';

export default function SearchProfiles() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setUsers(UserService.getAllUsers());
    }, []);

    const filteredUsers = users.filter(user =>
        user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.ville.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.equipe && user.equipe.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="pb-32 pt-12">
            <header className="mb-12 max-w-4xl">
                <div className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest mb-2">
                    <Sparkles size={14} /> Recruitment
                </div>
                <h1 className="text-5xl font-black mb-4 tracking-tight">Find Your <span className="text-red-500 italic">Squad</span></h1>
                <p className="text-gray-400 text-lg mb-10 max-w-2xl leading-relaxed">
                    Connect with millions of supporters from your team or city.
                    Search by name, favorite team, or location to grow your network.
                </p>

                {/* Search Bar Container */}
                <div className="relative group max-w-2xl">
                    <div className="absolute inset-0 bg-red-600/10 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center">
                        <Search className="absolute left-6 text-gray-400 group-focus-within:text-red-500 transition-colors" size={24} />
                        <input
                            className="w-full bg-[var(--bg-card)] border border-white/5 rounded-[2rem] py-5 pl-16 pr-8 text-white text-lg focus:outline-none focus:border-red-500 focus:shadow-[0_0_50px_rgba(239,68,68,0.1)] transition-all placeholder:text-gray-600"
                            placeholder="Search by name, city, or team..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredUsers.map(user => (
                    <Link
                        key={user.id}
                        to={`/profile/${user.id}`}
                        className="card group hover:border-red-500/50 transition-all duration-500 cursor-pointer relative overflow-hidden block hover:-translate-y-2 p-0 bg-white/2 hover:bg-white/5"
                    >
                        {/* Background Highlight */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-[60px] group-hover:bg-red-600/20 transition-all -translate-y-1/2 translate-x-1/2"></div>

                        <div className="flex flex-col items-center p-8 text-center relative z-10">
                            <div className="relative mb-6">
                                <div className="w-28 h-28 rounded-3xl bg-gray-800 border-4 border-white/5 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                    {user.photo ? (
                                        <img src={user.photo} alt={user.nom} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-700 to-gray-900">👤</div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-red-600 rounded-xl p-2 shadow-xl border-2 border-[var(--bg-card)] group-hover:rotate-12 transition-transform">
                                    <Users size={12} className="text-white" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-black mb-1 group-hover:text-red-500 transition-colors tracking-tight">{user.prenom} {user.nom}</h2>
                            <div className="text-sm font-bold text-gray-500 mb-6 flex items-center gap-2 justify-center uppercase tracking-widest">
                                <MapPin size={12} className="text-red-500" /> {user.ville}
                            </div>

                            <div className="w-full flex items-center gap-3 bg-white/5 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/5 justify-center group-hover:bg-red-600/10 group-hover:border-red-600/30 transition-all">
                                <Shield size={14} className="text-red-500" />
                                <span className="text-gray-300">{user.equipe || 'Fan Member'}</span>
                            </div>
                        </div>

                        {/* Hover Footer */}
                        <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-center py-3 translate-y-full group-hover:translate-y-0 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-[0_-10px_20px_rgba(239,68,68,0.2)]">
                            View Scouting Report
                        </div>
                    </Link>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-32 bg-white/2 rounded-[3rem] border border-dashed border-white/5">
                    <Users size={64} className="mx-auto text-gray-800 mb-6" />
                    <p className="text-2xl font-black text-gray-600 mb-2">No fans matches found.</p>
                    <p className="text-gray-500 font-bold">Try searching for #DimaMaghreb or another city.</p>
                </div>
            )}
        </div>
    );
}


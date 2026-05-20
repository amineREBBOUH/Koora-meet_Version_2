import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GroupService, AuthService, UserService } from '../services/storage';
import { Button } from '../components/UI';
import { Plus, Users, Search, Filter, MapPin, Flag, ChevronDown } from 'lucide-react';

export default function GroupsList() {
    const [groups, setGroups] = useState([]);
    const [activeTab, setActiveTab] = useState('total');
    const [searchTerm, setSearchTerm] = useState('');
    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        const fetchedGroups = await GroupService.getAllGroups();
        setGroups(fetchedGroups);
    };

    const handleJoin = async (groupId) => {
        try {
            await GroupService.joinGroup(groupId);
            loadGroups();
        } catch (err) {
            alert(err.message);
        }
    };

    // Filter Logic
    const filteredGroups = groups.filter(g => {
        const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.description.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeTab === 'available') return matchesSearch && g.participants.length < g.maxParticipants;
        if (activeTab === 'private') return matchesSearch && g.type === 'PRIVATE'; // Assuming we had this type
        return matchesSearch;
    });

    return (
        <div className="flex flex-col pt-4 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black mb-1">Find your Squad</h1>
                    <p className="text-[var(--text-secondary)]">Connect with fans sharing your passion for World Cup 2030</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-[var(--bg-glass)] hover:bg-[var(--bg-glass)] border border-[var(--border-subtle)] px-4 py-2 rounded-full text-sm font-bold transition-colors">
                        Advanced Filters <Filter size={16} />
                    </button>
                    <Link to="/groups/create">
                        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-red-600/30">
                            Create Meet <Plus size={18} />
                        </button>
                    </Link>
                </div>
            </div>

            {/* Search Bar & Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-full py-4 pl-12 pr-4 text-[var(--text-primary)] focus:outline-none focus:border-red-500 transition-colors"
                        placeholder="Search by name, interest..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide items-center">
                    <div className="relative">
                        <select
                            className="appearance-none bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-full py-4 pl-6 pr-10 text-[var(--text-primary)] font-bold focus:outline-none focus:border-red-500 cursor-pointer"
                            onChange={(e) => setSearchTerm(e.target.value)}
                            value={searchTerm}
                        >
                            <option value="">All Teams</option>
                            <option value="Maroc">Morocco 🇲🇦</option>
                            <option value="France">France 🇫🇷</option>
                            <option value="Spain">Spain 🇪🇸</option>
                            <option value="Portugal">Portugal 🇵🇹</option>
                            <option value="Brazil">Brazil 🇧🇷</option>
                            <option value="Argentina">Argentina 🇦🇷</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                    </div>

                    <button className="flex items-center gap-2 px-6 py-4 rounded-full bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap font-bold">
                        <MapPin size={18} /> Location <ChevronDown size={14} />
                    </button>

                    <Button variant="primary" style={{ borderRadius: '9999px', padding: '1rem 2rem' }}>
                        Search
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-8 border-b border-white/10 mb-8 overflow-x-auto">
                {[
                    { id: 'total', label: `Total (${groups.length})` },
                    { id: 'available', label: `Available Match (${groups.filter(g => g.participants.length < g.maxParticipants).length})` },
                    { id: 'private', label: 'Private' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-4 text-sm font-bold uppercase tracking-wider relative whitespace-nowrap ${activeTab === tab.id ? 'text-red-500' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
                        )}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredGroups.map(group => {
                    const isMember = group.participants.includes(currentUser.id);
                    const isFull = group.participants.length >= group.maxParticipants;

                    return (
                        <div key={group.id} className="card group hover:border-red-500/30 transition-all text-center relative overflow-hidden flex flex-col items-center">
                            {/* Dismiss Button Mockup */}
                            <button className="absolute top-2 right-2 p-1 text-gray-600 hover:text-white">✕</button>

                            <div className="w-20 h-20 rounded-full bg-gray-700 border-4 border-[var(--bg-dark)] shadow-xl mb-4 relative">
                                <img
                                    src={`https://i.pravatar.cc/150?u=${group.creatorId}`}
                                    alt="Leader"
                                    className="w-full h-full rounded-full object-cover"
                                />
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-[var(--bg-dark)]">
                                    <Users size={12} className="text-white" />
                                </div>
                            </div>

                            <h3 className="font-bold text-lg mb-1 text-[var(--text-primary)]">{group.name}</h3>
                            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] mb-4">
                                <MapPin size={10} /> {group.location || 'Casablanca, Morocco'}
                            </div>

                            <div className="flex gap-2 mb-6 w-full justify-center">
                                <span className="text-[10px] font-bold px-3 py-1 bg-green-900/20 text-green-500 rounded border border-green-900/30 uppercase">
                                    {group.participants.length < group.maxParticipants ? 'Active' : 'Full'}
                                </span>
                                <span className="text-[10px] font-bold px-3 py-1 bg-[var(--bg-glass)] text-[var(--text-muted)] rounded border border-[var(--border-subtle)] uppercase">
                                    Match Day
                                </span>
                            </div>

                            <div className="mt-auto w-full">
                                {isMember ? (
                                    <Link to={`/groups/${group.id}/chat`} className="w-full block">
                                        <button className="w-full py-2 rounded-full border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-sm">
                                            Enter Chat
                                        </button>
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => handleJoin(group.id)}
                                        disabled={isFull}
                                        className={`w-full py-2 rounded-full border border-[var(--border-subtle)] hover:border-[var(--border-color)] transition-all font-bold text-sm text-[var(--text-primary)] ${isFull ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--bg-glass)]'}`}
                                    >
                                        {isFull ? 'Full' : 'Connect'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Promo Card (Hardcoded based on design) */}
                <div className="card bg-red-600 border-red-500 flex flex-col items-center text-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <span className="bg-white text-red-600 text-[10px] font-black px-2 py-0.5 rounded mb-2 uppercase tracking-wide z-10">Match Day</span>
                    <h3 className="font-black text-xl mb-2 z-10">Atlas Lions Pre-Match Gathering</h3>
                    <p className="text-sm text-white/80 mb-4 z-10">Join 500+ fans at Oasis SQ. Free Entry!</p>
                    <div className="flex -space-x-2 mb-4 z-10">
                        {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-red-600" />)}
                    </div>
                    <button className="w-full py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-gray-100 transition-colors z-10">Join Meet</button>
                </div>
            </div>
        </div>
    );
}

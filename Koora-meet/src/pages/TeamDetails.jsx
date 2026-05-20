import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Shield, Trophy, MapPin, Calendar, Ticket, X, Check } from 'lucide-react';
import { teamsData } from '../data/teamsData';
import { Button } from '../components/UI';

export default function TeamDetails() {
    const { teamId } = useParams(); // e.g. 'mar', 'fra'
    const navigate = useNavigate();
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);

    const foundTeam = teamsData.find(t => t.id === teamId);

    // Fallback if team not found
    const team = foundTeam ? {
        ...foundTeam,
        // Adapt new data structure to old component expectation on the fly, or update component
        starters: foundTeam.players.slice(0, 11),
        subs: foundTeam.players.slice(11),
        coach: foundTeam.id === 'mar' ? 'Walid Regragui' : foundTeam.id === 'fra' ? 'Didier Deschamps' : 'Head Coach',
        titles: foundTeam.id === 'fra' ? 2 : foundTeam.id === 'arg' ? 3 : 0,
        color: foundTeam.colors // Map 'colors' to 'color' for existing styles if needed, though we used 'colors' in Teams.jsx. 
        // Note: Teams.jsx used 'colors' (gradient string). The existing TeamDetails used 'color'. 
        // We will standardise to use `foundTeam.colors` in the JSX below.
    } : {
        name: 'Team Not Found', code: 'xx', colors: 'from-gray-600 to-gray-900', coach: 'Unknown', ranking: 0, titles: 0,
        starters: [], subs: []
    };

    const handleTicketClick = (match) => {
        setSelectedMatch(match);
        setShowTicketModal(true);
    };

    return (
        <div className="pb-20">
            {/* Header with gradient */}
            <div className={`relative h-64 bg-gradient-to-b ${team.colors} flex items-end p-6`}>
                <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-md">
                    <ArrowLeft size={24} />
                </button>
                <div className="absolute inset-0 bg-black/20"></div>

                <div className="relative z-10 flex items-end gap-6">
                    <div className="w-32 h-32 rounded-full border-4 border-[var(--bg-dark)] bg-white shadow-2xl flex items-center justify-center overflow-hidden">
                        <img
                            src={`https://flagcdn.com/w160/${team.code}.png`}
                            alt={team.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="mb-4">
                        <h1 className="text-4xl font-black text-white drop-shadow-lg">{team.name}</h1>
                        <div className="flex items-center gap-2 text-white/90 font-medium">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-sm">Group F</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-sm"><MapPin size={14} /> Rabat Base Camp</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-4xl mx-auto space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)] text-center">
                        <div className="text-[var(--text-muted)] text-xs uppercase font-bold mb-1">FIFA Rank</div>
                        <div className="text-2xl font-black text-[var(--text-primary)]">#{team.ranking}</div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)] text-center">
                        <div className="text-[var(--text-muted)] text-xs uppercase font-bold mb-1">WC Titles</div>
                        <div className="text-2xl font-black text-[var(--text-primary)]">{team.titles}</div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)] text-center">
                        <div className="text-[var(--text-muted)] text-xs uppercase font-bold mb-1">Coach</div>
                        <div className="text-lg font-bold truncate text-[var(--text-primary)]">{team.coach}</div>
                    </div>
                    <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-subtle)] text-center">
                        <div className="text-[var(--text-muted)] text-xs uppercase font-bold mb-1">Star Player</div>
                        <div className="text-lg font-bold truncate text-[var(--text-primary)]">{team.starters[8]?.name || 'Unknown'}</div>
                    </div>
                </div>

                {/* Squad List */}
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Starting XI */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
                            <User size={20} /> Starting XI
                        </h2>
                        <div className="space-y-3">
                            {team.starters.length > 0 ? team.starters.map((player, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-green-500/30 transition-colors">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-[var(--bg-input)] overflow-hidden border-2 border-green-900/50">
                                            <img
                                                src={player.photo || `https://ui-avatars.com/api/?name=${player.name}&background=ef4444&color=fff&size=128`}
                                                alt={player.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://ui-avatars.com/api/?name=${player.name}&background=ef4444&color=fff&size=128`;
                                                }}
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-green-900 text-[10px] font-bold px-1.5 py-0.5 rounded border border-green-500 text-green-100">
                                            {player.position}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-[var(--text-primary)]">{player.name}</div>
                                        <div className="text-xs text-[var(--text-secondary)]">{player.club || 'National Team'}</div>
                                    </div>
                                    <div className="text-xl font-black text-[var(--text-muted)] opacity-20">#{i + 1}</div>
                                </div>
                            )) : <div className="text-gray-500">No data available</div>}
                        </div>
                    </div>

                    {/* Substitutes */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-500">
                            <User size={20} /> Substitutes (7tiat)
                        </h2>
                        <div className="space-y-3">
                            {team.subs.length > 0 ? team.subs.map((player, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-yellow-500/30 transition-colors opacity-80">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-[var(--bg-input)] overflow-hidden border border-yellow-900/50">
                                            <img
                                                src={player.photo || `https://ui-avatars.com/api/?name=${player.name}&background=facc15&color=000&size=128`}
                                                alt={player.name}
                                                className="w-full h-full object-cover grayscale"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://ui-avatars.com/api/?name=${player.name}&background=facc15&color=000&size=128`;
                                                }}
                                            />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 bg-yellow-900 text-[9px] font-bold px-1.5 py-0.5 rounded border border-yellow-500 text-yellow-100">
                                            {player.position}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-[var(--text-primary)]">{player.name}</div>
                                        <div className="text-xs text-[var(--text-secondary)]">{player.club || 'National Team'}</div>
                                    </div>
                                </div>
                            )) : <div className="text-gray-500">No data available</div>}
                        </div>
                    </div>
                </div>

                {/* Schedule & Tickets */}
                <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <Ticket className="text-red-500" /> Upcoming Matches
                    </h2>
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-glass)] p-4 rounded-xl border border-[var(--border-subtle)] border-l-4 border-l-green-500 gap-4">
                            <div>
                                <div className="text-xs text-[var(--text-muted)] mb-1">15 June 2030 • 20:00</div>
                                <div className="font-bold text-lg text-[var(--text-primary)]">{team.name} vs Croatia</div>
                                <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1"><MapPin size={10} /> Grand Stade de Casablanca</div>
                            </div>
                            <button
                                onClick={() => handleTicketClick({ opponent: 'Croatia', date: '15 June', venue: 'Casablanca' })}
                                className="w-full sm:w-auto px-6 py-2 bg-red-600 rounded-full text-sm font-bold hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Ticket size={16} /> Buy Tickets
                            </button>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-[var(--bg-glass)] p-4 rounded-xl border border-[var(--border-subtle)] border-l-4 border-l-gray-600 gap-4">
                            <div>
                                <div className="text-xs text-[var(--text-muted)] mb-1">20 June 2030 • 16:00</div>
                                <div className="font-bold text-lg text-[var(--text-primary)]">Paraguay vs {team.name}</div>
                                <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1"><MapPin size={10} /> Rabat Stadium</div>
                            </div>
                            <button
                                onClick={() => handleTicketClick({ opponent: 'Paraguay', date: '20 June', venue: 'Rabat' })}
                                className="w-full sm:w-auto px-6 py-2 bg-red-600 rounded-full text-sm font-bold hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Ticket size={16} /> Buy Tickets
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket Modal */}
            {showTicketModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[var(--bg-card)] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-red-900/10">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Ticket size={18} className="text-red-500" /> Select Tickets
                            </h3>
                            <button onClick={() => setShowTicketModal(false)} className="p-1 hover:bg-white/10 rounded-full"><X size={20} /></button>
                        </div>

                        <div className="p-6">
                            <div className="text-center mb-6">
                                <div className="text-sm text-gray-400 mb-1">{selectedMatch?.date} • {selectedMatch?.venue}</div>
                                <div className="text-xl font-black">{team.name} <span className="text-red-500">VS</span> {selectedMatch?.opponent}</div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {['Category 3 (Fan Zone)', 'Category 2 (Standard)', 'Category 1 (Premium)', 'VIP Hospitality'].map((cat, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-white/10 hover:border-red-500/50 hover:bg-red-500/5 cursor-pointer transition-all group">
                                        <div>
                                            <div className="font-bold text-sm">{cat}</div>
                                            <div className="text-xs text-gray-500">Available</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold">${50 + (i * 50)}</div>
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-600 group-hover:border-red-500 ml-auto mt-1"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button
                                className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-600/20"
                                onClick={() => {
                                    alert(`Tickets for ${team.name} vs ${selectedMatch?.opponent} purchased successfully! 🎟️`);
                                    setShowTicketModal(false);
                                }}
                            >
                                Confirm Purchase
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

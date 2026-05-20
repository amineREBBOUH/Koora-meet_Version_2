import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { teamsData } from '../data/teamsData';
import { Link } from 'react-router-dom';

export default function Teams() {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTeams = teamsData.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="pb-24 pt-8">
            <header className="mb-8">
                <h1 className="text-3xl font-black mb-4">Qualified Teams</h1>

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-full py-3 pl-12 pr-4 text-[var(--text-primary)] focus:outline-none focus:border-red-500 transition-colors"
                        placeholder="Search for a nation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTeams.map(team => (
                    <Link
                        key={team.id}
                        to={`/teams/${team.id}`}
                        className="card group hover:border-red-500/50 transition-all cursor-pointer relative overflow-hidden block"
                    >
                        {/* Background Gradient */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${team.colors} opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-40 transition-opacity`}></div>

                        <div className="flex justify-between items-start mb-6 relative">
                            <div className="w-16 h-16 rounded-full bg-gray-800 border-4 border-[var(--bg-card)] shadow-xl flex items-center justify-center text-2xl overflow-hidden">
                                <img
                                    src={`https://flagcdn.com/w160/${team.code.toLowerCase().replace('gb-eng', 'gb-eng').replace('gb-wls', 'gb-wls')}.png`} // Handle special codes if any, flagcdn uses lower case iso codes
                                    alt={team.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://ui-avatars.com/api/?name=${team.code}&background=random`;
                                    }}
                                />
                            </div>
                            <span className="text-xs font-bold bg-[var(--bg-glass)] px-2 py-1 rounded text-[var(--text-muted)]">GRP {team.group}</span>
                        </div>

                        <div className="relative">
                            <h2 className="text-2xl font-black mb-1 group-hover:text-red-500 transition-colors">{team.name}</h2>
                            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                                <span>FIFA Rank: <b className="text-[var(--text-primary)]">#{team.ranking}</b></span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center">
                            <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                <MapPin size={12} /> Base Camp: Rabat
                            </div>
                            <span className="text-red-500 font-bold text-xs uppercase group-hover:underline">View Squad</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthService } from '../services/storage';
import { Button } from '../components/UI';
import { LogOut, Edit, MapPin, Shield, Star, UserCheck, Sparkles, Trophy } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();

    if (!user || typeof user !== 'object') {
        AuthService.logout();
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        AuthService.logout();
        navigate('/');
    };

    const getCountryCode = (teamName) => {
        if (!teamName) return 'ma';
        const map = {
            'Maroc': 'ma',
            'France': 'fr',
            'Espagne': 'es',
            'Portugal': 'pt',
            'Brazil': 'br',
            'Argentina': 'ar'
        };
        return map[teamName] || 'ma';
    };

    const countryCode = getCountryCode(user.equipe);
    const flagUrl = `https://flagcdn.com/w1600/${countryCode}.png`;
    const smallFlagUrl = `https://flagcdn.com/w80/${countryCode}.png`;

    return (
        <div className="flex flex-col lg:flex-row gap-12 pt-12 pb-32">

            {/* Left Banner Area (Desktop) */}
            <div className="lg:w-1/3 space-y-8">
                <div className="sticky top-12">
                    <div className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest mb-2">
                        <Sparkles size={14} /> Supporter Card
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
                        Your Personal <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Locker Room</span>
                    </h1>
                    <p className="text-[var(--text-secondary)] mb-10 max-w-sm text-lg leading-relaxed">
                        Customize your identity, manage your squad, and represent your colors for the World Cup 2030.
                    </p>

                    <div className="flex -space-x-4 mb-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-14 h-14 rounded-2xl border-4 border-[var(--bg-dark)] bg-gray-800 overflow-hidden shadow-2xl">
                                <img src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="Fan" className="w-full h-full object-cover" />
                            </div>
                        ))}
                        <div className="w-14 h-14 rounded-2xl border-4 border-[var(--bg-dark)] bg-red-600 flex items-center justify-center font-black text-xs shadow-2xl">
                            +12K
                        </div>
                    </div>
                    <div className="flex gap-1 text-red-500 mb-8">
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <span className="text-[var(--text-muted)] text-sm font-bold ml-2">5.0 Official Fan Rating</span>
                    </div>
                </div>
            </div>

            {/* Right Profile Card */}
            <div className="flex-1 max-w-3xl">
                <div className="card relative overflow-hidden group border-white/10 shadow-3xl">
                    {/* Header/Banner BG - DYNAMIC FLAG */}
                    <div className="absolute top-0 left-0 right-0 h-48 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-105"
                            style={{ backgroundImage: `url(${flagUrl})` }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-card)]/80 to-[var(--bg-card)]"></div>
                    </div>

                    <div className="relative pt-28 px-8 flex flex-col items-center mb-10 text-center">
                        <div className="relative mb-6">
                            <div className="w-40 h-40 rounded-[2.5rem] border-4 border-[var(--bg-card)] bg-gray-800 overflow-hidden shadow-2xl group/photo">
                                {user.photo ? <img src={user.photo} className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-700 to-gray-900">👤</div>}
                                <Link to="/profile/edit" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity backdrop-blur-sm">
                                    <Edit size={24} className="text-white" />
                                </Link>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl border-4 border-[var(--bg-card)] overflow-hidden shadow-2xl animate-float">
                                <img src={smallFlagUrl} className="w-full h-full object-cover" />
                            </div>
                        </div>

                        <h2 className="text-4xl font-black mb-2 tracking-tight">{user.prenom} {user.nom}</h2>
                        <div className="flex items-center gap-4 text-sm font-bold">
                            <span className="flex items-center gap-2 text-[var(--text-secondary)] bg-[var(--bg-glass)] px-4 py-1.5 rounded-full border border-[var(--border-subtle)]"><MapPin size={14} className="text-red-500" /> {user.ville}</span>
                            <span className="px-4 py-1.5 rounded-full bg-red-600/10 text-red-500 border border-red-500/20 uppercase tracking-widest text-[10px]">PRO FAN</span>
                        </div>
                        <div className="mt-8 flex gap-4">
                            <Link to="/friends" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-600/20">
                                <UserCheck size={16} /> My Squad
                            </Link>
                            <Link to="/profile/edit" className="flex items-center gap-2 bg-[var(--bg-glass)] hover:bg-[var(--bg-glass)] text-[var(--text-primary)] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-[var(--border-subtle)]">
                                <Edit size={16} /> Edit Profile
                            </Link>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-10 px-4">
                        <div className="bg-[var(--bg-glass)] p-4 rounded-2xl border border-[var(--border-subtle)] text-center">
                            <div className="text-2xl font-black text-red-500">12</div>
                            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Matches</div>
                        </div>
                        <div className="bg-[var(--bg-glass)] p-4 rounded-2xl border border-[var(--border-subtle)] text-center">
                            <div className="text-2xl font-black text-red-500">450</div>
                            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Hype</div>
                        </div>
                        <div className="bg-[var(--bg-glass)] p-4 rounded-2xl border border-[var(--border-subtle)] text-center">
                            <div className="text-2xl font-black text-red-500">3</div>
                            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Groups</div>
                        </div>
                    </div>

                    <div className="space-y-8 px-4">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 px-2">Global SUPPORTER Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoItem label="Fan Identity" value={user.prenom + " " + user.nom} />
                                <InfoItem label="Base City" value={user.ville} />
                                <InfoItem label="World Cup Region" value="Morocco" />
                                <InfoItem label="Registration Year" value="2030" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 px-2">National Allegiance</h3>
                            <div className="p-6 rounded-2xl bg-gradient-to-r from-red-600/20 via-black/40 to-black border border-red-600/20 flex items-center justify-between overflow-hidden relative group/team">
                                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover/team:scale-110 transition-transform duration-1000">
                                    <Trophy size={160} className="text-red-500" />
                                </div>

                                <div className="flex items-center gap-6 relative z-10">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                                        <img src={smallFlagUrl} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <div className="font-black text-2xl tracking-tight text-white">{user.equipe}</div>
                                        <div className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1">Main Supporter • Road to 2030</div>
                                    </div>
                                </div>
                                <Link to="/teams" className="bg-[var(--text-primary)] text-[var(--bg-card)] px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all relative z-10">
                                    Change Team
                                </Link>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-white/5">
                            <button onClick={handleLogout} className="w-full py-4 rounded-2xl border border-red-600/20 text-red-600 hover:bg-red-600/10 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                                <LogOut size={16} /> Secure Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const InfoItem = ({ label, value }) => (
    <div className="bg-[var(--bg-glass)] p-5 rounded-3xl border border-[var(--border-subtle)] flex flex-col gap-1 hover:bg-[var(--bg-glass)] transition-colors">
        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{label}</span>
        <span className="font-black text-lg text-[var(--text-primary)]">{value}</span>
    </div>
);


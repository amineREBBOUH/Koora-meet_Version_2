import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GroupService } from '../services/storage';
import { Button, Input } from '../components/UI';
import { Users, User, Car, Calendar, MapPin, ArrowRight } from 'lucide-react';

export default function CreateGroup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        maxParticipants: 3,
        type: 'FRIENDS', // FRIENDS, FAMILY, ULTRA
        date: '',
        location: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return;
        try {
            await GroupService.createGroup(formData);
            navigate('/groups');
        } catch (err) {
            console.error("Error creating group", err);
        }
    };

    const SelectionCard = ({ icon: Icon, label, value }) => (
        <div
            onClick={() => setFormData({ ...formData, type: value })}
            style={{
                flex: 1,
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: formData.type === value ? 'var(--accent-primary)' : 'var(--bg-input)',
                border: `1px solid ${formData.type === value ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
            }}
        >
            <Icon size={24} color={formData.type === value ? 'white' : '#9ca3af'} />
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: formData.type === value ? 'white' : '#9ca3af' }}>{label}</span>
        </div>
    );

    return (
        <div className="split-layout">
            {/* Left Side - Visual */}
            <div className="split-left">
                <h1 style={{ fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '2rem' }}>
                    Build your <br />
                    ultimate <br />
                    <span style={{ color: 'var(--accent-primary)' }}>Match Day Squad</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: '#cbd5e1', maxWidth: '80%' }}>
                    Create a lobby, customize your vibe, and experience the thrill of the World Cup with your kind of people.
                </p>

                <div className="mt-8 flex items-center gap-4">
                    <div className="flex -space-x-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-gray-700 overflow-hidden">
                                <img src={`https://i.pravatar.cc/150?img=${i + 20}`} alt="Fan" />
                            </div>
                        ))}
                    </div>
                    <div className="text-sm">
                        <span className="text-green-500 font-bold block">+ 154 Active Fans</span>
                        <span className="text-gray-400">near the stadium</span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="split-right">
                <div className="w-full max-w-[500px] mx-auto">
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Create a Meet</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Set up your room preferences to find the perfect Team.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                        {/* Auto-match Logic Simulation */}
                        <div className="p-4 rounded-xl border border-dashed border-white/20 bg-white/5 mb-2">
                            <div className="flex items-center gap-3 text-red-500 font-bold text-sm mb-2">
                                <MapPin size={16} /> CASABLANCA • FAN ZONE
                            </div>
                            <div className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center font-bold text-[10px]">MA</div>
                                    <span>Auto-match (My Favorite Team)</span>
                                </div>
                                <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                </div>
                            </div>
                            <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div> Used by matching algorithm for team selection
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Input
                                label="Squad Name"
                                placeholder="e.g., Morocco Ultras, Weekend Warriors"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <div className="input-group">
                                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                                <textarea
                                    className="w-full bg-[var(--bg-input)] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-red-500 transition-colors resize-none h-24"
                                    placeholder="What's the plan? Where are we meeting?"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Number of Participants</label>
                            <div className="flex gap-2">
                                {[2, 3, 5].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, maxParticipants: num })}
                                        className={`flex-1 py-3 rounded-lg font-bold border ${formData.maxParticipants === num
                                            ? 'bg-red-600 border-red-600 text-white'
                                            : 'bg-[var(--bg-input)] border-white/10 text-gray-400 hover:bg-white/5'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Vibe Type</label>
                            <div className="flex gap-3">
                                <SelectionCard icon={User} label="Casual" value="CASUAL" />
                                <SelectionCard icon={Users} label="FRIENDS" value="FRIENDS" />
                                <SelectionCard icon={Car} label="CARPOOL" value="CARPOOL" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="When?"
                                placeholder="Game Kickoff"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                            <Input
                                label=""
                                placeholder="Schedule"
                                type="time"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                placeholder="MM/DD/YYYY"
                                type="date"
                            />
                            <Input
                                placeholder="No end time"
                                disabled
                            />
                        </div>

                        <Button type="submit" variant="primary">
                            Create Meet <ArrowRight size={20} className="ml-2" />
                        </Button>

                        <button
                            type="button"
                            onClick={() => navigate('/groups')}
                            className="w-full py-3 text-gray-500 hover:text-white transition-colors font-medium"
                        >
                            Cancel
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/storage';
import { Button, Input } from '../components/UI';
import { ArrowLeft, Save, User, MapPin, Flag, Globe, Camera } from 'lucide-react';

export default function EditProfile() {
    const navigate = useNavigate();
    const user = AuthService.getCurrentUser();

    const [formData, setFormData] = useState({
        nom: user?.nom || '',
        prenom: user?.prenom || '',
        ville: user?.ville || '',
        equipe: user?.equipe || 'Maroc',
        emplacement: user?.emplacement || 'Au Maroc',
        bio: user?.bio || 'Supporter passionné ⚽',
        photo: user?.photo || ''
    });

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, photo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        AuthService.updateProfile(formData);
        navigate('/profile');
    };

    return (
        <div className="pb-24 pt-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-black">Edit Profile</h1>
                    <p className="text-gray-400">Update your supporter identity</p>
                </div>
            </div>

            <div className="card p-6 md:p-8 animate-in slide-in-from-bottom-5 duration-500">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Identity Section */}
                    <div>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-500">
                            <User size={18} /> Personal Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Last Name"
                                value={formData.nom}
                                onChange={e => setFormData({ ...formData, nom: e.target.value })}
                                placeholder="Enter your last name"
                            />
                            <Input
                                label="First Name"
                                value={formData.prenom}
                                onChange={e => setFormData({ ...formData, prenom: e.target.value })}
                                placeholder="Enter your first name"
                            />
                        </div>

                        {/* Profile Photo Section */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium mb-3 text-gray-300 flex items-center gap-2">
                                <Camera size={16} /> Photo de Profil
                            </label>
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                {/* Current Photo Preview */}
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-24 h-24 rounded-full bg-gray-800 overflow-hidden border-4 border-red-900/50 shadow-lg">
                                        {formData.photo ?
                                            <img src={formData.photo} className="w-full h-full object-cover" alt="Profile" onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y="65" font-size="50" text-anchor="middle" x="50"%3E👤%3C/text%3E%3C/svg%3E';
                                            }} />
                                            : <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                                        }
                                    </div>
                                    <span className="text-xs text-gray-500">Aperçu</span>
                                </div>

                                <div className="flex-1 w-full space-y-4">
                                    {/* File Upload */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-300">Charger depuis votre appareil</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="w-full bg-[var(--bg-input)] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 file:cursor-pointer"
                                        />
                                    </div>

                                    {/* URL Input */}
                                    <Input
                                        label="Ou entrez une URL"
                                        value={formData.photo || ''}
                                        onChange={e => setFormData({ ...formData, photo: e.target.value })}
                                        placeholder="https://example.com/photo.jpg"
                                    />

                                    {/* Preset Avatars */}
                                    <div>
                                        <label className="block text-xs font-medium mb-2 text-gray-400">Ou choisissez un avatar :</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                <button
                                                    key={num}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, photo: `https://i.pravatar.cc/150?img=${num}` })}
                                                    className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 hover:border-red-500 transition-all hover:scale-110"
                                                >
                                                    <img src={`https://i.pravatar.cc/150?img=${num}`} className="w-full h-full object-cover" alt={`Avatar ${num}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2 text-gray-300">Bio</label>
                            <textarea
                                className="w-full bg-[var(--bg-input)] border border-white/5 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 transition-colors h-24 resize-none"
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                placeholder="Tell us about your passion for football..."
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/5 my-6"></div>

                    {/* Location & Team Section */}
                    <div>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-500">
                            <Flag size={18} /> Fan Status
                        </h2>
                        <div className="space-y-4">
                            <Input
                                label="City"
                                value={formData.ville}
                                onChange={e => setFormData({ ...formData, ville: e.target.value })}
                                placeholder="e.g. Casablanca"
                                icon={<MapPin size={16} className="text-gray-500" />}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Supported Team</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-[var(--bg-input)] border border-white/5 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
                                            value={formData.equipe}
                                            onChange={e => setFormData({ ...formData, equipe: e.target.value })}
                                        >
                                            <option value="Maroc">Maroc 🇲🇦</option>
                                            <option value="France">France 🇫🇷</option>
                                            <option value="Espagne">Espagne 🇪🇸</option>
                                            <option value="Portugal">Portugal 🇵🇹</option>
                                            <option value="Brazil">Brazil 🇧🇷</option>
                                            <option value="Argentina">Argentina 🇦🇷</option>
                                            <option value="Senegal">Senegal 🇸🇳</option>
                                        </select>
                                        <Trophy size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Current Location</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-[var(--bg-input)] border border-white/5 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
                                            value={formData.emplacement}
                                            onChange={e => setFormData({ ...formData, emplacement: e.target.value })}
                                        >
                                            <option value="Au Maroc">In Morocco 🇲🇦</option>
                                            <option value="Hors Maroc">Abroad 🌍</option>
                                        </select>
                                        <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" variant="primary" className="w-full py-4 text-lg font-bold shadow-lg shadow-red-600/20">
                            <Save size={20} className="mr-2" /> Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Icon for select
function Trophy({ size, className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
            <path d="M4 22h16"></path>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
        </svg>
    )
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserService, SecurityService, AuthService, FriendService } from '../services/storage';
import { Button } from '../components/UI';
import { ArrowLeft, MapPin, Shield, Flag, AlertTriangle, UserX, MessageCircle, UserPlus, UserCheck, Clock } from 'lucide-react';

export default function UserProfile() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isBlocked, setIsBlocked] = useState(false);
    const [friendStatus, setFriendStatus] = useState('none'); // none, pending, friend

    useEffect(() => {
        const fetchUser = () => {
            const foundUser = UserService.getUserById(userId);
            if (!foundUser) {
                navigate('/search'); // Or 404
                return;
            }
            setUser(foundUser);

            const curr = AuthService.getCurrentUser();
            setCurrentUser(curr);
            if (curr && SecurityService.isBlocked(userId)) {
                setIsBlocked(true);
            }

            // Check friend status
            if (curr && curr.id !== userId) {
                const status = FriendService.getRequestStatus(curr.id, userId);
                setFriendStatus(status);
            }
        };
        fetchUser();
    }, [userId, navigate]);

    if (!user) return null;

    const handleBlock = () => {
        if (confirm(`Are you sure you want to block ${user.nom}?`)) {
            SecurityService.blockUser(user.id);
            setIsBlocked(true);
            alert('User blocked.');
            navigate('/search');
        }
    };

    const handleReport = () => {
        const reason = prompt("Reason for reporting:");
        if (reason) {
            SecurityService.reportUser(user.id, reason);
            alert('User reported. Thank you for keeping the community safe.');
        }
    };

    const handleChat = () => {
        // Future implementation: Navigate to private chat
        navigate(`/chat/${user.id}`);
    };

    const getCountryCode = (teamName) => {
        if (!teamName) return 'ma';
        const map = {

            'Maroc': 'ma', 'France': 'fr', 'Espagne': 'es',
            'Portugal': 'pt', 'Brazil': 'br', 'Argentina': 'ar'
        };
        return map[teamName] || 'ma';
    };

    const handleAddFriend = () => {
        try {
            FriendService.sendRequest(currentUser.id, user.id);
            setFriendStatus('pending');
            alert('Friend request sent!');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleUnfriend = () => {
        if (confirm(`Remove ${user.nom} from your friends?`)) {
            try {
                FriendService.removeFriend(currentUser.id, user.id);
                setFriendStatus('none');
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const countryCode = getCountryCode(user.equipe);
    const flagUrl = `https://flagcdn.com/w1600/${countryCode}.png`;

    return (
        <div className="pb-20 pt-8 max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)} className="mb-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors inline-flex">
                <ArrowLeft size={24} />
            </button>

            <div className="card relative overflow-hidden">
                {/* Header/Banner BG */}
                <div className="absolute top-0 left-0 right-0 h-48 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm"
                        style={{ backgroundImage: `url(${flagUrl})` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-card)]"></div>
                </div>

                <div className="relative pt-32 px-6 flex flex-col md:flex-row items-end gap-6 mb-8">
                    <div className="w-32 h-32 rounded-full border-4 border-[var(--bg-card)] bg-gray-800 overflow-hidden shadow-2xl">
                        {user.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>}
                    </div>

                    <div className="flex-1 mb-2">
                        <h1 className="text-3xl font-black mb-1">{user.nom}</h1>
                        <div className="flex items-center gap-4 text-gray-400">
                            <span className="flex items-center gap-1"><MapPin size={16} /> {user.ville}</span>
                            <span className="flex items-center gap-1"><Shield size={16} /> {user.equipe} Fan</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-2 w-full md:w-auto">
                        {currentUser && currentUser.id !== user.id && (
                            <>
                                {friendStatus === 'none' && (
                                    <Button onClick={handleAddFriend} variant="primary" className="bg-blue-600 hover:bg-blue-700">
                                        <UserPlus size={18} className="mr-2" /> Add Friend
                                    </Button>
                                )}
                                {friendStatus === 'pending' && (
                                    <Button disabled variant="secondary" className="opacity-70">
                                        <Clock size={18} className="mr-2" /> Pending
                                    </Button>
                                )}
                                {friendStatus === 'friend' && (
                                    <Button onClick={handleUnfriend} variant="secondary" className="text-green-500 border-green-500/50 hover:bg-red-900/20 hover:text-red-500 hover:border-red-500/50">
                                        <UserCheck size={18} className="mr-2" /> Friends
                                    </Button>
                                )}
                                <Button onClick={handleChat} variant="secondary" className="flex-1 md:flex-none">
                                    <MessageCircle size={18} className="mr-2" /> Message
                                </Button>
                                <Button onClick={handleReport} variant="secondary" className="bg-yellow-900/20 text-yellow-500 hover:bg-yellow-900/40 border-yellow-900/50">
                                    <AlertTriangle size={18} />
                                </Button>
                                <Button onClick={handleBlock} variant="secondary" className="bg-red-900/20 text-red-500 hover:bg-red-900/40 border-red-900/50">
                                    <UserX size={18} />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Bio & Details */}
                <div className="p-6 pt-0 grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-400 mb-2 uppercase text-xs">Bio</h3>
                            <p className="text-lg leading-relaxed text-gray-200">
                                {user.bio || "This user hasn't written a bio yet."}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="text-xs text-gray-500 mb-1">Status</div>
                                <div className="font-bold text-green-400">Online</div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <div className="text-xs text-gray-500 mb-1">Member Since</div>
                                <div className="font-bold">{new Date(user.createdAt).getFullYear()}</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-400 mb-2 uppercase text-xs">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-white/5 px-3 py-1 rounded-full text-sm">⚽ Football</span>
                                <span className="bg-white/5 px-3 py-1 rounded-full text-sm">🏟️ Stadiums</span>
                                <span className="bg-white/5 px-3 py-1 rounded-full text-sm">🌍 Travel</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

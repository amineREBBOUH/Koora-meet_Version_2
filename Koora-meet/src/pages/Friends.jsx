
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Corrected import
import { FriendService, AuthService } from '../services/storage';
import { Button } from '../components/UI';
import { UserCheck, UserPlus, X, MessageCircle, Trash2, Shield, Search } from 'lucide-react';

export default function Friends() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'invitations'
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (!user) {
            navigate('/login');
            return;
        }
        setCurrentUser(user);
        refreshData(user.id);
    }, [navigate]);

    const refreshData = (userId) => {
        setLoading(true);
        try {
            const myFriends = FriendService.getFriends(userId);
            const myRequests = FriendService.getRequests(userId);
            setFriends(myFriends);
            setRequests(myRequests);
        } catch (error) {
            console.error("Failed to load friend data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = (requestId) => {
        try {
            FriendService.acceptRequest(requestId);
            refreshData(currentUser.id);
            // Optional: show toast
        } catch (e) {
            alert(e.message);
        }
    };

    const handleRefuse = (requestId) => {
        if (confirm("Refuse this friend request?")) {
            FriendService.refuseRequest(requestId);
            refreshData(currentUser.id);
        }
    };

    const handleRemove = (friendId) => {
        if (confirm("Are you sure you want to remove this friend?")) {
            FriendService.removeFriend(currentUser.id, friendId);
            refreshData(currentUser.id);
        }
    };

    const handleChat = (friendId) => {
        navigate(`/chat/${friendId}`);
    };

    if (!currentUser) return null;

    return (
        <div className="pb-24 pt-8 max-w-4xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black mb-2">Social Hub</h1>
                    <p className="text-gray-400">Manage your squad and connections.</p>
                </div>

                <div className="flex bg-gray-800/50 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all ${activeTab === 'friends' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        My Squad ({friends.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('invitations')}
                        className={`px-6 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'invitations' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Invitations
                        {requests.length > 0 && (
                            <span className="bg-white text-red-600 text-xs px-1.5 py-0.5 rounded-full font-black">{requests.length}</span>
                        )}
                    </button>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading your locker room...</div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* FRIENDS TAB */}
                    {activeTab === 'friends' && (
                        <>
                            {friends.length === 0 ? (
                                <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl bg-white/5">
                                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <UserPlus size={32} className="text-gray-500" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Build Your Squad</h3>
                                    <p className="text-gray-400 mb-6">You haven't added any friends yet.</p>
                                    <Button onClick={() => navigate('/search')} variant="primary">Find Fans</Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {friends.map(friend => (
                                        <div key={friend.id} className="card p-4 flex items-center gap-4 group">
                                            <div onClick={() => navigate(`/profile/${friend.id}`)} className="cursor-pointer relative">
                                                <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden border-2 border-transparent group-hover:border-red-500 transition-colors">
                                                    {friend.photo ? (
                                                        <img src={friend.photo} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-[var(--bg-card)]"></div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 onClick={() => navigate(`/profile/${friend.id}`)} className="font-bold text-lg truncate cursor-pointer hover:underline">{friend.nom}</h3>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1"><Shield size={10} /> {friend.equipe} Fan</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleChat(friend.id)}
                                                    className="p-2 bg-white/5 hover:bg-blue-600/20 hover:text-blue-500 rounded-lg transition-colors"
                                                    title="Message"
                                                >
                                                    <MessageCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(friend.id)}
                                                    className="p-2 bg-white/5 hover:bg-red-600/20 hover:text-red-500 rounded-lg transition-colors"
                                                    title="Remove Friend"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* INVITATIONS TAB */}
                    {activeTab === 'invitations' && (
                        <>
                            {requests.length === 0 ? (
                                <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl bg-white/5">
                                    <h3 className="text-xl font-bold mb-2">No Pending Invitations</h3>
                                    <p className="text-gray-400">You're all caught up!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map(req => (
                                        <div key={req.id} className="card p-4 flex items-center gap-4 animate-in slide-in-from-left-4">
                                            <div className="w-14 h-14 rounded-full bg-gray-700 overflow-hidden">
                                                {req.senderPhoto ? (
                                                    <img src={req.senderPhoto} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg">{req.senderName}</h3>
                                                <p className="text-sm text-gray-400">wants to join your squad.</p>
                                                <p className="text-xs text-gray-500 mt-1">{new Date(req.date || Date.now()).toLocaleDateString()}</p>
                                            </div>

                                            <div className="flex gap-3">
                                                <Button onClick={() => handleRefuse(req.id)} variant="secondary" className="px-4">
                                                    Refuse
                                                </Button>
                                                <Button onClick={() => handleAccept(req.id)} variant="primary" className="bg-green-600 hover:bg-green-700 px-6">
                                                    Accept
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

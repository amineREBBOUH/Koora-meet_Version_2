import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatService, AuthService, UserService } from '../services/storage';
import { ArrowLeft, Send, Mic, Phone, Video, MoreVertical } from 'lucide-react';

export default function PrivateChat() {
    const { userId } = useParams(); // ID of the user we are chatting WITH
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [recipient, setRecipient] = useState(null);
    const bottomRef = useRef(null);
    const currentUser = AuthService.getCurrentUser();
    const [showMenu, setShowMenu] = useState(false);

    const handleAction = (action) => {
        if (action === 'block') {
            if (confirm('Block this user?')) {
                import('../services/storage').then(m => m.SecurityService.blockUser(recipient.id));
                alert('User blocked');
            }
        } else if (action === 'report') {
            const reason = prompt('Reason for reporting:');
            if (reason) {
                import('../services/storage').then(m => m.SecurityService.reportUser(recipient.id, reason));
                alert('Report sent');
            }
        }
        setShowMenu(false);
    };

    useEffect(() => {
        // Load Recipient Info
        const user = UserService.getUserById(userId);
        if (user) {
            setRecipient(user);
        } else {
            // If mock user doesn't exist in 'users' array, create a temporary one for display
            // This handles the "Luisita" or "Sarah" mock cases from the group chat
            setRecipient({
                id: userId,
                prenom: 'Fan',
                nom: 'Unknown',
                photo: `https://i.pravatar.cc/150?u=${userId}`
            });
        }

        loadMessages();
        const interval = setInterval(loadMessages, 2000);
        return () => clearInterval(interval);
    }, [userId]);

    const getRoomId = () => {
        // Create a consistent Room ID regardless of who logged in (sort IDs)
        return [currentUser.id, userId].sort().join('_');
    };

    const loadMessages = () => {
        const roomId = getRoomId();
        const msgs = ChatService.getMessages(roomId);
        setMessages(msgs);
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const roomId = getRoomId();
        ChatService.sendMessage(roomId, newMessage);
        setNewMessage('');
        loadMessages();
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    if (!recipient) return <div className="p-8 text-center text-gray-500">Loading chat...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] bg-[var(--bg-dark)] overflow-hidden lg:rounded-2xl border border-white/5 max-w-4xl mx-auto">

            {/* Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[var(--bg-card)]">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden relative">
                        <img src={recipient.photo || `https://i.pravatar.cc/150?u=${recipient.id}`} alt={recipient.prenom} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--bg-card)]"></div>
                    </div>
                    <div>
                        <h2 className="font-bold leading-none">{recipient.prenom} {recipient.nom}</h2>
                        <span className="text-xs text-green-500">Online</span>
                    </div>
                </div>
                <div className="flex gap-2 text-gray-400">
                    <button className="p-2 hover:bg-white/10 rounded-full"><Phone size={20} /></button>
                    <button className="p-2 hover:bg-white/10 rounded-full"><Video size={20} /></button>
                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-white/10 rounded-full"><MoreVertical size={20} /></button>
                        {showMenu && (
                            <div className="absolute right-0 top-12 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl w-48 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => handleAction('report')}
                                    className="w-full text-left px-4 py-3 hover:bg-white/5 text-sm flex items-center gap-2"
                                >
                                    <span className="text-yellow-500">⚠</span> Report User
                                </button>
                                <button
                                    onClick={() => handleAction('block')}
                                    className="w-full text-left px-4 py-3 hover:bg-white/5 text-sm flex items-center gap-2 text-red-500"
                                >
                                    <span className="">🚫</span> Block User
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        <p className="text-sm">Say Hi to {recipient.prenom}! 👋</p>
                        <p className="text-xs opacity-50">Messages are end-to-end encrypted (simulated).</p>
                    </div>
                )}

                {messages.map(msg => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-3`}>
                            <div
                                className={`max-w-[75%] p-3 rounded-2xl text-sm ${isMe
                                    ? 'bg-red-600 text-white rounded-br-none'
                                    : 'bg-[var(--bg-card)] text-gray-200 border border-white/5 rounded-bl-none'
                                    }`}
                            >
                                {msg.text}
                                <span className="text-[10px] block text-right mt-1 opacity-70">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[var(--bg-card)] border-t border-white/5">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <button type="button" className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-400">
                        <Mic size={20} />
                    </button>
                    <input
                        className="flex-1 bg-black/30 border border-white/10 rounded-full py-3 pl-6 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-3 rounded-full bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatService, AuthService, GroupService } from '../services/storage';
import { Phone, Video, MoreVertical, Send, ArrowLeft, Mic } from 'lucide-react';

export default function ChatRoom() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [group, setGroup] = useState(null);
    const bottomRef = useRef(null);
    const currentUser = AuthService.getCurrentUser();

    useEffect(() => {
        const loadedGroup = GroupService.getAllGroups().find(g => g.id === groupId);
        if (loadedGroup) setGroup(loadedGroup);

        loadMessages();
        const interval = setInterval(loadMessages, 2000);
        return () => clearInterval(interval);
    }, [groupId]);

    const loadMessages = () => {
        const msgs = ChatService.getMessages(groupId);
        setMessages(msgs);
    };

    // --- SIMULATED CHAT LOGIC ---
    useEffect(() => {
        // Randomly receive a message from a "bot" user to simulate activity
        const timer = setInterval(() => {
            const shouldMessage = Math.random() > 0.6; // 40% chance every 8s
            if (!shouldMessage || !group) return;

            const mockUsers = [
                { id: 'bot-1', name: 'Luisita 🇪🇸', img: 34 },
                { id: 'bot-2', name: 'Sarah 🇬🇧', img: 45 },
                { id: 'bot-3', name: 'Daniel 🎾', img: 12 }
            ];

            const randomPhrases = [
                "Anyone seeing this referee? 😠",
                "What a save! 🧤",
                "Vamos Morocco!!! 🇲🇦",
                "Can't believe we are winning this!",
                "Who is going to the Fan Zone later?",
                "This match is insane 🔥",
                "Pass the ball! ⚽"
            ];

            const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
            const randomText = randomPhrases[Math.floor(Math.random() * randomPhrases.length)];

            // Inject message directly into storage
            ChatService.sendMessage(groupId, randomText, randomUser);
            loadMessages(); // Refresh UI

        }, 8000 + Math.random() * 5000); // Every 8-13 seconds

        return () => clearInterval(timer);
    }, [groupId, group]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        ChatService.sendMessage(groupId, newMessage);
        setNewMessage('');
        loadMessages();
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

        // Simulate immediate response sometimes
        setTimeout(() => {
            const mockUsers = [{ id: 'bot-2', name: 'Sarah 🇬🇧', img: 45 }];
            ChatService.sendMessage(groupId, "Totally agree! 👀", mockUsers[0]);
            loadMessages();
        }, 3000);
    };

    if (!group) return <div>Loading...</div>;

    return (
        <div className="flex h-[calc(100vh-2rem)] bg-[var(--bg-dark)] overflow-hidden lg:rounded-2xl border border-white/5">

            {/* Left Sidebar - Member List & Room Info */}
            <div className="w-80 bg-[var(--bg-card)] border-r border-white/5 flex flex-col hidden lg:flex">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <button onClick={() => navigate('/groups')} className="p-1 hover:bg-white/10 rounded">
                            <ArrowLeft size={20} className="text-gray-400" />
                        </button>
                        <h1 className="font-black text-xl text-white">Koora Meet</h1>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🇪🇸</span>
                        <div>
                            <h2 className="font-bold text-lg leading-none">{group.name}</h2>
                            <span className="text-xs text-red-500 font-bold uppercase tracking-wider">VIC 2030 Hype Room</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-b border-white/5">
                    <div className="bg-black/30 rounded-xl p-3 flex justify-between items-center text-center">
                        <div>
                            <div className="font-mono text-xl font-bold">00</div>
                            <div className="text-[10px] text-gray-500 uppercase">HR</div>
                        </div>
                        <div className="text-gray-600">:</div>
                        <div>
                            <div className="font-mono text-xl font-bold">45</div>
                            <div className="text-[10px] text-gray-500 uppercase">MIN</div>
                        </div>
                        <div className="text-gray-600">:</div>
                        <div>
                            <div className="font-mono text-xl font-bold text-red-500">17</div>
                            <div className="text-[10px] text-red-500 uppercase">SEC</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm text-gray-300">Working XI (4)</h3>
                        <span className="text-xs text-green-500">Online</span>
                    </div>

                    <div className="space-y-4">
                        {/* Mock Members */}
                        {[
                            { name: 'Luisita', status: 'Typing...', img: 34, isOnline: true },
                            { name: 'Sarah', status: 'Corner flag plz 🇪🇸', img: 45, isOnline: true },
                            { name: 'Daniel', status: 'Vamos! 🎾', img: 12, isOnline: true },
                            { name: 'Maria', status: 'Away 2m', img: 5, isOnline: false },
                        ].map((member, i) => (
                            <div key={i} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group/member ${member.isOnline ? '' : 'opacity-50'}`}>
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/150?img=${member.img}`} alt={member.name} />
                                    </div>
                                    {member.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--bg-card)]"></div>}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-sm">{member.name}</div>
                                    <div className={`text-xs ${member.name === 'Luisita' ? 'text-red-500 font-bold' : 'text-gray-500'}`}>{member.status}</div>
                                </div>

                                {/* Kick Button (Only for Creator) - Simulated check as these match members aren't real storage users yet */}
                                {group.creatorId === currentUser.id && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm(`Remove ${member.name} from the group?`)) {
                                                alert("Member removed (Simulated for this mock list)");
                                            }
                                        }}
                                        className="opacity-0 group-hover/member:opacity-100 p-1 hover:bg-red-500/20 text-red-500 rounded transition-all"
                                        title="Kick User"
                                    >
                                        <span className="text-xs font-bold">✕</span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-red-900/10 border-t border-red-900/20">
                    <div className="text-xs font-bold text-red-500 uppercase mb-1">Up Next</div>
                    <div className="font-bold mb-4">QUARTER FINALS: MARCO VS ...</div>

                    <button
                        onClick={() => {
                            if (confirm('Leave this squad?')) {
                                try {
                                    import('../services/storage').then(m => {
                                        m.GroupService.leaveGroup(groupId);
                                        navigate('/groups');
                                    });
                                } catch (e) {
                                    alert(e.message);
                                }
                            }
                        }}
                        className="w-full py-2 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors text-sm font-bold flex items-center justify-center gap-2"
                    >
                        Leave Squad
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                {/* Mobile Header (only visible on small screens) */}
                <div className="lg:hidden p-4 border-b border-white/5 flex justify-between items-center bg-[var(--bg-card)]">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/groups')}><ArrowLeft /></button>
                        <span className="font-bold">{group.name}</span>
                    </div>
                    <span className="text-xs bg-red-500 px-2 py-1 rounded text-white">LIVE</span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Date Separator */}
                    <div className="flex justify-center">
                        <span className="bg-black/40 text-gray-500 text-xs px-3 py-1 rounded-full">Today, 20:30</span>
                    </div>

                    {messages.map(msg => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-4 group`}>
                                {!isMe && (
                                    <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden self-end">
                                        <img src={`https://i.pravatar.cc/150?u=${msg.senderId}`} alt="" />
                                    </div>
                                )}

                                <div className="max-w-[70%]">
                                    {!isMe && <span className="block text-xs text-gray-500 mb-1 ml-1">{msg.senderName}</span>}
                                    <div
                                        className={`p-4 rounded-2xl text-sm shadow-md relative ${isMe
                                            ? 'bg-red-600 text-white rounded-br-sm'
                                            : 'bg-[#252525] text-gray-200 rounded-bl-sm border border-white/5'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className="block text-[10px] text-gray-600 mt-1 ml-1 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 lg:p-6 bg-[var(--bg-card)] border-t border-white/5">
                    <form onSubmit={handleSend} className="flex items-center gap-4">
                        <button type="button" className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-400">
                            <Mic size={20} />
                        </button>
                        <div className="flex-1 relative">
                            <input
                                className="w-full bg-black/30 border border-white/10 rounded-full py-4 pl-6 pr-12 text-white focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="Talk about the game..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                            <button className="absolute right-2 top-2 p-2 rounded-full hover:bg-white/10 text-gray-400">
                                <span role="img" aria-label="emoji">😊</span>
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

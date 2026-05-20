import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { PostService, AuthService, NotificationService, TravelAutomationService } from '../services/storage';
import { Button } from '../components/UI';
import { Search, Bell, Filter, Heart, MessageSquare, Share2, MoreHorizontal, Calendar, Users, Flame, ChevronRight, Hash, MapPin, TrendingUp, Sparkles, Cpu, X, Star, Car, Navigation } from 'lucide-react';

const matchesMap = {
    1: { teams: "Morocco vs Portugal", date: "Tomorrow, 22:50", venue: "Grand Stade de Casablanca" },
    2: { teams: "Spain vs Italy", date: "Sat 17 Jun, 20:00", venue: "Santiago Bernabéu, Madrid" }
};

export default function Dashboard() {
    const [user, setUser] = useState(AuthService.getCurrentUser());
    const [posts, setPosts] = useState([]);
    const [isPosting, setIsPosting] = useState(false);
    const [newPostText, setNewPostText] = useState('');
    const [notifications, setNotifications] = useState([]);
    
    // Travel Automation States
    const [automations, setAutomations] = useState([]);
    const [trackingAuto, setTrackingAuto] = useState(null);
    const [trackingStep, setTrackingStep] = useState(0);
    const [messageInput, setMessageInput] = useState('');
    const [chatLogs, setChatLogs] = useState([]);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (user) {
                const fetchedPosts = await PostService.getApprovedPosts();
                setPosts(fetchedPosts);
                setNotifications(NotificationService.getNotifications(user.id));
                setAutomations(TravelAutomationService.getAutomations(user.id));
            }
        };
        loadData();
    }, [user]);

    // Tracking Step Interval
    useEffect(() => {
        if (!trackingAuto) return;
        setTrackingStep(0);
        const interval = setInterval(() => {
            setTrackingStep(s => {
                if (s >= 7) {
                    clearInterval(interval);
                    return 7;
                }
                return s + 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [trackingAuto]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostText.trim()) return;
        await PostService.createPost(newPostText);
        setNewPostText('');
        setIsPosting(false);
        alert('Votre post a été soumis et est en attente de modération par l\'équipe.');
        const updatedPosts = await PostService.getApprovedPosts();
        setPosts(updatedPosts);
    };

    const handleLike = async (postId) => {
        await PostService.likePost(postId);
        const updatedPosts = await PostService.getApprovedPosts();
        setPosts(updatedPosts);
    };

    const handleComment = async (postId) => {
        const comment = prompt("Add a comment:");
        if (comment && comment.trim()) {
            PostService.addComment(postId, comment);
            const updatedPosts = await PostService.getApprovedPosts();
            setPosts(updatedPosts);
        }
    };

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const MatchCard = () => (
        <div className="relative rounded-[2rem] overflow-hidden border border-[var(--border-subtle)] shadow-2xl mb-8 group animate-in fade-in zoom-in-95 duration-700">
            <div className="absolute inset-0 z-0">
                <img
                    src="/match_hero.jpg"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    alt="Stadium"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>

            <div className="relative z-10 p-8 pt-24">
                <div className="flex gap-2 mb-6">
                    <span className="bg-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20">
                        Match of the Day
                    </span>
                    <span className="bg-[var(--bg-glass)] backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-[var(--border-subtle)]">
                        Group A • Open
                    </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">Atlas Lions: Road to 2030</h2>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8 font-medium">
                    <div className="flex items-center gap-2 bg-[var(--bg-glass)] px-3 py-1.5 rounded-xl backdrop-blur-md border border-[var(--border-subtle)]">
                        <Calendar size={16} className="text-red-500" /> Tomorrow, 22:50
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--bg-glass)] px-3 py-1.5 rounded-xl backdrop-blur-md border border-[var(--border-subtle)]">
                        <MapPin size={16} className="text-red-500" /> Casablanca Stadium
                    </div>
                </div>

                <div className="flex gap-4">
                    <Link to="/tickets">
                        <Button variant="primary" className="!w-auto px-8 h-12 !text-sm flex items-center gap-2 group">
                            Book Tickets
                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link to="/stats">
                        <button className="px-8 h-12 rounded-full bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--border-subtle)] hover:bg-[var(--bg-glass)] transition-all font-bold text-sm">
                            Match Stats
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );

    const QuickAction = ({ icon: Icon, title, desc, color, to }) => (
        <Link to={to} className="group">
            <div className="card h-full flex flex-col justify-between hover:border-red-500/50 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 ${color}`}></div>
                <div>
                    <div className={`p-4 rounded-2xl w-fit mb-6 ${color} bg-opacity-10 text-white shadow-inner`}>
                        <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-black mb-2 group-hover:text-red-500 transition-colors">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
                <div className="mt-6 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-red-500 transition-colors">
                    Get Started <ChevronRight size={14} />
                </div>
            </div>
        </Link>
    );

    const TravelStatusCard = () => {
        if (automations.length === 0) return null;
        
        const auto = automations[0];
        const match = matchesMap[auto.matchId] || { teams: "World Cup Match", venue: "Stadium" };
        
        return (
            <div className="card border border-red-500/30 bg-red-950/10 p-6 md:p-8 rounded-[2rem] shadow-[0_4px_30px_rgba(239,68,68,0.15)] relative overflow-hidden mb-8 group animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="absolute right-0 top-0 w-48 h-48 bg-red-500/5 rounded-full blur-[60px]"></div>
                <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none"></div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10 relative">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-3xl shadow-lg">
                            {auto.transportType === 'taxi' ? '🚕' : '🚗'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="bg-red-600/15 text-red-500 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-1">
                                    <Sparkles size={10} className="animate-spin" /> AI Active Travel Coord
                                </span>
                                <span className="text-[10px] bg-green-500/15 text-green-400 font-bold px-2 py-0.5 rounded-full uppercase">Confirmed</span>
                            </div>
                            <h3 className="text-2xl font-black text-white mt-1.5">{match.teams}</h3>
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1.5">
                                <MapPin size={12} className="text-red-500" />
                                {auto.pickupLocation} ➜ {match.venue}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <Button 
                            variant="primary" 
                            className="!w-auto px-6 h-11 !text-xs flex items-center gap-2"
                            onClick={() => {
                                setTrackingAuto(auto);
                                setTrackingStep(0);
                            }}
                        >
                            <Navigation size={12} className="animate-pulse" /> Track Driver
                        </Button>
                        <Button 
                            variant="secondary" 
                            className="!w-auto px-6 h-11 !text-xs flex items-center gap-2 bg-white/5 border border-white/5"
                            onClick={() => {
                                setChatLogs([
                                    { sender: 'driver', text: `Hello! I am ${auto.driver.name}, your assigned AI travel agent. I will pick you up at ${auto.pickupLocation} exactly 2.5 hours prior to the match. Feel free to message me!`, time: '14:30' }
                                ]);
                                setShowChat(true);
                            }}
                        >
                            <MessageSquare size={12} /> Contact Driver
                        </Button>
                    </div>
                </div>

                <div className="mt-6 pt-5 border-t border-red-500/10 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/5 overflow-hidden">
                            <img src={auto.driver.avatar} alt="Driver" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <span className="font-bold text-white block">{auto.driver.name}</span>
                            <span className="text-[10px] text-gray-500">Vehicle: {auto.driver.car} • Rating: ⭐ {auto.driver.rating}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                        <div>
                            <span className="text-gray-500 block">Assigned Plate Number</span>
                            <span className="font-mono font-bold text-red-400">{auto.driver.plate}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-32 pt-12">
            {/* Main Content */}
            <div className="flex-1 space-y-12">
                <header className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest mb-1">
                            <Sparkles size={14} /> Dima Maghreb 🇲🇦
                        </div>
                        <h1 className="text-4xl font-black tracking-tight">Welcome, {user?.prenom}!</h1>
                        <p className="text-[var(--text-secondary)]">Ready for the 2030 World Cup experience?</p>
                    </div>
                    <Link to="/settings" className="p-3 bg-[var(--bg-glass)] rounded-full hover:bg-[var(--bg-glass)] border border-[var(--border-subtle)] transition-all active:scale-95 relative group">
                        <Bell size={24} />
                        {(notifications || []).filter(n => n && !n.read).length > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-red-600 rounded-full border-2 border-[var(--bg-card)]"></span>
                        )}
                        <div className="absolute -bottom-10 right-0 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Notifications
                        </div>
                    </Link>
                </header>

                <TravelStatusCard />

                <MatchCard />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <QuickAction
                        icon={Flame}
                        title="Watch Party"
                        desc="Gather your squad and host an epic viewing party in your city."
                        color="bg-orange-500"
                        to="/groups/create"
                    />
                    <QuickAction
                        icon={Users}
                        title="Meetups"
                        desc="Join local fans in Casablanca for pre-match celebrations."
                        color="bg-red-600"
                        to="/groups"
                    />
                </div>

                {/* Featured Experiences */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black">Featured Experiences</h3>
                        <Link to="/tickets" className="text-sm font-black text-red-500 hover:underline">View All</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card relative h-[300px] group overflow-hidden border-[var(--border-subtle)] p-0">
                            <img
                                src="https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?q=80&w=1000&auto=format&fit=crop"
                                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center mb-3">
                                    <Users size={20} className="text-white" />
                                </div>
                                <h4 className="text-xl font-black text-white">Watch Party in Agadir</h4>
                                <p className="text-sm text-gray-300">Join 15 others at the Marina</p>
                            </div>
                        </div>
                        <div className="card relative h-[300px] group overflow-hidden border-[var(--border-subtle)] p-0">
                            <img
                                src="https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1000&auto=format&fit=crop"
                                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mb-3">
                                    <TrendingUp size={20} className="text-white" />
                                </div>
                                <h4 className="text-xl font-black text-white">Stadium Tour</h4>
                                <p className="text-sm text-gray-300">Explore the new Grand Stade de Casablanca</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Community Feed */}
                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                        <div>
                            <h3 className="text-2xl font-black">Community Flux</h3>
                            <p className="text-sm text-[var(--text-muted)]">Live updates from fans around the world.</p>
                        </div>
                        <button
                            onClick={() => setIsPosting(!isPosting)}
                            className="bg-white/5 hover:bg-red-600 hover:text-white border border-white/10 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition-all"
                        >
                            {isPosting ? 'Cancel' : '+ Message'}
                        </button>
                    </div>

                    {isPosting && (
                        <div className="card animate-in fade-in slide-in-from-top-4 duration-300">
                            <textarea
                                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-2xl p-6 text-[var(--text-primary)] focus:outline-none focus:border-red-500 transition-all resize-none text-lg"
                                rows="3"
                                placeholder="What's happening at the fan zone?..."
                                value={newPostText}
                                onChange={(e) => setNewPostText(e.target.value)}
                            />
                            <div className="flex justify-end pt-4">
                                <Button
                                    variant="primary"
                                    className="!w-auto px-10 h-14"
                                    onClick={handleCreatePost}
                                >
                                    Publish Post
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {posts.length === 0 ? (
                            <div className="text-center py-20 bg-white/2 border border-dashed border-white/10 rounded-3xl">
                                <MessageSquare className="mx-auto mb-4 text-gray-700" size={48} />
                                <p className="text-gray-500 font-bold italic">No posts yet. Be the first to shout!</p>
                            </div>
                        ) : (
                            posts.map(post => (
                                <div key={post.id} className="card group hover:bg-white/10 transition-all duration-300 border-white/5 p-8 relative overflow-hidden">
                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        <div className="w-14 h-14 bg-gray-700 rounded-full overflow-hidden border-2 border-red-900 group-hover:border-red-500 transition-colors">
                                            <img src={post.userPhoto || `https://i.pravatar.cc/150?u=${post.userId}`} alt="User" />
                                        </div>
                                        <div>
                                            <div className="font-black text-xl">{post.userName || 'Fan Member'}</div>
                                            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <MapPin size={10} /> {post.createdAt ? new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'} • Fan Zone
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mb-6 text-[var(--text-primary)] text-lg leading-relaxed relative z-10">
                                        {post.text}
                                    </p>
                                    {post.image && (
                                        <div className="mb-6 rounded-2xl overflow-hidden border border-[var(--border-subtle)]">
                                            <img src={post.image} alt="Post content" className="w-full object-cover max-h-96" />
                                        </div>
                                    )}
                                    <div className="flex gap-8 text-sm font-black uppercase tracking-widest text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-6 relative z-10">
                                        <button
                                            onClick={() => handleLike(post.id)}
                                            className="flex items-center gap-2 hover:text-red-500 transition-colors"
                                        >
                                            <Flame size={20} className={post.likes > 0 ? "text-red-500" : ""} />
                                            {post.likes || 0} Hype
                                        </button>
                                        <button
                                            onClick={() => handleComment(post.id)}
                                            className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                                        >
                                            <MessageSquare size={20} /> {post.comments || 0} Comments
                                        </button>
                                    </div>
                                    {/* Abstract background shape for posts */}
                                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-red-600/5 rounded-full blur-[60px] group-hover:bg-red-600/10 transition-colors"></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar (Desktop only) */}
            <div className="hidden lg:flex flex-col w-[340px] gap-8 sticky top-12 h-fit">

                {/* Stats Spotlight */}
                <div className="card p-8 bg-gradient-to-br from-red-900/40 to-[var(--bg-card)] border-white/10 group">
                    <div className="flex items-center gap-2 text-xs font-black text-red-500 uppercase tracking-widest mb-4">
                        <TrendingUp size={14} /> Live Stats
                    </div>
                    <h3 className="text-2xl font-black mb-6">Top Scorer</h3>
                    <div className="flex items-center gap-4 group-hover:translate-x-1 transition-transform">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-glass)] overflow-hidden border border-[var(--border-subtle)]">
                            <img src="https://i.pravatar.cc/150?u=mbappe" alt="Player" />
                        </div>
                        <div>
                            <p className="font-black text-lg">K. Mbappé 🇫🇷</p>
                            <p className="text-red-500 font-black text-2xl">4 <span className="text-[10px] text-gray-500 uppercase tracking-widest pl-1">Goals</span></p>
                        </div>
                    </div>
                    <Link to="/stats">
                        <button className="w-full mt-8 py-3 rounded-full bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                            See All Stats
                        </button>
                    </Link>
                </div>

                {/* Upcoming Matches */}
                <div className="card p-0 overflow-hidden">
                    <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-glass)]">
                        <h3 className="font-black text-sm uppercase tracking-widest">Upcoming Matches</h3>
                        <Link to="/teams" className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline">See All</Link>
                    </div>
                    <div className="p-6 space-y-6">
                        <MatchItem home="🇫🇷 France" away="🇧🇷 Brazil" time="20:00" />
                        <MatchItem home="🇪🇸 Spain" away="🇮🇹 Italy" time="22:00" />
                        <MatchItem home="🇲🇦 Morocco" away="🇩🇪 Germany" time="Sat 20:00" />
                    </div>
                </div>

                {/* Your Squad */}
                <div className="card p-0 overflow-hidden border-white/5">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                        <h3 className="font-black text-sm uppercase tracking-widest">Your Squad</h3>
                        <Link to="/friends" className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline hover:scale-105 transition-transform">+ Invite</Link>
                    </div>
                    <div className="p-6 space-y-4">
                        <UserItem name="Amine M." img="https://i.pravatar.cc/150?img=3" status="Online" color="bg-green-500" userId="amine_m" />
                        <UserItem name="Sarah K." img="https://i.pravatar.cc/150?img=5" status="Away" color="bg-yellow-500" userId="sarah_k" />
                        <UserItem name="Yassin L." img="https://i.pravatar.cc/150?img=4" status="Online" color="bg-green-500" userId="yassin_l" />
                    </div>
                </div>

                {/* Trending Tags */}
                <div className="px-2">
                    <h3 className="font-black text-xs text-gray-500 uppercase tracking-widest mb-4">Trending #Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {['DimaMaghreb', 'WorldCup2030', 'Casablanca', 'Ultras', 'RoadTo2030'].map(tag => (
                            <span key={tag} className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/50 hover:bg-red-600/10 hover:text-red-500 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer">#{tag}</span>
                        ))}
                    </div>
                </div>

            </div>

            {/* --- Live Tracking HUD Modal in Dashboard --- */}
            {trackingAuto && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-red-500/20 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-[0_0_80px_rgba(239,68,68,0.2)]">
                        <button 
                            onClick={() => setTrackingAuto(null)}
                            className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                        >
                            <X size={16} />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-4 animate-glow">
                                <Navigation size={28} className="animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black text-white">Live AI Travel Tracking</h3>
                            <p className="text-xs text-gray-400 mt-1">
                                Tracking driver <span className="text-white font-bold">{trackingAuto.driver.name}</span> in real-time
                            </p>
                        </div>

                        {/* Interactive SVG Routing HUD */}
                        <div className="relative h-48 bg-black/60 rounded-3xl border border-red-500/10 p-6 flex flex-col justify-between overflow-hidden shadow-inner mb-6">
                            <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
                            
                            <div className="flex justify-between items-center z-10">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-lg shadow-lg">📍</div>
                                    <span className="text-[10px] text-gray-500 font-bold mt-1 uppercase">Pickup</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-red-600 border border-red-500 flex items-center justify-center text-lg shadow-lg shadow-red-600/30 animate-pulse">🏟️</div>
                                    <span className="text-[10px] text-red-500 font-bold mt-1 uppercase">Stadium</span>
                                </div>
                            </div>

                            <svg className="absolute inset-0 w-full h-full p-6 z-0" style={{ pointerEvents: 'none' }}>
                                <path
                                    d="M 60,45 C 130,5 210,85 270,45"
                                    fill="none"
                                    stroke="rgba(239, 68, 68, 0.15)"
                                    strokeWidth="3"
                                    strokeDasharray="6 6"
                                />
                                <path
                                    d="M 60,45 C 130,5 210,85 270,45"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="3"
                                    strokeDasharray="300"
                                    strokeDashoffset={300 - (300 * (trackingStep / 7))}
                                    style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                                />
                            </svg>

                            <div 
                                className="absolute w-8 h-8 rounded-full bg-red-600 border border-white/10 flex items-center justify-center text-sm shadow-lg text-white"
                                style={{
                                    left: `${15 + (70 * (trackingStep / 7))}%`,
                                    top: `${35 + 10 * Math.sin(trackingStep)}%`,
                                    transition: 'all 0.8s ease-out',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                🚘
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest z-10 bg-black/40 py-1.5 px-3 rounded-xl border border-white/5">
                                <span>Signal Link: Active</span>
                                <span className="text-red-500 font-mono">Distance to Venue: {7 - trackingStep} km</span>
                            </div>
                        </div>

                        {/* Driver credentials */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-700 overflow-hidden border border-red-500/20">
                                        <img src={trackingAuto.driver.avatar} alt="Driver" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white text-lg flex items-center gap-1.5 leading-none">
                                            {trackingAuto.driver.name}
                                            <span className="flex items-center text-xs text-yellow-500 font-bold"><Star size={10} className="fill-current" /> {trackingAuto.driver.rating}</span>
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1">Car: {trackingAuto.driver.car} • License: {trackingAuto.driver.plate}</p>
                                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">Secure OTP Pick Token: KK-2030</p>
                                    </div>
                                </div>
                                <a 
                                    href={`tel:${trackingAuto.driver.phone}`}
                                    className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl shadow-lg transition-all w-full sm:w-auto text-center"
                                >
                                    Call Driver
                                </a>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <button 
                                onClick={() => setTrackingAuto(null)}
                                className="text-xs text-gray-500 hover:text-white uppercase tracking-widest font-black"
                            >
                                Minimize Tracking HUD
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Contact Driver Chat Simulation Modal --- */}
            {showChat && automations.length > 0 && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-[var(--bg-card)] border border-red-500/20 rounded-[2.5rem] p-6 md:p-8 flex flex-col h-[550px] shadow-[0_0_80px_rgba(239,68,68,0.25)]">
                        
                        {/* Header */}
                        <div className="flex justify-between items-center pb-4 border-b border-red-500/10 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden border border-red-500/20">
                                    <img src={automations[0].driver.avatar} alt="Driver" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-black text-sm text-white">{automations[0].driver.name}</h4>
                                    <span className="text-[9px] text-green-400 font-black uppercase tracking-wider flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Driver Online
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowChat(false)}
                                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Message log */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                            {chatLogs.map((chat, idx) => (
                                <div key={idx} className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-medium leading-relaxed shadow-md ${chat.sender === 'user' ? 'bg-red-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'}`}>
                                        {chat.text}
                                    </div>
                                    <span className="text-[9px] text-gray-500 mt-1 pl-1 pr-1">{chat.time}</span>
                                </div>
                            ))}
                        </div>

                        {/* Send form */}
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (!messageInput.trim()) return;
                                
                                const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                const newMsg = { sender: 'user', text: messageInput, time: timeStr };
                                setChatLogs(l => [...l, newMsg]);
                                setMessageInput('');

                                // Simulate driver response
                                setTimeout(() => {
                                    setChatLogs(l => [...l, { 
                                        sender: 'driver', 
                                        text: `Understood! Routing coordinates synced. Safe travels!`, 
                                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                    }]);
                                }, 1500);
                            }}
                            className="flex gap-2"
                        >
                            <input
                                type="text"
                                className="input-field m-0 !py-3 !text-xs border-white/5 bg-black/40 flex-1"
                                placeholder="Send secure message to driver..."
                                value={messageInput}
                                onChange={e => setMessageInput(e.target.value)}
                            />
                            <Button type="submit" variant="primary" className="!w-auto px-6 h-11 !text-xs font-black uppercase">
                                Send
                            </Button>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
}

const MatchItem = ({ home, away, time }) => (
    <div className="flex items-center justify-between group cursor-pointer hover:bg-white/2 p-2 -m-2 rounded-xl transition-colors">
        <div className="flex items-center gap-3">
            <div className="flex flex-col">
                <span className="font-black text-xs group-hover:text-red-500 transition-colors">{home} vs {away}</span>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Stadium: Casablanca</span>
            </div>
        </div>
        <span className="text-[10px] font-black bg-red-600/10 text-red-500 px-3 py-1 rounded-lg border border-red-500/20">{time}</span>
    </div>
);

const UserItem = ({ name, img, status, color, userId }) => (
    <Link to={`/chat/${userId}`} className="flex items-center justify-between group cursor-pointer">
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gray-700 overflow-hidden group-hover:ring-2 ring-red-500 transition-all">
                    <img src={img} alt={name} className="w-full h-full object-cover" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 ${color} rounded-full border-2 border-[var(--bg-card)]`}></div>
            </div>
            <div>
                <div className="font-black text-sm group-hover:text-red-500 transition-colors">{name}</div>
                <div className="text-[10px] font-bold text-gray-400">{status}</div>
            </div>
        </div>
        <ChevronRight size={14} className="text-gray-700 group-hover:text-red-500 transition-colors" />
    </Link>
);


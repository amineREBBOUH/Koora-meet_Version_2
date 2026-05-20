import React, { useState, useEffect, useRef } from 'react';
import { Ticket, Calendar, MapPin, Check, Info, Cpu, Navigation, Terminal, Sparkles, CheckCircle, Car } from 'lucide-react';
import { Button } from '../components/UI';
import { AuthService, TicketService, TravelAutomationService } from '../services/storage';

export default function Tickets() {
    const [selectedCat, setSelectedCat] = useState(null);
    const [autoTravel, setAutoTravel] = useState(true);
    const [activeAutomation, setActiveAutomation] = useState(null); // { match, category }
    const [transportType, setTransportType] = useState('taxi'); // 'taxi' or 'carpool'
    const [automationStep, setAutomationStep] = useState(0);
    const [logs, setLogs] = useState([]);
    const logEndRef = useRef(null);

    const matches = [
        {
            id: 1,
            teams: "Morocco vs Portugal",
            date: "Tomorrow, 22:50",
            venue: "Grand Stade de Casablanca",
            img: "https://images.unsplash.com/photo-1550853024-124d20153956?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            status: "Selling Fast"
        },
        {
            id: 2,
            teams: "Spain vs Italy",
            date: "Sat 17 Jun, 20:00",
            venue: "Santiago Bernabéu, Madrid",
            img: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            status: "Available"
        }
    ];

    const categories = [
        { id: 1, name: "Category 1", price: "2000 DH", desc: "Best view, central stands.", color: "bg-red-500" },
        { id: 2, name: "Category 2", price: "1200 DH", desc: "Corner views, great atmosphere.", color: "bg-orange-500" },
        { id: 3, name: "Category 3", price: "500 DH", desc: "Behind goals, intense fans.", color: "bg-green-600" },
    ];

    // Scroll to the bottom of technical logs
    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    // Handle automation step progress simulation
    useEffect(() => {
        if (!activeAutomation) return;

        const simulatedLogs = [
            `[0.2s] 🤖 [SYSTEM] Travel Orchestrator Agent online. Protocol initiated.`,
            `[0.8s] 🎫 [MATCH_SCAN] Match parsed: ${activeAutomation.match.teams} at ${activeAutomation.match.venue}.`,
            `[1.5s] 📍 [GEO_LOCATOR] User current coordinates queried. Origin: Casablanca Center.`,
            `[2.1s] 🛣️ [ROUTING] Querying live road conditions... Heavy traffic near Stade A3. Re-routing via Route N1.`,
            `[2.9s] 🔍 [PROVIDER_SCAN] Scanning local ${transportType === 'taxi' ? 'VIP Taxi Cooperatives' : 'Fan Carpools'} database...`,
            `[3.5s] 🚘 [NEGOTIATOR] Bidding ride token for route ${activeAutomation.match.venue}. Driver found!`,
            `[4.2s] 💳 [SECURE_PAY] Creating escrow smart handshake transaction for Ticket + Travel.`,
            `[4.8s] ✅ [SUCCESS] Seat reserved. Dispatching digital tickets and tracking tokens. Status: 100% Ok.`
        ];

        setLogs([simulatedLogs[0]]);
        setAutomationStep(0);

        const timer1 = setTimeout(() => { setLogs(l => [...l, simulatedLogs[1]]); setAutomationStep(1); }, 1000);
        const timer2 = setTimeout(() => { setLogs(l => [...l, simulatedLogs[2]]); setAutomationStep(2); }, 2000);
        const timer3 = setTimeout(() => { setLogs(l => [...l, simulatedLogs[3]]); setAutomationStep(3); }, 3000);
        const timer4 = setTimeout(() => { setLogs(l => [...l, simulatedLogs[4]]); setAutomationStep(4); }, 4000);
        const timer5 = setTimeout(() => { setLogs(l => [...l, simulatedLogs[5]]); setAutomationStep(5); }, 5000);
        const timer6 = setTimeout(() => { setLogs(l => [...l, simulatedLogs[6]]); setAutomationStep(6); }, 6000);
        const timer7 = setTimeout(() => { setLogs(l => [...l, simulatedLogs[7]]); setAutomationStep(7); }, 7000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
            clearTimeout(timer5);
            clearTimeout(timer6);
            clearTimeout(timer7);
        };
    }, [activeAutomation, transportType]);

    const handleBuy = (matchId) => {
        if (!selectedCat || selectedCat.matchId !== matchId) return alert("Please select a category for this match first.");

        const match = matches.find(m => m.id === matchId);
        const category = categories.find(c => c.id === selectedCat.catId);
        const user = AuthService.getCurrentUser();

        if (autoTravel) {
            // Initiate the futuristic Automation HUD
            setActiveAutomation({ match, category });
        } else {
            if (confirm(`Confirm purchase of ${category.name} ticket for ${category.price}?`)) {
                TicketService.buyTicket(matchId, category.id, category.price);
                alert(`Success! Ticket confirmed. \n\nCheck your email: ${user.email} for the QR Code.`);
            }
        }
    };

    const handleCompleteAutomation = () => {
        if (!activeAutomation) return;
        const { match, category } = activeAutomation;
        
        // Buy ticket in local storage
        TicketService.buyTicket(match.id, category.id, category.price);
        
        // Auto-book taxi/carpool in local storage
        TravelAutomationService.createAutomation(match.id, category.id, transportType, "Casablanca Center");

        // Reset
        setActiveAutomation(null);
        setSelectedCat(null);
        alert("Travel Coordination Complete! 🚗 Check your Dashboard or Koora Ride tab to track your driver in real-time.");
    };

    return (
        <div className="pb-24 pt-8">
            <header className="mb-8">
                <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                    <Ticket className="text-red-500" size={32} />
                    Official Ticketing
                </h1>
                <p className="text-gray-400">Secure your seats for the 2030 World Cup.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {matches.map(match => (
                    <div key={match.id} className="card p-0 overflow-hidden hover:border-red-500/50 transition-colors group">
                        <div className="h-48 relative">
                            <img src={match.img} alt={match.teams} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg mb-2 inline-block">
                                    {match.status}
                                </span>
                                <h3 className="text-2xl font-black">{match.teams}</h3>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-4 mb-6 text-gray-300 text-sm">
                                <div className="flex items-center gap-2"><Calendar size={16} /> {match.date}</div>
                                <div className="flex items-center gap-2"><MapPin size={16} /> {match.venue}</div>
                            </div>

                            <div className="space-y-3 mb-6">
                                {categories.map(cat => (
                                    <div
                                        key={cat.id}
                                        onClick={() => setSelectedCat({ matchId: match.id, catId: cat.id })}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${selectedCat?.matchId === match.id && selectedCat?.catId === cat.id
                                            ? 'border-red-500 bg-red-500/10'
                                            : 'border-white/10 hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
                                            <div>
                                                <div className="font-bold">{cat.name}</div>
                                                <div className="text-xs text-gray-400">{cat.desc}</div>
                                            </div>
                                        </div>
                                        <span className="font-mono font-bold text-lg">{cat.price}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Smart Auto-Travel Selector */}
                            <div className="mb-6 p-4 rounded-2xl bg-red-950/20 border border-red-500/20 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                            <Cpu className={autoTravel ? "animate-spin text-red-500" : ""} size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm flex items-center gap-1.5 text-white">
                                                🤖 AI Travel Coordinator
                                                <span className="bg-red-500/20 text-red-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Automated</span>
                                            </div>
                                            <p className="text-xs text-gray-400">Books taxi/carpool matching this match</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={autoTravel}
                                            onChange={() => setAutoTravel(!autoTravel)}
                                        />
                                        <div className="w-14 h-7 bg-gray-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                                    </label>
                                </div>
                                
                                {autoTravel && (
                                    <div className="w-full flex gap-2 pt-3 border-t border-red-500/10">
                                        <button
                                            onClick={() => setTransportType('taxi')}
                                            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${transportType === 'taxi' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                        >
                                            🚕 Private Taxi
                                        </button>
                                        <button
                                            onClick={() => setTransportType('carpool')}
                                            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${transportType === 'carpool' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                        >
                                            🚗 Fan Carpool
                                        </button>
                                    </div>
                                )}
                            </div>

                            <Button
                                variant="primary"
                                className="w-full py-4 text-lg"
                                onClick={() => handleBuy(match.id)}
                            >
                                {selectedCat?.matchId === match.id 
                                    ? (autoTravel ? '🤖 Match via AI Automation' : 'Proceed to Checkout') 
                                    : 'Select a Category'
                                }
                            </Button>

                            <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                                <Info size={12} /> Powered by FIFA Secure Payment
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- AI Agent Matching Overlay HUD --- */}
            {activeAutomation && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-4xl bg-red-950/20 border border-red-500/30 rounded-[2.5rem] shadow-[0_0_80px_rgba(239,68,68,0.25)] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row gap-8">
                        
                        {/* Ambient glowing blobs */}
                        <div className="absolute -left-20 -top-20 w-80 h-80 bg-red-600/10 rounded-full blur-[80px] pointer-events-none"></div>
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-red-600/10 rounded-full blur-[80px] pointer-events-none"></div>

                        {/* Left side - Progress indicators & Interactive Animated Map */}
                        <div className="flex-1 flex flex-col justify-between z-10">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-black text-red-500 uppercase tracking-widest mb-2">
                                    <Cpu className="animate-spin text-red-500" size={16} /> Autonomous Travel System
                                </div>
                                <h2 className="text-3xl font-black text-white mb-2">AI Agent Coordinator</h2>
                                <p className="text-sm text-gray-400 mb-6">Negotiating local transit for <span className="text-white font-bold">{activeAutomation.match.teams}</span></p>
                            </div>

                            {/* --- Futuristic Interactive SVG Map --- */}
                            <div className="relative h-44 bg-black/60 rounded-3xl border border-red-500/10 p-6 flex flex-col justify-between overflow-hidden shadow-inner">
                                <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
                                
                                {/* Source and Destination Icons */}
                                <div className="flex justify-between items-center z-10">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-lg shadow-lg">📍</div>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Pickup</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-red-600 border border-red-500 flex items-center justify-center text-lg shadow-lg shadow-red-600/30 animate-pulse">🏟️</div>
                                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1">Stadium</span>
                                    </div>
                                </div>

                                {/* Animated SVG Path with sliding car */}
                                <svg className="absolute inset-0 w-full h-full p-6 z-0" style={{ pointerEvents: 'none' }}>
                                    <path
                                        id="routePath"
                                        d="M 60,45 C 150,5 230,85 290,45"
                                        fill="none"
                                        stroke="rgba(239, 68, 68, 0.2)"
                                        strokeWidth="3"
                                        strokeDasharray="6 6"
                                    />
                                    <path
                                        d="M 60,45 C 150,5 230,85 290,45"
                                        fill="none"
                                        stroke="#ef4444"
                                        strokeWidth="3"
                                        strokeDasharray="300"
                                        strokeDashoffset={300 - (300 * (automationStep / 7))}
                                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                    />
                                </svg>
                                
                                {/* Animated car element */}
                                <div 
                                    className="absolute w-8 h-8 rounded-full bg-red-600 border border-white/10 flex items-center justify-center text-sm shadow-lg text-white"
                                    style={{
                                        left: `${15 + (70 * (automationStep / 7))}%`,
                                        top: `${35 + 10 * Math.sin(automationStep)}%`,
                                        transition: 'all 1s ease-out',
                                        transform: 'translate(-50%, -50%)'
                                    }}
                                >
                                    🚘
                                </div>

                                <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest z-10 bg-black/40 py-1.5 px-3 rounded-xl border border-white/5">
                                    <span>Status: {automationStep === 7 ? 'Route Confirmed' : 'Calculating Routing...'}</span>
                                    <span className="text-red-500 font-mono">{Math.round((automationStep / 7) * 100)}%</span>
                                </div>
                            </div>

                            {/* Driver Credentials Display (Unveiled at the end) */}
                            <div className={`mt-6 p-4 rounded-2xl bg-white/5 border border-white/5 transition-all duration-700 ${automationStep >= 5 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-2xl">
                                        {transportType === 'taxi' ? '🚕' : '🚗'}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Matched Transport Provider</span>
                                        <h4 className="font-bold text-white leading-none mt-1">
                                            {transportType === 'taxi' ? 'Youssef Tazi (VIP Taxi)' : 'Hamza Berrada (Fan Carpool)'}
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1">Vehicle: {transportType === 'taxi' ? 'Dacia Logan Black' : 'Renault Clio Red'} • Rating: ⭐ 4.9</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Technical Logs & Confirm Button */}
                        <div className="flex-1 flex flex-col justify-between border-l border-red-500/10 pl-0 md:pl-8 z-10">
                            {/* Scrolling System Terminal */}
                            <div className="flex flex-col h-72">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                                        <Terminal size={12} className="text-red-500" /> Technical Agent Logs
                                    </span>
                                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                                </div>
                                <div className="flex-1 bg-black/85 rounded-2xl border border-red-500/10 p-5 font-mono text-[11px] leading-relaxed text-red-400 overflow-y-auto shadow-inner space-y-2">
                                    {logs.map((log, idx) => (
                                        <div key={idx} className="animate-in fade-in slide-in-from-left-2 duration-300">
                                            {log}
                                        </div>
                                    ))}
                                    <div ref={logEndRef} />
                                </div>
                            </div>

                            {/* Final Action Button */}
                            <div className="mt-8">
                                <Button
                                    variant={automationStep === 7 ? "primary" : "secondary"}
                                    className={`w-full py-4 text-sm font-black uppercase tracking-widest transition-all ${automationStep === 7 ? 'shadow-[0_4px_25px_rgba(239,68,68,0.4)] animate-pulse' : 'opacity-50 cursor-not-allowed'}`}
                                    disabled={automationStep < 7}
                                    onClick={handleCompleteAutomation}
                                >
                                    {automationStep === 7 ? '🤖 Finalize & Generate QR Vouchers' : '🤖 AI Orchestration in Progress...'}
                                </Button>
                                <button
                                    className="w-full text-center text-xs text-gray-500 mt-4 hover:underline hover:text-white transition-colors"
                                    onClick={() => setActiveAutomation(null)}
                                >
                                    Abort Travel Automation
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}

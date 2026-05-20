import React, { useState, useEffect } from 'react';
import { CarpoolService, AuthService, TicketService, TravelAutomationService } from '../services/storage';
import { Button } from '../components/UI';
import { Car, MapPin, Calendar, Clock, UserPlus, Cpu, Sparkles, Navigation, X, Trash2, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const matchesMap = {
    1: { teams: "Morocco vs Portugal", date: "Tomorrow, 22:50", venue: "Grand Stade de Casablanca" },
    2: { teams: "Spain vs Italy", date: "Sat 17 Jun, 20:00", venue: "Santiago Bernabéu, Madrid" }
};

export default function Carpool() {
    const [user] = useState(AuthService.getCurrentUser());
    const [rides, setRides] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newRide, setNewRide] = useState({ from: '', to: '', date: '', price: '' });
    
    // Automation States
    const [myTickets, setMyTickets] = useState([]);
    const [automations, setAutomations] = useState([]);
    const [selectedTicketForAuto, setSelectedTicketForAuto] = useState('');
    const [autoTransportType, setAutoTransportType] = useState('taxi');
    const [trackingAutomation, setTrackingAutomation] = useState(null);
    const [trackingStep, setTrackingStep] = useState(0);

    const loadAutomationsAndTickets = () => {
        if (user) {
            setMyTickets(TicketService.getTickets(user.id));
            setAutomations(TravelAutomationService.getAutomations(user.id));
        }
    };

    useEffect(() => {
        setRides(CarpoolService.getRides());
        loadAutomationsAndTickets();
    }, [user]);

    const handleBook = (id) => {
        if (CarpoolService.bookSeat(id)) {
            alert("Seat Booked Successfully! 🚗");
            setRides(CarpoolService.getRides());
        } else {
            alert("No seats left!");
        }
    };

    const handlePublish = (e) => {
        e.preventDefault();
        CarpoolService.addRide({ ...newRide, driver: "Me", time: "10:00" });
        setRides(CarpoolService.getRides());
        setShowForm(false);
        alert("Ride Published!");
    };

    const handleAutoBookFromTickets = (e) => {
        e.preventDefault();
        if (!selectedTicketForAuto) return alert("Please select a ticket first.");

        const ticket = myTickets.find(t => t.id === selectedTicketForAuto);
        if (!ticket) return;

        // Auto book
        TravelAutomationService.createAutomation(ticket.matchId, ticket.categoryId, autoTransportType, "Casablanca Center");
        loadAutomationsAndTickets();
        setSelectedTicketForAuto('');
        alert("Success! 🤖 AI Travel Coordinator has booked your ride. Scroll down to track it!");
    };

    const handleCancelAutomation = (id) => {
        if (confirm("Cancel this automated travel reservation?")) {
            TravelAutomationService.cancelAutomation(id);
            loadAutomationsAndTickets();
            alert("Reservation canceled.");
        }
    };

    // Tracking Step Interval
    useEffect(() => {
        if (!trackingAutomation) return;
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
    }, [trackingAutomation]);

    return (
        <div className="pb-24 pt-8">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <Car className="text-red-500" size={32} />
                        Koora Ride
                    </h1>
                    <p className="text-gray-400">Share the journey, split the cost. Fan to Fan.</p>
                </div>
                <Button variant="primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : 'Offer a Ride'}
                </Button>
            </header>

            {/* --- AI Travel Automation Hub --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Automate Ride Trigger Panel */}
                <div className="card lg:col-span-1 border border-red-500/20 bg-red-950/10 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-black text-red-500 uppercase tracking-widest mb-4">
                            <Cpu className="animate-pulse" size={16} /> AI Travel Coordination
                        </div>
                        <h3 className="text-xl font-black mb-3">AI Transport Assistant</h3>
                        <p className="text-xs text-gray-400 leading-relaxed mb-6">
                            Have a tournament ticket? Skip the stress. Select your ticket, and let our automated system find you an optimal rideshare or assign a priority VIP taxi automatically.
                        </p>
                    </div>

                    {myTickets.length === 0 ? (
                        <div className="text-center p-6 bg-black/40 border border-dashed border-white/5 rounded-2xl">
                            <p className="text-xs text-gray-400 italic mb-4">No tickets purchased yet</p>
                            <Link to="/tickets">
                                <Button variant="secondary" className="!text-xs py-2">Get Match Tickets</Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleAutoBookFromTickets} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Select Match Ticket</label>
                                <select 
                                    className="input-field m-0 !py-3 !text-sm border border-red-500/10 bg-black/40"
                                    value={selectedTicketForAuto}
                                    onChange={e => setSelectedTicketForAuto(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose Ticket --</option>
                                    {myTickets.map(ticket => {
                                        const match = matchesMap[ticket.matchId];
                                        return (
                                            <option key={ticket.id} value={ticket.id}>
                                                {match ? match.teams : `Match #${ticket.matchId}`}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Automation Route Preference</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setAutoTransportType('taxi')}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${autoTransportType === 'taxi' ? 'bg-red-600 text-white shadow-lg' : 'bg-black/30 text-gray-400 hover:bg-black/50 border border-white/5'}`}
                                    >
                                        🚕 VIP Taxi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAutoTransportType('carpool')}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${autoTransportType === 'carpool' ? 'bg-red-600 text-white shadow-lg' : 'bg-black/30 text-gray-400 hover:bg-black/50 border border-white/5'}`}
                                    >
                                        🚗 Fan Carpool
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" variant="primary" className="w-full h-11 !text-xs mt-2 flex items-center justify-center gap-2">
                                <Sparkles size={14} /> Let AI Coordinate Transit
                            </Button>
                        </form>
                    )}
                </div>

                {/* Active Automated Bookings List */}
                <div className="card lg:col-span-2 border border-white/5 bg-white/2 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black flex items-center gap-2">
                            <span>Active Automations</span>
                            <span className="bg-red-600/10 text-red-500 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-red-500/20">
                                {automations.length} Active
                            </span>
                        </h3>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] pr-2">
                        {automations.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center py-12 text-center text-gray-500 border border-dashed border-white/5 rounded-2xl bg-black/20">
                                <Cpu size={32} className="text-gray-700 mb-2" />
                                <p className="text-sm font-bold italic">No active AI travel booking</p>
                                <p className="text-[10px] text-gray-600 max-w-[240px] mt-1">Activate AI Travel Coordinator during checkout or match one above.</p>
                            </div>
                        ) : (
                            automations.map(auto => {
                                const match = matchesMap[auto.matchId];
                                return (
                                    <div key={auto.id} className="p-5 rounded-2xl bg-black/60 border border-white/5 hover:border-red-500/30 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-2xl">
                                                {auto.transportType === 'taxi' ? '🚕' : '🚗'}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-white">{match ? match.teams : 'Match Trip'}</span>
                                                    <span className="text-[9px] bg-green-500/10 text-green-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        Confirmed
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1.5">
                                                    <Navigation size={10} className="text-red-500" />
                                                    <span>{auto.pickupLocation} ➜ {match ? match.venue : 'Stadium'}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-3">
                                                    <span>Driver: <strong className="text-gray-300">{auto.driver.name}</strong></span>
                                                    <span>Vehicle: <strong className="text-gray-300">{auto.driver.car}</strong></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                            <Button 
                                                variant="secondary" 
                                                className="!text-[10px] px-4 py-2 flex items-center gap-1"
                                                onClick={() => setTrackingAutomation(auto)}
                                            >
                                                <Navigation size={10} /> Track Live
                                            </Button>
                                            <button 
                                                onClick={() => handleCancelAutomation(auto.id)}
                                                className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all"
                                                title="Cancel automation"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {showForm && (
                <div className="card mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold mb-4">Publish a New Ride</h3>
                    <form onSubmit={handlePublish} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <input className="input-field m-0" placeholder="From (e.g. Casa)" required onChange={e => setNewRide({ ...newRide, from: e.target.value })} />
                        <input className="input-field m-0" placeholder="To (e.g. Tangier)" required onChange={e => setNewRide({ ...newRide, to: e.target.value })} />
                        <input className="input-field m-0" type="date" required onChange={e => setNewRide({ ...newRide, date: e.target.value })} />
                        <input className="input-field m-0" placeholder="Price (DH)" required onChange={e => setNewRide({ ...newRide, price: e.target.value })} />
                        <div className="col-span-full">
                            <Button variant="primary" className="w-full">Publish Now</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Standard Carpool Listing */}
            <h3 className="text-xl font-black mb-4">Traditional Fan Carpools</h3>
            <div className="grid gap-4">
                {rides.map(ride => (
                    <div key={ride.id} className="card flex flex-col md:flex-row items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-6 w-full md:w-auto mb-4 md:mb-0">
                            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl">🚗</div>
                            <div>
                                <div className="flex items-center gap-2 text-xl font-bold mb-1">
                                    {ride.from} <span className="text-gray-500">➜</span> {ride.to}
                                </div>
                                <div className="flex gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1"><UserPlus size={14} /> Driver: {ride.driver}</span>
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {ride.date}</span>
                                    <span className="flex items-center gap-1"><Clock size={14} /> {ride.time}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                                <div className="text-2xl font-black text-red-500">{ride.price}</div>
                                <div className="text-xs text-gray-400">{ride.seats} seats left</div>
                            </div>
                            <Button
                                variant={ride.seats > 0 ? "primary" : "secondary"}
                                disabled={ride.seats === 0}
                                onClick={() => handleBook(ride.id)}
                            >
                                {ride.seats > 0 ? 'Book' : 'Full'}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Live Tracking HUD Modal in Carpool --- */}
            {trackingAutomation && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-red-500/20 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-[0_0_80px_rgba(239,68,68,0.2)]">
                        <button 
                            onClick={() => setTrackingAutomation(null)}
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
                                Tracking driver <span className="text-white font-bold">{trackingAutomation.driver.name}</span> to match
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

                        {/* Driver details */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-700 overflow-hidden border border-red-500/20">
                                        <img src={trackingAutomation.driver.avatar} alt="Driver" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white text-lg flex items-center gap-1.5 leading-none">
                                            {trackingAutomation.driver.name}
                                            <span className="flex items-center text-xs text-yellow-500 font-bold"><Star size={10} className="fill-current" /> {trackingAutomation.driver.rating}</span>
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-1">Car: {trackingAutomation.driver.car} • License: {trackingAutomation.driver.plate}</p>
                                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">Secure OTP Pick Token: KK-2030</p>
                                    </div>
                                </div>
                                <a 
                                    href={`tel:${trackingAutomation.driver.phone}`}
                                    className="bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl shadow-lg transition-all w-full sm:w-auto text-center"
                                >
                                    Call Driver
                                </a>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <button 
                                onClick={() => setTrackingAutomation(null)}
                                className="text-xs text-gray-500 hover:text-white uppercase tracking-widest font-black"
                            >
                                Minimize Map Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

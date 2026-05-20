import React, { useState, useEffect, useRef } from 'react';
import { AuthService, AgentToolService, TravelAutomationService } from '../services/storage';
import {
  MapPin, Navigation, Phone, MessageSquare, CheckCircle,
  Car, Star, Shield, Clock, X, Send, Wifi, WifiOff,
  ChevronRight, AlertCircle, Sparkles
} from 'lucide-react';

// ─── Phase definitions ───────────────────────────────────────────────────────
const PHASES = [
  {
    key: 'approaching',
    label: 'Chauffeur en route vers vous',
    sub: 'Le chauffeur se dirige vers votre position de prise en charge.',
    icon: '🚕',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    etaKm: 4.2,
  },
  {
    key: 'arrived',
    label: 'Chauffeur arrivé !',
    sub: 'Votre chauffeur vous attend au point de prise en charge.',
    icon: '📍',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    etaKm: 0,
  },
  {
    key: 'en_route',
    label: 'En route vers le stade',
    sub: 'Vous êtes en route ! Prochaine destination : Grand Stade de Casablanca.',
    icon: '🏎️',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    etaKm: 7.0,
  },
  {
    key: 'at_venue',
    label: 'Arrivée au stade !',
    sub: 'Vous êtes arrivé à destination. Bon match ! 🇲🇦',
    icon: '🏟️',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    etaKm: 0,
  },
];

// ─── Animated SVG Map ────────────────────────────────────────────────────────
function LiveMap({ phaseIndex, carPct }) {
  return (
    <div className="relative w-full h-52 rounded-3xl bg-[#0a0a0f] border border-white/5 overflow-hidden">
      {/* Grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Road SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
        {/* Road shadow */}
        <path d="M 40,100 C 120,40 280,160 360,100" fill="none" stroke="rgba(239,68,68,0.08)" strokeWidth="18" strokeLinecap="round"/>
        {/* Road */}
        <path d="M 40,100 C 120,40 280,160 360,100" fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="8" strokeLinecap="round"/>
        {/* Dashed center line */}
        <path d="M 40,100 C 120,40 280,160 360,100" fill="none" stroke="rgba(239,68,68,0.35)" strokeWidth="2" strokeDasharray="12 8" strokeLinecap="round"/>
        {/* Progress fill */}
        <path
          d="M 40,100 C 120,40 280,160 360,100"
          fill="none"
          stroke="#ef4444"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="400"
          strokeDashoffset={400 - 320 * carPct}
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
      </svg>

      {/* Pickup pin */}
      <div className="absolute flex flex-col items-center" style={{ left: '7%', top: '42%', transform: 'translate(-50%,-50%)' }}>
        <div className="w-9 h-9 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center text-base shadow-lg">📍</div>
        <span className="text-[8px] text-gray-400 mt-1 font-bold uppercase tracking-wider whitespace-nowrap">Pickup</span>
      </div>

      {/* Venue pin */}
      <div className="absolute flex flex-col items-center" style={{ right: '5%', top: '42%', transform: 'translate(50%,-50%)' }}>
        <div className="w-9 h-9 rounded-full bg-red-600 border-2 border-red-400 flex items-center justify-center text-base shadow-lg shadow-red-600/40 animate-pulse">🏟️</div>
        <span className="text-[8px] text-red-400 mt-1 font-bold uppercase tracking-wider whitespace-nowrap">Stade</span>
      </div>

      {/* Animated car along the bezier */}
      <AnimatedCar pct={carPct} />

      {/* Signal pulse ring */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-ping absolute"></span>
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        <span className="text-[9px] text-green-400 font-bold uppercase tracking-widest ml-3">GPS Live</span>
      </div>
    </div>
  );
}

// Approximate a point on the bezier curve for the car position
function bezierPoint(t) {
  // Cubic bezier: P0=(40,100) P1=(120,40) P2=(280,160) P3=(360,100) in a 400×200 viewBox
  const p = (a, b, c, d, t) => Math.pow(1-t,3)*a + 3*Math.pow(1-t,2)*t*b + 3*(1-t)*t*t*c + Math.pow(t,3)*d;
  return { x: p(40, 120, 280, 360, t), y: p(100, 40, 160, 100, t) };
}

function AnimatedCar({ pct }) {
  const pt = bezierPoint(Math.min(pct, 0.98));
  // Convert viewBox coords (400×200) to percentage
  const left = `${(pt.x / 400) * 100}%`;
  const top  = `${(pt.y / 200) * 100}%`;
  return (
    <div
      className="absolute w-8 h-8 rounded-full bg-red-600 border-2 border-white/20 flex items-center justify-center text-sm shadow-lg shadow-red-600/50 z-10"
      style={{ left, top, transform: 'translate(-50%,-50%)', transition: 'left 1.2s ease-out, top 1.2s ease-out' }}
    >
      🚕
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function DriverConnect() {
  const currentUser = AuthService.getCurrentUser();

  // Pull booking — prefer agent taxi bookings, fall back to automations
  const taxiBookings = AgentToolService.getTaxiBookings(currentUser?.id);
  const automations  = TravelAutomationService.getAutomations(currentUser?.id);
  const booking      = taxiBookings[0] || (automations[0] ? {
    driver: automations[0].driver,
    pickup: automations[0].pickupLocation,
    destination: 'Grand Stade de Casablanca',
    otp: 'KK-2030',
    time: 'Demain, 20:00',
    phase: 'approaching',
    status: 'CONFIRMED',
  } : null);

  const [phaseIndex, setPhaseIndex]   = useState(0);
  const [carPct, setCarPct]           = useState(0);
  const [driverOnline, setDriverOnline] = useState(true);
  const [chatOpen, setChatOpen]       = useState(false);
  const [messages, setMessages]       = useState([]);
  const [msgInput, setMsgInput]       = useState('');
  const chatBottomRef = useRef(null);

  // Auto-advance simulation
  useEffect(() => {
    if (!booking) return;
    // Start car animation
    setCarPct(0.12);

    // Simulate phase progression
    const t1 = setTimeout(() => { setPhaseIndex(1); setCarPct(0.22); }, 6000);
    const t2 = setTimeout(() => { setPhaseIndex(2); setCarPct(0.55); }, 14000);
    const t3 = setTimeout(() => { setPhaseIndex(3); setCarPct(0.99); }, 26000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Car animation tick when en_route
  useEffect(() => {
    if (phaseIndex !== 2) return;
    const interval = setInterval(() => {
      setCarPct(p => Math.min(p + 0.04, 0.95));
    }, 900);
    return () => clearInterval(interval);
  }, [phaseIndex]);

  // Driver welcome message
  useEffect(() => {
    if (!booking) return;
    setMessages([{
      id: 1, sender: 'driver',
      text: `Salam ! Je suis ${booking.driver?.name}, votre chauffeur. Je me dirige vers vous à ${booking.pickup}. OTP de sécurité : ${booking.otp}. À tout de suite ! 🚕`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatOpen]);

  const phase = PHASES[phaseIndex];

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(m => [...m, { id: Date.now(), sender: 'user', text: msgInput, time: timeStr }]);
    const sent = msgInput;
    setMsgInput('');

    // Simulate driver auto-reply
    setTimeout(() => {
      const replies = [
        'Compris ! Je serai là dans quelques minutes. 🚗',
        'Pas de souci, je suis en route. 👍',
        'Reçu ! À tout de suite.',
        'Ok, coordonnées mises à jour. Je vous retrouve là-bas !',
        'Parfait, je vous envoie ma position exacte maintenant. 📍',
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setMessages(m => [...m, {
        id: Date.now(),
        sender: 'driver',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1400);
  };

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center p-8">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-4xl">🚕</div>
        <h2 className="text-2xl font-black text-white">Aucune Réservation Active</h2>
        <p className="text-gray-400 max-w-sm">Vous n'avez pas encore de taxi ou de trajet réservé. Utilisez l'Agent Autonome ou la page Billets pour réserver votre transport.</p>
        <a href="/chatbot" className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-red-600/20">
          Lancer l'Agent Autonome →
        </a>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-10 max-w-3xl mx-auto px-2 lg:px-0">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
          <Sparkles size={12} className="animate-spin" /> Connexion Chauffeur Live
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Votre Chauffeur</h1>
        <p className="text-gray-400 text-sm mt-1">Suivi en temps réel de votre trajet sécurisé vers le stade.</p>
      </div>

      {/* ── Phase Status Banner ── */}
      <div className={`rounded-3xl border p-5 mb-6 flex items-center gap-4 ${phase.bg} ${phase.border}`}>
        <div className="text-3xl">{phase.icon}</div>
        <div className="flex-1">
          <p className={`font-black text-sm ${phase.color}`}>{phase.label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{phase.sub}</p>
        </div>
        {/* Phase stepper dots */}
        <div className="flex gap-1.5">
          {PHASES.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i <= phaseIndex ? 'bg-red-500' : 'bg-white/10'}`} />
          ))}
        </div>
      </div>

      {/* ── Live GPS Map ── */}
      <div className="mb-6">
        <LiveMap phaseIndex={phaseIndex} carPct={carPct} />
        <div className="flex justify-between items-center mt-3 px-1 text-xs text-gray-500 font-mono">
          <span className="flex items-center gap-1"><MapPin size={11} className="text-red-500" /> {booking.pickup}</span>
          {phaseIndex < 2 && phase.etaKm > 0 && (
            <span className="text-yellow-400 font-bold">{(phase.etaKm - phaseIndex * 2.1).toFixed(1)} km restants</span>
          )}
          {phaseIndex >= 2 && phase.etaKm > 0 && (
            <span className="text-red-400 font-bold">{Math.max(0, (7 - carPct * 7)).toFixed(1)} km jusqu'au stade</span>
          )}
          <span className="flex items-center gap-1">{booking.destination} <ChevronRight size={11} /></span>
        </div>
      </div>

      {/* ── Driver Profile Card ── */}
      <div className="card border border-white/5 p-6 rounded-[2rem] mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar with online ring */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-red-500/30 shadow-xl">
              <img src={booking.driver?.avatar} alt={booking.driver?.name} className="w-full h-full object-cover" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[var(--bg-card)] flex items-center justify-center ${driverOnline ? 'bg-green-500' : 'bg-gray-600'}`}>
              {driverOnline ? <Wifi size={10} className="text-white" /> : <WifiOff size={10} className="text-white" />}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl font-black text-white">{booking.driver?.name}</h2>
              <span className="text-[10px] bg-green-500/15 text-green-400 font-bold px-2 py-0.5 rounded-full uppercase border border-green-500/20">
                {driverOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
            <p className="text-xs text-gray-400">{booking.driver?.car}</p>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1 text-yellow-500 font-bold">
                <Star size={12} className="fill-current" /> {booking.driver?.rating}
              </span>
              <span className="text-gray-500">•</span>
              <span className="font-mono text-red-400 font-bold">{booking.driver?.plate}</span>
              <span className="text-gray-500">•</span>
              <span className="flex items-center gap-1 text-green-400 font-bold">
                <Shield size={10} /> OTP : {booking.otp}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <a
              href={`tel:${booking.driver?.phone}`}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg w-full"
            >
              <Phone size={14} /> Appeler
            </a>
            <button
              onClick={() => setChatOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg w-full"
            >
              <MessageSquare size={14} /> Chat Sécurisé
            </button>
          </div>
        </div>

        {/* Booking meta row */}
        <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { icon: Clock,     label: 'Heure de départ', value: booking.time },
            { icon: MapPin,    label: 'Prise en charge',  value: booking.pickup },
            { icon: Navigation,label: 'Destination',      value: 'Grand Stade' },
            { icon: Shield,    label: 'OTP Sécurité',     value: booking.otp },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <Icon size={14} className="text-red-500" />
              <span className="text-[9px] text-gray-500 uppercase tracking-widest">{label}</span>
              <span className="text-xs font-black text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Phase Progress Timeline ── */}
      <div className="card border border-white/5 p-6 rounded-[2rem] mb-6">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
          <Navigation size={13} className="text-red-500" /> Statut du Trajet
        </h3>
        <div className="flex flex-col gap-0">
          {PHASES.map((p, i) => (
            <div key={p.key} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm transition-all duration-500 ${
                  i < phaseIndex  ? 'bg-green-600 border-green-500' :
                  i === phaseIndex ? 'bg-red-600 border-red-400 animate-pulse shadow-lg shadow-red-600/30' :
                  'bg-white/5 border-white/10'
                }`}>
                  {i < phaseIndex ? <CheckCircle size={14} className="text-white" /> : p.icon}
                </div>
                {i < PHASES.length - 1 && (
                  <div className={`w-0.5 h-8 mt-1 transition-all duration-700 ${i < phaseIndex ? 'bg-green-500' : 'bg-white/10'}`} />
                )}
              </div>
              <div className={`pb-6 ${i === phaseIndex ? 'opacity-100' : i < phaseIndex ? 'opacity-60' : 'opacity-30'}`}>
                <p className={`text-sm font-black ${i === phaseIndex ? p.color : 'text-white'}`}>{p.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{p.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Driver Chat Modal ── */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-red-500/20 rounded-[2.5rem] flex flex-col h-[560px] shadow-[0_0_80px_rgba(239,68,68,0.25)] overflow-hidden">

            {/* Chat header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/1">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden border border-red-500/20">
                    <img src={booking.driver?.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--bg-card)] animate-pulse" />
                </div>
                <div>
                  <p className="font-black text-sm text-white">{booking.driver?.name}</p>
                  <p className="text-[9px] text-green-400 font-bold uppercase tracking-widest">Connecté · Chauffeur</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition-all">
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-red-600 text-white rounded-tr-none'
                      : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-gray-600 mt-1">{msg.time}</span>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex gap-2 p-4 border-t border-white/5 bg-white/1">
              <input
                type="text"
                className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-all"
                placeholder="Écrire au chauffeur..."
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={!msgInput.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-2xl disabled:opacity-40 transition-all"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

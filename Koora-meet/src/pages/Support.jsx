import React, { useState, useEffect } from 'react';
import { AgentToolService, StoreService } from '../services/storage';
import { Headphones, Package, Ticket, Hotel, MessageSquare, Clock, MapPin, ChevronRight, X, Send, AlertTriangle } from 'lucide-react';

export default function Support() {
  const [history, setHistory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // the item ID being discussed
  const [chatMessages, setChatMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');

  useEffect(() => {
    // Combine Agent History and Store Orders
    setHistory(AgentToolService.getFullHistory());
    setOrders(StoreService.getOrders());
  }, []);

  const openChat = (item) => {
    setActiveChat(item);
    setChatMessages([
      { sender: 'bot', text: `Bonjour ! Comment puis-je vous aider concernant la référence ${item.ref} ?` }
    ]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!msgInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: msgInput }]);
    setMsgInput('');

    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Un de nos agents SAV a été notifié de votre demande. Nous traitons ce dossier en priorité.' 
      }]);
    }, 1000);
  };

  const allItems = [
    ...orders.map(o => ({ ...o, category: 'store' })),
    ...history.filter(h => h.type !== 'shop') // Exclude agent shop history to avoid duplicates with StoreService orders
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getItemIcon = (type) => {
    if (type === 'store' || type === 'shop') return <Package className="text-orange-500" />;
    if (type === 'hotel') return <Hotel className="text-blue-500" />;
    if (type === 'ticket') return <Ticket className="text-green-500" />;
    if (type === 'train') return <span className="text-2xl">🚆</span>;
    return <span className="text-2xl">🚕</span>;
  };

  return (
    <div className="pb-24 pt-10 max-w-5xl mx-auto px-4">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
          <Headphones size={12} /> Service Après Vente
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">Support & Suivi</h1>
        <p className="text-gray-400 mt-2">Suivez vos commandes de la boutique et vos réservations (Hôtels, Taxis, Trains, Billets).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Orders/Bookings */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-black text-white mb-4">Vos Dossiers Actifs</h2>
          
          {allItems.length === 0 ? (
            <div className="p-8 text-center border border-white/5 bg-white/2 rounded-3xl">
              <AlertTriangle size={32} className="mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400 font-bold">Aucun dossier en cours.</p>
            </div>
          ) : (
            allItems.map(item => (
              <div key={item.id} className="p-5 bg-[var(--bg-card)] border border-white/5 rounded-3xl hover:border-white/10 transition-all flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                  {getItemIcon(item.type || item.category)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      {item.category === 'store' ? 'Commande Boutique' : `Réservation ${item.type}`}
                    </h3>
                    <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-300 font-mono">{item.ref}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {item.category === 'store' 
                      ? `${item.items.length} article(s) - Total: ${item.total} DH` 
                      : item.type === 'hotel' ? item.hotel?.name 
                      : item.type === 'taxi' ? `${item.pickup} → ${item.destination}`
                      : item.type === 'train' ? `${item.origin} → ${item.destination} à ${item.time}`
                      : item.event}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={10} /> {item.status || item.estimatedDelivery || 'CONFIRMÉ'}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="sm:pl-4 sm:border-l border-white/5">
                  <button 
                    onClick={() => openChat(item)}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={14} /> Contacter SAV
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Support Chat Box */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--bg-card)] border border-white/5 rounded-3xl h-[500px] flex flex-col overflow-hidden sticky top-24 shadow-2xl">
            {activeChat ? (
              <>
                <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <Headphones size={16} className="text-red-500" /> Support Live
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Dossier: {activeChat.ref}</p>
                  </div>
                  <button onClick={() => setActiveChat(null)} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500">
                    <X size={14} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-red-600 text-white rounded-tr-none'
                          : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-black/20 flex gap-2">
                  <input
                    type="text"
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    placeholder="Écrivez votre message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                  <button type="submit" disabled={!msgInput.trim()} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded-xl disabled:opacity-50">
                    <Send size={14} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <Headphones size={48} className="text-gray-600 mb-4" />
                <h3 className="text-lg font-black text-white mb-2">Comment pouvons-nous vous aider ?</h3>
                <p className="text-xs text-gray-400">Sélectionnez un dossier à gauche pour démarrer une conversation avec notre équipe SAV.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

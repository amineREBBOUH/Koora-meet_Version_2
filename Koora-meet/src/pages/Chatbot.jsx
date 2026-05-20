import React, { useState, useEffect, useRef } from 'react';
import { AuthService, AgentToolService } from '../services/storage';
import { Send, Bot, Sparkles, Cpu, Terminal, MapPin, Navigation, Info, CheckCircle, MessageSquare, AlertCircle, ShoppingBag, Hotel, Ticket } from 'lucide-react';
import { allTopics } from '../data/chatbotData';
import { Button } from '../components/UI';

export default function Chatbot() {
    const currentUser = AuthService.getCurrentUser();
    const [agentMode, setAgentMode] = useState(false); // Toggle mode
    
    // Legacy Q&A Chatbot States
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [step, setStep] = useState('PRELIMINARY');
    const bottomRef = useRef(null);

    // AI Agent States
    const [agentLogs, setAgentLogs] = useState([]);
    const [pendingAction, setPendingAction] = useState(null);
    const [privateMessages, setPrivateMessages] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [agentInput, setAgentInput] = useState('');

    // Initial Q&A Load
    useEffect(() => {
        if (messages.length === 0) {
            addBotMessage(`Bonjour ${currentUser.prenom} ! 👋 Je suis l'assistant Koora. Prêt pour la Coupe du Monde ?`);
            setTimeout(() => askNextQuestion(), 1000);
        }
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, agentLogs]);

    // Q&A Helper Functions
    const addBotMessage = (text, options = []) => {
        setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text, options }]);
    };

    const addUserMessage = (text) => {
        setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
    };

    const askNextQuestion = () => {
        addBotMessage("Vos informations sont-elles correctes pour le pass supporter ?", [
            { label: "✅ Oui, continuer", value: "START_MAIN" },
            { label: "✏️ Modifier", value: "EDIT_INFO" }
        ]);
    };

    const handleOptionClick = (value, label) => {
        addUserMessage(label);
        processInput(value);
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        addUserMessage(input);
        processInput(input);
        setInput('');
    };

    const processInput = (text) => {
        const lowerInput = text.toLowerCase();

        if (text === 'START_MAIN') {
            setStep('MAIN_MENU');
            addBotMessage("Posez-moi vos questions ! Exemples :\n- Infos billets 🎟️\n- Grand Stade de Casablanca 🏟️\n- Statistiques des Lions de l'Atlas 🇲🇦\n- Où loger ? 🏨");
            return;
        }

        let bestMatch = null;
        let maxScore = 0;

        allTopics.forEach(topic => {
            let score = 0;
            topic.keywords.forEach(kw => {
                if (lowerInput.includes(kw)) score += 2;
            });
            if (score > maxScore) {
                maxScore = score;
                bestMatch = topic;
            }
        });

        if (bestMatch && maxScore > 0) {
            setTimeout(() => addBotMessage(bestMatch.response), 500);
            setTimeout(() => {
                addBotMessage("💡 **Vous aimeriez peut-être savoir :**", [
                    { label: "🏨 Hôtels à proximité", value: "hotels" },
                    { label: "🚕 Transports & Taxis", value: "taxi" },
                    { label: "🎫 Achat Billets", value: "tickets" },
                    { label: "🍽️ Gastronomie locale", value: "food" }
                ]);
            }, 1500);
            return;
        }

        setTimeout(() => {
            addBotMessage(
                "🤔 Je ne suis pas sûr de comprendre, mais je peux vous renseigner sur :\n\n" +
                "🏟️ **Stades** : \"Parle-moi du Grand Stade\"\n" +
                "🏨 **Hôtels** : \"Hôtels de luxe à Casablanca\"\n" +
                "🚕 **Transports** : \"Prix des taxis\"\n" +
                "⚽ **Équipes** : \"Statistiques du Maroc\"\n\n" +
                "Essayez de reformuler ou choisissez une option !",
                [
                    { label: "🏟️ Stades", value: "stadium" },
                    { label: "🏨 Hôtels", value: "hotel" },
                    { label: "🚕 Taxis", value: "taxi" }
                ]
            );
        }, 500);
    };

    // --- AI Autonomous Agent Operations ---
    
    // Auto-initialize position when switching to Agent Mode
    useEffect(() => {
        if (agentMode && agentLogs.length === 0) {
            triggerAgentInitialization();
        }
    }, [agentMode]);

    const triggerAgentInitialization = () => {
        setAgentLogs([
            { type: 'system', text: '🤖 Initialisation de l\'Agent Autonome Koora...' },
            { type: 'system', text: 'Règle 1 : Appel prioritaire de get_location()' }
        ]);

        setTimeout(async () => {
            // ── REAL TOOL CALL (ASYNC) ──
            const pos = await AgentToolService.get_location();

            setUserLocation(pos.label);
            setAgentLogs(prev => [
                ...prev,
                { type: 'action', data: { action: 'get_location', details: '{}', waiting: 'non' } },
                { type: 'success', text: `📍 Position acquise : ${pos.label}` }
            ]);

            setTimeout(() => {
                // ── REAL TOOL CALL ──
                const msg = `📍 Votre position actuelle a été détectée avec succès : ${pos.city}, ${pos.country}.`;
                AgentToolService.send_private_message('Utilisateur', msg);

                setAgentLogs(prev => [...prev, {
                    type: 'action',
                    data: { action: 'send_private_message', details: JSON.stringify({ contact: 'Utilisateur', message: msg }, null, 2), waiting: 'non' }
                }]);
                setPrivateMessages([{ sender: 'AI Agent', text: msg, time: 'À l\'instant' }]);

                setTimeout(() => {
                    setAgentLogs(prev => [...prev, {
                        type: 'bot',
                        text: `Bonjour ! J'ai détecté votre position à ${pos.city}. Je suis prêt à organiser vos réservations d'hôtel, vos billets de match ou vos transports. Que souhaitez-vous faire ?`
                    }]);
                }, 800);
            }, 1000);
        }, 800);
    };


    const handleAgentSubmit = (e) => {
        e.preventDefault();
        if (!agentInput.trim() || pendingAction) return;

        const text = agentInput.trim();
        const lowerText = text.toLowerCase();
        setAgentInput('');

        setAgentLogs(prev => [
            ...prev,
            { type: 'user', text: text },
            { type: 'system', text: '🤖 Analyse LLM en cours (Extraction des intentions)...' }
        ]);

        setTimeout(() => {
            // Simulated LLM Natural Language Parser
            if (lowerText.includes('train') && (lowerText.includes('hotel') || lowerText.includes('hôtel'))) {
                 handleAgentWorkflow('TRAIN_HOTEL_TAXI');
            } else if (lowerText.includes('billet') || lowerText.includes('match') || lowerText.includes('ticket')) {
                 handleAgentWorkflow('MATCH_TAXI');
            } else if (lowerText.includes('hotel') || lowerText.includes('hôtel')) {
                 handleAgentWorkflow('HOTEL_TAXI');
            } else if (lowerText.includes('store') || lowerText.includes('boutique') || lowerText.includes('maillot') || lowerText.includes('tenu')) {
                 handleAgentWorkflow('STORE');
            } else if (lowerText.includes('train')) {
                 handleAgentWorkflow('TRAIN_HOTEL_TAXI');
            } else {
                 setAgentLogs(prev => [
                    ...prev,
                    { type: 'bot', text: "Je suis prêt à exécuter vos tâches. Essayez de me demander : réserver un hôtel, trouver un taxi, réserver un train, acheter des billets ou un maillot." }
                ]);
            }
        }, 1200);
    };

    const handleAgentWorkflow = (type) => {
        if (pendingAction) return;

        if (type === 'MATCH_TAXI') {
            setAgentLogs(prev => [
                ...prev,
                { type: 'system', text: 'Intention détectée : [Billet de match] + [Taxi]' }
            ]);

            setTimeout(() => {
                const buyTicketAction = {
                    action: 'buy_ticket',
                    details: JSON.stringify({ event: 'Morocco vs Portugal', date: 'Tomorrow, 22:50', quantity: 1, category: 'Category 1' }, null, 2),
                    waiting: 'oui',
                    onConfirm: () => executeBuyTicketAndTaxiWorkflow()
                };
                setPendingAction(buyTicketAction);
                setAgentLogs(prev => [...prev, { type: 'action', data: buyTicketAction }]);
            }, 1000);
        } else if (type === 'HOTEL_TAXI') {
            setAgentLogs(prev => [
                ...prev,
                { type: 'system', text: 'Intention détectée : [Hôtel] + [Taxi]' }
            ]);

            setTimeout(() => {
                const bookHotelAction = {
                    action: 'book_hotel',
                    details: JSON.stringify({ city: 'Casablanca', checkin: '2030-06-12', checkout: '2030-06-15', guests: 2, budget: '150 EUR/nuit' }, null, 2),
                    waiting: 'oui',
                    onConfirm: () => executeBookHotelAndTaxiWorkflow()
                };
                setPendingAction(bookHotelAction);
                setAgentLogs(prev => [...prev, { type: 'action', data: bookHotelAction }]);
            }, 1000);
        } else if (type === 'STORE') {
            setAgentLogs(prev => [
                ...prev,
                { type: 'system', text: 'Intention détectée : [Boutique] + [Achat]' }
            ]);

            setTimeout(() => {
                const searchStoreAction = {
                    action: 'search_fan_store',
                    details: JSON.stringify({ team: 'Maroc', item_type: 'Jersey' }, null, 2),
                    waiting: 'non'
                };
                setAgentLogs(prev => [...prev, { type: 'action', data: searchStoreAction }]);

                setTimeout(() => {
                    const purchaseAction = {
                        action: 'purchase_item',
                        details: JSON.stringify({ item_id: 'jersey_morocco_2030_home', size: 'L', quantity: 1, address: 'Casablanca Hotel' }, null, 2),
                        waiting: 'oui',
                        onConfirm: () => executePurchaseWorkflow()
                    };
                    setPendingAction(purchaseAction);
                    setAgentLogs(prev => [...prev, { type: 'action', data: purchaseAction }]);
                }, 1200);
            }, 1000);
        } else if (type === 'TRAIN_HOTEL_TAXI') {
            setAgentLogs(prev => [
                ...prev,
                { type: 'system', text: 'Intention détectée : [Train] + [Hôtel] + [Taxi]' }
            ]);

            setTimeout(() => {
                const bookTrainAction = {
                    action: 'book_train',
                    details: JSON.stringify({ origin: 'Tanger', destination: 'Casablanca', date: '2030-06-12', time: '10:00', classType: '1ère Classe' }, null, 2),
                    waiting: 'oui',
                    onConfirm: () => executeTrainHotelTaxiWorkflow()
                };
                setPendingAction(bookTrainAction);
                setAgentLogs(prev => [...prev, { type: 'action', data: bookTrainAction }]);
            }, 1000);
        }
    };

    const executeTrainHotelTaxiWorkflow = () => {
        setPendingAction(null);
        // ── REAL TOOL CALL ──
        const trainResult = AgentToolService.book_train('Tanger', 'Casablanca', '2030-06-12', '10:00', '1ère Classe');
        setAgentLogs(prev => [...prev, { type: 'success', text: `🚆 Billet Train Al Boraq acheté ! Réf : ${trainResult.ref}` }]);

        setTimeout(() => {
            setPrivateMessages(p => [...p, { sender: 'AI Agent', text: `🚆 Train Tanger-Casablanca confirmé. Réf : ${trainResult.ref}`, time: 'À l\'instant' }]);

            setTimeout(() => {
                setAgentLogs(prev => [...prev, { type: 'system', text: 'Règle 4 : Recherche d\'hôtel + Taxi à l\'arrivée.' }]);
                const bookHotelAction = {
                    action: 'book_hotel',
                    details: JSON.stringify({ city: 'Casablanca', checkin: '2030-06-12', checkout: '2030-06-15', guests: 2, budget: '150 EUR/nuit' }, null, 2),
                    waiting: 'oui',
                    onConfirm: () => {
                        setPendingAction(null);
                        const hotelResult = AgentToolService.book_hotel('Casablanca', '2030-06-12', '2030-06-15', 2, '150 EUR/nuit');
                        setAgentLogs(prev => [...prev, { type: 'success', text: `🏨 ${hotelResult.hotel.name} réservé ! Réf : ${hotelResult.hotel.ref}` }]);
                        setTimeout(() => {
                            setPrivateMessages(p => [...p, { sender: 'AI Agent', text: `🏨 ${hotelResult.hotel.name} confirmé. Réf : ${hotelResult.hotel.ref}`, time: 'À l\'instant' }]);
                            setTimeout(() => {
                                const taxiResult = AgentToolService.book_taxi('Gare Casa Voyageurs', hotelResult.hotel.name, '2030-06-12, 12:30');
                                setAgentLogs(prev => [...prev, { type: 'success', text: `🚕 Navette Gare-Hôtel réservée ! Chauffeur : ${taxiResult.driver.name}. OTP : ${taxiResult.otp}` }]);
                                setPrivateMessages(p => [...p, { sender: 'AI Agent', text: `🚕 ${taxiResult.driver.name} vous attend à la gare. OTP : ${taxiResult.otp}`, time: 'À l\'instant' }]);
                                setTimeout(() => {
                                    setAgentLogs(prev => [...prev, { type: 'bot', text: `✅ Train + Hôtel + Navette coordonnés intelligemment ! Bon voyage ! 🚆🏨🚕` }]);
                                }, 800);
                            }, 1000);
                        }, 800);
                    }
                };
                setPendingAction(bookHotelAction);
                setAgentLogs(prev => [...prev, { type: 'action', data: bookHotelAction }]);
            }, 1500);
        }, 1000);
    };

    // Sub-workflows confirmation triggers
    const executeBuyTicketAndTaxiWorkflow = () => {
        setPendingAction(null);
        // ── REAL TOOL CALL ──
        const ticketResult = AgentToolService.buy_ticket('Morocco vs Portugal', 'Tomorrow, 22:50', 1, 'Category 1');
        setAgentLogs(prev => [...prev, {
            type: 'success',
            text: `🎟️ Billet acheté ! Réf : ${ticketResult.ref}`
        }]);

        setTimeout(() => {
            setAgentLogs(prev => [...prev, {
                type: 'action',
                data: { action: 'send_private_message', details: JSON.stringify({ contact: 'Utilisateur', message: `🎟️ Billet Maroc vs Portugal confirmé ! Réf : ${ticketResult.ref}` }, null, 2), waiting: 'non' }
            }]);
            setPrivateMessages(p => [...p, { sender: 'AI Agent', text: `🎟️ Billet validé ! Réf : ${ticketResult.ref}`, time: 'À l\'instant' }]);

            setTimeout(() => {
                setAgentLogs(prev => [...prev, { type: 'system', text: 'Règle 4 : Commande automatique du taxi après acquisition du billet.' }]);

                const bookTaxiAction = {
                    action: 'book_taxi',
                    details: JSON.stringify({ pickup: 'Casablanca Center', destination: 'Grand Stade de Casablanca', time: 'Demain, 20:00' }, null, 2),
                    waiting: 'oui',
                    onConfirm: () => {
                        setPendingAction(null);
                        // ── REAL TOOL CALL ──
                        const taxiResult = AgentToolService.book_taxi('Casablanca Center', 'Grand Stade de Casablanca', 'Demain, 20:00');
                        setAgentLogs(prev => [...prev, {
                            type: 'success',
                            text: `🚕 Taxi réservé ! Chauffeur : ${taxiResult.driver.name}. OTP : ${taxiResult.otp}`
                        }]);
                        setTimeout(() => {
                            setPrivateMessages(p => [...p, { sender: 'AI Agent', text: `🚕 ${taxiResult.driver.name} (${taxiResult.driver.car}) confirmé. OTP : ${taxiResult.otp}`, time: 'À l\'instant' }]);
                            setTimeout(() => {
                                setAgentLogs(prev => [...prev, {
                                    type: 'bot',
                                    text: `✅ Tout est prêt ! Billet + Chauffeur ${taxiResult.driver.name} coordonnés. → Accédez à /driver-connect pour le suivi en temps réel ! 🇲🇦🔥`
                                }]);
                            }, 800);
                        }, 1000);
                    }
                };
                setPendingAction(bookTaxiAction);
                setAgentLogs(prev => [...prev, { type: 'action', data: bookTaxiAction }]);
            }, 1500);
        }, 1000);
    };

    const executeBookHotelAndTaxiWorkflow = () => {
        setPendingAction(null);
        // ── REAL TOOL CALL ──
        const hotelResult = AgentToolService.book_hotel('Casablanca', '2030-06-12', '2030-06-15', 2, '150 EUR/nuit');
        setAgentLogs(prev => [...prev, {
            type: 'success',
            text: `🏨 ${hotelResult.hotel.name} réservé ! Réf : ${hotelResult.hotel.ref}`
        }]);

        setTimeout(() => {
            setPrivateMessages(p => [...p, { sender: 'AI Agent', text: `🏨 ${hotelResult.hotel.name} (${hotelResult.hotel.stars}★) confirmé. Réf : ${hotelResult.hotel.ref}`, time: 'À l\'instant' }]);

            setTimeout(() => {
                setAgentLogs(prev => [...prev, { type: 'system', text: 'Règle 4 : Commande automatique du taxi Aéroport → Hôtel.' }]);

                const bookTaxiAction = {
                    action: 'book_taxi',
                    details: JSON.stringify({ pickup: 'Aéroport Mohammed V', destination: hotelResult.hotel.name, time: '2030-06-12, 14:00' }, null, 2),
                    waiting: 'oui',
                    onConfirm: () => {
                        setPendingAction(null);
                        // ── REAL TOOL CALL ──
                        const taxiResult = AgentToolService.book_taxi('Aéroport Mohammed V', hotelResult.hotel.name, '2030-06-12, 14:00');
                        setAgentLogs(prev => [...prev, {
                            type: 'success',
                            text: `🚕 Navette réservée ! Chauffeur : ${taxiResult.driver.name}. OTP : ${taxiResult.otp}`
                        }]);
                        setTimeout(() => {
                            setPrivateMessages(p => [...p, { sender: 'AI Agent', text: `🚕 ${taxiResult.driver.name} vous attend à l'aéroport. OTP : ${taxiResult.otp}`, time: 'À l\'instant' }]);
                            setTimeout(() => {
                                setAgentLogs(prev => [...prev, {
                                    type: 'bot',
                                    text: `✅ Hôtel + Navette coordonnés intelligemment ! → Suivez votre chauffeur sur /driver-connect ✈️🏨`
                                }]);
                            }, 800);
                        }, 1000);
                    }
                };
                setPendingAction(bookTaxiAction);
                setAgentLogs(prev => [...prev, { type: 'action', data: bookTaxiAction }]);
            }, 1500);
        }, 1000);
    };

    const executePurchaseWorkflow = () => {
        setPendingAction(null);
        // ── REAL TOOL CALL ──
        const orderResult = AgentToolService.purchase_item('jersey_morocco_2030_home', 'L', 1, 'Casablanca Hotel');
        setAgentLogs(prev => [...prev, {
            type: 'success',
            text: `🛍️ Commande validée ! Réf : ${orderResult.ref} — Livraison : ${orderResult.estimatedDelivery}`
        }]);
        setTimeout(() => {
            setPrivateMessages(p => [...p, { sender: 'AI Agent', text: `🛍️ Maillot Maroc (Taille L) commandé. Réf : ${orderResult.ref}. Livraison : ${orderResult.estimatedDelivery}`, time: 'À l\'instant' }]);
            setTimeout(() => {
                setAgentLogs(prev => [...prev, {
                    type: 'bot',
                    text: `✅ Commande finalisée ! Votre maillot officiel Dima Maghreb 2030 sera livré en ${orderResult.estimatedDelivery}. Allez les Lions de l'Atlas ! 🇲🇦⚽`
                }]);
            }, 800);
        }, 1000);
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] lg:h-[calc(100vh-2rem)] bg-[var(--bg-dark)] gap-6 p-4 lg:p-8">
            
            {/* Left Column: Navigation and Controls */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
                <div className="card p-6 border border-white/5 bg-[var(--bg-card)] rounded-[2rem] flex flex-col gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 text-red-500 border border-red-600/20 text-[10px] font-bold uppercase tracking-wider mb-3">
                            <Sparkles size={12} className="animate-spin" /> Koora Brain
                        </div>
                        <h1 className="text-2xl font-black">Koora AI</h1>
                        <p className="text-xs text-gray-400 mt-1">
                            Basculez entre le Chatbot classique et l'Agent Autonome intelligent.
                        </p>
                    </div>

                    {/* Mode Toggle Button */}
                    <div className="flex flex-col gap-2.5">
                        <button
                            onClick={() => setAgentMode(false)}
                            className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                                !agentMode 
                                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/20' 
                                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Bot size={16} /> Mode Q&A Standard
                        </button>
                        <button
                            onClick={() => setAgentMode(true)}
                            className={`w-full py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-2 ${
                                agentMode 
                                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/20 animate-pulse' 
                                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Cpu size={16} /> Agent Autonome (Beta)
                        </button>
                    </div>
                </div>

                {/* Simulated Private Messages Display (Rule 3 Notification Console) */}
                {agentMode && (
                    <div className="card p-6 border border-red-500/15 bg-red-950/5 rounded-[2rem] flex-1 flex flex-col min-h-[180px] overflow-hidden">
                        <h3 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2 mb-3">
                            <MessageSquare size={14} /> Messagerie Privée
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-[11px] leading-relaxed">
                            {privateMessages.length === 0 ? (
                                <span className="text-gray-500 italic">Aucun message privé envoyé.</span>
                            ) : (
                                privateMessages.map((msg, i) => (
                                    <div key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl">
                                        <div className="flex justify-between font-bold text-white mb-1">
                                            <span>{msg.sender}</span>
                                            <span className="text-[9px] text-gray-500">{msg.time}</span>
                                        </div>
                                        <p className="text-gray-300">{msg.text}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Chat Workspace */}
            <div className="flex-1 flex flex-col card border border-white/5 bg-[var(--bg-card)] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                
                {/* Mode Header */}
                <div className="p-6 border-b border-white/5 bg-white/1 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
                            {agentMode ? <Cpu size={20} className="animate-pulse" /> : <Bot size={20} />}
                        </div>
                        <div>
                            <h2 className="font-black text-sm uppercase tracking-wider text-white">
                                {agentMode ? 'Assistant Autonome IA' : 'Assistant Interactif Q&A'}
                            </h2>
                            <p className="text-[10px] text-gray-400">
                                {agentMode 
                                    ? 'Exécution d\'outils et réservations intelligentes d\'après votre localisation' 
                                    : 'Conseils pratiques, infos de transport et guide Coupe du Monde 2030'}
                            </p>
                        </div>
                    </div>
                    {agentMode && userLocation && (
                        <div className="hidden sm:flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold px-3 py-1.5 rounded-xl">
                            <MapPin size={12} /> Casablanca Center
                        </div>
                    )}
                </div>

                {/* WORKSPACE AREA: Standard Q&A Mode */}
                {!agentMode && (
                    <div className="flex-1 flex flex-col overflow-hidden h-full">
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                        msg.sender === 'bot' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700'
                                    }`}>
                                        {msg.sender === 'bot' ? <Bot size={18} /> : <div className="font-bold text-xs">ME</div>}
                                    </div>
                                    <div className={`flex flex-col gap-2 max-w-[85%] lg:max-w-[70%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-4 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                                            msg.sender === 'user' 
                                                ? 'bg-white/10 text-white rounded-tr-none' 
                                                : 'bg-black/30 border border-white/5 text-gray-200 rounded-tl-none shadow-xl'
                                        }`}>
                                            {msg.text}
                                        </div>
                                        {msg.sender === 'bot' && msg.options && (
                                            <div className="flex flex-wrap gap-2">
                                                {msg.options.map((opt, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleOptionClick(opt.value, opt.label)}
                                                        className="px-3 py-1.5 bg-white/5 hover:bg-red-600 hover:text-white border border-white/10 rounded-xl text-xs transition-all duration-300 font-medium"
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                        <div className="p-6 border-t border-white/5 bg-white/1">
                            <form onSubmit={handleSend} className="relative flex gap-2">
                                <input
                                    className="w-full p-4 pr-14 rounded-2xl bg-black/40 border border-white/5 text-xs text-white focus:outline-none focus:border-red-500 transition-all placeholder-gray-500"
                                    placeholder="Ask anything..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-2 p-2 rounded-xl bg-red-600 text-white hover:bg-red-500 transition-colors"
                                    disabled={!input.trim()}
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* WORKSPACE AREA: AI Autonomous Agent Terminal Mode */}
                {agentMode && (
                    <div className="flex-1 flex flex-col overflow-hidden h-full">
                        
                        {/* Terminal Screen log */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
                            {agentLogs.map((log, idx) => {
                                if (log.type === 'system') {
                                    return (
                                        <div key={idx} className="text-gray-500 flex items-center gap-1.5">
                                            <Terminal size={12} /> {log.text}
                                        </div>
                                    );
                                }
                                if (log.type === 'success') {
                                    return (
                                        <div key={idx} className="text-green-400 flex items-center gap-1.5">
                                            <CheckCircle size={12} /> {log.text}
                                        </div>
                                    );
                                }
                                if (log.type === 'user') {
                                    return (
                                        <div key={idx} className="text-right text-red-400 font-bold">
                                            ➜ {log.text}
                                        </div>
                                    );
                                }
                                if (log.type === 'bot') {
                                    return (
                                        <div key={idx} className="p-4 bg-red-950/10 border border-red-500/20 rounded-2xl font-sans text-gray-200 mt-2 leading-relaxed">
                                            {log.text}
                                        </div>
                                    );
                                }
                                if (log.type === 'action') {
                                    const action = log.data;
                                    return (
                                        <div key={idx} className="p-4 bg-black/50 border border-white/5 rounded-2xl text-gray-300 space-y-1 relative overflow-hidden group">
                                            <div className="absolute right-3 top-3 w-6 h-6 rounded-full bg-red-600/10 flex items-center justify-center text-[10px] text-red-500 font-bold border border-red-500/20">
                                                ⚙️
                                            </div>
                                            <div className="text-red-400 font-black">→ ACTION : {action.action}</div>
                                            <div className="text-gray-400 font-semibold">→ DÉTAILS :</div>
                                            <pre className="text-[10px] text-gray-500 bg-white/2 p-2.5 rounded-lg border border-white/5 whitespace-pre-wrap">{action.details}</pre>
                                            <div className="flex items-center gap-1 text-[11px] font-bold mt-2">
                                                <span>→ ATTENTE CONFIRMATION :</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${action.waiting === 'oui' ? 'bg-yellow-500/15 text-yellow-500' : 'bg-green-500/15 text-green-400'}`}>
                                                    {action.waiting}
                                                </span>
                                            </div>

                                            {/* Render active confirmation button sheet (Rule 2 Confirmation Hook) */}
                                            {action.waiting === 'oui' && pendingAction && pendingAction.action === action.action && (
                                                <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                                                    <button
                                                        onClick={() => action.onConfirm()}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                                                    >
                                                        ✅ Confirmer l'action
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setPendingAction(null);
                                                            setAgentLogs(prev => [...prev, { type: 'system', text: '❌ Action annulée par l\'utilisateur.' }]);
                                                        }}
                                                        className="px-4 py-2 bg-white/5 hover:bg-red-600 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border border-white/5"
                                                    >
                                                        ❌ Annuler
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                                return null;
                            })}
                            <div ref={bottomRef} />
                        </div>

                        {/* Interactive LLM Prompt Form */}
                        <div className="p-4 sm:p-6 border-t border-white/5 bg-white/1">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                                <Sparkles size={12} className="text-red-500" /> Parlez à votre Agent Autonome (LLM Simulé) :
                            </h4>
                            <form onSubmit={handleAgentSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={agentInput}
                                    onChange={(e) => setAgentInput(e.target.value)}
                                    disabled={!!pendingAction}
                                    placeholder="Ex: Réserve un train depuis Tanger, un hôtel à Casa et un taxi..."
                                    className="flex-1 bg-black/40 border border-white/5 hover:border-white/10 focus:border-red-500 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!!pendingAction || !agentInput.trim()}
                                    className="px-5 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-red-600/20"
                                >
                                    <Send size={16} />
                                </button>
                            </form>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="text-[9px] text-gray-500">Suggestions rapides :</span>
                                <button onClick={() => setAgentInput('Je veux acheter le maillot du Maroc')} className="text-[9px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-gray-300 transition-colors">👕 Maillot Maroc</button>
                                <button onClick={() => setAgentInput('Réserve un billet pour Maroc-Portugal et un taxi')} className="text-[9px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-gray-300 transition-colors">🎟️ Billet + Taxi</button>
                                <button onClick={() => setAgentInput('Je prends le train pour Casa, trouve un hôtel et un taxi')} className="text-[9px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-gray-300 transition-colors">🚆 Train + Hôtel</button>
                            </div>
                        </div>

                    </div>
                )}

            </div>

        </div>
    );
}

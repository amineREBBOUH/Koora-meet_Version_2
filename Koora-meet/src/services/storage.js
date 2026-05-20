/**
 * Simulated Backend Service using localStorage
 * NO EXTERNAL DATABASE REQUIRED - Runs 100% in the browser
 */

const KEYS = {
  USERS: 'koora_users',
  CURRENT_USER: 'koora_current_user',
  GROUPS: 'koora_groups',
  MESSAGES: 'koora_messages',
  CHATBOT_SESSIONS: 'koora_chatbot_sessions',
  POSTS: 'koora_posts',
  TICKETS: 'koora_tickets',
  AUTOMATIONS: 'koora_automations',
};

// Helper for safe JSON parsing
const safeParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error parsing ${key}, resetting to fallback.`, e);
    localStorage.removeItem(key);
    return fallback;
  }
};

// --- DATA INITIALIZATION ---
export const initStorage = () => {
  if (!localStorage.getItem(KEYS.USERS)) localStorage.setItem(KEYS.USERS, JSON.stringify([]));
  if (!localStorage.getItem(KEYS.GROUPS)) localStorage.setItem(KEYS.GROUPS, JSON.stringify([]));
  if (!localStorage.getItem(KEYS.MESSAGES)) localStorage.setItem(KEYS.MESSAGES, JSON.stringify([]));
  if (!localStorage.getItem(KEYS.POSTS)) localStorage.setItem(KEYS.POSTS, JSON.stringify([]));
  if (!localStorage.getItem(KEYS.AUTOMATIONS)) localStorage.setItem(KEYS.AUTOMATIONS, JSON.stringify([]));
};

// Ensure storage is initialized on load
initStorage();

// --- AUTH SERVICE ---
export const AuthService = {
  register: async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = safeParse(KEYS.USERS, []);
        if (users.find(u => u.email === userData.email)) {
          return reject(new Error('Cet email est déjà utilisé.'));
        }

        const newUser = {
          id: crypto.randomUUID(),
          ...userData,
          role: 'user',
          isVerified: true, // Auto-verify for local storage mode
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
        
        // Auto-login after register
        localStorage.setItem('koora_token', 'local-token-' + newUser.id);
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(newUser));
        
        resolve({ message: 'Inscription réussie !', user: newUser });
      }, 500); // Simulate network delay
    });
  },

  verifyEmail: async (token) => {
    return { message: "Compte activé (Mode Local)" };
  },

  forgotPassword: async (email) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = safeParse(KEYS.USERS, []);
        if (!users.find(u => u.email === email)) {
          return reject(new Error('Aucun compte trouvé avec cet e-mail.'));
        }
        resolve({ message: 'Lien envoyé (Mode Local)' });
      }, 500);
    });
  },

  resetPassword: async (token, password) => {
    return { message: 'Mot de passe mis à jour (Mode Local)' };
  },

  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock account fallback
        if (email === 'test@koora.com' && password === 'admin2030') {
          const mockUser = { id: 'mock-123', nom: 'Test', prenom: 'Admin', email: 'test@koora.com', equipe: 'Maroc', role: 'admin' };
          localStorage.setItem('koora_token', 'mock-token-123');
          localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(mockUser));
          return resolve(mockUser);
        }

        const users = safeParse(KEYS.USERS, []);
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
          return reject(new Error('Email ou mot de passe incorrect'));
        }

        localStorage.setItem('koora_token', 'local-token-' + user.id);
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
        resolve(user);
      }, 500);
    });
  },

  logout: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
    localStorage.removeItem('koora_token');
  },

  getCurrentUser: () => {
    const user = safeParse(KEYS.CURRENT_USER, null);
    return (user && typeof user === 'object') ? user : null;
  },

  updateProfile: (updatedData) => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) throw new Error("Non connecté");

    const users = safeParse(KEYS.USERS, []);
    const index = users.findIndex(u => u.id === currentUser.id);

    if (index !== -1) {
      const updatedUser = { ...users[index], ...updatedData };
      users[index] = updatedUser;
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updatedUser)); // Update session too
      return updatedUser;
    }
    return currentUser;
  },

  getAllUsers: () => safeParse(KEYS.USERS, []),
  
  deleteUser: (userId) => {
    let users = safeParse(KEYS.USERS, []);
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }
};

// --- GROUP SERVICE ---
export const GroupService = {
  createGroup: async (groupData) => {
    const currentUser = AuthService.getCurrentUser();
    const groups = safeParse(KEYS.GROUPS, []);
    const newGroup = {
      id: crypto.randomUUID(),
      ...groupData,
      creatorId: currentUser.id,
      creatorName: `${currentUser.prenom} ${currentUser.nom}`,
      participants: [currentUser.id],
      createdAt: new Date().toISOString()
    };
    groups.push(newGroup);
    localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
    return newGroup;
  },

  getAllGroups: async () => {
    return safeParse(KEYS.GROUPS, []);
  },

  joinGroup: async (groupId) => {
    const currentUser = AuthService.getCurrentUser();
    const groups = safeParse(KEYS.GROUPS, []);
    const group = groups.find(g => g.id === groupId);
    
    if (!group) throw new Error("Group not found");
    if (group.participants.includes(currentUser.id)) throw new Error("Already a member");
    if (group.participants.length >= group.maxParticipants) throw new Error("Group is full");
    
    group.participants.push(currentUser.id);
    localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
    return group;
  },

  leaveGroup: (groupId) => {
    const currentUser = AuthService.getCurrentUser();
    const groups = safeParse(KEYS.GROUPS, []);
    const index = groups.findIndex(g => g.id === groupId);

    if (index === -1) throw new Error("Groupe non trouvé");

    groups[index].participants = groups[index].participants.filter(id => id !== currentUser.id);
    localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
  },

  kickMember: (groupId, userId) => {
    const groups = safeParse(KEYS.GROUPS, []);
    const index = groups.findIndex(g => g.id === groupId);
    if (index === -1) throw new Error("Group not found");

    groups[index].participants = groups[index].participants.filter(id => id !== userId);
    localStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
  }
};

// --- POST SERVICE ---
export const PostService = {
  createPost: async (text, image = null) => {
    const currentUser = AuthService.getCurrentUser();
    const posts = safeParse(KEYS.POSTS, []);
    const newPost = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      userName: currentUser.prenom + ' ' + currentUser.nom,
      userPhoto: currentUser.photo,
      text,
      image,
      likes: [],
      comments: [],
      status: 'pending', // Added moderation status
      createdAt: new Date().toISOString()
    };
    posts.unshift(newPost);
    localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    return newPost;
  },

  getAllPosts: async () => {
    return safeParse(KEYS.POSTS, []);
  },

  getApprovedPosts: async () => {
    const posts = safeParse(KEYS.POSTS, []);
    return posts.filter(p => p.status === 'approved' || !p.status); // Fallback for old posts
  },

  getPendingPosts: () => {
    const posts = safeParse(KEYS.POSTS, []);
    return posts.filter(p => p.status === 'pending');
  },

  updatePostStatus: (postId, newStatus) => {
    const posts = safeParse(KEYS.POSTS, []);
    const index = posts.findIndex(p => p.id === postId);
    if (index > -1) {
      posts[index].status = newStatus;
      localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
    }
  },

  likePost: async (postId) => {
    const currentUser = AuthService.getCurrentUser();
    const posts = safeParse(KEYS.POSTS, []);
    const post = posts.find(p => p.id === postId);
    
    if (post) {
      const likeIndex = post.likes.indexOf(currentUser.id);
      if (likeIndex === -1) {
        post.likes.push(currentUser.id);
      } else {
        post.likes.splice(likeIndex, 1);
      }
      localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
      return post;
    }
    return null;
  },

  addComment: (postId, text) => {
    const currentUser = AuthService.getCurrentUser();
    const posts = safeParse(KEYS.POSTS, []);
    const post = posts.find(p => p.id === postId);
    
    if (post) {
      post.comments.push({
        id: crypto.randomUUID(),
        userId: currentUser.id,
        userName: currentUser.prenom + ' ' + currentUser.nom,
        text,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
      return post;
    }
    return null;
  }
};

// --- CHAT SERVICE ---
export const ChatService = {
  sendMessage: (roomId, text, senderOverride = null) => {
    const badWords = ['bad', 'hate', 'stupid', 'idiot'];
    const containsBadWord = badWords.some(word => text.toLowerCase().includes(word));
    if (containsBadWord) throw new Error("Message contains inappropriate content.");

    const currentUser = AuthService.getCurrentUser();
    const messages = safeParse(KEYS.MESSAGES, []);
    const sender = senderOverride || { id: currentUser.id, name: currentUser.nom + ' ' + currentUser.prenom };

    const newMessage = {
      id: crypto.randomUUID(),
      roomId,
      senderId: sender.id,
      senderName: sender.name,
      text,
      createdAt: new Date().toISOString()
    };

    messages.push(newMessage);
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
    return newMessage;
  },

  getMessages: (roomId) => {
    const messages = safeParse(KEYS.MESSAGES, []);
    return messages.filter(m => m.roomId === roomId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }
};

// --- SECURITY SERVICE ---
export const SecurityService = {
  blockUser: (userId) => {
    const currentUser = AuthService.getCurrentUser();
    let blocked = safeParse('koora_blocked', {});
    if (!blocked[currentUser.id]) blocked[currentUser.id] = [];
    if (!blocked[currentUser.id].includes(userId)) blocked[currentUser.id].push(userId);
    localStorage.setItem('koora_blocked', JSON.stringify(blocked));
    return true;
  },
  isBlocked: (userId) => {
    const currentUser = AuthService.getCurrentUser();
    let blocked = safeParse('koora_blocked', {});
    return blocked[currentUser.id]?.includes(userId);
  },
  reportUser: (userId, reason) => {
    let reports = safeParse('koora_reports', []);
    reports.push({ reporterId: AuthService.getCurrentUser().id, reportedId: userId, reason, date: new Date().toISOString() });
    localStorage.setItem('koora_reports', JSON.stringify(reports));
    return true;
  }
};

// --- SYSTEM SERVICE ---
export const SystemService = {
  resetApp: () => {
    localStorage.clear();
    window.location.reload();
  }
};

// --- OTHER SERVICES (Mocked for LocalStorage) ---
export const ChatbotService = {
  saveSession: (userId, data) => {
    let sessions = safeParse(KEYS.CHATBOT_SESSIONS, {});
    sessions[userId] = { ...sessions[userId], ...data };
    localStorage.setItem(KEYS.CHATBOT_SESSIONS, JSON.stringify(sessions));
  },
  getSession: (userId) => {
    return safeParse(KEYS.CHATBOT_SESSIONS, {})[userId] || {};
  }
};

export const PredictionService = {
  getPredictions: (userId) => safeParse('koora_predictions', {})[userId] || [],
  submitPrediction: (userId, matchId, homeScore, awayScore) => {
    const all = safeParse('koora_predictions', {});
    if (!all[userId]) all[userId] = [];
    all[userId] = all[userId].filter(p => p.matchId !== matchId);
    all[userId].push({ matchId, homeScore, awayScore, points: 0 });
    localStorage.setItem('koora_predictions', JSON.stringify(all));
  },
  hasPredicted: (userId, matchId) => {
    const userPreds = safeParse('koora_predictions', {})[userId] || [];
    return userPreds.find(p => p.matchId === matchId);
  },
  getLeaderboard: () => [
    { id: 1, name: "Amine M.", points: 120, rank: 1 },
    { id: 2, name: "Sarah K.", points: 115, rank: 2 },
    { id: 3, name: "Youssef B.", points: 98, rank: 3 }
  ]
};

export const CarpoolService = {
  getRides: () => safeParse('koora_rides', [
    { id: 1, driver: "Omar", from: "Casablanca", to: "Tangier", date: "2030-06-14", time: "09:00", price: "150 DH", seats: 2 },
    { id: 2, driver: "Hamza", from: "Casablanca", to: "Grand Stade de Casablanca", date: "Tomorrow", time: "20:30", price: "30 DH", seats: 3 },
    { id: 3, driver: "Sarah", from: "Casablanca", to: "Grand Stade de Casablanca", date: "Tomorrow", time: "21:00", price: "40 DH", seats: 2 },
    { id: 4, driver: "Carlos", from: "Madrid", to: "Santiago Bernabéu, Madrid", date: "2030-06-17", time: "18:00", price: "15 EUR", seats: 4 }
  ]),
  addRide: (ride) => {
    const rides = CarpoolService.getRides();
    rides.push({ ...ride, id: Date.now(), seats: 4 });
    localStorage.setItem('koora_rides', JSON.stringify(rides));
  },
  bookSeat: (rideId) => {
    const rides = CarpoolService.getRides();
    const index = rides.findIndex(r => r.id === rideId);
    if (index !== -1 && rides[index].seats > 0) {
      rides[index].seats -= 1;
      localStorage.setItem('koora_rides', JSON.stringify(rides));
      return true;
    }
    return false;
  }
};

export const UserService = {
  getAllUsers: () => safeParse(KEYS.USERS, []),
  getUserById: (id) => safeParse(KEYS.USERS, []).find(u => u.id === id) || null
};

export const TicketService = {
  getTickets: (userId) => safeParse(KEYS.TICKETS, []).filter(t => t.userId === userId),
  buyTicket: (matchId, categoryId, price) => {
    const currentUser = AuthService.getCurrentUser();
    const tickets = safeParse(KEYS.TICKETS, []);
    const newTicket = { id: crypto.randomUUID(), userId: currentUser.id, matchId, categoryId, price, purchaseDate: new Date().toISOString(), status: 'CONFIRMED' };
    tickets.push(newTicket);
    localStorage.setItem(KEYS.TICKETS, JSON.stringify(tickets));
    return newTicket;
  }
};

export const TravelAutomationService = {
  getAutomations: (userId) => safeParse(KEYS.AUTOMATIONS, []).filter(a => a.userId === userId),
  createAutomation: (matchId, categoryId, transportType, pickupLocation) => {
    const currentUser = AuthService.getCurrentUser();
    const automations = safeParse(KEYS.AUTOMATIONS, []);
    
    // Remove previous automation for same match to prevent duplication
    const filtered = automations.filter(a => !(a.userId === currentUser.id && a.matchId === matchId));
    
    let driver = {};
    if (transportType === 'taxi') {
      driver = {
        name: "Youssef Tazi",
        car: "Dacia Logan (Black)",
        plate: "12345-A-7",
        rating: "4.9",
        phone: "+212 612-345678",
        avatar: "https://i.pravatar.cc/150?img=33"
      };
    } else {
      driver = {
        name: "Hamza Berrada",
        car: "Renault Clio (Red)",
        plate: "98765-B-6",
        rating: "4.8",
        phone: "+212 698-765432",
        avatar: "https://i.pravatar.cc/150?img=11"
      };
    }

    const newAutomation = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      matchId,
      categoryId,
      transportType, // 'taxi' or 'carpool'
      pickupLocation: pickupLocation || "Casablanca Center",
      driver,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    filtered.push(newAutomation);
    localStorage.setItem(KEYS.AUTOMATIONS, JSON.stringify(filtered));

    // Send visual in-app notification
    NotificationService.notify(
      currentUser.id,
      "🤖 Smart Automation Travel Active",
      `Your taxi/ride to World Cup match is booked with driver ${driver.name} (${driver.car})!`,
      "success"
    );

    return newAutomation;
  },
  cancelAutomation: (id) => {
    const automations = safeParse(KEYS.AUTOMATIONS, []);
    const filtered = automations.filter(a => a.id !== id);
    localStorage.setItem(KEYS.AUTOMATIONS, JSON.stringify(filtered));
    return true;
  }
};

export const FriendService = {
  getFriends: (userId) => {
    const friendIds = safeParse('koora_friends', {})[userId] || [];
    return UserService.getAllUsers().filter(u => friendIds.includes(u.id));
  },
  sendRequest: (fromId, toId) => {
    if (fromId === toId) throw new Error("Cannot add yourself");
    let requests = safeParse('koora_friend_requests', []);
    if (requests.find(r => r.from === fromId && r.to === toId && r.status === 'pending')) throw new Error("Request already sent");
    requests.push({ id: Date.now(), from: fromId, to: toId, status: 'pending', date: new Date().toISOString() });
    localStorage.setItem('koora_friend_requests', JSON.stringify(requests));
  },
  getRequests: (userId) => {
    const myRequests = safeParse('koora_friend_requests', []).filter(r => r.to === userId && r.status === 'pending');
    const allUsers = UserService.getAllUsers();
    return myRequests.map(req => {
      const sender = allUsers.find(u => u.id === req.from);
      return { ...req, senderName: sender ? sender.nom : 'Unknown', senderPhoto: sender ? sender.photo : null };
    });
  },
  acceptRequest: (requestId) => {
    let requests = safeParse('koora_friend_requests', []);
    const index = requests.findIndex(r => r.id === requestId);
    if (index !== -1) {
      requests[index].status = 'accepted';
      localStorage.setItem('koora_friend_requests', JSON.stringify(requests));
      const { from, to } = requests[index];
      let friends = safeParse('koora_friends', {});
      if (!friends[from]) friends[from] = [];
      if (!friends[to]) friends[to] = [];
      if (!friends[from].includes(to)) friends[from].push(to);
      if (!friends[to].includes(from)) friends[to].push(from);
      localStorage.setItem('koora_friends', JSON.stringify(friends));
    }
  },
  refuseRequest: (requestId) => {
    const newRequests = safeParse('koora_friend_requests', []).filter(r => r.id !== requestId);
    localStorage.setItem('koora_friend_requests', JSON.stringify(newRequests));
  },
  removeFriend: (myId, friendId) => {
    let friends = safeParse('koora_friends', {});
    if (friends[myId]) friends[myId] = friends[myId].filter(id => id !== friendId);
    if (friends[friendId]) friends[friendId] = friends[friendId].filter(id => id !== myId);
    localStorage.setItem('koora_friends', JSON.stringify(friends));
  }
};

export const NotificationService = {
  getNotifications: (userId) => safeParse('koora_notifications', {})[userId] || [],
  notify: (userId, title, message, type = 'info') => {
    let all = safeParse('koora_notifications', {});
    if (!all[userId]) all[userId] = [];
    all[userId].unshift({ id: Date.now(), title, message, type, read: false, date: new Date().toISOString() });
    all[userId] = all[userId].slice(0, 20);
    localStorage.setItem('koora_notifications', JSON.stringify(all));
  },
  markRead: (userId) => {
    let all = safeParse('koora_notifications', {});
    if (all[userId]) {
      all[userId] = all[userId].map(n => ({ ...n, read: true }));
      localStorage.setItem('koora_notifications', JSON.stringify(all));
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// AGENT TOOL SERVICE  –  implements all 7 autonomous-agent tools
// Each function simulates a real backend call and persists to localStorage.
// ─────────────────────────────────────────────────────────────────────────────
export const AgentToolService = {

  /** Rule 1 – always first (Now uses real Browser Geolocation & Reverse Geocoding) */
  get_location: async () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const fallback = { city: 'Casablanca', country: 'Maroc', lat: 33.5731, lng: -7.5898, label: 'Casablanca (GPS non supporté)', timestamp: new Date().toISOString() };
        localStorage.setItem('koora_agent_location', JSON.stringify(fallback));
        resolve(fallback);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          try {
            // Reverse Geocoding using OpenStreetMap (Nominatim API - Free)
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.state || 'Localisation';
            const country = data.address?.country || '';
            const locationData = {
              city, country, lat, lng,
              label: `${city}, ${country} (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
              timestamp: new Date().toISOString()
            };
            localStorage.setItem('koora_agent_location', JSON.stringify(locationData));
            resolve(locationData);
          } catch (e) {
            // Fallback if API fails but we have coords
            const fb = { city: 'Inconnu', country: '', lat, lng, label: `Position GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`, timestamp: new Date().toISOString() };
            localStorage.setItem('koora_agent_location', JSON.stringify(fb));
            resolve(fb);
          }
        },
        (err) => {
          console.error("GPS Error:", err);
          // Fallback if user denies location permission
          const fallback = { city: 'Casablanca', country: 'Maroc', lat: 33.5731, lng: -7.5898, label: 'Casablanca (Position simulée par défaut)', timestamp: new Date().toISOString() };
          localStorage.setItem('koora_agent_location', JSON.stringify(fallback));
          resolve(fallback);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  },

  getLastLocation: () => safeParse('koora_agent_location', null),

  /** Rule 3 – notify at every key step */
  send_private_message: (contact, message) => {
    const currentUser = AuthService.getCurrentUser();
    const key = 'koora_agent_messages';
    let msgs = safeParse(key, []);
    const entry = {
      id: Date.now(),
      from: 'AI Agent',
      to: contact,
      message,
      read: false,
      timestamp: new Date().toISOString()
    };
    msgs.unshift(entry);
    msgs = msgs.slice(0, 50);
    localStorage.setItem(key, JSON.stringify(msgs));
    // also push as a platform notification
    if (currentUser) {
      NotificationService.notify(currentUser.id, '📩 Message Agent', message, 'info');
    }
    return entry;
  },

  getAgentMessages: () => safeParse('koora_agent_messages', []),
  markAgentMessagesRead: () => {
    const msgs = safeParse('koora_agent_messages', []).map(m => ({ ...m, read: true }));
    localStorage.setItem('koora_agent_messages', JSON.stringify(msgs));
  },

  /** Book a taxi and create a TravelAutomation record */
  book_taxi: (pickup, destination, time) => {
    const currentUser = AuthService.getCurrentUser();
    const drivers = [
      { name: 'Youssef Tazi',   car: 'Dacia Logan (Black)',  plate: '12345-A-7', rating: '4.9', phone: '+212 612-345678', avatar: 'https://i.pravatar.cc/150?img=33' },
      { name: 'Hamza Berrada',  car: 'Renault Clio (Red)',   plate: '98765-B-6', rating: '4.8', phone: '+212 698-765432', avatar: 'https://i.pravatar.cc/150?img=11' },
      { name: 'Khalid Mansour', car: 'Peugeot 508 (White)',  plate: '55432-C-9', rating: '5.0', phone: '+212 661-234567', avatar: 'https://i.pravatar.cc/150?img=52' },
    ];
    const driver = drivers[Math.floor(Math.random() * drivers.length)];
    const otp = 'KK-' + Math.floor(1000 + Math.random() * 9000);

    const booking = {
      id: crypto.randomUUID(),
      userId: currentUser?.id,
      type: 'taxi',
      pickup, destination, time,
      driver, otp,
      status: 'CONFIRMED',
      phase: 'approaching', // approaching | arrived | en_route | at_venue
      createdAt: new Date().toISOString()
    };

    const key = 'koora_agent_taxi_bookings';
    const all = safeParse(key, []);
    all.unshift(booking);
    localStorage.setItem(key, JSON.stringify(all));

    // mirror into TravelAutomations so Dashboard card appears
    const automations = safeParse(KEYS.AUTOMATIONS, []);
    automations.unshift({
      id: booking.id,
      userId: currentUser?.id,
      matchId: 1,
      categoryId: 1,
      transportType: 'taxi',
      pickupLocation: pickup,
      driver,
      otp,
      status: 'CONFIRMED',
      createdAt: booking.createdAt
    });
    localStorage.setItem(KEYS.AUTOMATIONS, JSON.stringify(automations));

    if (currentUser) {
      NotificationService.notify(currentUser.id, '🚕 Taxi Réservé', `Chauffeur ${driver.name} confirmé. OTP: ${otp}`, 'success');
    }
    AgentToolService.send_private_message('Utilisateur', `🚕 Taxi VIP réservé avec ${driver.name} (${driver.car}). OTP de sécurité : ${otp}. Départ : ${time}`);
    return booking;
  },

  getTaxiBookings: (userId) => safeParse('koora_agent_taxi_bookings', []).filter(b => !userId || b.userId === userId),

  /** Book a hotel */
  book_hotel: (city, checkin, checkout, guests, budget) => {
    const currentUser = AuthService.getCurrentUser();
    const hotels = [
      { name: 'Atlas View Casablanca', stars: 5, address: 'Boulevard Mohammed V, Casablanca', ref: 'HT-' + Math.floor(1000 + Math.random() * 9000) },
      { name: 'Kenzi Tower Hotel',     stars: 5, address: 'Place Nations Unies, Casablanca',   ref: 'HT-' + Math.floor(1000 + Math.random() * 9000) },
      { name: 'Golden Tulip',          stars: 4, address: 'Rue de l\'Eglise, Casablanca',       ref: 'HT-' + Math.floor(1000 + Math.random() * 9000) },
    ];
    const hotel = hotels[Math.floor(Math.random() * hotels.length)];

    const booking = {
      id: crypto.randomUUID(),
      userId: currentUser?.id,
      type: 'hotel',
      city, checkin, checkout, guests, budget,
      hotel,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    const key = 'koora_agent_hotel_bookings';
    const all = safeParse(key, []);
    all.unshift(booking);
    localStorage.setItem(key, JSON.stringify(all));

    if (currentUser) {
      NotificationService.notify(currentUser.id, '🏨 Hôtel Réservé', `${hotel.name} – ${checkin} → ${checkout}`, 'success');
    }
    AgentToolService.send_private_message('Utilisateur', `🏨 Réservation confirmée : ${hotel.name} (${hotel.stars}★) du ${checkin} au ${checkout}. Réf : ${hotel.ref}`);
    return booking;
  },

  getHotelBookings: (userId) => safeParse('koora_agent_hotel_bookings', []).filter(b => !userId || b.userId === userId),

  /** Buy a ticket and persist via TicketService */
  buy_ticket: (event, date, quantity, category) => {
    const currentUser = AuthService.getCurrentUser();
    const ref = 'WC30-' + event.replace(/\s/g, '').slice(0, 6).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
    const ticket = TicketService.buyTicket(1, category, '2000 DH');

    const booking = {
      id: ticket.id,
      userId: currentUser?.id,
      type: 'ticket',
      event, date, quantity, category,
      ref,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    const key = 'koora_agent_ticket_bookings';
    const all = safeParse(key, []);
    all.unshift(booking);
    localStorage.setItem(key, JSON.stringify(all));

    if (currentUser) {
      NotificationService.notify(currentUser.id, '🎟️ Billet Acheté', `${event} – ${category}. Réf: ${ref}`, 'success');
    }
    AgentToolService.send_private_message('Utilisateur', `🎟️ Billet confirmé : ${event} (${category}). Réf : ${ref}`);
    return booking;
  },

  getTicketBookings: (userId) => safeParse('koora_agent_ticket_bookings', []).filter(b => !userId || b.userId === userId),

  /** Search fan store */
  search_fan_store: (team, item_type) => {
    const catalogue = {
      'Maroc': {
        'Jersey': [
          { id: 'jersey_morocco_2030_home', name: 'Maillot Domicile Maroc 2030', price: '450 DH', sizes: ['S','M','L','XL','XXL'], img: 'https://i.pravatar.cc/150?img=60' },
          { id: 'jersey_morocco_2030_away', name: 'Maillot Extérieur Maroc 2030', price: '450 DH', sizes: ['S','M','L','XL'],      img: 'https://i.pravatar.cc/150?img=61' },
        ],
        'Scarf': [
          { id: 'scarf_morocco_2030', name: 'Écharpe Officielle Lions de l\'Atlas', price: '120 DH', sizes: ['Unique'], img: 'https://i.pravatar.cc/150?img=62' },
        ]
      }
    };
    return catalogue[team]?.[item_type] || [{ id: 'generic_001', name: `${team} ${item_type}`, price: '300 DH', sizes: ['M','L'] }];
  },

  /** Purchase item */
  purchase_item: (item_id, size, quantity, address) => {
    const currentUser = AuthService.getCurrentUser();
    const ref = 'SHOP-' + item_id.slice(0, 6).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);

    const order = {
      id: crypto.randomUUID(),
      userId: currentUser?.id,
      type: 'shop',
      item_id, size, quantity, address,
      ref,
      status: 'PROCESSING',
      estimatedDelivery: '3-5 jours ouvrés',
      createdAt: new Date().toISOString()
    };

    const key = 'koora_agent_shop_orders';
    const all = safeParse(key, []);
    all.unshift(order);
    localStorage.setItem(key, JSON.stringify(all));

    if (currentUser) {
      NotificationService.notify(currentUser.id, '🛍️ Commande Validée', `Article ${item_id}. Réf : ${ref}`, 'success');
    }
    AgentToolService.send_private_message('Utilisateur', `🛍️ Commande confirmée ! Réf : ${ref}. Livraison estimée : ${order.estimatedDelivery} à ${address}`);
    return order;
  },

  getShopOrders: (userId) => safeParse('koora_agent_shop_orders', []).filter(o => !userId || o.userId === userId),

  /** Book a train */
  book_train: (origin, destination, date, time, classType) => {
    const currentUser = AuthService.getCurrentUser();
    const trains = [
      { type: 'Al Boraq (TGV)', number: 'B-' + Math.floor(1000 + Math.random() * 9000), duration: '2h10' },
      { type: 'Al Atlas', number: 'A-' + Math.floor(1000 + Math.random() * 9000), duration: '4h30' }
    ];
    const train = trains[0]; // Default to Al Boraq for premium feel
    const ref = 'TRN-' + Math.floor(10000 + Math.random() * 90000);

    const booking = {
      id: crypto.randomUUID(),
      userId: currentUser?.id,
      type: 'train',
      origin, destination, date, time, classType,
      train,
      ref,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    const key = 'koora_agent_train_bookings';
    const all = safeParse(key, []);
    all.unshift(booking);
    localStorage.setItem(key, JSON.stringify(all));

    if (currentUser) {
      NotificationService.notify(currentUser.id, '🚆 Train Réservé', `${origin} → ${destination} à ${time}`, 'success');
    }
    AgentToolService.send_private_message('Utilisateur', `🚆 Billet de train confirmé : ${origin} vers ${destination} (${train.type}). Départ à ${time}. Réf: ${ref}`);
    return booking;
  },

  getTrainBookings: (userId) => safeParse('koora_agent_train_bookings', []).filter(b => !userId || b.userId === userId),

  /** All agent history combined */
  getFullHistory: (userId) => {
    const taxis   = AgentToolService.getTaxiBookings(userId);
    const hotels  = AgentToolService.getHotelBookings(userId);
    const tickets = AgentToolService.getTicketBookings(userId);
    const orders  = AgentToolService.getShopOrders(userId);
    const trains  = AgentToolService.getTrainBookings(userId);
    return [...taxis, ...hotels, ...tickets, ...orders, ...trains].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /** For Admin */
  getAllGlobalBookings: () => {
    const taxis = safeParse('koora_agent_taxi_bookings', []);
    const hotels = safeParse('koora_agent_hotel_bookings', []);
    const tickets = safeParse('koora_agent_ticket_bookings', []);
    const trains = safeParse('koora_agent_train_bookings', []);
    return [...taxis, ...hotels, ...tickets, ...trains].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STORE SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export const StoreService = {
  getProducts: () => {
    const defaultProducts = [
      { id: 'jersey_morocco_2030_home', name: 'Maillot Domicile Maroc 2030', price: 450, category: 'Jersey', team: 'Maroc', img: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&q=80', badge: 'New' },
      { id: 'jersey_morocco_2030_away', name: 'Maillot Extérieur Maroc 2030', price: 450, category: 'Jersey', team: 'Maroc', img: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=500&q=80' },
      { id: 'scarf_morocco_2030', name: 'Écharpe Lions de l\'Atlas', price: 120, category: 'Scarf', team: 'Maroc', img: 'https://images.unsplash.com/photo-1600181516264-3ea807ff44b9?w=500&q=80' },
      { id: 'jersey_spain_2030', name: 'Maillot Domicile Espagne 2030', price: 500, category: 'Jersey', team: 'Espagne', img: 'https://images.unsplash.com/photo-1551280857-2b9ebf2fa20c?w=500&q=80' },
      { id: 'jersey_portugal_2030', name: 'Maillot Domicile Portugal 2030', price: 500, category: 'Jersey', team: 'Portugal', img: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=500&q=80' }
    ];
    let products = safeParse('koora_store_products', null);
    if (!products) {
      localStorage.setItem('koora_store_products', JSON.stringify(defaultProducts));
      return defaultProducts;
    }
    return products;
  },
  addProduct: (product) => {
    const products = StoreService.getProducts();
    products.unshift({ id: crypto.randomUUID(), ...product });
    localStorage.setItem('koora_store_products', JSON.stringify(products));
  },
  updateProduct: (id, updatedFields) => {
    const products = StoreService.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index > -1) {
      products[index] = { ...products[index], ...updatedFields };
      localStorage.setItem('koora_store_products', JSON.stringify(products));
    }
  },
  deleteProduct: (id) => {
    let products = StoreService.getProducts();
    products = products.filter(p => p.id !== id);
    localStorage.setItem('koora_store_products', JSON.stringify(products));
  },
  getAllOrders: () => safeParse('koora_store_orders', []),
  getCart: () => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return [];
    return safeParse(`koora_cart_${currentUser.id}`, []);
  },
  addToCart: (product, size, quantity = 1) => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return;
    const cart = StoreService.getCart();
    const existing = cart.find(item => item.product.id === product.id && item.size === size);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: crypto.randomUUID(), product, size, quantity });
    }
    localStorage.setItem(`koora_cart_${currentUser.id}`, JSON.stringify(cart));
  },
  removeFromCart: (cartItemId) => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return;
    const cart = StoreService.getCart().filter(item => item.id !== cartItemId);
    localStorage.setItem(`koora_cart_${currentUser.id}`, JSON.stringify(cart));
  },
  clearCart: () => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return;
    localStorage.removeItem(`koora_cart_${currentUser.id}`);
  },
  checkout: (address) => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return null;
    const cart = StoreService.getCart();
    if (cart.length === 0) return null;

    let total = 0;
    cart.forEach(item => total += item.product.price * item.quantity);

    const ref = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const order = {
      id: crypto.randomUUID(),
      userId: currentUser.id,
      items: cart,
      total,
      address,
      ref,
      status: 'PROCESSING',
      estimatedDelivery: '3-5 jours ouvrés',
      createdAt: new Date().toISOString()
    };

    const key = 'koora_store_orders';
    const all = safeParse(key, []);
    all.unshift(order);
    localStorage.setItem(key, JSON.stringify(all));

    StoreService.clearCart();

    NotificationService.notify(currentUser.id, '🛍️ Commande Validée', `Réf : ${ref}. Total: ${total} DH`, 'success');
    return order;
  },
  getOrders: () => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return [];
    return safeParse('koora_store_orders', []).filter(o => o.userId === currentUser.id);
  }
};


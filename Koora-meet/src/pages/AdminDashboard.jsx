import React, { useState, useEffect } from 'react';
import { AuthService, StoreService, AgentToolService, PostService } from '../services/storage';
import { Users, ShoppingBag, Calendar, Trash2, Edit, Plus, X, CheckCircle, ShieldAlert, FileText, Clock, Check } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  
  // Product Form Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', price: '', category: 'Jersey', team: '', img: '', badge: ''
  });

  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadData();
    }
  }, [currentUser]);

  const loadData = () => {
    setUsers(AuthService.getAllUsers());
    setProducts(StoreService.getProducts());
    setBookings(AgentToolService.getAllGlobalBookings());
    setPendingPosts(PostService.getPendingPosts());
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  // --- Users Management ---
  const handleDeleteUser = (id) => {
    if (window.confirm("Supprimer cet utilisateur ?")) {
      AuthService.deleteUser(id);
      loadData();
    }
  };

  // --- Product Management (Store CRUD) ---
  const openAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', category: 'Jersey', team: '', img: '', badge: '' });
    setIsProductModalOpen(true);
  };

  const openEditProduct = (p) => {
    setEditingProduct(p.id);
    setProductForm({ ...p });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Supprimer ce produit de la boutique ?")) {
      StoreService.deleteProduct(id);
      loadData();
    }
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      StoreService.updateProduct(editingProduct, productForm);
    } else {
      StoreService.addProduct(productForm);
    }
    setIsProductModalOpen(false);
    loadData();
  };

  return (
    <div className="pb-24 pt-10 max-w-7xl mx-auto px-4">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30">
          <ShieldAlert size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Panneau d'Administration</h1>
          <p className="text-gray-400 text-sm">Gérez les utilisateurs, la boutique et suivez les réservations globales.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-8 border-b border-white/5 pb-4">
        <button onClick={() => setActiveTab('users')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === 'users' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
          <Users size={16} /> Utilisateurs
        </button>
        <button onClick={() => setActiveTab('store')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === 'store' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
          <ShoppingBag size={16} /> Boutique (CRUD)
        </button>
        <button onClick={() => setActiveTab('bookings')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === 'bookings' ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
          <Calendar size={16} /> Réservations Globales
        </button>
        <button onClick={() => setActiveTab('posts')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all ${activeTab === 'posts' ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
          <FileText size={16} /> Modération Posts
          {pendingPosts.length > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{pendingPosts.length}</span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="bg-[var(--bg-card)] border border-white/5 rounded-3xl p-6 min-h-[500px]">
        
        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-4">Comptes Connectés ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs uppercase bg-white/5 text-gray-400">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-xl">Nom / Prénom</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3 text-right rounded-tr-xl">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                      <td className="px-4 py-3 font-bold">{u.nom} {u.prenom}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] uppercase ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 bg-red-600/10 text-red-500 rounded hover:bg-red-600 hover:text-white transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STORE CRUD TAB */}
        {activeTab === 'store' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">Catalogue Fan Store ({products.length})</h2>
              <button onClick={openAddProduct} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-green-600/20">
                <Plus size={14} /> Ajouter un Produit
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-center">
                  <img src={p.img} alt={p.name} className="w-16 h-16 object-cover rounded-xl bg-black/40" />
                  <div className="flex-1">
                    <div className="text-[10px] text-red-400 font-bold uppercase">{p.team} - {p.category}</div>
                    <div className="text-sm font-bold text-white line-clamp-1">{p.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{p.price} DH</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => openEditProduct(p)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"><Edit size={14} /></button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-4">Réservations Globales (Taxis, Hôtels, Trains, Billets)</h2>
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <p className="text-gray-500 text-sm italic">Aucune réservation pour le moment.</p>
              ) : (
                bookings.map(b => (
                  <div key={b.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-black uppercase text-gray-300">{b.type}</span>
                        <span className="text-[10px] text-gray-500 font-mono">Réf: {b.ref}</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {b.type === 'taxi' ? `Taxi: ${b.pickup} → ${b.destination}` : ''}
                        {b.type === 'hotel' ? `Hôtel: ${b.hotel?.name || b.city}` : ''}
                        {b.type === 'train' ? `Train: ${b.origin} → ${b.destination}` : ''}
                        {b.type === 'ticket' ? `Match: ${b.event}` : ''}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Utilisateur ID: {b.userId || 'Inconnu'} • {new Date(b.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold uppercase">
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {/* POSTS MODERATION TAB */}
        {activeTab === 'posts' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-bold text-white">Posts en attente de validation</h2>
              {pendingPosts.length > 0 && (
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-black">
                  {pendingPosts.length} en attente
                </span>
              )}
            </div>

            {pendingPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center opacity-50">
                <Check size={48} className="mb-4 text-green-500" />
                <p className="text-sm font-bold text-gray-400">Tout est à jour ! Aucun post en attente de modération.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPosts.map(post => (
                  <div key={post.id} className="p-5 bg-white/5 border-l-4 border-orange-500 rounded-2xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-black">
                            {post.userName?.[0] || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{post.userName || 'Utilisateur Inconnu'}</p>
                            <p className="text-[10px] text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                          </div>
                          <span className="ml-auto px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-[10px] font-black uppercase flex items-center gap-1">
                            <Clock size={10} /> En attente
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">{post.text}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => { PostService.updatePostStatus(post.id, 'approved'); loadData(); }}
                        className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                      >
                        <Check size={14} /> Approuver & Publier
                      </button>
                      <button
                        onClick={() => { PostService.updatePostStatus(post.id, 'rejected'); loadData(); }}
                        className="flex-1 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      >
                        <X size={14} /> Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)}></div>
          <div className="bg-[var(--bg-dark)] border border-white/10 rounded-3xl w-full max-w-md relative z-10 shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-black text-white">{editingProduct ? 'Modifier le Produit' : 'Ajouter un Produit'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400"><X size={16} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="productForm" onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Nom du produit</label>
                  <input type="text" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-red-500 outline-none" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-400 mb-1">Prix (DH)</label>
                    <input type="number" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-red-500 outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-400 mb-1">Équipe</label>
                    <input type="text" required value={productForm.team} onChange={e => setProductForm({...productForm, team: e.target.value})} placeholder="Ex: Maroc" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-red-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Catégorie</label>
                  <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-red-500 outline-none appearance-none">
                    <option value="Jersey">Maillot (Jersey)</option>
                    <option value="Scarf">Écharpe (Scarf)</option>
                    <option value="Accessories">Accessoires</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">URL Image</label>
                  <input type="url" required value={productForm.img} onChange={e => setProductForm({...productForm, img: e.target.value})} placeholder="https://..." className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-red-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1">Badge (Optionnel)</label>
                  <input type="text" value={productForm.badge} onChange={e => setProductForm({...productForm, badge: e.target.value})} placeholder="Ex: New, Promo..." className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-red-500 outline-none" />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-white/5 bg-black/20">
              <button type="submit" form="productForm" className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2">
                <CheckCircle size={18} /> {editingProduct ? 'Enregistrer les modifications' : 'Créer le produit'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

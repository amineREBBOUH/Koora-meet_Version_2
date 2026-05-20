import React, { useState, useEffect } from 'react';
import { StoreService } from '../services/storage';
import { ShoppingCart, Search, Filter, Shield, Star, CheckCircle, X, ChevronRight, Plus, Minus, CreditCard, ShoppingBag } from 'lucide-react';

export default function FanStore() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [checkoutStep, setCheckoutStep] = useState(0); // 0: closed, 1: address, 2: success

  useEffect(() => {
    setProducts(StoreService.getProducts());
    setCart(StoreService.getCart());
  }, []);

  const refreshCart = () => setCart(StoreService.getCart());

  const handleAddToCart = (product) => {
    StoreService.addToCart(product, 'L', 1);
    refreshCart();
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (itemId) => {
    StoreService.removeFromCart(itemId);
    refreshCart();
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    const address = new FormData(e.target).get('address');
    const order = StoreService.checkout(address);
    if (order) {
      setCheckoutStep(2);
      refreshCart();
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const filteredProducts = products.filter(p => 
    (activeTab === 'All' || p.category === activeTab) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="pb-24 pt-10 max-w-6xl mx-auto px-4">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
            <ShoppingBag size={12} /> Official Store
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Fan <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Boutique</span></h1>
          <p className="text-gray-400 mt-2 max-w-lg">Équipez-vous pour la Coupe du Monde 2030 avec les tenues officielles de vos équipes nationales favorites.</p>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-3 transition-all"
        >
          <ShoppingCart size={18} className="text-red-400" />
          <span className="font-bold text-sm">Panier</span>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[var(--bg-dark)] shadow-lg animate-bounce">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* ── FILTERS ── */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Rechercher un maillot, une équipe..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:border-red-500 focus:outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['All', 'Jersey', 'Scarf', 'Accessories'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── PRODUCT GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="group bg-[var(--bg-card)] border border-white/5 rounded-3xl overflow-hidden hover:border-red-500/30 transition-all shadow-xl hover:shadow-red-500/10">
            {/* Image Box */}
            <div className="relative aspect-square overflow-hidden bg-white/5 p-6 flex items-center justify-center">
              {product.badge && (
                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                  {product.badge}
                </div>
              )}
              <div className="absolute top-4 right-4 z-10">
                <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white/10 transition-all">
                  <Star size={16} />
                </button>
              </div>
              <img src={product.img} alt={product.name} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-700" />
            </div>
            {/* Details */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">{product.team}</p>
                  <h3 className="text-base font-bold text-white mt-1 line-clamp-1">{product.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-white">{product.price} <span className="text-[10px] text-gray-500 uppercase">DH</span></span>
                </div>
              </div>
              <button 
                onClick={() => handleAddToCart(product)}
                className="w-full mt-4 py-3 bg-white/5 hover:bg-red-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all border border-white/5 hover:border-red-500 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-red-600/20"
              >
                <ShoppingBag size={14} /> Ajouter au panier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── CART SLIDEOUT ── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-[var(--bg-dark)] h-full border-l border-white/10 flex flex-col shadow-2xl animate-slide-left">
            
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-black text-white flex items-center gap-3">
                <ShoppingCart className="text-red-500" /> Votre Panier
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                  <ShoppingBag size={48} className="mb-4 text-gray-500" />
                  <p className="text-sm font-bold text-gray-400">Votre panier est vide</p>
                </div>
              ) : checkoutStep === 0 ? (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4 p-4 bg-[var(--bg-card)] border border-white/5 rounded-2xl">
                    <img src={item.product.img} alt="" className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{item.product.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">Taille: {item.size}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-black text-red-400">{item.product.price} DH</span>
                        <div className="flex items-center gap-3 bg-white/5 rounded-lg px-2 py-1">
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveFromCart(item.id)} className="text-gray-500 hover:text-red-500 p-1 self-start">
                      <X size={16} />
                    </button>
                  </div>
                ))
              ) : checkoutStep === 1 ? (
                <form id="checkoutForm" onSubmit={handleCheckout} className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-red-950/20 border border-red-500/20 rounded-2xl mb-4">
                    <p className="text-xs text-red-300 font-bold flex items-center gap-2"><Shield size={14} /> Paiement 100% Sécurisé (Chiffrement SSL 256 bits)</p>
                  </div>
                  
                  <div className="space-y-3 bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2"><ShoppingBag size={14} className="text-red-500" /> Livraison</h4>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">Adresse complète</label>
                      <textarea name="address" required className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-red-500 outline-none transition-all" rows="2" placeholder="N° rue, Bâtiment, Quartier, Ville..."></textarea>
                    </div>
                  </div>

                  <div className="space-y-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2"><CreditCard size={14} className="text-red-500" /> Carte Bancaire</h4>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">Titulaire de la carte</label>
                      <input type="text" required placeholder="Nom figurant sur la carte" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-red-500 outline-none transition-all" />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">Numéro de carte</label>
                      <div className="relative">
                        <input type="text" required maxLength="19" placeholder="0000 0000 0000 0000" className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 p-3 text-xs text-white font-mono focus:border-red-500 outline-none transition-all tracking-widest" />
                        <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Date d'expiration</label>
                        <input type="text" required maxLength="5" placeholder="MM/AA" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white font-mono text-center focus:border-red-500 outline-none transition-all" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">CVC / CVV</label>
                        <input type="text" required maxLength="4" placeholder="123" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white font-mono text-center focus:border-red-500 outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
                  <div className="w-20 h-20 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Commande Validée !</h3>
                  <p className="text-sm text-gray-400 mb-8">Votre commande a été traitée avec succès. Vous pouvez suivre la livraison dans l'espace SAV.</p>
                  <a href="/support" className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold transition-colors">
                    Suivre ma commande
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && checkoutStep < 2 && (
              <div className="p-6 border-t border-white/5 bg-[var(--bg-card)]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400 text-sm font-bold">Total TTC</span>
                  <span className="text-2xl font-black text-white">{cartTotal} <span className="text-sm text-gray-500">DH</span></span>
                </div>
                {checkoutStep === 0 ? (
                  <button onClick={() => setCheckoutStep(1)} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-wider text-sm transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2">
                    Passer la commande <ChevronRight size={18} />
                  </button>
                ) : (
                  <button type="submit" form="checkoutForm" className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black uppercase tracking-wider text-sm transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2">
                    Payer {cartTotal} DH <CheckCircle size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

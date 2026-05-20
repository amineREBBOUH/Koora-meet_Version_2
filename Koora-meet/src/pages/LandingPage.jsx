import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/UI';
import { Bot, Users, Ticket, Trophy, Sparkles, ChevronRight, MapPin, Search } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-dark)] font-sans overflow-x-hidden">
            {/* --- Navigation --- */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-dark)]/50 backdrop-blur-xl border-b border-white/5 py-4 px-6 lg:px-12 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-red-600 shadow-lg shadow-red-600/20">
                        <img src="/logo.jpg" alt="Koora Meet" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-[var(--text-primary)]">Koora Meet</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                    <a href="#features" className="hover:text-red-500 transition-colors">Features</a>
                    <a href="#teams" className="hover:text-red-500 transition-colors">Teams</a>
                    <a href="#stats" className="hover:text-red-500 transition-colors">Stats</a>
                </div>
                <div className="flex gap-4">
                    <Link to="/login">
                        <button className="px-6 py-2.5 rounded-full font-bold text-sm text-gray-300 hover:text-white transition-colors">Log In</button>
                    </Link>
                    <Link to="/register">
                        <Button variant="primary" className="!w-auto px-6 py-2.5 !text-sm">Get Started</Button>
                    </Link>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <section className="relative min-h-screen flex items-center justify-center pt-24 px-6">
                {/* Background Decor */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-transparent to-transparent opacity-50"></div>
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-red-600/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-red-900/20 rounded-full blur-[120px]"></div>

                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 text-red-500 border border-red-600/20 text-xs font-bold uppercase tracking-wider mb-2">
                            <Sparkles size={14} /> Official FIFA World Cup 2030 Community
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black leading-[1.05] tracking-tight">
                            Vivez le Football <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-800">Sans Limites.</span>
                        </h1>
                        <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Connect with millions of fans across Morocco, Spain, and Portugal.
                            The only social platform dedicated to the World Cup 2030 experience.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                            <Link to="/register">
                                <Button className="h-14 px-10 text-lg group">
                                    Join the Community
                                    <ChevronRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/login">
                                <button className="h-14 px-10 rounded-full border border-white/10 font-bold hover:bg-white/5 transition-all">
                                    Browse Fans
                                </button>
                            </Link>
                        </div>

                        <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-50">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black">100+</span>
                                <span className="text-xs uppercase tracking-widest">Nations</span>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black">1M+</span>
                                <span className="text-xs uppercase tracking-widest">Fans</span>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black">2030</span>
                                <span className="text-xs uppercase tracking-widest">Year</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative hidden lg:block animate-in fade-in slide-in-from-right-12 duration-1000">
                        <div className="relative z-10 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl transform rotate-3 hover:rotate-0 transition-transform duration-700 aspect-[4/5] bg-[var(--bg-card)]">
                            <img
                                src="/landing_hero.jpg"
                                alt="Hakimi and Ziyech"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-dark)] via-transparent to-transparent"></div>

                            {/* Floating Mockup Cards */}
                            <div className="absolute bottom-8 left-8 right-8 space-y-4">
                                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center gap-4 animate-bounce-slow">
                                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
                                        <Users size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Watch Party in Agadir</p>
                                        <p className="text-xs text-gray-400">Join 15 others at the Marina</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center gap-4 translate-x-4">
                                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                                        <Bot size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Koora AI Agent</p>
                                        <p className="text-xs text-gray-400">Tickets found for Cat 3!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative Circle */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-red-600/10 rounded-full -z-10 animate-pulse"></div>
                    </div>
                </div>
            </section>

            {/* --- Features Section --- */}
            <section id="features" className="py-24 px-6 bg-[var(--bg-dark)] border-t border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight">Everything a fan needs.</h2>
                        <p className="text-[var(--text-secondary)] text-lg">Designed for the ultimate 2030 experience across Morocco, Spain, and Portugal.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={Bot}
                            title="Koora Assistant"
                            desc="24/7 AI guide for stadiums, hotels, and travel info."
                            link="/chatbot"
                        />
                        <FeatureCard
                            icon={Users}
                            title="Meet Fans"
                            desc="Find your squad and host watch parties anywhere."
                            link="/search"
                        />
                        <FeatureCard
                            icon={Ticket}
                            title="Official Tickets"
                            desc="Secure your seats for every match safely."
                            link="/tickets"
                        />
                        <FeatureCard
                            icon={Search}
                            title="Find Rides"
                            desc="Carpool with fans and save on travel costs."
                            link="/carpool"
                        />
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="py-12 border-t border-white/5 bg-[var(--bg-dark)]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full border border-red-600" />
                        <span className="font-black text-lg">Koora Meet</span>
                    </div>
                    <div className="flex gap-8 text-sm text-[var(--text-muted)] font-medium">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                    <p className="text-xs text-gray-600">© 2026 Koora Meet. World Cup 2030 Fan Platform.</p>
                </div>
            </footer>
        </div>
    );
}

const FeatureCard = ({ icon: Icon, title, desc, link }) => (
    <div className="group p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-red-600/30 hover:bg-white/10 transition-all duration-500 flex flex-col gap-6 h-full">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500">
            <Icon size={28} />
        </div>
        <div className="space-y-2">
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
        </div>
        <div className="mt-auto pt-4 flex items-center gap-2 text-red-500 text-sm font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Discover <ChevronRight size={14} />
        </div>
    </div>
);


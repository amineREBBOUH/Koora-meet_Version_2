import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/storage';
import { Button, Input } from '../components/UI';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await AuthService.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)] px-4">
            <div className="max-w-md w-full bg-[var(--bg-card)] border border-white/10 p-8 rounded-3xl">
                <button 
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={18} /> Retour
                </button>

                {success ? (
                    <div className="text-center">
                        <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
                        <h2 className="text-2xl font-bold mb-2">E-mail envoyé !</h2>
                        <p className="text-gray-400 mb-6">
                            Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. 
                            Veuillez vérifier votre boîte de réception.
                        </p>
                        <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
                            Retour à la connexion
                        </Button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Mot de passe oublié ?</h2>
                        <p className="text-gray-400 mb-8">
                            Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <Input
                                label="Adresse E-mail"
                                type="email"
                                placeholder="votre@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                variant="primary" 
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                                {!loading && <Mail size={18} className="ml-2" />}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthService } from '../services/storage';
import { Button, Input } from '../components/UI';
import { Lock, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Les mots de passe ne correspondent pas.');
        }

        if (password.length < 6) {
            return setError('Le mot de passe doit faire au moins 6 caractères.');
        }

        setLoading(true);
        try {
            await AuthService.resetPassword(token, password);
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
                {success ? (
                    <div className="text-center">
                        <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
                        <h2 className="text-2xl font-bold mb-2">Mot de passe réinitialisé !</h2>
                        <p className="text-gray-400 mb-6">
                            Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.
                        </p>
                        <Button variant="primary" onClick={() => navigate('/login')} className="w-full">
                            Se connecter
                        </Button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Nouveau mot de passe</h2>
                        <p className="text-gray-400 mb-8">
                            Veuillez choisir un mot de passe fort et facile à retenir.
                        </p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <Input
                                label="Nouveau Mot de passe"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                            <Input
                                label="Confirmer le Mot de passe"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
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
                                {loading ? 'Mise à jour...' : 'Réinitialiser le mot de passe'}
                                {!loading && <Lock size={18} className="ml-2" />}
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

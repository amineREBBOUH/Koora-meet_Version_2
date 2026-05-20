import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthService } from '../services/storage';
import { Button } from '../components/UI';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyEmail() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const data = await AuthService.verifyEmail(token);
                setStatus('success');
                setMessage(data.message);
            } catch (err) {
                setStatus('error');
                setMessage(err.message);
            }
        };
        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)] px-4">
            <div className="max-w-md w-full bg-[var(--bg-card)] border border-white/10 p-8 rounded-3xl text-center">
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader className="animate-spin text-red-500" size={48} />
                        <h2 className="text-xl font-bold">Vérification en cours...</h2>
                        <p className="text-gray-400">Nous activons votre compte Koora Meet.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4">
                        <CheckCircle className="text-green-500" size={64} />
                        <h2 className="text-2xl font-bold">Compte Activé !</h2>
                        <p className="text-gray-400">{message}</p>
                        <Button variant="primary" onClick={() => navigate('/login')} className="mt-4 w-full">
                            Se connecter maintenant
                        </Button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4">
                        <XCircle className="text-red-500" size={64} />
                        <h2 className="text-2xl font-bold">Échec de l'activation</h2>
                        <p className="text-gray-400">{message}</p>
                        <Button variant="outline" onClick={() => navigate('/register')} className="mt-4 w-full">
                            Retour à l'inscription
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

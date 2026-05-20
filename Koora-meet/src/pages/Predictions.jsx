import React, { useState, useEffect } from 'react';
import { AuthService, PredictionService } from '../services/storage';
import { Button } from '../components/UI';
import { Trophy, Award, Target } from 'lucide-react';

export default function Predictions() {
    const user = AuthService.getCurrentUser();
    const [matches, setMatches] = useState([
        { id: 101, home: "Morocco", away: "Portugal", date: "Tomorrow, 22:00" },
        { id: 102, home: "Spain", away: "France", date: "Jun 16, 20:00" },
        { id: 103, home: "Brazil", away: "Argentina", date: "Jun 17, 18:00" }
    ]);
    const [inputs, setInputs] = useState({});
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        setLeaderboard(PredictionService.getLeaderboard());
    }, []);

    const handleScoreChange = (matchId, type, value) => {
        setInputs(prev => ({
            ...prev,
            [matchId]: { ...prev[matchId], [type]: value }
        }));
    };

    const handleSubmit = (matchId) => {
        const p = inputs[matchId];
        if (!p || !p.home || !p.away) return alert("Please enter both scores!");

        PredictionService.submitPrediction(user.id, matchId, p.home, p.away);
        setInputs({ ...inputs }); // Force re-render to update button state
        alert("Prediction Saved! Good luck! 🍀");
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-20 pt-8">
            {/* Main: Prediction Form */}
            <div className="flex-1">
                <header className="mb-8">
                    <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                        <Target className="text-red-500" size={32} />
                        Match Predictor
                    </h1>
                    <p className="text-gray-400">Guess the scores and win exclusive rewards!</p>
                </header>

                <div className="space-y-6">
                    {matches.map(m => (
                        <div key={m.id} className="card bg-gradient-to-br from-[var(--bg-card)] to-black border border-white/5">
                            <div className="text-center text-sm text-gray-500 mb-4">{m.date}</div>
                            <div className="flex items-center justify-between px-4 lg:px-12 mb-6">
                                <div className="text-center w-1/3">
                                    <h3 className="text-xl font-black mb-2">{m.home}</h3>
                                    <input
                                        type="number"
                                        className="w-16 h-16 text-center text-3xl font-bold bg-white/5 rounded-xl border border-white/10 focus:border-red-500 focus:outline-none"
                                        placeholder="-"
                                        onChange={(e) => handleScoreChange(m.id, 'home', e.target.value)}
                                    />
                                </div>
                                <div className="text-2xl font-bold text-gray-600">VS</div>
                                <div className="text-center w-1/3">
                                    <h3 className="text-xl font-black mb-2">{m.away}</h3>
                                    <input
                                        type="number"
                                        className="w-16 h-16 text-center text-3xl font-bold bg-white/5 rounded-xl border border-white/10 focus:border-red-500 focus:outline-none"
                                        placeholder="-"
                                        onChange={(e) => handleScoreChange(m.id, 'away', e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button
                                variant={PredictionService.hasPredicted(user.id, m.id) ? "secondary" : "primary"}
                                className="w-full"
                                onClick={() => handleSubmit(m.id)}
                                disabled={!!PredictionService.hasPredicted(user.id, m.id)}
                            >
                                {PredictionService.hasPredicted(user.id, m.id) ? "Prediction Locked 🔒" : "Lock Prediction"}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar: Leaderboard */}
            <div className="w-full lg:w-96">
                <div className="card bg-yellow-900/10 border-yellow-500/20">
                    <div className="flex items-center gap-3 mb-6">
                        <Trophy className="text-yellow-500" />
                        <h2 className="text-xl font-bold text-yellow-500">Top Predictors</h2>
                    </div>

                    <div className="space-y-4">
                        {leaderboard.map((u, i) => (
                            <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i === 0 ? 'bg-yellow-500 text-black' :
                                        i === 1 ? 'bg-gray-400 text-black' :
                                            i === 2 ? 'bg-orange-700 text-white' : 'bg-gray-800'
                                        }`}>
                                        {u.rank}
                                    </div>
                                    <span className="font-bold">{u.name}</span>
                                </div>
                                <div className="font-mono text-yellow-500 font-bold">{u.points} pts</div>
                            </div>
                        ))}
                        <div className="border-t border-white/10 pt-4 mt-4 text-center text-sm text-gray-400">
                            You are currently <strong>Unranked</strong>. <br /> Start predicting to join the elite!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Football API Service - 2026 World Cup
 * Tentative de connexion à une vraie API (ex: API-Football v3).
 * Si la clé est manquante ou invalide, bascule sur des données 2026 locales réalistes.
 */

const API_URL = 'https://v3.football.api-sports.io/';
const API_KEY = localStorage.getItem('football_api_key') || ''; // Utilisateur peut définir 'football_api_key' dans localStorage

export const ApiService = {
    // Fake 2026 World Cup Qualifiers/Groups Data Fallback
    fallbackData: {
        matches: [
            { id: 1, homeTeam: 'USA', awayTeam: 'Mexico', date: '2026-06-11T20:00:00Z', venue: 'Azteca Stadium, Mexico City', status: 'Scheduled' },
            { id: 2, homeTeam: 'Canada', awayTeam: 'Morocco', date: '2026-06-12T15:00:00Z', venue: 'BMO Field, Toronto', status: 'Scheduled' },
            { id: 3, homeTeam: 'Argentina', awayTeam: 'Spain', date: '2026-06-15T18:00:00Z', venue: 'MetLife Stadium, New York', status: 'Scheduled' },
        ],
        groups: [
            {
                name: 'Group A (2026)',
                teams: [
                    { name: 'Mexico', code: 'MEX', played: 0, won: 0, draw: 0, lost: 0, pts: 0, form: ['-'] },
                    { name: 'USA', code: 'USA', played: 0, won: 0, draw: 0, lost: 0, pts: 0, form: ['-'] },
                    { name: 'Canada', code: 'CAN', played: 0, won: 0, draw: 0, lost: 0, pts: 0, form: ['-'] },
                ]
            },
            {
                name: 'Group B (2026)',
                teams: [
                    { name: 'Morocco', code: 'MAR', played: 0, won: 0, draw: 0, lost: 0, pts: 0, form: ['-'] },
                    { name: 'Argentina', code: 'ARG', played: 0, won: 0, draw: 0, lost: 0, pts: 0, form: ['-'] },
                    { name: 'France', code: 'FRA', played: 0, won: 0, draw: 0, lost: 0, pts: 0, form: ['-'] },
                ]
            }
        ],
        scorers: [
            { name: 'Kylian Mbappé', team: 'FRA', goals: 0, assists: 0 },
            { name: 'Lionel Messi', team: 'ARG', goals: 0, assists: 0 },
            { name: 'Brahim Diaz', team: 'MAR', goals: 0, assists: 0 },
        ]
    },

    async fetchMatches() {
        if (!API_KEY) return this.fallbackData.matches;
        
        try {
            const response = await fetch(`${API_URL}fixtures?league=1&season=2026`, {
                method: 'GET',
                headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
            });
            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            return data.response.length > 0 ? data.response : this.fallbackData.matches;
        } catch (error) {
            console.warn("API 2026 Fetch failed, using fallback data:", error);
            return this.fallbackData.matches;
        }
    },

    async fetchStats() {
        if (!API_KEY) return { groups: this.fallbackData.groups, scorers: this.fallbackData.scorers };
        
        try {
            const response = await fetch(`${API_URL}standings?league=1&season=2026`, {
                method: 'GET',
                headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }
            });
            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            return data.response.length > 0 ? data.response : { groups: this.fallbackData.groups, scorers: this.fallbackData.scorers };
        } catch (error) {
            console.warn("API 2026 Fetch failed, using fallback data:", error);
            return { groups: this.fallbackData.groups, scorers: this.fallbackData.scorers };
        }
    }
};

import axios from 'axios';

// Remplacez par l'URL de votre backend local (ex: http://localhost:5000)
const API_URL = 'http://localhost:5000/api'; 

/**
 * Récupère la liste de toutes les équipes (avec classements FIFA réels)
 */
export const getAllTeams = async () => {
    try {
        const response = await axios.get(`${API_URL}/teams`);
        return response.data.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des équipes :", error);
        // Fallback en cas d'erreur de serveur (pour le développement)
        return [
            { id: 1, name: "Argentine", code: "ARG", continent: "CONMEBOL", fifaRanking: 1, worldCupsWon: 3 },
            { id: 2, name: "France", code: "FRA", continent: "UEFA", fifaRanking: 2, worldCupsWon: 2 },
            { id: 5, name: "Maroc", code: "MAR", continent: "CAF", fifaRanking: 12, worldCupsWon: 0 }
        ];
    }
};

/**
 * Récupère les vraies statistiques en direct via l'API-Football (si configuré côté backend)
 * @param {string} teamId - L'ID de l'équipe (ex: '10' pour l'Angleterre)
 */
export const getLiveTeamStats = async (teamId) => {
    try {
        const response = await axios.get(`${API_URL}/teams/live/stats`, {
            params: { teamId: teamId }
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques en direct :", error);
        throw error;
    }
};

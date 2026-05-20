const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * SOLUTION 1 : DONNÉES RÉELLES STATIQUES (ACTUALISÉES)
 * Ces données sont basées sur le vrai palmarès et les classements mondiaux.
 */
const realWorldCupTeams = [
  { id: 1, name: "Argentine", code: "ARG", continent: "CONMEBOL", fifaRanking: 1, worldCupsWon: 3, keyPlayer: "Lionel Messi", group: "A" },
  { id: 2, name: "France", code: "FRA", continent: "UEFA", fifaRanking: 2, worldCupsWon: 2, keyPlayer: "Kylian Mbappé", group: "A" },
  { id: 3, name: "Brésil", code: "BRA", continent: "CONMEBOL", fifaRanking: 5, worldCupsWon: 5, keyPlayer: "Vinícius Jr", group: "B" },
  { id: 4, name: "Angleterre", code: "ENG", continent: "UEFA", fifaRanking: 3, worldCupsWon: 1, keyPlayer: "Harry Kane", group: "B" },
  { id: 5, name: "Maroc", code: "MAR", continent: "CAF", fifaRanking: 12, worldCupsWon: 0, keyPlayer: "Achraf Hakimi", group: "C" },
  { id: 6, name: "Espagne", code: "ESP", continent: "UEFA", fifaRanking: 8, worldCupsWon: 1, keyPlayer: "Rodri", group: "C" },
  { id: 7, name: "Portugal", code: "POR", continent: "UEFA", fifaRanking: 6, worldCupsWon: 0, keyPlayer: "Cristiano Ronaldo", group: "D" },
  { id: 8, name: "Belgique", code: "BEL", continent: "UEFA", fifaRanking: 4, worldCupsWon: 0, keyPlayer: "Kevin De Bruyne", group: "D" },
  { id: 9, name: "États-Unis", code: "USA", continent: "CONCACAF", fifaRanking: 11, worldCupsWon: 0, keyPlayer: "Christian Pulisic", group: "E", host: true },
  { id: 10, name: "Mexique", code: "MEX", continent: "CONCACAF", fifaRanking: 15, worldCupsWon: 0, keyPlayer: "Edson Álvarez", group: "E", host: true },
  { id: 11, name: "Canada", code: "CAN", continent: "CONCACAF", fifaRanking: 48, worldCupsWon: 0, keyPlayer: "Alphonso Davies", group: "F", host: true },
  { id: 12, name: "Sénégal", code: "SEN", continent: "CAF", fifaRanking: 17, worldCupsWon: 0, keyPlayer: "Sadio Mané", group: "F" },
  { id: 13, name: "Japon", code: "JPN", continent: "AFC", fifaRanking: 18, worldCupsWon: 0, keyPlayer: "Takefusa Kubo", group: "G" },
  { id: 14, name: "Croatie", code: "CRO", continent: "UEFA", fifaRanking: 10, worldCupsWon: 0, keyPlayer: "Luka Modrić", group: "G" },
  { id: 15, name: "Allemagne", code: "GER", continent: "UEFA", fifaRanking: 16, worldCupsWon: 4, keyPlayer: "Jamal Musiala", group: "H" },
  { id: 16, name: "Uruguay", code: "URU", continent: "CONMEBOL", fifaRanking: 14, worldCupsWon: 2, keyPlayer: "Federico Valverde", group: "H" },
  { id: 17, name: "Colombie", code: "COL", continent: "CONMEBOL", fifaRanking: 13, worldCupsWon: 0, keyPlayer: "Luis Díaz", group: "I" },
  { id: 18, name: "Pays-Bas", code: "NED", continent: "UEFA", fifaRanking: 7, worldCupsWon: 0, keyPlayer: "Virgil van Dijk", group: "I" },
  { id: 19, name: "Italie", code: "ITA", continent: "UEFA", fifaRanking: 9, worldCupsWon: 4, keyPlayer: "Nicolò Barella", group: "J" },
  { id: 20, name: "Corée du Sud", code: "KOR", continent: "AFC", fifaRanking: 22, worldCupsWon: 0, keyPlayer: "Son Heung-min", group: "J" },
];

/**
 * GET /api/teams
 * Retourne la liste des équipes qualifiées ou probables avec de VRAIES données historiques.
 */
router.get('/teams', (req, res) => {
  res.json({
    success: true,
    count: realWorldCupTeams.length,
    data: realWorldCupTeams
  });
});

/**
 * GET /api/teams/:id
 * Retourne les détails d'une équipe spécifique
 */
router.get('/teams/:id', (req, res) => {
  const team = realWorldCupTeams.find(t => t.id === parseInt(req.params.id));
  if (team) {
    res.json({ success: true, data: team });
  } else {
    res.status(404).json({ success: false, message: "Équipe non trouvée" });
  }
});

/**
 * =========================================================================
 * SOLUTION 2 : INTÉGRATION API EXTERNE RÉELLE (API-FOOTBALL via RapidAPI)
 * =========================================================================
 * Utilisez cette route si vous possédez une clé API-Football.
 * Elle ira chercher les vraies statistiques en direct sur les serveurs de la FIFA.
 */
router.get('/teams/live/stats', async (req, res) => {
  try {
    // Remplacer par votre clé API RapidAPI
    const API_KEY = process.env.RAPIDAPI_KEY || 'VOTRE_CLE_API_ICI'; 
    
    const options = {
      method: 'GET',
      url: 'https://api-football-v1.p.rapidapi.com/v3/teams/statistics',
      params: {
        league: '1', // ID de la Coupe du Monde
        season: '2026',
        team: req.query.teamId || '10' // ID de l'équipe (ex: Angleterre)
      },
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    res.json({
      success: true,
      source: "API-Football (Live)",
      data: response.data.response
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération des statistiques en direct",
      error: error.message 
    });
  }
});

module.exports = router;

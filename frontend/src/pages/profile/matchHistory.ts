import { fetchWithGame } from '../../api/api';
import { t } from '../../i18n';

function renderMatchHistory(history: any[]): string {
    if (!history || history.length === 0) {
        return `<p class="text-center text-xl mt-4">🕹️ Você ainda não tem partidas jogadas.</p>`;
    }

    return history.reverse().map(match => {
        const gameType = match.gameType;
        let playersHtml = '';
        let title = '';

        if (gameType === 'TOURNAMENT') {
            const players = [
                { name: match.player4Username, alias: match.player1Alias, points: match.player4Points },
                { name: match.player3Username, alias: match.player2Alias, points: match.player3Points },
                { name: match.player2Username, alias: match.player3Alias, points: match.player2Points },
                { name: match.player1Username, alias: match.player4Alias, points: match.player1Points },
            ].filter(p => p.name).sort((a, b) => b.points - a.points);

            const medals = ['🏆', '🥈', '🥉', ''];

            playersHtml = players.map((p, index) => {
                const medal = medals[index] || '';
                const position = index + 1;
                return `<div class="text-lg">${medal}${position}º ${t().place}: ${p.name} (${p.alias})</div>`;
            }).join('');
            
            title = `🏆 ${t().tournament}: ${match.tournamentName}`;

        } else if (gameType === 'MULTIPLAYER_REMOTO') {
            const players = [
                { name: match.player4Username, points: match.player4Points },
                { name: match.player3Username, points: match.player3Points },
                { name: match.player2Username, points: match.player2Points },
                { name: match.player1Username, points: match.player1Points },
            ].filter(p => p.name).sort((a, b) => b.points - a.points);

            playersHtml = players.map((p, index) => {
                const position = index + 1;
                return `<div class="text-lg">${position}º: ${p.name}</div>`;
            }).join('');

            title = `🎮 ${t().mode}: ${match.tournamentName}`;

        } else if (gameType === 'SINGLEPLAYER' || gameType === 'MULTIPLAYER_LOCAL' || gameType === 'RPS') {
            const players = [
                { name: match.player1Username, points: match.player1Points },
                { name: match.player2Username, points: match.player2Points },
            ].filter(p => p.name);

            playersHtml = players.map(p => `<div class="text-lg">${p.name}: ${p.points} ${t().points}</div>`).join('');
            
            title = `🎮 ${t().mode}: ${match.tournamentName}`;
        }
        
        return `
            <div class="bg-slate-800 p-4 rounded-lg mb-4 shadow-retro">
                <h3 class="text-xl text-indigo-400 font-bold mb-2">${title}</h3>
                ${playersHtml}
            </div>
        `;
    }).join('');
}


export async function loadMatchHistory(userUuid: string) {
    try {
        const historyResponse = await fetchWithGame(`/history?userUuid=${userUuid}`);
        console.log("Recebido: ", historyResponse);
        const history = await historyResponse.json();
        const historyContainer = document.getElementById('match-history-container');
        if (historyContainer) {
            historyContainer.innerHTML = renderMatchHistory(history);
        }
    } catch (error) {
        console.error('Failed to load match history:', error);
        const historyContainer = document.getElementById('match-history-container');
        if (historyContainer) {
            historyContainer.innerHTML = `<p class="text-center text-red-500">${t().errorLoadingMatchHistory}</p>`;
        }
    }
}
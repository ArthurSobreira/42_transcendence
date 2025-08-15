import { WebSocketServer, WebSocket } from 'ws';
import { URL } from 'url';
import { ClientData, Game } from './types';
import { startGame, startOneVsOneGame } from './game';
import * as https from 'https';

export const clients = new Map<string, ClientData>();
export const games = new Map<string, Game>();
export const gameTokens = new Map<string, string>();

export const agent = new https.Agent({
  rejectUnauthorized: false,
});

const remoteLobby: ClientData[] = [];
const tournamentLobby: ClientData[] = [];

const tournaments = new Map<string, {
    gameIds: string[];
    winners: ClientData[];
    finalistsReady: number;
    tournamentName: string;
    eliminatedPlayers: { id: string; realUsername: string; username: string }[];
}>();

function broadcastLobbyUpdate(mode: 'remote' | 'tournament') {
    const lobby = mode === 'remote' ? remoteLobby : tournamentLobby;
    const lobbyInfo = lobby.map(c => ({ id: c.id, username: c.username, profilePic: c.profilePic }));
    const message = JSON.stringify({ type: 'lobby_update', players: lobbyInfo });
    lobby.forEach(client => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(message);
        }
    });
}

function cleanupClient(userId: string) {
    const client = clients.get(userId);
    if (!client) return;

    if (client.gameMode === 'tournament') {
        const lobbyIndex = tournamentLobby.findIndex(c => c.id === userId);
        if (lobbyIndex > -1) {
            tournamentLobby.splice(lobbyIndex, 1);
            broadcastLobbyUpdate('tournament');
        }

        for (const [tournamentId, tournament] of tournaments.entries()) {
            const winnerIndex = tournament.winners.findIndex(w => w.id === userId);
            if (winnerIndex > -1) {
                tournament.winners.splice(winnerIndex, 1);
                if (tournament.winners.length === 0 && tournament.gameIds.length === 0) {
                    tournaments.delete(tournamentId);
                }
            }
        }
    } else {
        const lobbyIndex = remoteLobby.findIndex(c => c.id === userId);
        if (lobbyIndex > -1) {
            remoteLobby.splice(lobbyIndex, 1);
            broadcastLobbyUpdate('remote');
        }
    }

    clients.delete(userId);
}

export function stopGame(gameId: string) {
    const game = games.get(gameId);
    if (!game) return;

    if (game.gameLoopInterval) clearInterval(game.gameLoopInterval);
    if (game.speedUpInterval) clearInterval(game.speedUpInterval);

    const { tournamentId, isFinal, playerIds, gameState } = game;

    if (tournamentId) {
        const tournament = tournaments.get(tournamentId);
        if (!tournament) {
            games.delete(gameId);
            return;
        }

        const [p1, p2] = gameState.paddles;
        const WIN_SCORE = 5;
        let winnerId: string, loserId: string;

        if (p1.score >= WIN_SCORE) {
            winnerId = playerIds[0];
            loserId = playerIds[1];
        } else {
            winnerId = playerIds[1];
            loserId = playerIds[0];
        }

        const winnerClient = clients.get(winnerId);
        const loserClient = clients.get(loserId);

        if (isFinal) {
            const winnerData = winnerClient ? { id: winnerClient.id, username: winnerClient.username, profilePic: winnerClient.profilePic } : null;
            const finalOverMessage = JSON.stringify({ type: 'game_over', winner: winnerData, tournamentName: tournament.tournamentName });

            sendTournamentHistory(tournamentId, winnerId, loserId);

            playerIds.forEach(id => {
                const client = clients.get(id);
                if (client && client.ws.readyState === WebSocket.OPEN) {
                    client.ws.send(finalOverMessage);
                }
            });
            tournaments.delete(tournamentId);
        } else {
            if (loserClient) {
                const loser = clients.get(loserId);
                if (loser) {
                    tournament.eliminatedPlayers.push({
                        id: loserId,
                        realUsername: loser.realUsername || loser.username,
                        username: loser.username
                    });
                }
            }

            if (loserClient && loserClient.ws.readyState === WebSocket.OPEN) {
                loserClient.ws.send(JSON.stringify({ type: 'semifinal_loss' }));
            }
            if (winnerClient) {
                tournament.winners.push(winnerClient);
                const winMessage = {
                    type: 'semifinal_win',
                    winners: tournament.winners.map(w => ({ username: w.username, profilePic: w.profilePic }))
                };
                if (winnerClient.ws.readyState === WebSocket.OPEN) {
                    winnerClient.ws.send(JSON.stringify(winMessage));
                }

                if (tournament.winners.length === 2) {
                    const readyMessage = {
                        type: 'final_ready',
                        finalists: tournament.winners.map(f => ({ username: f.username, profilePic: f.profilePic }))
                    };
                    tournament.winners.forEach(finalist => {
                        if (finalist.ws.readyState === WebSocket.OPEN) {
                            finalist.ws.send(JSON.stringify(readyMessage));
                        }
                    });
                }
            }
        }
    }

    games.delete(gameId);
    gameTokens.delete(gameId);
    console.log(`Jogo ${gameId} finalizado e removido.`);
}


async function createTournamentInService(players: ClientData[], tournamentName: string, jwtToken: string) {
    try {
        const body = {
            gameType: 'TOURNAMENT',
            tournamentName: tournamentName,
            player1Username: players[0]?.realUsername || players[0]?.username || '',
            player2Username: players[1]?.realUsername || players[1]?.username || '',
            player3Username: players[2]?.realUsername || players[2]?.username || '',
            player4Username: players[3]?.realUsername || players[3]?.username || '',
            aliasPlayer1: players[0]?.username || '',
            aliasPlayer2: players[1]?.username || '',
            aliasPlayer3: players[2]?.username || '',
            aliasPlayer4: players[3]?.username || '',
        };


        console.log("Creating tournament with data:", body);
        
        const response = await fetch('https://game-service:3001/tournament', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            agent: agent,
            body: JSON.stringify(body)
        } as any);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to create tournament:', response.status, errorText);
        } else {
            console.log('Tournament created successfully!');
        }
    } catch (error) {
        console.error('Error creating tournament:', error);
    }
}

async function sendTournamentHistory(tournamentId: string, finalWinnerId: string, finalLoserId: string) {
    const tournament = tournaments.get(tournamentId);
    if (!tournament) return;

    const winner = clients.get(finalWinnerId);
    const runnerUp = clients.get(finalLoserId);
    
    const eliminatedPlayers = tournament.eliminatedPlayers;
    const thirdPlace = eliminatedPlayers.length >= 2 ? eliminatedPlayers[1] : null;
    const fourthPlace = eliminatedPlayers.length >= 1 ? eliminatedPlayers[0] : null;

    const historyData = {
        gameType: 'TOURNAMENT',
        tournamentId: tournamentId,
        tournamentName: "tournament",
        player1Username: winner?.realUsername || winner?.username || '',
        player1Alias: winner?.username || '',
        player1Points: 1,
        player2Username: runnerUp?.realUsername || runnerUp?.username || '',
        player2Alias: runnerUp?.username || '',
        player2Points: 2,
        player3Username: thirdPlace?.realUsername || '',
        player3Alias: thirdPlace?.username || '',
        player3Points: 3,
        player4Username: fourthPlace?.realUsername || '',
        player4Alias: fourthPlace?.username || '',
        player4Points: 4
    };

    let jwtToken: string | null = null;
    const finalPlayers = [winner, runnerUp];
    for (const player of finalPlayers) {
        if (player && player.jwtToken) {
            jwtToken = player.jwtToken;
            break;
        }
    }

    if (!jwtToken) {
        console.error('Nenhum token JWT disponível para salvar o histórico do torneio');
        return;
    }

    try {
        const response = await fetch('https://game-service:3001/history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(historyData),
            agent: agent,
        } as any);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Falha ao salvar o histórico do torneio:', response.status, errorText);
        } else {
            console.log('Histórico do torneio salvo com sucesso:', historyData);
        }
    } catch (error) {
        console.error('Erro ao salvar o histórico do torneio:', error);
    }
}


export function setupWebSocket(server: any) {
	const wss = new WebSocketServer({ noServer: true });

	server.server.on('upgrade', (request: any, socket: any, head: any) => {
		wss.handleUpgrade(request, socket, head, (ws: any) => {
			wss.emit('connection', ws, request);
		});
	});

	wss.on('connection', (ws: WebSocket, req: any) => {
		const url = new URL(req.url!, `http://${req.headers.host}`);

		const userId = url.searchParams.get('userId');
		const username = url.searchParams.get('username') || 'Anônimo';
		const realUsername = url.searchParams.get('realUsername') || username;
		const profilePic = url.searchParams.get('profilePic') || 'https://placehold.co/128x128/000000/FFFFFF?text=User';
		const gameModeParam = url.searchParams.get('mode') || 'remote';
		const gameMode: 'remote' | 'tournament' = (gameModeParam === 'tournament') ? 'tournament' : 'remote';
		const jwtToken = url.searchParams.get('token') || '';
		const tournamentName = url.searchParams.get('tournamentName') || `Tournament-${Date.now()}`;

		if (!userId) {
			ws.send(JSON.stringify({ type: 'error', message: 'ID de usuário inválido.' }));
			ws.close();
			return;
		}

		const targetLobby = gameMode === 'tournament' ? tournamentLobby : remoteLobby;
		const duplicateNickname = targetLobby.find(client => client.username === username && client.id !== userId);
		
		if (duplicateNickname) {
			ws.send(JSON.stringify({ 
				type: 'error', 
				message: `O apelido "${username}" já está sendo usado na sala ${gameMode}. Escolha outro apelido.` 
			}));
			return;
		}

		if (clients.has(userId)) {
			const existingClient = clients.get(userId);
			if (existingClient && existingClient.ws.readyState === WebSocket.OPEN) {
				existingClient.ws.close();
			}
			cleanupClient(userId);
		}

		console.log(`Jogador ${username} (${userId}) conectado no modo ${gameMode}.`);

		const clientData: ClientData = {
			ws,
            username: username,
			realUsername,
			inputs: {},
			id: userId,
			profilePic,
			isReady: false,
			gameMode,
			jwtToken
		};

		clients.set(userId, clientData);

		ws.on('message', (message: any) => {
			try {
				const data = JSON.parse(message.toString());
				const client = clients.get(userId);
				if (!client) return;

				switch (data.type) {
					case 'keys':
						client.inputs = data.keys;
						break;

					case 'final_ready_click':
                    let tournamentId: string | undefined;
                    let tournamentData: any;

                    for (const [id, data] of tournaments.entries()) {
                        if (data.winners.some(winner => winner.id === userId)) {
                            tournamentId = id;
                            tournamentData = data;
                            break;
                        }
                    }

                    if (tournamentData && tournamentId) {
                        const finalist = tournamentData.winners.find((w: any) => w.id === userId);
                        if (finalist && !finalist.isReady) {
                            finalist.isReady = true;
                            tournamentData.finalistsReady++;
                        }

                        const otherFinalist = tournamentData.winners.find((w: any) => w.id !== userId);
                        if (otherFinalist) {
                            const otherClient = clients.get(otherFinalist.id);
                            if (otherClient && otherClient.ws.readyState === WebSocket.OPEN) {
                                otherClient.ws.send(JSON.stringify({ type: 'opponent_ready' }));
                            }
                        }

                        if (tournamentData.finalistsReady === 2) {
                            const finalGameId = startOneVsOneGame(
                                tournamentData.winners.map((w: any) => w.id),
                                tournamentId,
                                true
                            );
                            if (finalGameId) {
                                const tourney = tournaments.get(tournamentId);
                                if (tourney) {
                                    tourney.gameIds.push(finalGameId);
                                }
                            }
                        }
                    }
                    break;

				}
			} catch (error) {
				console.error('Erro ao processar mensagem:', error);
			}
		});

		if (gameMode === 'tournament') {
			tournamentLobby.push(clientData);
			broadcastLobbyUpdate('tournament');

			if (tournamentLobby.length >= 4) {
				const tournamentId = `tourney-${Date.now()}`;
				const gamePlayers = tournamentLobby.splice(0, 4);

				tournaments.set(tournamentId, {
					gameIds: [],
					winners: [],
					finalistsReady: 0,
					tournamentName: tournamentName,
					eliminatedPlayers: []
				});

				createTournamentInService(gamePlayers, tournamentName, jwtToken);

				const group1 = [gamePlayers[0], gamePlayers[1]];
				const group2 = [gamePlayers[2], gamePlayers[3]];

				const gameId1 = startOneVsOneGame(group1.map(p => p.id), tournamentId);
				const gameId2 = startOneVsOneGame(group2.map(p => p.id), tournamentId);

				if (gameId1) tournaments.get(tournamentId)?.gameIds.push(gameId1);
				if (gameId2) tournaments.get(tournamentId)?.gameIds.push(gameId2);

				broadcastLobbyUpdate('tournament');
			}
		} else {
			remoteLobby.push(clientData);
			broadcastLobbyUpdate('remote');

			if (remoteLobby.length >= 4) {
				const gamePlayers = remoteLobby.splice(0, 4);
				startGame(gamePlayers.map(p => p.id));
				broadcastLobbyUpdate('remote');
			}
		}

		ws.on('close', () => {
			console.log(`Jogador ${clients.get(userId)?.username} (${userId}) desconectado.`);

			const client = clients.get(userId);
			if (!client) return;

			let wasInGame = false;

			for (const [gameId, game] of games.entries()) {
				if (game.playerIds.includes(userId)) {
					wasInGame = true;
					const playerIndex = game.playerIds.indexOf(userId);

					if (game.playerIds.length === 4 && !game.tournamentId) {
						if (game.gameState.paddles[playerIndex]) {
							game.gameState.paddles[playerIndex].lost = true;
						}
						console.log(`Jogador ${userId} marcado como perdedor no jogo ${gameId}, jogo continua.`);
						
						const remainingPlayers = game.playerIds.filter(id => id !== userId && clients.has(id));
						remainingPlayers.forEach(id => {
							const remainingClient = clients.get(id);
							if (remainingClient && remainingClient.ws.readyState === WebSocket.OPEN) {
								remainingClient.ws.send(JSON.stringify({ 
									type: 'player_disconnected', 
									disconnectedPlayer: client?.username || 'Jogador desconhecido',
									playerIndex: playerIndex
								}));
							}
						});
					} else {
						stopGame(gameId);
						const remainingPlayers = game.playerIds.filter(id => id !== userId && clients.has(id));
						remainingPlayers.forEach(id => {
							const remainingClient = clients.get(id);
							if (remainingClient && remainingClient.ws.readyState === WebSocket.OPEN) {
								remainingClient.ws.send(JSON.stringify({ type: 'opponent_disconnected' }));
							}
						});
						break;
					}
				}
			}

			cleanupClient(userId);
		});

		ws.on('error', (error: any) => {
			console.error(`Erro no WebSocket do jogador ${userId}:`, error);
			cleanupClient(userId);
		});
	});
}
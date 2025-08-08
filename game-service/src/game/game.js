"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOneVsOneGame = startOneVsOneGame;
exports.updateGame1v1 = updateGame1v1;
exports.startGame = startGame;
exports.updateGame = updateGame;
const constants_1 = require("./constants");
const websockets_1 = require("./websockets");
const ws_1 = require("ws");
function startOneVsOneGame(playerIds, tournamentId, isFinal = false) {
    if (playerIds.length !== 2) {
        console.error("Jogo 1x1 precisa de 2 jogadores.");
        return null;
    }
    const gameId = `1v1-${playerIds.join('-')}-${Date.now()}`;
    const gameState = {
        paddles: [
            { x: 20, y: constants_1.CANVAS_HEIGHT / 2 - constants_1.PADDLE_WIDTH / 2, width: constants_1.PADDLE_HEIGHT, height: constants_1.PADDLE_WIDTH, score: 0, lost: false },
            { x: constants_1.CANVAS_WIDTH - constants_1.PADDLE_HEIGHT - 20, y: constants_1.CANVAS_HEIGHT / 2 - constants_1.PADDLE_WIDTH / 2, width: constants_1.PADDLE_HEIGHT, height: constants_1.PADDLE_WIDTH, score: 0, lost: false },
        ],
        ball: {
            x: constants_1.CANVAS_WIDTH / 2,
            y: constants_1.CANVAS_HEIGHT / 2,
            radius: constants_1.BALL_RADIUS,
            speedX: 0,
            speedY: 0
        }
    };
    resetBall(gameState);
    const newGame = {
        playerIds,
        gameState,
        gameLoopInterval: null,
        speedUpInterval: null,
        tournamentId: tournamentId,
        isFinal: isFinal
    };
    websockets_1.games.set(gameId, newGame);
    newGame.gameLoopInterval = setInterval(() => updateGame1v1(gameId), 1000 / 60);
    newGame.speedUpInterval = setInterval(() => {
        const game = websockets_1.games.get(gameId);
        if (game) {
            game.gameState.ball.speedX *= 1.2;
            game.gameState.ball.speedY *= 1.2;
        }
    }, 3000);
    playerIds.forEach((id, index) => {
        const client = websockets_1.clients.get(id);
        if (client) {
            client.ws.send(JSON.stringify({
                type: 'game_start',
                gameId,
                opponents: playerIds.map(pid => websockets_1.clients.get(pid)?.username || 'Desconhecido'),
                paddles: gameState.paddles,
                ball: gameState.ball,
                playerNumber: index + 1
            }));
        }
    });
    console.log(`Jogo 1x1 no estilo multiplayer local iniciado: ${gameId}`);
    return gameId;
}
function updateGame1v1(gameId) {
    const game = websockets_1.games.get(gameId);
    if (!game)
        return;
    const { gameState, playerIds } = game;
    const { ball, paddles } = gameState;
    const [p1, p2] = paddles;
    const [client1, client2] = playerIds.map(id => websockets_1.clients.get(id));
    if (!client1 || !client2) {
        (0, websockets_1.stopGame)(gameId);
        return;
    }
    const input1 = client1.inputs;
    const input2 = client2.inputs;
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > constants_1.CANVAS_HEIGHT) {
        ball.speedY *= -1;
    }
    if (ball.x - ball.radius < 0) {
        p2.score++;
        checkWinAndStopGame(gameId);
        resetBall(gameState);
    }
    else if (ball.x + ball.radius > constants_1.CANVAS_WIDTH) {
        p1.score++;
        checkWinAndStopGame(gameId);
        resetBall(gameState);
    }
    const player = (ball.x < constants_1.CANVAS_WIDTH / 2) ? p1 : p2;
    if (collides(ball, player)) {
        const collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        const angleRad = (Math.PI / 4) * collidePoint;
        const direction = (ball.x < constants_1.CANVAS_WIDTH / 2) ? 1 : -1;
        const currentSpeed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);
        ball.speedX = direction * currentSpeed * Math.cos(angleRad);
        ball.speedY = currentSpeed * Math.sin(angleRad);
    }
    if (input1['w'] && p1.y > 0)
        p1.y -= constants_1.PADDLE_SPEED;
    if (input1['s'] && p1.y < constants_1.CANVAS_HEIGHT - p1.height)
        p1.y += constants_1.PADDLE_SPEED;
    if (input2['ArrowUp'] && p2.y > 0)
        p2.y -= constants_1.PADDLE_SPEED;
    if (input2['ArrowDown'] && p2.y < constants_1.CANVAS_HEIGHT - p2.height)
        p2.y += constants_1.PADDLE_SPEED;
    const updateMessage = JSON.stringify({ type: 'update', ball, paddles });
    [client1, client2].forEach(c => {
        if (c?.ws.readyState === ws_1.WebSocket.OPEN)
            c.ws.send(updateMessage);
    });
}
function checkWinAndStopGame(gameId) {
    const game = websockets_1.games.get(gameId);
    if (!game)
        return;
    const { gameState, playerIds } = game;
    const [p1, p2] = gameState.paddles;
    const WIN_SCORE = constants_1.LOSE_SCORE;
    if (p1.score >= WIN_SCORE || p2.score >= WIN_SCORE) {
        if (game.tournamentId) {
            (0, websockets_1.stopGame)(gameId);
            return;
        }
        const winnerId = p2.score >= WIN_SCORE ? playerIds[0] : playerIds[1];
        const winnerClient = websockets_1.clients.get(winnerId);
        const winnerData = winnerClient
            ? { id: winnerClient.id, username: winnerClient.username, profilePic: winnerClient.profilePic }
            : null;
        const gameOverMessage = JSON.stringify({ type: 'game_over', winner: winnerData });
        playerIds.forEach(id => {
            websockets_1.clients.get(id)?.ws.send(gameOverMessage);
        });
        (0, websockets_1.stopGame)(gameId);
    }
}
function createInitialGameState() {
    return {
        paddles: [
            { x: constants_1.CANVAS_WIDTH / 2 - constants_1.PADDLE_WIDTH / 2, y: 10, width: constants_1.PADDLE_WIDTH, height: constants_1.PADDLE_HEIGHT, score: 0, lost: false },
            { x: constants_1.CANVAS_WIDTH / 2 - constants_1.PADDLE_WIDTH / 2, y: constants_1.CANVAS_HEIGHT - constants_1.PADDLE_HEIGHT - 10, width: constants_1.PADDLE_WIDTH, height: constants_1.PADDLE_HEIGHT, score: 0, lost: false },
            { x: 10, y: constants_1.CANVAS_HEIGHT / 2 - constants_1.PADDLE_WIDTH / 2, width: constants_1.PADDLE_HEIGHT, height: constants_1.PADDLE_WIDTH, score: 0, lost: false },
            { x: constants_1.CANVAS_WIDTH - constants_1.PADDLE_HEIGHT - 10, y: constants_1.CANVAS_HEIGHT / 2 - constants_1.PADDLE_WIDTH / 2, width: constants_1.PADDLE_HEIGHT, height: constants_1.PADDLE_WIDTH, score: 0, lost: false },
        ],
        ball: { x: constants_1.CANVAS_WIDTH / 2, y: constants_1.CANVAS_HEIGHT / 2, radius: constants_1.BALL_RADIUS, speedX: 0, speedY: 0 },
    };
}
function resetBall(gameState) {
    gameState.ball.x = constants_1.CANVAS_WIDTH / 2;
    gameState.ball.y = constants_1.CANVAS_HEIGHT / 2;
    const angle = (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 4 + (Math.random() - 0.5) * (Math.PI / 4));
    gameState.ball.speedX = Math.cos(angle) * constants_1.INITIAL_BALL_SPEED;
    gameState.ball.speedY = Math.sin(angle) * constants_1.INITIAL_BALL_SPEED;
}
function collides(b, p) {
    const p_top = p.y;
    const p_bottom = p.y + p.height;
    const p_left = p.x;
    const p_right = p.x + p.width;
    const b_top = b.y - b.radius;
    const b_bottom = b.y + b.radius;
    const b_left = b.x - b.radius;
    const b_right = b.x + b.radius;
    return p_left < b_right && p_right > b_left && p_top < b_bottom && p_bottom > b_top;
}
async function sendRemoteMatchHistory(gameId, playerIds, eliminationOrder) {
    const game = websockets_1.games.get(gameId);
    if (!game)
        return;
    try {
        const playerNames = {};
        game.players.forEach(player => {
            playerNames[player.id] = player.realUsername || player.username;
        });
        const winnerIndex = playerIds.findIndex(id => !eliminationOrder.includes(id));
        const winnerId = winnerIndex !== -1 ? playerIds[winnerIndex] : (eliminationOrder.length > 0 ? eliminationOrder[eliminationOrder.length - 1] : playerIds[0]);
        const positions = {};
        if (winnerId) {
            positions['player1'] = { username: playerNames[winnerId], points: 1 };
        }
        const secondPlaceCandidates = eliminationOrder.filter(id => id !== winnerId);
        if (secondPlaceCandidates.length >= 1) {
            const secondPlaceId = secondPlaceCandidates[secondPlaceCandidates.length - 1];
            positions['player2'] = { username: playerNames[secondPlaceId], points: 2 };
        }
        if (secondPlaceCandidates.length >= 2) {
            const thirdPlaceId = secondPlaceCandidates[secondPlaceCandidates.length - 2];
            positions['player3'] = { username: playerNames[thirdPlaceId], points: 3 };
        }
        if (secondPlaceCandidates.length >= 3) {
            const fourthPlaceId = secondPlaceCandidates[0];
            positions['player4'] = { username: playerNames[fourthPlaceId], points: 4 };
        }
        const historyData = {
            gameType: 'MULTIPLAYER_REMOTO',
            tournamentId: gameId,
            tournamentName: 'remote',
            player1Username: positions['player1']?.username || null,
            player1Points: positions['player1']?.points || null,
            player2Username: positions['player2']?.username || null,
            player2Points: positions['player2']?.points || null,
            player3Username: positions['player3']?.username || null,
            player3Points: positions['player3']?.points || null,
            player4Username: positions['player4']?.username || null,
            player4Points: positions['player4']?.points || null,
        };
        let jwtToken = null;
        for (const player of game.players) {
            const client = websockets_1.clients.get(player.id);
            if (client && client.jwtToken) {
                jwtToken = client.jwtToken;
                break;
            }
        }
        if (!jwtToken) {
            for (const playerId of playerIds) {
                const client = websockets_1.clients.get(playerId);
                if (client && client.jwtToken) {
                    jwtToken = client.jwtToken;
                    break;
                }
            }
        }
        if (!jwtToken) {
            console.error('Nenhum token JWT disponível para salvar o histórico do jogo remoto');
            return;
        }
        console.log('Enviando histórico do jogo remoto:', historyData);
        const response = await fetch('https://game-service:3001/history', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`
            },
            body: JSON.stringify(historyData),
            agent: websockets_1.agent
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Falha ao salvar o histórico do jogo remoto:', response.status, errorText);
        }
        else {
            console.log('Histórico do jogo remoto salvo com sucesso');
        }
    }
    catch (error) {
        console.error('Erro ao salvar o histórico do jogo remoto:', error);
    }
}
function startGame(playerIds) {
    const gameId = `${playerIds.join('-')}-${Date.now()}`;
    const gameState = createInitialGameState();
    resetBall(gameState);
    const playerInfos = playerIds.map(id => {
        const client = websockets_1.clients.get(id);
        return {
            id: id,
            username: client.username,
            realUsername: client.realUsername || client.username,
        };
    });
    const newGame = {
        playerIds,
        players: playerInfos,
        gameState,
        gameLoopInterval: null,
        speedUpInterval: null,
        eliminationOrder: []
    };
    websockets_1.games.set(gameId, newGame);
    newGame.speedUpInterval = setInterval(() => {
        const game = websockets_1.games.get(gameId);
        if (game) {
            game.gameState.ball.speedX *= 1.4;
            game.gameState.ball.speedY *= 1.4;
        }
    }, 5000);
    newGame.gameLoopInterval = setInterval(() => updateGame(gameId), 1000 / 60);
    const playerUsernames = playerInfos.map(p => p.username);
    playerIds.forEach((playerId, index) => {
        const client = websockets_1.clients.get(playerId);
        if (client) {
            client.ws.send(JSON.stringify({ type: 'game_start', gameId, opponents: playerUsernames, playerNumber: index + 1 }));
        }
    });
    console.log(`Jogo iniciado entre 4 jogadores. GameId: ${gameId}`);
}
function updateGame(gameId) {
    const game = websockets_1.games.get(gameId);
    if (!game)
        return;
    const { gameState, playerIds, eliminationOrder } = game;
    const { ball, paddles } = gameState;
    const playerClients = playerIds.map(id => websockets_1.clients.get(id));
    playerClients.forEach((client, index) => {
        if (!client) {
            paddles[index].lost = true;
            const disconnectedPlayerId = playerIds[index];
            if (!eliminationOrder.includes(disconnectedPlayerId)) {
                eliminationOrder.push(disconnectedPlayerId);
                console.log(`Jogador ${disconnectedPlayerId} marcado como perdido por desconexão (posição ${eliminationOrder.length + 1})`);
            }
            if (index < 2) {
                paddles[index].x = 0;
                paddles[index].width = constants_1.CANVAS_WIDTH;
            }
            else {
                paddles[index].y = 0;
                paddles[index].height = constants_1.CANVAS_HEIGHT;
            }
        }
    });
    const remainingActivePlayers = paddles.filter(p => !p.lost);
    if (remainingActivePlayers.length === 0) {
        (0, websockets_1.stopGame)(gameId);
        return;
    }
    const [p1, p2, p3, p4] = playerClients.map(c => c?.inputs || {});
    if (!paddles[0].lost && p1['a'] && paddles[0].x > 0)
        paddles[0].x -= constants_1.PADDLE_SPEED;
    if (!paddles[0].lost && p1['d'] && paddles[0].x < constants_1.CANVAS_WIDTH - paddles[0].width)
        paddles[0].x += constants_1.PADDLE_SPEED;
    if (!paddles[1].lost && p2['ArrowLeft'] && paddles[1].x > 0)
        paddles[1].x -= constants_1.PADDLE_SPEED;
    if (!paddles[1].lost && p2['ArrowRight'] && paddles[1].x < constants_1.CANVAS_WIDTH - paddles[1].width)
        paddles[1].x += constants_1.PADDLE_SPEED;
    if (!paddles[2].lost && p3['w'] && paddles[2].y > 0)
        paddles[2].y -= constants_1.PADDLE_SPEED;
    if (!paddles[2].lost && p3['s'] && paddles[2].y < constants_1.CANVAS_HEIGHT - paddles[2].height)
        paddles[2].y += constants_1.PADDLE_SPEED;
    if (!paddles[3].lost && p4['ArrowUp'] && paddles[3].y > 0)
        paddles[3].y -= constants_1.PADDLE_SPEED;
    if (!paddles[3].lost && p4['ArrowDown'] && paddles[3].y < constants_1.CANVAS_HEIGHT - paddles[3].height)
        paddles[3].y += constants_1.PADDLE_SPEED;
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    if (ball.y - ball.radius < 0) {
        if (paddles[0].lost && collides(ball, paddles[0])) {
            ball.speedY *= -1;
            ball.y = paddles[0].y + paddles[0].height + ball.radius;
        }
        else {
            paddles[0].score++;
            resetBall(gameState);
        }
    }
    else if (ball.y + ball.radius > constants_1.CANVAS_HEIGHT) {
        if (paddles[1].lost && collides(ball, paddles[1])) {
            ball.speedY *= -1;
            ball.y = paddles[1].y - ball.radius;
        }
        else {
            paddles[1].score++;
            resetBall(gameState);
        }
    }
    if (ball.x - ball.radius < 0) {
        if (paddles[2].lost && collides(ball, paddles[2])) {
            ball.speedX *= -1;
            ball.x = paddles[2].x + paddles[2].width + ball.radius;
        }
        else {
            paddles[2].score++;
            resetBall(gameState);
        }
    }
    else if (ball.x + ball.radius > constants_1.CANVAS_WIDTH) {
        if (paddles[3].lost && collides(ball, paddles[3])) {
            ball.speedX *= -1;
            ball.x = paddles[3].x - ball.radius;
        }
        else {
            paddles[3].score++;
            resetBall(gameState);
        }
    }
    paddles.forEach((paddle, index) => {
        if (!paddle.lost && collides(ball, paddle)) {
            let relativeImpact;
            if (index === 0 || index === 1) {
                const paddleCenter = paddle.x + paddle.width / 2;
                relativeImpact = (ball.x - paddleCenter) / (paddle.width / 2);
                const angle = relativeImpact * Math.PI / 4;
                const speed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);
                ball.speedX = speed * Math.sin(angle);
                ball.speedY = (index === 0 ? 1 : -1) * speed * Math.cos(angle);
            }
            else {
                const paddleCenter = paddle.y + paddle.height / 2;
                relativeImpact = (ball.y - paddleCenter) / (paddle.height / 2);
                const angle = relativeImpact * Math.PI / 4;
                const speed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);
                ball.speedY = speed * Math.sin(angle);
                ball.speedX = (index === 2 ? 1 : -1) * speed * Math.cos(angle);
            }
        }
    });
    paddles.forEach((paddle, index) => {
        if (paddle.score >= constants_1.LOSE_SCORE && !paddle.lost) {
            paddle.lost = true;
            const eliminatedPlayerId = playerIds[index];
            if (!eliminationOrder.includes(eliminatedPlayerId)) {
                eliminationOrder.push(eliminatedPlayerId);
                console.log(`Jogador ${websockets_1.clients.get(eliminatedPlayerId)?.username} eliminado (posição ${eliminationOrder.length + 1})`);
            }
            if (index < 2) {
                paddle.x = 0;
                paddle.width = constants_1.CANVAS_WIDTH;
            }
            else {
                paddle.y = 0;
                paddle.height = constants_1.CANVAS_HEIGHT;
            }
        }
    });
    const activePlayers = paddles.filter(p => !p.lost);
    if (activePlayers.length <= 1) {
        const winnerIndex = paddles.findIndex(p => !p.lost);
        const winnerId = winnerIndex !== -1 ? playerIds[winnerIndex] : null;
        const winnerClient = winnerId ? websockets_1.clients.get(winnerId) : null;
        const winnerData = winnerClient
            ? { id: winnerClient.id, username: winnerClient.username, profilePic: winnerClient.profilePic }
            : null;
        sendRemoteMatchHistory(gameId, playerIds, eliminationOrder);
        playerClients.forEach((client) => {
            if (client)
                client.ws.send(JSON.stringify({ type: 'game_over', winner: winnerData }));
        });
        (0, websockets_1.stopGame)(gameId);
        return;
    }
    const updateMessage = JSON.stringify({ type: 'update', ...gameState });
    playerClients.forEach(client => {
        if (client && client.ws.readyState === ws_1.WebSocket.OPEN)
            client.ws.send(updateMessage);
    });
}

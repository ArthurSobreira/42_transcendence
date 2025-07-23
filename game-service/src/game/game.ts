import { Game, GameState, Ball, Paddle, ClientData } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  BALL_RADIUS,
  PADDLE_SPEED,
  LOSE_SCORE,
  INITIAL_BALL_SPEED,
} from './constants';
import { games, clients, stopGame } from './websockets';
import { WebSocket } from 'ws';

export function startOneVsOneGame(playerIds: string[], tournamentId?: string, isFinal = false): string | null {
    if (playerIds.length !== 2) {
        console.error("Jogo 1x1 precisa de 2 jogadores.");
        return null;
    }

    const gameId = `1v1-${playerIds.join('-')}-${Date.now()}`;
    const gameState: GameState = {

        paddles: [
            { x: 20, y: CANVAS_HEIGHT / 2 - PADDLE_WIDTH / 2, width: PADDLE_HEIGHT, height: PADDLE_WIDTH, score: 0, lost: false },
            { x: CANVAS_WIDTH - PADDLE_HEIGHT - 20, y: CANVAS_HEIGHT / 2 - PADDLE_WIDTH / 2, width: PADDLE_HEIGHT, height: PADDLE_WIDTH, score: 0, lost: false },
        ],
        ball: {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
            radius: BALL_RADIUS,
            speedX: 0,
            speedY: 0
        }
    };

    resetBall(gameState);

    const newGame: Game = {
        playerIds,
        gameState,
        gameLoopInterval: null,
        speedUpInterval: null,
        tournamentId: tournamentId,
        isFinal: isFinal
    };
    games.set(gameId, newGame);

    newGame.gameLoopInterval = setInterval(() => updateGame1v1(gameId), 1000 / 60);

    newGame.speedUpInterval = setInterval(() => {
        const game = games.get(gameId);
        if (game) {
            game.gameState.ball.speedX *= 1.2;
            game.gameState.ball.speedY *= 1.2;
        }
    }, 3000);

    playerIds.forEach((id, index) => {
        const client = clients.get(id);
        if (client) {
            client.ws.send(JSON.stringify({
                type: 'game_start',
                gameId,
                opponents: playerIds.map(pid => clients.get(pid)?.username || 'Desconhecido'),
                paddles: gameState.paddles,
                ball: gameState.ball,
                playerNumber: index + 1
            }));
        }
    });
    console.log(`Jogo 1x1 no estilo multiplayer local iniciado: ${gameId}`);
    return gameId;
}

export function updateGame1v1(gameId: string) {
    const game = games.get(gameId);
    if (!game) return;

    const { gameState, playerIds } = game;
    const { ball, paddles } = gameState;
    const [p1, p2] = paddles;

    const [client1, client2] = playerIds.map(id => clients.get(id));
    if (!client1 || !client2) {
        stopGame(gameId);
        return;
    }

    const input1 = client1.inputs;
    const input2 = client2.inputs;

    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > CANVAS_HEIGHT) {
        ball.speedY *= -1;
    }

    if (ball.x - ball.radius < 0) {
        p2.score++;
        checkWinAndStopGame(gameId);
        resetBall(gameState);
    } else if (ball.x + ball.radius > CANVAS_WIDTH) {
        p1.score++;
        checkWinAndStopGame(gameId);
        resetBall(gameState);
    }

    const player = (ball.x < CANVAS_WIDTH / 2) ? p1 : p2;
    if (collides(ball, player)) {
        const collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        const angleRad = (Math.PI / 4) * collidePoint;
        const direction = (ball.x < CANVAS_WIDTH / 2) ? 1 : -1;
        const currentSpeed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);
        
        ball.speedX = direction * currentSpeed * Math.cos(angleRad);
        ball.speedY = currentSpeed * Math.sin(angleRad);
    }

    if (input1['w'] && p1.y > 0) p1.y -= PADDLE_SPEED;
    if (input1['s'] && p1.y < CANVAS_HEIGHT - p1.height) p1.y += PADDLE_SPEED;

    if (input2['ArrowUp'] && p2.y > 0) p2.y -= PADDLE_SPEED;
    if (input2['ArrowDown'] && p2.y < CANVAS_HEIGHT - p2.height) p2.y += PADDLE_SPEED;

    const updateMessage = JSON.stringify({ type: 'update', ball, paddles });
    [client1, client2].forEach(c => {
        if (c?.ws.readyState === WebSocket.OPEN) c.ws.send(updateMessage);
    });
}

function checkWinAndStopGame(gameId: string) {
    const game = games.get(gameId);
    if (!game) return;

    const { gameState, playerIds } = game;
    const [p1, p2] = gameState.paddles;
    const WIN_SCORE = LOSE_SCORE;

    if (p1.score >= WIN_SCORE || p2.score >= WIN_SCORE) {
        if (game.tournamentId) {
            stopGame(gameId);
            return;
        }

        const winnerId = p2.score >= WIN_SCORE ? playerIds[0] : playerIds[1];
        const winnerClient = clients.get(winnerId);
        const winnerData = winnerClient
            ? { id: winnerClient.id, username: winnerClient.username, profilePic: winnerClient.profilePic }
            : null;

        const gameOverMessage = JSON.stringify({ type: 'game_over', winner: winnerData });
        playerIds.forEach(id => {
            clients.get(id)?.ws.send(gameOverMessage);
        });

        stopGame(gameId);
    }
}



function createInitialGameState(): GameState {
  return {
    paddles: [
      { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: 10, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0, lost: false },
      { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - PADDLE_HEIGHT - 10, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0, lost: false },
      { x: 10, y: CANVAS_HEIGHT / 2 - PADDLE_WIDTH / 2, width: PADDLE_HEIGHT, height: PADDLE_WIDTH, score: 0, lost: false },
      { x: CANVAS_WIDTH - PADDLE_HEIGHT - 10, y: CANVAS_HEIGHT / 2 - PADDLE_WIDTH / 2, width: PADDLE_HEIGHT, height: PADDLE_WIDTH, score: 0, lost: false },
    ],
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, radius: BALL_RADIUS, speedX: 0, speedY: 0 },
  };
}

function resetBall(gameState: GameState) {
  gameState.ball.x = CANVAS_WIDTH / 2;
  gameState.ball.y = CANVAS_HEIGHT / 2;
  const angle = (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 4 + (Math.random() - 0.5) * (Math.PI/4));
  gameState.ball.speedX = Math.cos(angle) * INITIAL_BALL_SPEED;
  gameState.ball.speedY = Math.sin(angle) * INITIAL_BALL_SPEED;
}

function collides(b: Ball, p: Paddle): boolean {
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

export function startGame(playerIds: string[]) {
    const gameId = playerIds.join('-');
    const gameState = createInitialGameState();
    resetBall(gameState);

    const newGame: Game = {
        playerIds,
        gameState,
        gameLoopInterval: null,
        speedUpInterval: null,
    };
    games.set(gameId, newGame);

    newGame.speedUpInterval = setInterval(() => {
        const game = games.get(gameId);
        if (game) {
            game.gameState.ball.speedX *= 1.4;
            game.gameState.ball.speedY *= 1.4;
        }
    }, 5000);

    newGame.gameLoopInterval = setInterval(() => updateGame(gameId), 1000 / 60);

    const playerInfos = playerIds.map(id => clients.get(id)!);
    const usernames = playerInfos.map(p => p.username);

    playerIds.forEach((playerId, index) => {
        const client = clients.get(playerId);
        if (client) {
            client.ws.send(JSON.stringify({ type: 'game_start', gameId, opponents: usernames, playerNumber: index + 1 }));
        }
    });
    console.log(`Jogo iniciado entre 4 jogadores. GameId: ${gameId}`);
}

export function updateGame(gameId: string) {
    const game = games.get(gameId);
    if (!game) return;

    const { gameState, playerIds } = game;
    const { ball, paddles } = gameState;

    const playerClients = playerIds.map(id => clients.get(id));
    if (playerClients.some(c => !c)) {
        stopGame(gameId);
        return;
    }

    const [p1, p2, p3, p4] = playerClients.map(c => c!.inputs);
    if (!paddles[0].lost && p1['a'] && paddles[0].x > 0) paddles[0].x -= PADDLE_SPEED;
    if (!paddles[0].lost && p1['d'] && paddles[0].x < CANVAS_WIDTH - paddles[0].width) paddles[0].x += PADDLE_SPEED;
    if (!paddles[1].lost && p2['ArrowLeft'] && paddles[1].x > 0) paddles[1].x -= PADDLE_SPEED;
    if (!paddles[1].lost && p2['ArrowRight'] && paddles[1].x < CANVAS_WIDTH - paddles[1].width) paddles[1].x += PADDLE_SPEED;
    if (!paddles[2].lost && p3['w'] && paddles[2].y > 0) paddles[2].y -= PADDLE_SPEED;
    if (!paddles[2].lost && p3['s'] && paddles[2].y < CANVAS_HEIGHT - paddles[2].height) paddles[2].y += PADDLE_SPEED;
    if (!paddles[3].lost && p4['ArrowUp'] && paddles[3].y > 0) paddles[3].y -= PADDLE_SPEED;
    if (!paddles[3].lost && p4['ArrowDown'] && paddles[3].y < CANVAS_HEIGHT - paddles[3].height) paddles[3].y += PADDLE_SPEED;

    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.y - ball.radius < 0) {
        if (paddles[0].lost && collides(ball, paddles[0])) {
            ball.speedY *= -1;
            ball.y = paddles[0].y + paddles[0].height + ball.radius;
        } else {
            paddles[0].score++;
            resetBall(gameState);
        }
    } else if (ball.y + ball.radius > CANVAS_HEIGHT) {
        if (paddles[1].lost && collides(ball, paddles[1])) {
            ball.speedY *= -1;
            ball.y = paddles[1].y - ball.radius;
        } else {
            paddles[1].score++;
            resetBall(gameState);
        }
    }

    if (ball.x - ball.radius < 0) {
        if (paddles[2].lost && collides(ball, paddles[2])) {
            ball.speedX *= -1;
            ball.x = paddles[2].x + paddles[2].width + ball.radius;
        } else {
            paddles[2].score++;
            resetBall(gameState);
        }
    } else if (ball.x + ball.radius > CANVAS_WIDTH) {
        if (paddles[3].lost && collides(ball, paddles[3])) {
            ball.speedX *= -1;
            ball.x = paddles[3].x - ball.radius;
        } else {
            paddles[3].score++;
            resetBall(gameState);
        }
    }
  
    paddles.forEach((paddle, index) => {
        if (!paddle.lost && collides(ball, paddle)) {
            let relativeImpact: number;
            if (index === 0 || index === 1) {
                const paddleCenter = paddle.x + paddle.width / 2;
                relativeImpact = (ball.x - paddleCenter) / (paddle.width / 2);
                const angle = relativeImpact * Math.PI / 4;
                const speed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);
                ball.speedX = speed * Math.sin(angle);
                ball.speedY = (index === 0 ? 1 : -1) * speed * Math.cos(angle);
            } else {
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
        if (paddle.score >= LOSE_SCORE && !paddle.lost) {
            paddle.lost = true;
            if(index < 2) { paddle.x = 0; paddle.width = CANVAS_WIDTH; }
            else { paddle.y = 0; paddle.height = CANVAS_HEIGHT; }
        }
    });

    const activePlayers = paddles.filter(p => !p.lost);
    if (activePlayers.length <= 1) {
        const winnerIndex = paddles.findIndex(p => !p.lost);
        const winnerId = winnerIndex !== -1 ? playerIds[winnerIndex] : null;
        const winnerClient = winnerId ? clients.get(winnerId) : null;
        
        const winnerData = winnerClient 
            ? { id: winnerClient.id, username: winnerClient.username, profilePic: winnerClient.profilePic }
            : null;

        playerClients.forEach((client) => {
            if(client) client.ws.send(JSON.stringify({ type: 'game_over', winner: winnerData }));
        });
        stopGame(gameId);
        return;
    }

    const updateMessage = JSON.stringify({ type: 'update', ...gameState });
    playerClients.forEach(client => {
        if (client && client.ws.readyState === WebSocket.OPEN) client.ws.send(updateMessage);
    });
}
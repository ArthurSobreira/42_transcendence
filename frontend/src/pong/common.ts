import { fetchWithGame, fetchWithAuth } from "../api/api";
import { t } from '../i18n';

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  score: number;
  lost?: boolean;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
}

export const PADDLE_WIDTH = 15, PADDLE_HEIGHT = 100, BALL_RADIUS = 10;
export const PADDLE_SPEED = 8;
export const AI_SPEED = PADDLE_SPEED;
export const WIN_SCORE = 3;
export const LOSE_SCORE = 5;

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let ball: Ball | null = null;
let paddles: Paddle[] = [];
let animationFrameId: number | null = null;
let isWaiting = false;
let playerNames: string[] = [];

export const keys: { [key: string]: boolean } = {};

export const getCanvas = () => canvas;
export const getCtx = () => ctx;
export const getBall = () => ball;
export const getPaddles = () => paddles;
export const getPlayer1 = () => paddles[0];
export const getPlayer2 = () => paddles[1];

export const setBall = (newBall: Ball | null) => { ball = newBall; };
export const setPaddles = (newPaddles: Paddle[]) => { paddles = newPaddles; };
export const setAnimationFrameId = (id: number | null) => { animationFrameId = id; };
export const setIsWaiting = (waiting: boolean) => { isWaiting = waiting; };
export const setPlayerNames = (names: string[]) => { playerNames = names; };

export function keyDownHandler(e: KeyboardEvent) { keys[e.key] = true; }
export function keyUpHandler(e: KeyboardEvent) { keys[e.key] = false; }

export function initSharedState(): boolean {
  canvas = document.getElementById('pongCanvas') as HTMLCanvasElement;
  if (!canvas) return false;
  ctx = canvas.getContext('2d')!;

  if (!ball) {
    ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: BALL_RADIUS,
      speedX: 5,
      speedY: 0
    };
  }

  if (paddles.length === 0) {
    paddles = [
      { x: 20, y: canvas.height / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0 },
      { x: canvas.width - 20 - PADDLE_WIDTH, y: canvas.height / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0 }
    ];
  }

  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);
  return true;
}

export function stopSharedState(): void {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    setAnimationFrameId(null);
  }
  document.removeEventListener('keydown', keyDownHandler);
  document.removeEventListener('keyup', keyUpHandler);
  paddles = [];
  ball = null;
}


export function collides(b: Ball, p: Paddle): boolean {
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

export function resetBall() {
  if (ball) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.speedY = (Math.random() * 6) - 3;
  }
}


export function draw() {
    if (!canvas || !ctx) return;
    
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (isWaiting) {
      ctx.fillStyle = 'white';
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(t().waitingOpponents, canvas.width / 2, canvas.height / 2);
      return;
    }
    
    if (!ball || paddles.length === 0) return;
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    paddles.forEach((p, index) => {
        ctx.fillStyle = p.lost ? 'red' : 'white';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';

        const name = playerNames[index] || `P${index + 1}`;
        if (paddles.length === 4) {
             if (index === 0) {
                ctx.fillText(`${name}: ${p.score}`, canvas.width / 2, 30);
             }
             if (index === 1) {
                ctx.fillText(`${name}: ${p.score}`, canvas.width / 2, canvas.height - 20);
             }
             if (index === 2) {
                ctx.save();
                ctx.translate(30, canvas.height / 2);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(`${name}: ${p.score}`, 0, 0);
                ctx.restore();
             }
             if (index === 3) {
                ctx.save();
                ctx.translate(canvas.width - 30, canvas.height / 2);
                ctx.rotate(Math.PI / 2);
                ctx.fillText(`${name}: ${p.score}`, 0, 0);
                ctx.restore();
             }
        } else {
            if (index === 0) ctx.fillText(`${name}: ${p.score}`, canvas.width / 4, 30);
            if (index === 1) ctx.fillText(`${name}: ${p.score}`, (canvas.width / 4) * 3, 30);
        }
    });
}

export async function sendMatchHistory(gameType: string, tournamentName: string, player1Username: string | null, player1Points: number | null, player2Username: string | null, player2Points: number | null, player3Username: string | null = null, player3Points: number | null = null, player4Username: string | null = null, player4Points: number | null = null) {
  try {
    const historyData = {
      gameType: gameType.toUpperCase(),
      tournamentName: tournamentName,
      player1Username: player1Username,
      player1Points: player1Points,
      player2Username: player2Username,
      player2Points: player2Points,
      player3Username: player3Username,
      player3Points: player3Points,
      player4Username: player4Username,
      player4Points: player4Points,
    };

    await fetchWithGame('/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(historyData),
    });
  } catch (error) {
    console.error('Falha ao enviar histórico da partida:', error);
  }
}

export async function getUserProfile(): Promise<{ username: string, profilePic: string }> {
  try {
    const response = await fetchWithAuth('/users/me');
    const user = await response.json();

    return {
      uuid: user.Username || t().defaultPlayer + ' 1',
      profilePic: user.ProfilePic || 'https://placehold.co/128x128/000000/FFFFFF?text=P1'
    };
  } catch {
    return { uuid: t().defaultPlayer + ' 1', profilePic: 'https://placehold.co/128x128/000000/FFFFFF?text=P1' };
  }
}

export async function getCachoraoProfile(): Promise<{ username: string, profilePic: string }> {
  try {
    // talvez const response = await fetchWithAuth('/users/exists/cachorrao'); ?
    const response = await fetch('/api/users/exists/cachorrao');


    if (!response.ok) {
      return { uuid: 'Cachorrao', profilePic: '/img/cachorrao.jpg' };
    }
    
    const userResponse = await fetch('/api/users?username=cachorrao');
    
    if (!userResponse.ok) {
      return { uuid: 'Cachorrao', profilePic: '/img/cachorrao.jpg' };
    }
    
    const user = await userResponse.json();
    return { 
      uuid: user.Username || 'Cachorrao',
      profilePic: user.ProfilePic || '/img/cachorrao.jpg'
    };
  } catch (error) {
    console.error('Erro ao buscar perfil do Cachorrao:', error);
    return { uuid: 'Cachorrao', profilePic: '/img/cachorrao.jpg' };
  }
}
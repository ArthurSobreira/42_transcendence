import { fetchWithAuth } from '../api/api';
import { t } from '../i18n';
import {
  initSharedState, stopSharedState, draw, keys,
  setBall, setPaddles, setAnimationFrameId, setIsWaiting,
  setPlayerNames,
} from './common';

let ws: WebSocket | null = null;
let animationFrameId: number | null = null;

async function getUserProfile(): Promise<{ username: string, profilePic: string }> {
  try {
    const response = await fetchWithAuth('/users/me');
    if (!response.ok) {
      return { uuid: 'Anônimo', profilePic: 'https://placehold.co/128x128/000000/FFFFFF?text=User' };
    }
    const user = await response.json();
    return { 
        uuid: user.Username || 'Anônimo',
        profilePic: user.ProfilePic || 'https://placehold.co/128x128/000000/FFFFFF?text=User'
    };
  } catch (error) {
    return { uuid: 'Anônimo', profilePic: 'https://placehold.co/128x128/000000/FFFFFF?text=User' };
  }
}

function renderWaitingRoom(players: any[]) {
    const waitingRoomDiv = document.getElementById('waiting-room')!;
    const gameContainerDiv = document.getElementById('game-container')!;
    const slotsDiv = document.getElementById('player-slots')!;
    const waitingMessage = document.getElementById('waiting-message')!;

    waitingRoomDiv.classList.remove('hidden');
    gameContainerDiv.classList.add('hidden');
    slotsDiv.innerHTML = '';

    for (let i = 0; i < 4; i++) {
        const player = players[i];
        let slotHtml: string;
        if (player) {
            slotHtml = `
                <div class="bg-slate-800 p-4 rounded-lg flex flex-col items-center justify-center border-2 border-white shadow-retro h-48 transition-all duration-300 transform hover:scale-105">
                    <img src="${player.profilePic}" alt="Foto de ${player.username}" class="w-24 h-24 rounded-full mb-4 border-2 border-indigo-400">
                    <p class="text-lg truncate">${player.username}</p>
                </div>
            `;
        } else {
            slotHtml = `
                <div class="bg-slate-900 p-4 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-600 h-48">
                    <p class="text-lg text-gray-500">${t().waiting}</p>
                </div>
            `;
        }
        slotsDiv.innerHTML += slotHtml;
    }
    waitingMessage.textContent = t().waitingMorePlayers.replace('{{count}}', (4 - players.length).toString());
}

function updateRemote() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'keys',
      keys: {
        'w': keys['w'], 's': keys['s'],
        'a': keys['a'], 'd': keys['d'],
        'ArrowUp': keys['ArrowUp'], 'ArrowDown': keys['ArrowDown'],
        'ArrowLeft': keys['ArrowLeft'], 'ArrowRight': keys['ArrowRight']
      }
    }));
  }
}

function gameLoop() {
  updateRemote();
  draw();
  animationFrameId = requestAnimationFrame(gameLoop);
  setAnimationFrameId(animationFrameId);
}

export async function initRemoteGame() {
  if (!initSharedState()) return;

  const { username, profilePic } = await getUserProfile();
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    window.location.hash = '/login';
    return;
  }
  const payload = JSON.parse(atob(token.split('.')[1]));
  const userId = payload.uuid;

  ws = new WebSocket(`wss://localhost:3001?userId=${userId}&username=${encodeURIComponent(username)}&profilePic=${encodeURIComponent(profilePic)}&mode=remote&token=${encodeURIComponent(token)}`);

  ws.onopen = () => {
      console.log(`WebSocket conectado como ${username}.`);
      renderWaitingRoom([]);
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
      case 'lobby_update':
        renderWaitingRoom(message.players);
        break;
      case 'game_start':
        document.getElementById('waiting-room')?.classList.add('hidden');
        document.getElementById('game-container')?.classList.remove('hidden');
        setIsWaiting(false);
        const playerNames = message.opponents;
        setPlayerNames(playerNames);
        if(message.paddles && message.ball){
          setPaddles(message.paddles);
          setBall(message.ball);
        }
        gameLoop();
        break;
      case 'update':
        setBall(message.ball);
        setPaddles(message.paddles);
        break;
      case 'game_over':
        stopRemoteGame();
        if (message.winner) {
          const { username, profilePic } = message.winner;
          const path = `/winner?username=${encodeURIComponent(username)}&profilePic=${encodeURIComponent(profilePic)}`;
          history.pushState({}, '', path);
          window.dispatchEvent(new PopStateEvent('popstate'));
        } else {
            alert(t().gameEndedNoWinner);
            window.location.hash = '/';
        }
        break;
      case 'opponent_disconnected':
        alert(t().opponentDisconnected);
        stopRemoteGame();
        window.location.hash = '/';
        break;
      case 'error':
        alert(`${t().serverError}: ${message.message}`);
        stopRemoteGame();
        window.location.hash = '/';
        break;
    }
  };

  ws.onclose = () => {
    if (animationFrameId === null) {
        alert(t().connectionLostLobby);
        stopRemoteGame();
        window.location.hash = '/';
    }
  };
}

export function stopRemoteGame() {
  stopSharedState();
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    setAnimationFrameId(null);
    animationFrameId = null;
  }
  if (ws) {
    ws.onmessage = null;
    ws.onclose = null;
    ws.close();
    ws = null;
  }
  setIsWaiting(false);
  
  const waitingRoomDiv = document.getElementById('waiting-room');
  const gameContainerDiv = document.getElementById('game-container');
  if (waitingRoomDiv) waitingRoomDiv.classList.add('hidden');
  if (gameContainerDiv) gameContainerDiv.classList.remove('hidden');
}
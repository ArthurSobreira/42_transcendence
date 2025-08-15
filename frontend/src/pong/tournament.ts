import { fetchWithAuth } from '../api/api';
import { t } from '../i18n';
import {
  initSharedState, stopSharedState, draw, keys,
  setBall, setPaddles, setAnimationFrameId, setIsWaiting,
  setPlayerNames,
} from './common';

let ws: WebSocket | null = null;
let animationFrameId: number | null = null;
let userNickname: string = '';
let currentTournamentName: string = `Tournament-${Date.now()}`;

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

function getPlayerHTML(player: any | null) {
    if (player) {
        return `
            <div class="flex flex-col items-center">
                <img src="${player.profilePic}" alt="${player.username}" class="w-24 h-24 rounded-full border-4 border-white mb-2">
                <span class="text-lg">${player.username}</span>
            </div>
        `;
    }
    return `
        <div class="flex flex-col items-center">
            <div class="w-24 h-24 rounded-full border-4 border-dashed border-gray-500 flex items-center justify-center">
                <span class="text-gray-500 text-4xl">?</span>
            </div>
            <span class="text-lg text-gray-500">${t().waiting}</span>
        </div>
    `;
}


function renderWaitingRoom(players: any[]) {
    const waitingRoomDiv = document.getElementById('waiting-room');
    const gameContainerDiv = document.getElementById('game-container');
    const slotsDiv = document.getElementById('player-slots');
    const waitingMessage = document.getElementById('waiting-message');

    if (!waitingRoomDiv || !gameContainerDiv || !slotsDiv || !waitingMessage) return;

    waitingRoomDiv.classList.remove('hidden');
    gameContainerDiv.classList.add('hidden');

    slotsDiv.innerHTML = `
        <div class="flex justify-around items-center w-full">
            ${getPlayerHTML(players[0])}
            <span class="text-4xl text-glow mx-4">${t().vs.toUpperCase()}</span>
            ${getPlayerHTML(players[1])}
        </div>
        <div class="flex justify-around items-center w-full mt-8">
            ${getPlayerHTML(players[2])}
            <span class="text-4xl text-glow mx-4">${t().vs.toUpperCase()}</span>
            ${getPlayerHTML(players[3])}
        </div>
    `;

    const remaining = 4 - players.length;
    waitingMessage.textContent = remaining > 0 ? t().waitingMorePlayers.replace('{{count}}', remaining.toString()) : t().tournamentStarting;
}



function setupTournamentEventListeners() {
    const nicknameModal = document.getElementById('nickname-modal');
    const nicknameInput = document.getElementById('nickname-input') as HTMLInputElement;
    const confirmNicknameButton = document.getElementById('confirm-nickname-button');
    const cancelNicknameButton = document.getElementById('cancel-nickname-button');
    const nicknameError = document.getElementById('nickname-error');
    const nicknameDuplicateError = document.getElementById('nickname-duplicate-error');

    confirmNicknameButton?.addEventListener('click', () => {
        const nickname = nicknameInput?.value.trim();
        if (!nickname) {
            nicknameError?.classList.remove('hidden');
            nicknameDuplicateError?.classList.add('hidden');
            return;
        }
        
        nicknameError?.classList.add('hidden');
        nicknameDuplicateError?.classList.add('hidden');
        userNickname = nickname;
        
        nicknameModal?.classList.add('hidden');
        
        startTournamentGameWithNickname();
    });

    cancelNicknameButton?.addEventListener('click', () => {
        nicknameModal?.classList.add('hidden');
        nicknameInput.value = '';
        nicknameError?.classList.add('hidden');
        nicknameDuplicateError?.classList.add('hidden');
        window.location.hash = '/';
    });

    nicknameInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmNicknameButton?.click();
        }
    });

    nicknameInput?.addEventListener('input', () => {
        if (nicknameInput.value.trim()) {
            nicknameError?.classList.add('hidden');
            nicknameDuplicateError?.classList.add('hidden');
        }
    });
}

function updateRemoteTournament() {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'keys',
      keys: {
        'w': keys['w'], 's': keys['s'],
        'ArrowUp': keys['ArrowUp'], 'ArrowDown': keys['ArrowDown'],
      }
    }));
  }
}

function gameLoopTournament() {
  updateRemoteTournament();
  draw();
  animationFrameId = requestAnimationFrame(gameLoopTournament);
  setAnimationFrameId(animationFrameId);
}

async function startTournamentGameWithNickname() {
    stopTournamentGame();
    if (!initSharedState()) return;

    document.getElementById('nickname-modal')?.classList.add('hidden');
    document.getElementById('waiting-room')?.classList.remove('hidden');

    const { username: realUsername, profilePic } = await getUserProfile();
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.hash = '/login';
        return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.uuid;

    ws = new WebSocket(`wss://localhost:3001?userId=${userId}&username=${encodeURIComponent(userNickname)}&realUsername=${encodeURIComponent(realUsername)}&profilePic=${encodeURIComponent(profilePic)}&mode=tournament&token=${encodeURIComponent(token)}&tournamentName=${encodeURIComponent(currentTournamentName)}`);

    ws.onopen = () => {
        console.log(`WebSocket conectado como ${userNickname}. Aguardando jogadores...`);
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        switch (message.type) {
            case 'lobby_update':
                renderWaitingRoom(message.players);
                break;

            case 'game_start':
            document.getElementById('waiting-room')?.classList.add('hidden');
            document.getElementById('final-waiting-room')?.classList.add('hidden');
            document.getElementById('nickname-modal')?.classList.add('hidden');
            
            document.getElementById('game-container')?.classList.remove('hidden');
            
            setIsWaiting(false);
            const playerNames = message.opponents;
            setPlayerNames(playerNames);
            if(message.paddles && message.ball){
                setPaddles(message.paddles);
                setBall(message.ball);
            }
            gameLoopTournament();
            break;

            case 'update':
                setBall(message.ball);
                setPaddles(message.paddles);
                break;

            case 'game_over':
                stopTournamentGame();
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

            case 'semifinal_win':
                renderFinalsWaitingRoom(message.winners);
                break;

            case 'semifinal_loss':
                stopTournamentGame();
                history.pushState({}, '', '/defeat');
                window.dispatchEvent(new PopStateEvent('popstate'));
                break;

            case 'final_ready':
                renderFinalsWaitingRoom(message.finalists);
                break;

            case 'opponent_ready':
                const readyStatus = document.getElementById('ready-status')!;
                readyStatus.textContent = t().opponentReady;
                break;

            case 'opponent_disconnected':
                alert(t().opponentDisconnected);
                stopTournamentGame();
                window.location.hash = '/';
                break;

            case 'error':
                if (message.message && message.message.includes('já está sendo usado')) {
                    document.getElementById('nickname-modal')?.classList.remove('hidden');
                    document.getElementById('waiting-room')?.classList.add('hidden');
                    document.getElementById('nickname-duplicate-error')?.classList.remove('hidden');
                    document.getElementById('nickname-error')?.classList.add('hidden');
                    
                    const nicknameInput = document.getElementById('nickname-input') as HTMLInputElement;
                    nicknameInput?.focus();
                    nicknameInput?.select();
                } else {
                    alert(`${t().serverError}: ${message.message}`);
                    stopTournamentGame();
                    window.location.hash = '/';
                }
                break;
        }
    };

    ws.onclose = () => {
        if (document.getElementById('game-container')?.classList.contains('hidden')) {
            console.log("Conexão WebSocket fechada.");
        } else {
            alert(t().connectionLost);
        }
        stopTournamentGame();
        window.location.hash = '/';
    };

    ws.onerror = (err) => {
        console.error("Erro no WebSocket: ", err);
        alert(t().connectionError);
        stopTournamentGame();
        window.location.hash = '/';
    };

    document.getElementById('ready-button')?.addEventListener('click', () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'final_ready_click' }));
            const readyButton = document.getElementById('ready-button') as HTMLButtonElement;
            const readyStatus = document.getElementById('ready-status')!;
            readyButton.textContent = t().waitingOpponent;
            readyButton.disabled = true;
            readyStatus.textContent = "";
        }
    });
}


export async function initTournamentGame() {
    setupTournamentEventListeners();
    
    userNickname = '';
    currentTournamentName = `Tournament-${Date.now()}`;
    
    document.getElementById('nickname-modal')?.classList.remove('hidden');
    document.getElementById('waiting-room')?.classList.add('hidden');
    document.getElementById('game-container')?.classList.add('hidden');
    document.getElementById('final-waiting-room')?.classList.add('hidden');
    
    document.getElementById('nickname-error')?.classList.add('hidden');
    document.getElementById('nickname-duplicate-error')?.classList.add('hidden');
    
    const nicknameInput = document.getElementById('nickname-input') as HTMLInputElement;
    if (nicknameInput) {
        nicknameInput.value = '';
        nicknameInput.focus();
    }
}


export function stopTournamentGame() {
    stopSharedState();

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        setAnimationFrameId(null);
        animationFrameId = null;
    }

    if (ws) {
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        if (ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
        ws = null;
    }

    const readyButton = document.getElementById('ready-button') as HTMLButtonElement;
    if (readyButton) {
        readyButton.textContent = t().ready;
        readyButton.disabled = false;
        readyButton.classList.add('hidden');
    }

    document.getElementById('final-waiting-room')?.classList.add('hidden');
    document.getElementById('waiting-room')?.classList.add('hidden');
    document.getElementById('game-container')?.classList.remove('hidden');
}


function renderFinalsWaitingRoom(finalists: any[]) {
    const finalWaitingRoom = document.getElementById('final-waiting-room')!;
    const initialWaitingRoom = document.getElementById('waiting-room')!;
    const gameContainer = document.getElementById('game-container')!;
    const finalistsDisplay = document.getElementById('finalists-display')!;
    const readyButton = document.getElementById('ready-button')!;

    initialWaitingRoom.classList.add('hidden');
    gameContainer.classList.add('hidden');
    finalWaitingRoom.classList.remove('hidden');

    const player1 = finalists[0];
    const player2 = finalists[1];

    let player2HTML;
    if (player2) {
        player2HTML = `
            <div class="flex flex-col items-center text-center w-1/3">
                <img src="${player2.profilePic}" alt="${player2.username}" class="w-32 h-32 rounded-full border-4 border-white mb-2">
                <span class="text-2xl truncate">${player2.username}</span>
            </div>`;
        readyButton.classList.remove('hidden');
    } else {
        player2HTML = `
            <div class="flex flex-col items-center text-center w-1/3">
                <div class="w-32 h-32 rounded-full border-4 border-dashed border-gray-500 flex items-center justify-center">
                    <span class="text-gray-400 text-lg">EM ESPERA...</span>
                </div>
                <span class="text-2xl text-gray-500">Aguardando oponente</span>
            </div>`;
    }

    finalistsDisplay.innerHTML = `
        <div class="flex flex-col items-center text-center w-1/3">
            <img src="${player1.profilePic}" alt="${player1.username}" class="w-32 h-32 rounded-full border-4 border-white mb-2">
            <span class="text-2xl truncate">${player1.username}</span>
        </div>
        <span class="text-6xl text-glow mx-8">${t().vs.toUpperCase()}</span>
        ${player2HTML}
    `;
}

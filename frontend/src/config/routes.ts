import { initPongGame } from '../pong/game';
import { initRpsGame } from '../rps/game';
import { showProfile } from '../pages/profile';
import { showWinner } from '../pages/winner';
import { initTournamentGame } from '../pong/tournament';

export const routes = [
  { path: '/login', view: 'login' },
  { path: '/', view: 'mainMenu' },
  { path: '/pong', view: 'pongModeSelection' },
  { path: '/pong/singleplayer', view: 'pongGame', action: () => initPongGame('singleplayer') },
  { path: '/pong/multiplayer', view: 'pongGame', action: () => initPongGame('multiplayer') },
  { path: '/pong/remote-multiplayer', view: 'pongGame', action: () => initPongGame('remote-multiplayer') },
  { path: '/pong/tournament', view: 'pongTournament', action: initTournamentGame },
  { path: '/rps', view: 'rps', action: initRpsGame },
  { path: '/creators', view: 'creators' },
  { path: '/profile', view: 'profile', action: showProfile },
  { path: '/winner', view: 'winner', action: showWinner },
  { path: '/defeat', view: 'defeat' },
];
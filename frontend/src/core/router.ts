import { routes } from '../config/routes';
import { renderView } from './view';
import { stopPongGame } from '../pong/game';
import { logout, initializeAuth } from '../auth/auth';
import { fetchWithAuth, isUserAuthenticated } from '../api/api';

const appContainer = document.getElementById('app') as HTMLDivElement;
let statusListenersActive = false;

export async function updateUserStatus(isOnline: boolean) {
  try {
    await fetchWithAuth('/users/me/status', {
      method: 'PUT',
      body: JSON.stringify({ isOnline }),
    });
  } catch (error) {
    console.error('Falha ao atualizar status:', error);
  }
}

const handleFocus = () => updateUserStatus(true);
const handleBlur = () => updateUserStatus(false);

const handleUnload = () => {
  if (isUserAuthenticated()) {
    navigator.sendBeacon('/api/users/me/status', JSON.stringify({ isOnline: false }));
  }
};
function startStatusListeners() {
    if (statusListenersActive) return;
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('unload', handleUnload);
    statusListenersActive = true;
}

export function stopStatusListeners() {
    if (!statusListenersActive) return;
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('blur', handleBlur);
    window.removeEventListener('unload', handleUnload);
    statusListenersActive = false;
}

export async function router() {
  const path = window.location.pathname;
  const gameRoutes = [
    '/pong/singleplayer',
    '/pong/multiplayer',
    '/pong/remote-multiplayer',
    '/pong/tournament',
    '/rps'
  ];

  if (gameRoutes.includes(path)) {
    document.body.classList.add('in-game');
  } else {
    document.body.classList.remove('in-game');
  }

  stopPongGame();
  stopStatusListeners();

  appContainer.innerHTML = `<h1>Carregando...</h1>`;
  const isAuthenticated = isUserAuthenticated();
  const isProtectedRoute = !['/login'].includes(path);

  if (!isAuthenticated && isProtectedRoute) {
    history.pushState({}, '', '/login');
    await router();
    return;
  }

  if (isAuthenticated && path === '/login') {
    history.pushState({}, '', '/');
    await router();
    return;
  }

  if (isAuthenticated && isProtectedRoute) {
    startStatusListeners();
    updateUserStatus(true);
  }

  const route = routes.find(r => r.path === path);

  if (route) {
    if ((route.path === '/profile' || route.path === '/winner') && route.action) {
      appContainer.innerHTML = await (route.action as Function)();
    } else {
      appContainer.innerHTML = await renderView(route.view);
      if (route.action) {
        setTimeout(() => (route.action as Function)(), 1);
      }
    } 

    if (route.view === 'login') {
      initializeAuth();
    }
  } else {
    appContainer.innerHTML = await renderView('404');
  }
}

document.body.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const navLink = target.closest('[data-navigate]');
  if (navLink) {
    e.preventDefault();
    const path = navLink.getAttribute('data-navigate')!;
    history.pushState({}, '', path);
    router();
  }
});

window.addEventListener('popstate', router);
window.addEventListener('auth-error', logout);
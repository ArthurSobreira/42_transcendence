import { API_BASE_URL, GOOGLE_CLIENT_ID } from '../utils/constants';
import { updateProfileLink } from '../components/profileLink';
import { stopStatusListeners } from '../core/router';
import { isUserAuthenticated } from '../api/api';
import { t, ErrorKeys } from '../i18n';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: any) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme: string;
              size: string;
              type: string;
            }
          ) => void;
        };
      };
    };
  }
}

function navigateTo(path: string) {
  history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function logout() {
  if (isUserAuthenticated()) {
    navigator.sendBeacon(`${API_BASE_URL}/users/me/status`, JSON.stringify({ isOnline: false }));
  }

  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  localStorage.removeItem('jwtToken');

  stopStatusListeners();
  updateProfileLink();
  navigateTo('/login');
}

async function handleAuthSuccess(data: any) {
  if (data.token) {
    document.cookie = `token=${data.token}; path=/; max-age=3600; samesite=lax`;
    localStorage.setItem('jwtToken', data.token);
  }

  setTimeout(() => {
    updateProfileLink();
    navigateTo('/');
  }, 100);
}

function displayAuthError(backendMessage?: string) {
  const errorElement = document.getElementById('auth-error');
  if (errorElement) {
    if (backendMessage) {
      const firstError = backendMessage.split('\n')[0];

      const cleanMessage = firstError.split('Message:')[1]?.trim() || firstError;
      
      const errorTranslations = t().errors;
      const displayMessage = errorTranslations[cleanMessage as ErrorKeys] || errorTranslations["Default Error"];
      
      errorElement.textContent = displayMessage;
      errorElement.style.display = 'block';
    } else {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }
}

async function handleEmailLogin(event: Event) {
    event.preventDefault();
    displayAuthError();
    const email = (document.getElementById('login-email') as HTMLInputElement).value;
    const password = (document.getElementById('login-password') as HTMLInputElement).value;

    try {
        const res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email, 
                password, 
                isOnline: true, 
                lastLogin: new Date().toISOString() 
            }),
        });

        const data = await res.json();
        if (res.ok) {
            await handleAuthSuccess(data);
        } else {
            displayAuthError(data.message || 'Falha no login.');
        }
    } catch (err) {
        console.error("Erro ao tentar fazer login:", err);
        displayAuthError("Erro de rede. Tente novamente.");
    }
}

async function handleRegister(event: Event) {
    event.preventDefault();
    displayAuthError();
    const username = (document.getElementById('register-username') as HTMLInputElement).value;
    const email = (document.getElementById('register-email') as HTMLInputElement).value;
    const password = (document.getElementById('register-password') as HTMLInputElement).value;
    const anonymous = (document.getElementById('share-email-checkbox') as HTMLInputElement).checked;

    try {
        const res = await fetch(`${API_BASE_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                email, 
                password,
                anonymous: anonymous,
                profilePic: null,
                lastLogin: null
            }),
        });
        console.log("Resposta do servidor:", res);
        const data = await res.json();
        if (res.ok) {
          console.log("Dados recebidos:", data);
            await handleAuthSuccess(data);
        } else {
            console.log("Erro na resposta do servidor:", data);
            displayAuthError(data.message || 'Falha no cadastro.');
        }
    } catch (err) {
        console.error("Erro ao tentar se cadastrar:", err);
        displayAuthError("Erro de rede. Tente novamente.");
    }
}

export async function handleGoogleCredentialResponse(response: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential }),
    });

    if (res.ok) {
      const data = await res.json();
      await handleAuthSuccess(data);
    } else {
      const errorData = await res.json();
      displayAuthError(`Falha no login com Google: ${errorData.message}`);
    }
  } catch (err) {
    console.error("Erro ao tentar fazer login com Google:", err);
    displayAuthError("Erro de rede. Não foi possível conectar ao servidor.");
  }
}

function setupViews() {
    const initialView = document.getElementById('initial-view');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');

    const showLoginBtn = document.getElementById('show-login-view');
    const showRegisterBtn = document.getElementById('show-register-view');

    const backFromLoginBtn = document.getElementById('back-to-initial-from-login');
    const backFromRegisterBtn = document.getElementById('back-to-initial-from-register');

    const showView = (viewToShow: HTMLElement | null) => {
        initialView?.classList.add('hidden');
        loginView?.classList.add('hidden');
        registerView?.classList.add('hidden');
        viewToShow?.classList.remove('hidden');
        displayAuthError();
    };

    showLoginBtn?.addEventListener('click', () => showView(loginView));
    showRegisterBtn?.addEventListener('click', () => showView(registerView));

    backFromLoginBtn?.addEventListener('click', () => showView(initialView));
    backFromRegisterBtn?.addEventListener('click', () => showView(initialView));
}

export function initializeAuth() {
  let attempts = 0;
  const maxAttempts = 100;

  const checkGoogleReady = setInterval(() => {
    const googleSignInElement = document.getElementById("g_id_signin");
    if (typeof window.google !== 'undefined' && window.google.accounts && googleSignInElement) {
      clearInterval(checkGoogleReady);
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse
        });
        window.google.accounts.id.renderButton(
          googleSignInElement,
          { theme: "outline", size: "large", type: 'standard' }
        );

        setupViews();

        document.getElementById('email-login-form')?.addEventListener('submit', handleEmailLogin);
        document.getElementById('register-account-form')?.addEventListener('submit', handleRegister);

      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
      }
    } else {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(checkGoogleReady);
        console.error("A API do Google não carregou a tempo ou o elemento 'g_id_signin' não foi encontrado");
      }
    }
  }, 100);
}
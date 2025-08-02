import { fetchWithAuth } from '../api/api';
import { logout } from '../auth/auth';
import { renderView } from '../core/view';
import { getCurrentLanguage, t, ErrorKeys } from '../i18n';
import { API_BASE_URL } from '../utils/constants';

function displayProfileError(errorKey: ErrorKeys) {
  const errorElement = document.getElementById('profile-error-message');
  console.log("Displaying profile error:", errorKey);
  if (errorElement) {
    errorElement.textContent = t().errors[errorKey] || t().errors['Default Error'];
  }
}

export async function showProfile(): Promise<string> {
  try {
    const response = await fetchWithAuth('/users/me');
    const user = await response.json();
    const tempEmail = user.Email;

    if (!tempEmail.includes('@')) {
      user.Email = '00110100 00110010';
    }

    user.ProfilePic = user.ProfilePic || '/img/cachorrao_user.png';
    user.statusText = user.isOnline ? 'Online' : 'Offline';
    user.statusColor = user.isOnline ? 'text-green-500' : 'text-red-500';

    if (user.lastLogin) {
      const lang = getCurrentLanguage();
      const date = new Date(user.lastLogin);
      user.formattedLastLogin = date.toLocaleString(lang, {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
    } else {
      user.formattedLastLogin = 'Nunca';
    }

    const viewHtml = await renderView('profile', { user });

    setTimeout(() => {
      document.getElementById('logout-button')?.addEventListener('click', logout);

      const editProfileButton = document.getElementById('edit-profile-button');
      const editProfileModal = document.getElementById('edit-profile-modal');
      const editProfileForm = document.getElementById('edit-profile-form');
      const cancelEditButton = document.getElementById('cancel-edit-button');
      const usernameInput = document.getElementById('edit-username') as HTMLInputElement;
      const errorElement = document.getElementById('profile-error-message');

      editProfileButton?.addEventListener('click', () => {
        if (usernameInput) {
            usernameInput.value = user.Username;
        }
        if (errorElement) {
            errorElement.textContent = '';
        }
        editProfileModal?.classList.remove('hidden');
      });

      cancelEditButton?.addEventListener('click', () => {
        editProfileModal?.classList.add('hidden');
      });

      editProfileForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (errorElement) {
            errorElement.textContent = '';
        }

        const newUsername = (document.getElementById('edit-username') as HTMLInputElement).value;
        const newPassword = (document.getElementById('edit-password') as HTMLInputElement).value;

        const body: { [key: string]: any } = {
            uuid: user.Uuid,
            email: tempEmail,
            profilePic: user.ProfilePic,
        };

        if (newUsername && newUsername !== user.Username) {
            body.username = newUsername;
        }

        if (newPassword) {
            body.password = newPassword;
        }

        if (Object.keys(body).length <= 3) {
            displayProfileError('Default Error'); 
            return;
        }
        
        const token = localStorage.getItem('jwtToken');
        const headers = new Headers({
            'Content-Type': 'application/json',
        });
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        try {
          const updateResponse = await fetch(`${API_BASE_URL}/user`, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(body)
          });

          if (updateResponse.ok) {
            window.location.reload();
          } else {
            const errorData = await updateResponse.json();
            const rawMessage = errorData.message || '';

            const firstError = rawMessage.split('\n')[0];
            const messageParts = firstError.split('Message:');
            const cleanMessage = (messageParts.length > 1 ? messageParts[1].trim() : firstError) as ErrorKeys;

            displayProfileError(cleanMessage);
          }
        } catch (error) {
          displayProfileError('Network Error');
        }
      });
      
      const deleteAccountButton = document.getElementById('delete-account-button');
      const deleteAccountModal = document.getElementById('delete-account-modal');
      const cancelDeleteButton = document.getElementById('cancel-delete-button');
      const confirmDeleteButton = document.getElementById('confirm-delete-button');

      deleteAccountButton?.addEventListener('click', () => {
        deleteAccountModal?.classList.remove('hidden');
      });

      cancelDeleteButton?.addEventListener('click', () => {
        deleteAccountModal?.classList.add('hidden');
      });

      confirmDeleteButton?.addEventListener('click', async () => {
        try {
          const response = await fetchWithAuth('/user', {
            method: 'DELETE',
            body: JSON.stringify({ Uuid: user.Uuid }),
          });

          if (response.ok) {
            logout();
          } else {
            alert('Erro ao deletar a conta.');
          }
        } catch (error) {
          console.error('Falha ao deletar a conta:', error);
          alert('Erro ao deletar a conta.');
        } finally {
          deleteAccountModal?.classList.add('hidden');
        }
      });
    }, 0);

    return viewHtml;
  } catch (error: any) {
    return await renderView('error', { message: error.message });
  }
}
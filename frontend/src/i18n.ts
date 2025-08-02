type Language = 'pt-BR' | 'en' | 'es' | 'fr';

export type ErrorKeys =
  | "Invalid email address"
  | "Wrong email address"
  | "Invalid password: must be between 8 and 30 characters long"
  | "Wrong password, try again"
  | "Username already exists"
  | "Email already exists"
  | "Points can't be negative"
  | "Invalid file extension. Only .jpg and .png are allowed"
  | "Invalid request freind. Sender and receiver uuid are the same"
  | "Invalid friend request status for the operation"
  | "This friendship already exists"
  | "This friendship not exists"
  | "A database constraint, like unique, was violated"
  | "User(s) not found"
  | "Internal server error"
  | "Network Error"
  | "Default Error";


const translations = {
  'pt-BR': {
    // Menu Principal
    mainMenuTitle: 'TRANSCENDENCE',
    playPongButton: 'Jogar Pong',
    playRpsButton: 'Pedra, Papel, Tesoura',
    profileLink: 'Perfil',
    creatorsLink: 'Conheça nossos criadores!',

    // Seleção Pong
    pongTitle: 'PONG',
    selectMode: 'Selecione o modo de jogo:',
    singlePlayer: 'Single Player',
    multiplayer: 'Multiplayer',
    backToMenu: 'Voltar ao Menu',

    // Jogo Pong
    pongInstructions: 'P1: W/S | P2: ↑/↓| P3: A/D | P4: ←/→',

    // Jogo RPS
    rpsTitle: 'Pedra, Papel & Tesoura',
    player: 'Você',
    cpu: 'CPU',
    yourTurn: 'Faça sua jogada:',
    win: 'Você Ganhou!',
    lose: 'Você Perdeu!',
    draw: 'Empate!',

    // Página de Perfil
    profileTitle: 'Nome',
    profileText: 'Informações básicas do usuário.',
    matchesPlayed: 'Partidas jogadas',
    wins: 'Vitórias',
    loses: 'Derrotas',
    lastLogin: 'Último login',

    // Página de Criadores
    creatorsTitle: 'Criadores',
    creatorsText: 'Este projeto foi criado por...',

    // Página de Vencedor
    congratulations: 'Parabéns!',
    youWon: 'você ganhou!',

    errors: {
      "Invalid email address": "Endereço de e-mail inválido.",
      "Wrong email address": "Endereço de e-mail incorreto.",
      "Invalid password: must be between 8 and 30 characters long": "Senha inválida: deve ter entre 8 e 30 caracteres.",
      "Wrong password, try again": "Senha incorreta, tente novamente.",
      "Username already exists": "Este nome de usuário já existe.",
      "Email already exists": "Este e-mail já está em uso.",
      "A database constraint, like unique, was violated": "Ocorreu um conflito de dados. Tente usar informações diferentes.",
      "User(s) not found": "Usuário não encontrado.",
      "Internal server error": "Erro interno do servidor. Tente novamente mais tarde.",
      "Network Error": "Erro de rede. Verifique sua conexão e tente novamente.",
      "Default Error": "Ocorreu um erro. Tente novamente."
    } as Record<ErrorKeys, string>
  },
  'en': {
    // Main Menu
    mainMenuTitle: 'TRANSCENDENCE',
    playPongButton: 'Play Pong',
    playRpsButton: 'Rock, Paper, Scissors',
    profileLink: 'Profile',
    creatorsLink: 'Meet our creators!',

    // Pong Selection
    pongTitle: 'PONG',
    selectMode: 'Select game mode:',
    singlePlayer: 'Single Player',
    multiplayer: 'Multiplayer',
    backToMenu: 'Back to Menu',

    // Pong Game
    pongInstructions: 'P1: W/S | P2: ↑/↓ | P3: A/D | P4: ←/→',

    // RPS Game
    rpsTitle: 'Rock, Paper & Scissors',
    player: 'You',
    cpu: 'CPU',
    yourTurn: 'Make your move:',
    win: 'You Win!',
    lose: 'You Lose!',
    draw: 'Draw!',

    // Profile Page
    profileTitle: 'Profile',
    profileText: 'Basic user information.',
    matchesPlayed: 'Matches Played',
    wins: 'Wins',
    loses: 'Defeats',
    lastLogin: 'Last login',

    // Creators Page
    creatorsTitle: 'Creators',
    creatorsText: 'This project was created by...',
    
    // Winner Page
    congratulations: 'Congratulations!',
    youWon: 'you won!',

    errors: {
      "Invalid email address": "Invalid email address.",
      "Wrong email address": "Wrong email address.",
      "Invalid password: must be between 8 and 30 characters long": "Invalid password: must be between 8 and 30 characters long.",
      "Wrong password, try again": "Wrong password, try again.",
      "Username already exists": "This username already exists.",
      "Email already exists": "This email is already in use.",
      "A database constraint, like unique, was violated": "A data conflict occurred. Try using different information.",
      "User(s) not found": "User not found.",
      "Internal server error": "Internal server error. Please try again later.",
      "Network Error": "Network error. Check your connection and try again.",
      "Default Error": "An error occurred. Please try again."
    } as Record<ErrorKeys, string>
  },
  'es': {
    // Menú Principal
    mainMenuTitle: 'TRANSCENDENCE',
    playPongButton: 'Jugar Pong',
    playRpsButton: 'Piedra, Papel, Tijeras',
    profileLink: 'Perfil',
    creatorsLink: '¡Conoce a nuestros creadores!',

    // Selección Pong
    pongTitle: 'PONG',
    selectMode: 'Selecciona el modo de juego:',
    singlePlayer: 'Un jugador',
    multiplayer: 'Multijugador',
    backToMenu: 'Volver al menú',

    // Juego Pong
    pongInstructions: 'P1: W/S | P2: ↑/↓ | P3: A/D | P4: ←/→',

    // Juego RPS
    rpsTitle: 'Piedra, Papel y Tijeras',
    player: 'Tú',
    cpu: 'CPU',
    yourTurn: 'Haz tu jugada:',
    win: '¡Ganaste!',
    lose: '¡Perdiste!',
    draw: '¡Empate!',

    // Página de Perfil
    profileTitle: 'Perfil',
    profileText: 'Información básica del usuario.',
    matchesPlayed: 'Partidas jugadas',
    wins: 'Victorias',
    loses: 'Derrotas',
    lastLogin: 'Último inicio de sesión',

    // Página de Creadores
    creatorsTitle: 'Creadores',
    creatorsText: 'Este proyecto fue creado por...',
  
    // Página de Ganador
    congratulations: '¡Felicidades!',
    youWon: '¡has ganado!',

    errors: {
      "Invalid email address": "Dirección de correo electrónico inválida.",
      "Wrong email address": "Dirección de correo electrónico incorrecta.",
      "Invalid password: must be between 8 and 30 characters long": "Contraseña no válida: debe tener entre 8 y 30 caracteres.",
      "Wrong password, try again": "Contraseña incorrecta, intente de nuevo.",
      "Username already exists": "Este nombre de usuario ya existe.",
      "Email already exists": "Este correo electrónico ya está en uso.",
      "A database constraint, like unique, was violated": "Ocurrió un conflicto de datos. Intente usar información diferente.",
      "User(s) not found": "Usuario no encontrado.",
      "Internal server error": "Error interno del servidor. Por favor, inténtelo de nuevo más tarde.",
      "Network Error": "Error de red. Verifique su conexión e intente nuevamente.",
      "Default Error": "Ocurrió un error. Por favor, inténtelo de nuevo."
    } as Record<ErrorKeys, string>

  },
  'fr': {
    // Menu Principal
    mainMenuTitle: 'TRANSCENDENCE',
    playPongButton: 'Jouer au Pong',
    playRpsButton: 'Pierre, Papier, Ciseaux',
    profileLink: 'Profil',
    creatorsLink: 'Rencontrez nos créateurs !',

    // Sélection Pong
    pongTitle: 'PONG',
    selectMode: 'Sélectionnez le mode de jeu :',
    singlePlayer: 'Un joueur',
    multiplayer: 'Multijoueur',
    backToMenu: 'Retour au menu',

    // Jeu Pong
    pongInstructions: 'J1 : W/S | J2 : ↑/↓ | J3 : A/D | J4 : ←/→',

    // Jeu RPS
    rpsTitle: 'Pierre, Papier & Ciseaux',
    player: 'Vous',
    cpu: 'CPU',
    yourTurn: 'Faites votre choix :',
    win: 'Vous avez gagné !',
    lose: 'Vous avez perdu !',
    draw: 'Égalité !',

    // Page de Profil
    profileTitle: 'Profil',
    profileText: 'Informations de base sur l’utilisateur.',
    matchesPlayed: 'Parties jouées',
    wins: 'Victoires',
    loses: 'Défaites',
    lastLogin: 'Dernière connexion',

    // Page des Créateurs
    creatorsTitle: 'Créateurs',
    creatorsText: 'Ce projet a été créé par...',

    // Page du Gagnant
    congratulations: 'Félicitations !',
    youWon: 'vous avez gagné !',

    errors: {
      "Invalid email address": "Adresse e-mail invalide.",
      "Wrong email address": "Adresse e-mail incorrecte.",
      "Invalid password: must be between 8 and 30 characters long": "Mot de passe invalide : doit contenir entre 8 et 30 caractères.",
      "Wrong password, try again": "Mot de passe incorrect, réessayez.",
      "Username already exists": "Ce nom d'utilisateur existe déjà.",
      "Email already exists": "Cet e-mail est déjà utilisé.",
      "A database constraint, like unique, was violated": "Un conflit de données est survenu. Essayez d'utiliser des informations différentes.",
      "User(s) not found": "Utilisateur non trouvé.",
      "Internal server error": "Erreur interne du serveur. Veuillez réessayer plus tard.",
      "Network Error": "Erreur réseau. Vérifiez votre connexion et réessayez.",
      "Default Error": "Une erreur est survenue. Veuillez réessayer."
    } as Record<ErrorKeys, string>
  }
};

let currentLanguage: Language = 'pt-BR';

export function toggleLanguage(): void {
  const langs: Language[] = ['pt-BR', 'en', 'es', 'fr'];
  const nextIndex = (langs.indexOf(currentLanguage) + 1) % langs.length;
  currentLanguage = langs[nextIndex];
}

export function getCurrentLanguage(): Language {
  return currentLanguage;
}

export function t() {
  return translations[currentLanguage];
}
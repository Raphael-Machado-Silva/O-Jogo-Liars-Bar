let players = [];

// Lista de nomes de imagens que estão na pasta "img"
const imageNames = ['porco', 'touro', 'gato', 'cachorro', 'leão', 'pato'];

// Lista de cartas possíveis
let cardValues = ['Q', 'K', 'J', 'A'];
let pointsEditable = true; // Controla se os pontos podem ser alterados

// Função para ajustar a lista de cartas com base no checkbox
function toggleJack() {
  const includeJack = document.getElementById('cb3-8').checked;

  if (includeJack) {
    // Adiciona o 'J' ao array apenas se ainda não estiver presente
    if (!cardValues.includes('J')) {
      cardValues.push('J');
    }
  } else {
    // Remove todas as ocorrências de 'J' do array
    cardValues = cardValues.filter(card => card !== 'J');
  }

  console.log('Cartas disponíveis:', cardValues); // Para depuração
  
  // Atualiza o número de cartas por jogador sempre que a checkbox mudar
  calculateCardsPerPlayer();
}

// Função para calcular o número de cartas por jogador e exibir a quantidade
function calculateCardsPerPlayer() {
  const numPlayers = parseInt(document.getElementById('numPlayers').value); // Número de jogadores
  const includeJack = document.getElementById('cb3-8').checked; // Verifica se o Valete está incluído
  let totalCardValues = includeJack ? cardValues.length : cardValues.filter(val => val !== 'J').length;

  // Sempre adiciona 2 Jokers ao total de cartas
  totalCardValues = (cardValues.length * 6) + 2; // Adiciona os 2 Jokers sempre
  // Calcula o número de cartas por jogador
  const cardsPerPlayer = Math.floor(totalCardValues  / numPlayers);

  // Exibe a quantidade de cartas
  document.getElementById('cardsPerPlayer').textContent = `Cada jogador receberá ${cardsPerPlayer} cartas.`;
}

// Função para gerar os campos de entrada para os nomes dos jogadores e seleção de imagens
function generatePlayerInputs() {
  const numPlayers = parseInt(document.getElementById('numPlayers').value);
  const playerInputsContainer = document.getElementById('playerInputs');
  playerInputsContainer.innerHTML = ''; // Limpa entradas antigas

  // Gera os campos de entrada de acordo com o número de jogadores selecionado
  for (let i = 1; i <= numPlayers; i++) {
    const inputContainer = document.createElement('div');
    inputContainer.className = 'player-input-container';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = `Nome do Jogador ${i}`;
    nameInput.id = `player-name-${i}`;
    nameInput.className = 'player-name-input';

    const imageInput = document.createElement('select');
    imageInput.id = `player-image-${i}`;
    imageInput.className = 'player-image-input';

    // Preenche as opções de imagem com os nomes fornecidos
    imageNames.forEach(imageName => {
      const option = document.createElement('option');
      option.value = imageName; // Valor é o nome da imagem sem extensão
      option.textContent = imageName; // Exibe o nome da imagem
      imageInput.appendChild(option);
    });

    // Adiciona o campo de entrada para pontos
    const pointsInput = document.createElement('input');
    pointsInput.type = 'number';
    pointsInput.id = `player-points-${i}`;
    pointsInput.value = 0; // Define valor inicial de pontos como 0
    pointsInput.min = 0; // Permite apenas números positivos
    pointsInput.className = 'players-points-input';

    // Adiciona a etiqueta Pts: antes do input de pontos
    const pointsLabel = document.createElement('span');
    pointsLabel.textContent = 'Pts:';
    pointsLabel.className = 'points-label';

    inputContainer.appendChild(nameInput);
    inputContainer.appendChild(imageInput);
    inputContainer.appendChild(pointsLabel);
    inputContainer.appendChild(pointsInput);


    playerInputsContainer.appendChild(inputContainer);
  }

  // Exibe o número de cartas assim que a página for carregada ou atualizada
  calculateCardsPerPlayer();
}

// Função para iniciar o jogo
function startGame() {
  const numPlayers = parseInt(document.getElementById('numPlayers').value);
  if (numPlayers < 3 || numPlayers > 6) {
    alert('Por favor, escolha entre 3 e 6 jogadores.');
    return;
  }
  document.querySelector('.text').textContent = 'QUE OS JOGOS COMEÇEM!';

  // Exibe a tela preta com a contagem regressiva
  const countdownOverlay = document.createElement('div');
  countdownOverlay.id = 'countdown-overlay';
  countdownOverlay.style.position = 'fixed';
  countdownOverlay.style.top = 0;
  countdownOverlay.style.left = 0;
  countdownOverlay.style.width = '100%';
  countdownOverlay.style.height = '100%';
  countdownOverlay.style.backgroundColor = 'black';
  countdownOverlay.style.display = 'flex';
  countdownOverlay.style.justifyContent = 'center';
  countdownOverlay.style.alignItems = 'center';
  countdownOverlay.style.zIndex = 1000;
  document.body.appendChild(countdownOverlay);

  const countdownText = document.createElement('h1');
  countdownText.style.color = 'white';
  countdownText.style.fontSize = '5rem';
  countdownOverlay.appendChild(countdownText);

  // Contagem regressiva de 3, 2, 1
  let countdown = 3;
  const countdownInterval = setInterval(() => {
    countdownText.textContent = countdown;
    countdown--;
    if (countdown < 0) {
      clearInterval(countdownInterval);
      // Remove o 0 e exibe a imagem após a contagem
      countdownText.textContent = '';
      showRandomCard(countdownOverlay);
    }
  }, 1000);

  // Captura os nomes e as imagens dos jogadores e valida
  players = [];
  for (let i = 1; i <= numPlayers; i++) {
    const name = document.getElementById(`player-name-${i}`).value.trim();
    const imageSelect = document.getElementById(`player-image-${i}`);
    const imageName = imageSelect.value;

    if (name === '') {
      alert(`Por favor, insira um nome para o Jogador ${i}.`);
      return;
    }

    if (!imageName) {
      alert(`Por favor, selecione uma imagem para o Jogador ${i}.`);
      return;
    }

    players.push({
      id: i,
      name: name,
      image: `img/${imageName}.png`, // Concatena com a extensão .png
      drum: Array(6).fill(false),
      currentPosition: 0,
      alive: true,
      points: parseInt(document.getElementById(`player-points-${i}`).value) // Pega os pontos antes de iniciar
    });
  }

  // Inicializa a posição da bala aleatoriamente para cada jogador
  players.forEach(player => {
    const bulletPosition = Math.floor(Math.random() * 6);
    player.drum[bulletPosition] = true;
  });

  // Exibe os jogadores na tela
  const playersContainer = document.getElementById('players');
  playersContainer.innerHTML = ''; // Limpa a área de exibição dos jogadores

  players.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player';
    playerDiv.id = `player-${player.id}`;

    // Verifica qual jogador tem a maior pontuação e coloca a coroa
    const isKing = player.points === Math.max(...players.map(p => p.points)) && player.points > 0;

    playerDiv.innerHTML = `
      <div class="player-info">
        <img src="${player.image}" alt="Foto do Jogador ${player.id}" class="player-image">
        <h3>${player.name} ${isKing ? ' <i class="fa-solid fa-chess-king"></i>' : ''}</h3>
      </div>
      <button class="trigger-btn" id="button-player-${player.id}" onclick="pullTrigger(${player.id})">Puxar o Gatilho</button>
      <div class="result" id="result-player-${player.id}">Pronto para disparar!</div>
    `;

    playersContainer.appendChild(playerDiv);
  });

  document.getElementById('setup').style.display = 'none';
  document.getElementById('game').style.display = 'block';
}

// Função para mostrar uma imagem aleatória com fundo escuro por 3 segundos
function showRandomCard(countdownOverlay = null) {
  // Fundo semitransparente
  const darkOverlay = document.createElement('div');
  darkOverlay.id = 'dark-overlay';
  darkOverlay.style.position = 'fixed';
  darkOverlay.style.top = 0;
  darkOverlay.style.left = 0;
  darkOverlay.style.width = '100%';
  darkOverlay.style.height = '100%';
  darkOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
  darkOverlay.style.display = 'flex';
  darkOverlay.style.justifyContent = 'center';
  darkOverlay.style.alignItems = 'center';
  darkOverlay.style.zIndex = 1001;
  document.body.appendChild(darkOverlay);

  // Sorteia uma carta aleatória
  const randomCard = cardValues[Math.floor(Math.random() * cardValues.length)];

  // Cria um elemento de imagem para a carta
  const cardImage = document.createElement('img');
  cardImage.id = 'card';
  cardImage.src = `img/${randomCard}.png`; // Caminho para a imagem
  cardImage.style.width = '150px'; // Ajuste o tamanho conforme necessário
  darkOverlay.appendChild(cardImage);

  // Remove a tela preta inicial, se existir
  if (countdownOverlay) {
    document.body.removeChild(countdownOverlay);
  }

  // Remove o fundo e a imagem após 3 segundos
  setTimeout(() => {
    document.body.removeChild(darkOverlay);
  }, 3000);
}

// Função para simular o disparo do gatilho
function pullTrigger(playerId) {
  const player = players.find(p => p.id === playerId);
  const resultElement = document.getElementById(`result-player-${playerId}`);
  const buttonElement = document.getElementById(`button-player-${playerId}`);

  if (!player.alive) {
    resultElement.textContent = "Você já está fora do jogo!";
    resultElement.style.color = '#f5a623';
    return;
  }

  const isBullet = player.drum[player.currentPosition];

  if (isBullet) {
    resultElement.textContent = "BANG! Você foi atingido! 😵";
    resultElement.style.color = '#e63946';
    player.alive = false;
    buttonElement.classList.add('disabled');
    buttonElement.disabled = true;
  } else {
    const remainingChambers = 5 - player.currentPosition;
    if (remainingChambers === 0) {
      resultElement.textContent = "BANG! A bala estava no último disparo! 😵";
      resultElement.style.color = '#e63946';
      player.alive = false;
      buttonElement.classList.add('disabled');
      buttonElement.disabled = true;
    } else {
      resultElement.textContent = `Clic! Você está salvo! 😅 (${remainingChambers} espaços restantes)`;
      resultElement.style.color = '#38b000';
      player.currentPosition++;
    }
  }

  // Exibe uma nova carta após 2 segundos
  setTimeout(() => {
    showRandomCard();
  }, 2000);
}

// Função para reiniciar o jogo
function restartGame() {
  const numPlayers = parseInt(document.getElementById('numPlayers').value);
  if (numPlayers < 3 || numPlayers > 6) {
    alert('Por favor, escolha entre 3 e 6 jogadores.');
    return;
  }

  // Reseta o estado dos jogadores, mas mantém nome e imagem
  players.forEach(player => {
    player.drum = Array(6).fill(false);
    player.currentPosition = 0;
    player.alive = true;

    // Reposiciona aleatoriamente a bala
    const bulletPosition = Math.floor(Math.random() * 6);
    player.drum[bulletPosition] = true;
  });

  document.getElementById('setup').style.display = 'block';
  document.getElementById('game').style.display = 'none';
  
  document.querySelector('.text').textContent = 'Escolha o número de jogadores e clique em iniciar para jogar';
}

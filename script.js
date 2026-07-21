// ==========================================
// 💾 1. CARREGAR PINS SALVOS
// ==========================================
const cardsContainer = document.getElementById('cardsContainer');

function loadSavedPins() {
  const savedPins = JSON.parse(localStorage.getItem('vintagePins')) || [];
  cardsContainer.innerHTML = '';
  
  savedPins.forEach((pin, index) => {
    createCardDOM(pin.title, pin.image, index);
  });
}

function createCardDOM(title, imageUrl, index) {
  const newCard = document.createElement('div');
  newCard.classList.add('card');

  // Criação dos elementos via JS para maior segurança
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.title = 'Excluir Pin';
  deleteBtn.addEventListener('click', () => deletePin(index));

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = title;

  const h2 = document.createElement('h2');
  h2.textContent = title; // Previne XSS/Injeção de código

  newCard.appendChild(deleteBtn);
  newCard.appendChild(img);
  newCard.appendChild(h2);

  cardsContainer.prepend(newCard);
}

loadSavedPins();


// ==========================================
// 🚀 2. ADICIONAR E SALVAR NOVO PIN
// ==========================================
const uploadBtn = document.getElementById('uploadBtn');
const pinTitleInput = document.getElementById('pinTitle');
const pinImageInput = document.getElementById('pinImage');
const fileLabel = document.getElementById('fileLabel');

// Atualiza o texto da label quando um arquivo for selecionado
if (pinImageInput) {
  pinImageInput.addEventListener('change', () => {
    if (pinImageInput.files.length > 0) {
      fileLabel.textContent = `📷 ${pinImageInput.files[0].name.slice(0, 15)}...`;
    } else {
      fileLabel.textContent = '📁 Escolher Imagem';
    }
  });
}

uploadBtn.addEventListener('click', () => {
  const titleText = pinTitleInput.value.trim();
  const imageFile = pinImageInput.files[0];

  if (!titleText || !imageFile) {
    alert('Por favor, preencha o título e escolha uma imagem!');
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    const img = new Image();
    img.src = e.target.result;

    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxWidth = 500;
      const scaleSize = maxWidth / img.width;

      canvas.width = maxWidth;
      canvas.height = img.height * scaleSize;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedImageUrl = canvas.toDataURL('image/jpeg', 0.7);

      try {
        const savedPins = JSON.parse(localStorage.getItem('vintagePins')) || [];
        savedPins.push({ title: titleText, image: compressedImageUrl });
        localStorage.setItem('vintagePins', JSON.stringify(savedPins));

        loadSavedPins();

        pinTitleInput.value = '';
        pinImageInput.value = '';
        fileLabel.textContent = '📁 Escolher Imagem';
      } catch (err) {
        alert('Sua memória local encheu! Apague alguns pins usando a lixeira 🗑️');
      }
    };
  };

  reader.readAsDataURL(imageFile);
});


// ==========================================
// ❌ 3. EXCLUIR PIN
// ==========================================
function deletePin(index) {
  let savedPins = JSON.parse(localStorage.getItem('vintagePins')) || [];
  savedPins.splice(index, 1);
  localStorage.setItem('vintagePins', JSON.stringify(savedPins));
  loadSavedPins();
}


// ==========================================
// 🔍 4. FILTRO DE PESQUISA
// ==========================================
const searchInput = document.getElementById('searchInput');

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
      const title = card.querySelector('h2').textContent.toLowerCase();
      if (title.includes(searchTerm)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
}


// ==========================================
// 🎵 5. PLAYER DE MÚSICA DO YOUTUBE
// ==========================================
const loadMusicBtn = document.getElementById('loadMusicBtn');
const ytUrlInput = document.getElementById('ytUrlInput');
const ytPlayer = document.getElementById('ytPlayer');
const closeMusicBtn = document.getElementById('closeMusicBtn');

if (loadMusicBtn) {
  loadMusicBtn.addEventListener('click', playYouTubeMusic);
}

if (ytUrlInput) {
  ytUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      playYouTubeMusic();
    }
  });
}

function getYouTubeVideoId(url) {
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  if (match && match[1].length === 11) {
    return match[1];
  }

  return url.trim().length === 11 ? url.trim() : null;
}

function playYouTubeMusic() {
  const inputVal = ytUrlInput.value.trim();

  if (!inputVal) {
    alert('Por favor, cole um link do YouTube!');
    return;
  }

  const videoId = getYouTubeVideoId(inputVal);

  if (!videoId) {
    alert('Link do YouTube inválido!');
    return;
  }

  ytPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
  ytPlayer.style.display = 'block';
  if (closeMusicBtn) closeMusicBtn.style.display = 'inline-block';
}


// ==========================================
// ❌ 6. FECHAR MÚSICA
// ==========================================
if (closeMusicBtn) {
  closeMusicBtn.addEventListener('click', () => {
    ytPlayer.src = '';
    ytPlayer.style.display = 'none';
    closeMusicBtn.style.display = 'none';
  });
}
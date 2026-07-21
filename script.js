// ==========================================
// 🔥 1. CONFIGURAÇÃO DO FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCvaQJmf5r8Ghf1fRHR0Dc1xUMmGHpkebo",
  authDomain: "vintagepins.firebaseapp.com",
  projectId: "vintagepins",
  storageBucket: "vintagepins.firebasestorage.app",
  messagingSenderId: "1085260664647",
  appId: "1:1085260664647:web:b3b46c3d22f2c64caec662"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

const cardsContainer = document.getElementById('cardsContainer');

// ==========================================
// 💾 2. CARREGAR PINS DA NUVEM (EM TEMPO REAL)
// ==========================================
function listenToPins() {
  db.collection('pins').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
    cardsContainer.innerHTML = '';
    
    snapshot.forEach((doc) => {
      const pin = doc.data();
      createCardDOM(pin.title, pin.image, doc.id);
    });
  }, (error) => {
    console.error("Erro ao carregar pins do Firebase:", error);
  });
}

function createCardDOM(title, imageUrl, pinId) {
  const newCard = document.createElement('div');
  newCard.classList.add('card');

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.innerHTML = '🗑️';
  deleteBtn.title = 'Excluir Pin';
  deleteBtn.addEventListener('click', () => deletePin(pinId));

  const img = document.createElement('img');
  img.src = imageUrl;
  img.alt = title;

  const h2 = document.createElement('h2');
  h2.textContent = title;

  newCard.appendChild(deleteBtn);
  newCard.appendChild(img);
  newCard.appendChild(h2);

  cardsContainer.appendChild(newCard);
}

listenToPins();

// ==========================================
// 🚀 3. ENVIAR NOVO PIN PARA A NUVEM
// ==========================================
const uploadBtn = document.getElementById('uploadBtn');
const pinTitleInput = document.getElementById('pinTitle');
const pinImageInput = document.getElementById('pinImage');
const fileLabel = document.getElementById('fileLabel');

if (pinImageInput) {
  pinImageInput.addEventListener('change', () => {
    if (pinImageInput.files.length > 0) {
      fileLabel.textContent = `📷 ${pinImageInput.files[0].name.slice(0, 15)}...`;
    } else {
      fileLabel.textContent = '📁 Escolher Imagem';
    }
  });
}

uploadBtn.addEventListener('click', async () => {
  const titleText = pinTitleInput.value.trim();
  const imageFile = pinImageInput.files[0];

  if (!titleText || !imageFile) {
    alert('Por favor, preencha o título e escolha uma imagem!');
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Enviando... ⏳';

  try {
    // 1. Enviar imagem para o Firebase Storage
    const storageRef = storage.ref(`pins/${Date.now()}_${imageFile.name}`);
    const snapshot = await storageRef.put(imageFile);
    const imageUrl = await snapshot.ref.getDownloadURL();

    // 2. Salvar título e URL da imagem no Firestore Database
    await db.collection('pins').add({
      title: titleText,
      image: imageUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    pinTitleInput.value = '';
    pinImageInput.value = '';
    fileLabel.textContent = '📁 Escolher Imagem';
    alert('Pin postado com sucesso!');
  } catch (error) {
    console.error('Erro ao postar:', error);
    alert('Erro ao enviar o Pin. Verifica se ativaste o Firestore e o Storage no modo de teste!');
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Postar Pin 🚀';
  }
});

// ==========================================
// ❌ 4. EXCLUIR PIN DA NUVEM
// ==========================================
async function deletePin(pinId) {
  if (confirm('Tem certeza que deseja apagar este pin para todo mundo?')) {
    try {
      await db.collection('pins').doc(pinId).delete();
    } catch (error) {
      alert('Erro ao apagar o pin!');
    }
  }
}

// ==========================================
// 🔍 5. FILTRO DE PESQUISA
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
// 🎵 6. PLAYER DE MÚSICA DO YOUTUBE
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

if (closeMusicBtn) {
  closeMusicBtn.addEventListener('click', () => {
    ytPlayer.src = '';
    ytPlayer.style.display = 'none';
    closeMusicBtn.style.display = 'none';
  });
}

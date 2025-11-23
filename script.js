const API = 'https://api.jikan.moe/v4/anime/5114/characters';
const cardsEl = document.getElementById('cards');
const pageInfo = document.getElementById('pageInfo');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const searchInput = document.getElementById('search');
const btnSearch = document.getElementById('btnSearch');
const btnReload = document.getElementById('btnReload');

let characters = [];
let currentIndex = 0;
const PAGE_SIZE = 8;

// fetch characters from Jikan
async function loadCharacters() {
  try {
    const res = await fetch(API);
    if(!res.ok) throw new Error('Erro na API');
    const data = await res.json();
    characters = data.data;
    currentIndex = 0;
    renderPage();
  } catch (err) {
    console.error(err);
    cardsEl.innerHTML = '<p>Não foi possível carregar os personagens. Tente novamente mais tarde.</p>';
  }
}

function renderPage() {
  const page = Math.floor(currentIndex / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(characters.length / PAGE_SIZE) || 1;
  pageInfo.textContent = `Página ${page} de ${totalPages}`;
  prevBtn.disabled = page <= 1;
  nextBtn.disabled = page >= totalPages;

  const slice = characters.slice(currentIndex, currentIndex + PAGE_SIZE);
  renderCards(slice);
}

function renderCards(items) {
  if(!items || items.length === 0) {
    cardsEl.innerHTML = '<p>Nenhum personagem encontrado.</p>';
    return;
  }
  cardsEl.innerHTML = '';
  items.forEach(it => {
    const card = document.createElement('article');
    card.className = 'card';
    const img = document.createElement('img');
    const imgUrl = (it.character && it.character.images && it.character.images.jpg && it.character.images.jpg.image_url) ? it.character.images.jpg.image_url : '';
    img.src = imgUrl;
    img.alt = it.character.name || 'Personagem';
    const h3 = document.createElement('h3');
    h3.textContent = it.character.name;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `Papel: ${it.role || 'Desconhecido'}`;
    const more = document.createElement('p');
    const va = (it.voice_actors && it.voice_actors.length) ? it.voice_actors.map(v=>v.person.name + ' ('+v.language+')').join('; ') : '—';
    more.textContent = `Dubladores: ${va}`;
    card.appendChild(img);
    card.appendChild(h3);
    card.appendChild(meta);
    card.appendChild(more);
    cardsEl.appendChild(card);
  });
}

// search by name (character)
function searchName(name) {
  if(!name) { renderPage(); return; }
  const filtered = characters.filter(c => c.character && c.character.name.toLowerCase().includes(name.toLowerCase()));
  renderCards(filtered);
  pageInfo.textContent = `Resultados da busca (${filtered.length})`;
  prevBtn.disabled = true;
  nextBtn.disabled = true;
}

// events
prevBtn.addEventListener('click', () => {
  currentIndex = Math.max(0, currentIndex - PAGE_SIZE);
  renderPage();
});
nextBtn.addEventListener('click', () => {
  currentIndex = Math.min(characters.length - PAGE_SIZE, currentIndex + PAGE_SIZE);
  renderPage();
});
btnSearch.addEventListener('click', () => searchName(searchInput.value.trim()));
btnReload.addEventListener('click', () => { searchInput.value=''; renderPage(); });

// initial load
loadCharacters();
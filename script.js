// --- CONFIGURATION ---
const API_KEY ='edba9d2e';
const API_URL = 'https://www.omdbapi.com/';

// --- DOM ELEMENTS ---
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('resultsContainer');
const favoritesContainer = document.getElementById('favoritesContainer');

// --- STATE ---
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// --- EVENT LISTENERS ---
searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchMovies();
});

// --- FUNCTIONS ---

// 1. Search Movies
async function searchMovies() {
    const query = searchInput.value.trim();
    if (!query) return;

    resultsContainer.innerHTML = '<p style="text-align:center; width:100%;">Searching...</p>';

    try {
        const response = await fetch(`${API_URL}?s=${query}&apikey=${API_KEY}`);
        const data = await response.json();

        if (data.Response === "True") {
            displayMovies(data.Search);
        } else {
            resultsContainer.innerHTML = `<p style="text-align:center;">${data.Error}</p>`;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        resultsContainer.innerHTML = '<p style="text-align:center;">Something went wrong.</p>';
    }
}

// 2. Get Full Movie Details (for accurate rating)
async function getMovieDetails(id) {
    try {
        const response = await fetch(`${API_URL}?i=${id}&apikey=${API_KEY}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching details:", error);
        return null;
    }
}

// 3. Display Movies (Create Cards)
async function displayMovies(movies) {
    resultsContainer.innerHTML = '';

    for (const movie of movies) {
        // Get full details for accurate rating
        const details = await getMovieDetails(movie.imdbID);
        
        if (details && details.Response === "True") {
            const card = createMovieCard(details);
            resultsContainer.appendChild(card);
        }
    }
}

// 4. Create Movie Card
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.classList.add('movie-card');

    const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image';
    const rating = movie.imdbRating || 'N/A';

    card.innerHTML = `
        <img src="${poster}" alt="${movie.Title}">
        <div class="card-content">
            <h3>${movie.Title}</h3>
            <div class="card-meta">
                <span>${movie.Year}</span>
                <span class="rating">⭐ ${rating}</span>
            </div>
            <p class="plot">${movie.Plot}</p>
            <button class="add-fav-btn" onclick="addToFavorites('${movie.imdbID}', '${movie.Title}', '${movie.Year}', '${movie.Plot}', '${movie.Poster}', '${rating}')">
                ❤️ Add to Favorites
            </button>
        </div>
    `;

    return card;
}

// 5. Add to Favorites
function addToFavorites(id, title, year, plot, poster, rating) {
    const isFavorite = favorites.some(fav => fav.id === id);
    if (isFavorite) {
        alert('Movie is already in your favorites!');
        return;
    }

    const newMovie = { id, title, year, plot, poster, rating };
    favorites.push(newMovie);
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
    alert(`${title} added to favorites!`);
}

// 6. Remove from Favorites
function removeFromFavorites(id) {
    favorites = favorites.filter(fav => fav.id !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
}

// 7. Render Favorites List
function renderFavorites() {
    favoritesContainer.innerHTML = '';

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = '<p class="empty-msg">No favorites yet. Search for a movie to add it!</p>';
        return;
    }

    favorites.forEach(movie => {
        const card = document.createElement('div');
        card.classList.add('movie-card');
        
        const poster = movie.poster !== 'N/A' ? movie.poster : 'https://via.placeholder.com/300x450?text=No+Image';
        const rating = movie.rating || 'N/A';

        card.innerHTML = `
            <img src="${poster}" alt="${movie.title}">
            <div class="card-content">
                <h3>${movie.title}</h3>
                <div class="card-meta">
                    <span>${movie.year}</span>
                    <span class="rating">⭐ ${rating}</span>
                </div>
                <p class="plot">${movie.plot}</p>
                <button class="add-fav-btn" style="background-color: #c0354c;" onclick="removeFromFavorites('${movie.id}')">
                    ❌ Remove
                </button>
            </div>
        `;
        favoritesContainer.appendChild(card);
    });
}

// Initialize Favorites on Load
renderFavorites();
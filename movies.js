const playButton = document.getElementById('play-trailer');
const trailerContainer = document.getElementById('trailer-container');
const trailerIframe = document.getElementById('trailer-iframe');
const closeTrailer = document.querySelector('.close-trailer');

// Background rotation variables
const backgrounds = [
    {
        bg: document.getElementById('hero-bg-1'),
        title: "Beauty and the Beast",
        description: "Unlimited Entertainment, Movies, TVs shows, & More.",
        trailer: "https://www.youtube.com/embed/e3Nl_TCQXuw"
    },
    {
        bg: document.getElementById('hero-bg-2'),
        title: "Barbie",
        description: "Experience the magical journey of Barbie in her new adventure.",
        trailer: "https://www.youtube.com/embed/pBk4NYhWNMM"
    },
    {
        bg: document.getElementById('hero-bg-3'),
        title: "Spider-Man: Across the Spider-Verse",
        description: "The next chapter in the Spider-Verse saga.",
        trailer: "https://www.youtube.com/embed/cqGjhVJWtEg"
    }
];

let currentBg = 0;
let isTrailerPlaying = false;
let backgroundRotationInterval;

// Function to start background rotation
function startBackgroundRotation() {
    backgroundRotationInterval = setInterval(() => {
        if (!isTrailerPlaying) { // Only rotate if no trailer is playing
            // Hide current background
            backgrounds[currentBg].bg.style.opacity = 0;
            
            // Update to next background
            currentBg = (currentBg + 1) % backgrounds.length;
            
            // Show new background
            backgrounds[currentBg].bg.style.opacity = 1;
            
            // Update movie info
            document.getElementById('movie-title').textContent = backgrounds[currentBg].title;
            document.getElementById('movie-description').textContent = backgrounds[currentBg].description;
            
            // Update trailer URL
            trailerIframe.src = backgrounds[currentBg].trailer;
        }
    }, 5000);
}

// Start the background rotation
startBackgroundRotation();

playButton.addEventListener('click', () => {
    trailerContainer.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    isTrailerPlaying = true;
});

trailerContainer.addEventListener('click', (event) => {
    if (event.target === trailerContainer || event.target.classList.contains('close-trailer')) {
        trailerContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Pause the video when closing
        trailerIframe.src = trailerIframe.src;
        isTrailerPlaying = false;
    }
});

const API_KEY = '5b840d0df49fca6fefa830d98e674c8c'; 
const BASE_URL = 'https://api.themoviedb.org/3';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// DOM Elements
const elements = {
    moviesContainer: document.getElementById('movies-container'),
    genreButtons: document.getElementById('genre-buttons'),
    showFavorites: document.getElementById('show-favorites'),
    searchInput: document.getElementById('search-input'),
    trailerContainer: document.getElementById('trailer-container'),
    trailerIframe: document.getElementById('trailer-iframe'),
    heroTitle: document.getElementById('movie-title'),
    heroDescription: document.getElementById('movie-description'),
    heroMeta: document.getElementById('movie-meta'),
    featuredSlider: document.getElementById('featured-slider'),
    recentUpdates: document.getElementById('recent-updates'),
    movieSummaries: document.getElementById('movie-summaries')
};

// Initialize
async function init() {
    await fetchGenres();
    await loadHomePageContent();
    setupEventListeners();
}

async function fetchGenres() {
    try {
        const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
        const { genres } = await response.json();
        
        genres.forEach(genre => {
            elements.genreButtons.innerHTML += `
                <button class="genre-btn" data-genre="${genre.id}">${genre.name}</button>
            `;
        });
    } catch (error) {
        console.error('Error fetching genres:', error);
    }
}

async function fetchMovies(genreId = 'all') {
    try {
        const url = genreId === 'all' 
            ? `${BASE_URL}/movie/popular?api_key=${API_KEY}`
            : `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}`;
        
        const response = await fetch(url);
        const { results } = await response.json();
        displayMovies(results);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

function displayMovies(movies) {
    elements.moviesContainer.innerHTML = '';
    
    movies.forEach(movie => {
        const isFavorite = favorites.includes(movie.id);
        elements.moviesContainer.innerHTML += `
            <div class="movie-card" data-id="${movie.id}">
                ${movie.vote_average ? `<div class="movie-rating">⭐ ${movie.vote_average.toFixed(1)}</div>` : ''}
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="movie-poster">
                <div class="movie-overlay">
                    <h3>${movie.title}</h3>
                    <p>${movie.release_date?.substring(0, 4) || 'N/A'}</p>
                    <div class="movie-actions">
                        <button class="action-btn watch-btn">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="action-btn favorite-btn ${isFavorite ? 'active' : ''}">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
}

function setupEventListeners() {
    // Genre filtering
    elements.genreButtons.addEventListener('click', (e) => {
        if (e.target.classList.contains('genre-btn')) {
            document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            fetchMovies(e.target.dataset.genre);
        }
    });

    // Favorites toggle
    elements.showFavorites.addEventListener('click', toggleFavoritesView);

    // Movie card interactions
    elements.moviesContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.movie-card');
        if (!card) return;
        
        if (e.target.closest('.watch-btn')) {
            playTrailer(card.dataset.id);
        } 
        else if (e.target.closest('.favorite-btn')) {
            toggleFavorite(card.dataset.id, e.target.closest('.favorite-btn'));
        }
    });

    // Trailer popup
    document.querySelector('.close-trailer').addEventListener('click', () => {
        elements.trailerContainer.style.display = 'none';
        elements.trailerIframe.src = '';
        isTrailerPlaying = false;
    });
}

function toggleFavorite(movieId, button) {
    const index = favorites.indexOf(Number(movieId));
    if (index === -1) {
        favorites.push(Number(movieId));
        button.classList.add('active');
    } else {
        favorites.splice(index, 1);
        button.classList.remove('active');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

async function playTrailer(movieId) {
    try {
        isTrailerPlaying = true;
        const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`);
        const { results } = await response.json();
        const trailer = results.find(video => video.type === 'Trailer');
        
        if (trailer) {
            elements.trailerIframe.src = `https://www.youtube.com/embed/${trailer.key}`;
            elements.trailerContainer.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            alert('No trailer available for this movie');
            isTrailerPlaying = false;
        }
    } catch (error) {
        console.error('Error fetching trailer:', error);
        isTrailerPlaying = false;
    }
}

function toggleFavoritesView() {
    console.log('Favorites view toggled');
}

async function loadHomePageContent() {
    try {
        await Promise.all([
            fetchFeaturedContent(),
            fetchRecentUpdates(),
            fetchMovieSummaries(),
            fetchMovies()
        ]);
    } catch (error) {
        console.error('Error loading home page content:', error);
    }
}

async function fetchFeaturedContent() {
    try {
        const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=1`);
        const { results } = await response.json();
        displayFeaturedContent(results.slice(0, 5));
    } catch (error) {
        console.error('Error fetching featured content:', error);
        elements.featuredSlider.innerHTML = '<div class="error">Failed to load featured content</div>';
    }
}

function displayFeaturedContent(movies) {
    elements.featuredSlider.innerHTML = '';
    
    movies.forEach(movie => {
        if (!movie.backdrop_path) return;
        
        elements.featuredSlider.innerHTML += `
            <div class="featured-item" data-id="${movie.id}">
                <img src="https://image.tmdb.org/t/p/w1280${movie.backdrop_path}" alt="${movie.title}">
                <div class="featured-info">
                    <h3>${movie.title}</h3>
                    <p>${movie.overview.substring(0, 100)}${movie.overview.length > 100 ? '...' : ''}</p>
                </div>
            </div>
        `;
    });
}

async function fetchRecentUpdates() {
    try {
        const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}&page=1`);
        const { results } = await response.json();
        displayRecentUpdates(results.slice(0, 8));
    } catch (error) {
        console.error('Error fetching recent updates:', error);
        elements.recentUpdates.innerHTML = '<div class="error">Failed to load recent updates</div>';
    }
}

function displayRecentUpdates(movies) {
    elements.recentUpdates.innerHTML = '';
    
    movies.forEach(movie => {
        if (!movie.poster_path) return;
        
        elements.recentUpdates.innerHTML += `
            <div class="update-card" data-id="${movie.id}">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                <div class="update-info">
                    <h4>${movie.title}</h4>
                    <div class="update-meta">
                        <span>${movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}</span>
                        <span>${movie.vote_average ? '⭐ ' + movie.vote_average.toFixed(1) : ''}</span>
                    </div>
                </div>
            </div>
        `;
    });
}

async function fetchMovieSummaries() {
    try {
        const response = await fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=1`);
        const { results } = await response.json();
        displayMovieSummaries(results.slice(0, 6));
    } catch (error) {
        console.error('Error fetching movie summaries:', error);
        elements.movieSummaries.innerHTML = '<div class="error">Failed to load movie summaries</div>';
    }
}

function displayMovieSummaries(movies) {
    elements.movieSummaries.innerHTML = '';
    
    movies.forEach(movie => {
        if (!movie.poster_path) return;
        
        elements.movieSummaries.innerHTML += `
            <div class="summary-card" data-id="${movie.id}">
                <img class="summary-poster" src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                <div class="summary-content">
                    <h3>${movie.title}</h3>
                    <p>${movie.overview ? movie.overview.substring(0, 120) + (movie.overview.length > 120 ? '...' : '') : 'No description available'}</p>
                    <div class="summary-rating">
                        <i class="fas fa-star"></i>
                        <span>${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10</span>
                    </div>
                </div>
            </div>
        `;
    });
}




init();
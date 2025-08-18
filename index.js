const apiKey = "1deb7e44"
const moviesList = document.getElementById("movies-list")
const searchInput = document.getElementById("search-input")
const searchbtn = document.getElementById("search-btn")

function initializeWatchlist() {
    const storedData = localStorage.getItem("watchlistData")
    let watchlistData
    if (storedData) {
        watchlistData = JSON.parse(storedData)
    }
    else {
        watchlistData = { moviesIDs: [] }
        localStorage.setItem("watchlistData", JSON.stringify(watchlistData))
    }
    return watchlistData
}

function getMoviesList(obj) {
    return obj["Search"] || []
}

async function getMoviesData(arr) {
    let moviesData = []
    const promises = arr.map(movie => {
        return fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`)
            .then(res => res.json())
            .then(movieDetails => {
                moviesData.push(movieDetails)
            })
    })
    await Promise.all(promises)
    return moviesData
}

function renderMovies(arr) {
    let moviesHtml = ""
    for (let movie of arr) {
        moviesHtml += `
            <li class="movie">
                <img 
                    class="movie-cover"
                    src="${movie.Poster || 'N/A'}"
                    alt="${movie.Title} Cover"
                >
                <div class="movie-info-container">
                    <div class="movie-title">
                        <h2 class="name">${movie.Title}</h2>
                        <span class="rating">${movie.imdbRating || 'N/A'}</span>
                    </div>
                    <div class="movie-details">
                        <span class="duration">${movie.Runtime || 'N/A'}</span>
                        <span class="tags">${movie.Genre || 'N/A'}</span>
                        <button 
                            id="addBtn"
                            class="add-to-watchlist"
                            data-imdbid="${movie.imdbID}"
                            data-title="${movie.Title}"
                        >Watchlist</button>
                    </div>
                    <div class="movie-desc">${movie.Plot || 'No description available.'}</div>
                </div>
            </li>
        `      
    }
    moviesList.innerHTML = moviesHtml
}

function addToWatchlist(movieId, title) {
    const watchlistData = initializeWatchlist()
    if (!watchlistData.moviesIDs.includes(movieId)) {
        watchlistData.moviesIDs.push(movieId)
        localStorage.setItem("watchlistData", JSON.stringify(watchlistData))
        showNotification(`${title} added to your watchlist`)
    }
    else {
        showNotification(`${title} already in your watchlist`)
    }
}

function showNotification(message) {
    const notification = document.createElement("div")
    notification.className = "notification"
    notification.textContent = message
    document.body.appendChild(notification)
    
    setTimeout(() => {
        notification.classList.add("visible")
    }, 0)
    setTimeout(() => {
        notification.classList.add("hidden")
        setTimeout(() => {
            notification.remove()
        }, 150)
    }, 3000)
}

moviesList.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-watchlist")) {
        const movieID = e.target.dataset.imdbid
        const title = e.target.dataset.title
        addToWatchlist(movieID, title)
    }
})

function searchMovies(query) {
    query = query.trim()
    if (query.length >= 2) {
        fetch(`https://www.omdbapi.com/?apikey=1deb7e44&type=movie&s=${searchInput.value}`)
        .then(res => res.json())
        .then(data => getMoviesList(data))
        .then(moviesList => getMoviesData(moviesList))
        .then(moviesData => renderMovies(moviesData))
    }
    else {
        alert("Please, enter 2 characters at least.")
    }
}

searchbtn.addEventListener("click", () => {
    searchMovies(searchInput.value)
})

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchMovies(searchInput.value)
    }
})
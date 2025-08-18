const apiKey = "1deb7e44"
const moviesWatchlist = document.getElementById("movies-watchlist")
const emptyState = document.querySelector(".empty-state")

function initializeWatchlist() {
   const storedData = localStorage.getItem("watchlistData")
   let watchlistData
   if (storedData) {
      watchlistData = JSON.parse(storedData)
      localStorage.setItem("watchlistData", JSON.stringify(watchlistData))
   }
   else {
      watchlistData = { moviesIDs: [] }
      localStorage.setItem("watchlistData", JSON.stringify(watchlistData))
   }
   return watchlistData
}

async function displayWatchlist() {
   const watchlistData = initializeWatchlist()
   emptyState.style.display = watchlistData.moviesIDs.length === 0 ? "flex" : "none"
   
   const promises = watchlistData.moviesIDs.map(movieId => {
      return fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movieId}`)
         .then(res => res.json())
   })
   const moviesData = await Promise.all(promises)
   renderMovies(moviesData)
}

function renderMovies(arr) {
   let moviesHtml = ""
   for (let movie of arr) {
      moviesHtml += `
         <li class="movie">
            <img 
               class="movie-cover"
               src="${movie.Poster}"
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
                     id="removeBtn"
                     class="remove-from-watchlist"
                     data-imdbid="${movie.imdbID}"
                     data-title="${movie.Title}"
                  >Remove</button>
               </div>
               <div class="movie-desc">${movie.Plot || 'No description available.'}</div>
            </div>
         </li>
      `      
   }
   moviesWatchlist.innerHTML = moviesHtml
}

function removeFromWatchlist(movieId, title) {
   const watchlistData = initializeWatchlist()
   watchlistData.moviesIDs = watchlistData.moviesIDs.filter(id => id !== movieId)
   localStorage.setItem("watchlistData", JSON.stringify(watchlistData))
   showNotification(`${title} removed from your watchlist!`)
   displayWatchlist()
}

function showNotification(message) {
   const existingNotification = document.querySelector(".notification")
   if (existingNotification) {
      existingNotification.remove()
   }

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

moviesWatchlist.addEventListener("click", (e) => {
   const imdbID = e.target.dataset.imdbid
   const title = e.target.dataset.title
   removeFromWatchlist(imdbID, title)
})

// Initialization -> Display movies
displayWatchlist()
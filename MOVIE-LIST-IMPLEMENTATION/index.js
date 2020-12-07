const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filterMovies = []
let mode = true //default card mode
let nowPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const listMode = document.querySelector('#list-mode')
const cardMode = document.querySelector('#card-mode')

function getMoviesByPage(page) {
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  const data = filterMovies.length ? filterMovies : movies
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderMovieList(data) {
  let rawHTML = ''

  //processing
  if (mode) {
    data.forEach((item) => {
      //title image
      rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
    })
  } else {
    data.forEach((item) => {
      rawHTML += `
      <div class="col-12 border-top border-primary d-flex flex-nowrap">
        <div class="col-10 mt-3">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="mt-2 mb-2">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal"
            data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
      `
    })
  }
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="Movie Poster" class="img-fluid">`
    modalDate.innerText = 'release date: ' + data.release_date
    modalDescription.innerText = data.description
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已在收藏清單中')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  nowPage = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(nowPage))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyWord = searchInput.value.trim().toLowerCase()

  filterMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyWord)
  )

  if (!keyWord.length) {
    return alert('Please enter a vaild value')
  }

  if (filterMovies.length === 0) {
    return alert('Cannot find movies with keyword: ' + keyWord)
  }
  /*for (const movie of movies) {
    if (movie.title.toLowerCase().includes(keyWord)) {
      filterMovies.push(movie)
    }
  }*/
  renderPaginator(filterMovies.length)
  renderMovieList(getMoviesByPage(1))
})

listMode.addEventListener('click', function onListModeClicked(event) {
  mode = false
  const data = filterMovies.length ? filterMovies : movies
  renderPaginator(data.length)
  renderMovieList(getMoviesByPage(nowPage))
})

cardMode.addEventListener('click', function onCardModeClicked(event) {
  mode = true
  const data = filterMovies.length ? filterMovies : movies
  renderPaginator(data.length)
  renderMovieList(getMoviesByPage(nowPage))
})

axios.get(INDEX_URL).then((response) => {
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(nowPage))
})
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/'
const INDEX_URL = BASE_URL + 'api/v1/users/'

const favoriteUsers = JSON.parse(localStorage.getItem('favorites'))
const USERS_PER_PAGE = 16

const dataPanel = document.querySelector('#data-Panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
//Render
function renderUserList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-6 col-md-4 col-lg-3">
        <div class="mb-2">
          <div class="card border-0" style="width: 18rem;">
            <img src="${item.avatar}" class="card-img-top rounded-circle p-2" alt="avatar">
            <div class="card-body d-flex justify-content-center">
              <h5 class="card-title">${item.name} ${item.surname}</h5>
            </div>
            <div class="card-footer border-0 d-flex justify-content-center">
              <button class="btn btn-primary btn-show-user mr-2" data-toggle="modal" data-target="#modal-user" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

//Show Modal
function showUserModal(id) {
  const userTitle = document.querySelector('#user-modal-title')
  const userAvatar = document.querySelector('#user-modal-avatar')
  const userInfo = document.querySelector('#user-modal-info')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data
    userTitle.innerText = `${data.name} ${data.surname}`
    userAvatar.innerHTML = `<img src="${data.avatar}" class="img-fluid rounded-circle" alt="avatar">`
    userInfo.innerHTML = `
      <p>Gender: ${data.gender}</p>
      <p>Age: ${data.age}</p>
      <p>Region: ${data.region}</p>
      <p>Birthday: ${data.birthday}</p>
      <p>Email: ${data.email}</p>
    `
  })
}

function renderPaginator(amount) {
  const page = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  for (let i = 1; i <= page; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${i}>${i}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function removeFavorite(id) {
  const userIndex = favoriteUsers.findIndex((favoriteUser) => favoriteUser.id === id)
  favoriteUsers.splice(userIndex, 1)
  localStorage.setItem('favorites', JSON.stringify(favoriteUsers))
  renderUserList(favoriteUsers)
  renderPaginator(favoriteUsers.length)
}

function showUserPerPage(page) {
  const startIndex = (page - 1) * USERS_PER_PAGE
  return favoriteUsers.slice(startIndex, startIndex + USERS_PER_PAGE)
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-user')) {
    //console.log(event.target.dataset.id)
    showUserModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderUserList(showUserPerPage(page))
})

renderUserList(favoriteUsers)
renderPaginator(favoriteUsers.length)


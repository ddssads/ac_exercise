const BASE_URL = 'https://lighthouse-user-api.herokuapp.com/'
const INDEX_URL = BASE_URL + 'api/v1/users/'

const users = []
let filteredUsers = []
const USERS_PER_PAGE = 16
let condition = ''

const dataPanel = document.querySelector('#data-Panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const conditionContent = document.querySelector('#condition-content')
const userTitle = document.querySelector('#user-modal-title')
const userAvatar = document.querySelector('#user-modal-avatar')
const userInfo = document.querySelector('#user-modal-info')


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
              <h5 class="card-title ">${item.name} ${item.surname}</h5>
            </div>
            <div class="card-footer border-0 d-flex justify-content-center" >
              <button class="btn btn-primary btn-show-user mr-2" data-toggle="modal" data-target="#modal-user" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-add-favorite" data-id="${item.id}">Like</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}


function renderPaginator(amount) {
  const page = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  for (let i = 1; i <= page; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${i}>${i}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function showUserPerPage(page) {
  const startIndex = (page - 1) * USERS_PER_PAGE
  const data = filteredUsers.length ? filteredUsers : users
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

//Show Modal
function showUserModal(id) {
  clearModalPreviousData()
  handleModalLoading(true)

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
    handleModalLoading(false)
  })
}

function clearModalPreviousData() {
  userTitle.innerText = ''
  userAvatar.innerHTML = null
  userInfo.innerHTML = null
}

function handleModalLoading(isLoading) {
  const modalLoading = document.querySelector('.modal-loading')
  if (isLoading) {
    modalLoading.style.display = 'block'
  } else {
    modalLoading.style.display = 'none'
  }
}

function addToFavorite(id) {
  const favoriteUsers = JSON.parse(localStorage.getItem('favorites')) || []
  const findUser = users.find((user) => user.id === id)
  if (favoriteUsers.some((findUser) => findUser.id === id)) {
    return alert('已在喜歡名單中')
  }
  favoriteUsers.push(findUser)
  localStorage.setItem('favorites', JSON.stringify(favoriteUsers))
  console.log(favoriteUsers)
}


dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-user')) {
    //console.log(event.target.dataset.id)
    showUserModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword)
  )
  if (!keyword.length) {
    alert('欄位不能為空')
  } else if (filteredUsers.length === 0) {
    alert(`找不到${keyword}相關人物`)
  } else {
    renderPaginator(filteredUsers.length)
    renderUserList(showUserPerPage(1))
  }
})

conditionContent.addEventListener('click', function onConditionContentClicked(event) {
  if (event.target.id === "condition-male" || event.target.id === "condition-female") {
    condition = event.target.dataset.condition
  }
  filteredUsers = users.filter((user) => user.gender === condition)
  if (event.target.id === "condition-confirm") {
    event.target.parentElement.className = "collapse"
    renderPaginator(filteredUsers.length)
    renderUserList(showUserPerPage(1))
  }
})


paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderUserList(showUserPerPage(page))
})

axios.get(INDEX_URL).then((response) => {
  //console.log(response.data.results)
  users.push(...response.data.results)
  renderPaginator(users.length)
  renderUserList(showUserPerPage(1))
})

handleModalLoading()
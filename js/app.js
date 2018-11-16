const makeListBtn = document.getElementById('makeList');
const olBookList = document.getElementById('olBookList');
const modalBody = document.querySelector('.modal-body');
const formSelectUser = document.getElementById('formSelectUser');
const formFilterBooks = document.getElementById('formFilterBooks');
const searchBook = document.getElementById('searchBook');
const searchBookInput = document.getElementById('searchBookInput');
const searchResults = document.getElementById('searchResults');

const allUsers = {
  karl: [
    '0321683684',
    '0385267746',
    '0321702840',
    '0132658607',
    '1407062859',
    '111824043X',
    '0321648781',
    '0321702840',
    '0262134721',
  ],
  trung: [
    '1118871650',
    '1593275846',
    '1491964898',
  ],
  tim: [
    '1454925663',
    '1593275846',
  ],
};

// EVENT LISTENERS
olBookList.addEventListener('click', checkForDuplicate);
searchResults.addEventListener('click', checkForDuplicate);
formSelectUser.addEventListener('change', selectUser);
formFilterBooks.addEventListener('keyup', filterBooks);
searchBook.addEventListener('submit', searchFindBooks);



// BOOK TITLES LIST - STEP 1 - remove other lists if present in DOM and then determine user to build new list
function selectUser(e) {
  // remove other list from DOM first
  while (olBookList.firstChild) {
    olBookList.removeChild(olBookList.firstChild);
  }
  const selectedUser = e.target.value;
  if (allUsers.hasOwnProperty(selectedUser)) {
    getAllBookTitles(allUsers[selectedUser]);
  }
  e.preventDefault();
}


// BOOK TITLES LIST - STEP 2 - pull book titles from api
function getAllBookTitles(selectedList) {
  selectedList.forEach(isbn => {
    // get book data
    fetch('https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn, { 
      method: 'get',
    })
    .then(response => { return response.json(); })
    .then(data => {
      // read book title from api
      let bookTitle = data.items[0].volumeInfo.title;
      // run function to create li with isbn and book title as parameters
      createListElement(isbn, bookTitle);
    })
    .catch(error => {   
      console.log(error);
    });
  });
};

// BOOK TITLES LIST - STEP 3 - create UI 
function createListElement(i, t) {
  // create new li
  const newLi = document.createElement('li');
  // add isbn as id
  newLi.id = i;
  // add classes to li
  newLi.classList.add('list-group-item', 'list-group-item-secondary', 'list-group-item-action', 'animated', 'flipInX');
  // insert title in li
  newLi.innerHTML = t;
  // append li to ol
  olBookList.appendChild(newLi);
};



// MODAL CONTENT - STEP 1
function checkForDuplicate(e) {
  const modalContent = document.getElementById('modal-book-details');
  const isbn = e.target.id;

    // if element does NOT exist, run function
    if (!modalContent) {
      getBookDetails(isbn);
      $('#bookModal').modal();
    // if element DOES exist, move on to next conditional
    } else if (modalContent && modalContent.firstElementChild.innerHTML != isbn) {
      getBookDetails(isbn);
      $('#bookModal').modal();
    // open modal without updating content
    } else {
      $('#bookModal').modal();
    }
}

// MODAL CONTENT - STEP 2
function getBookDetails(isbn) {
  fetch('https://www.googleapis.com/books/v1/volumes?q=isbn:' + isbn, { 
      method: 'get',
      })
      .then(response => { return response.json(); })
      .then(data => {      
        const bookTitle = data.items[0].volumeInfo.title;
        let subtitle = data.items[0].volumeInfo.subtitle;
        const ulBookAuthor = data.items[0].volumeInfo.authors[0];
        const ulBookThumb = data.items[0].volumeInfo.imageLinks.thumbnail;
        const ulBookdescription = data.items[0].volumeInfo.description;
        const ulBookPageCount = data.items[0].volumeInfo.pageCount;
        const ulBookLink = data.items[0].volumeInfo.canonicalVolumeLink;
        //console.log(data.items[0].volumeInfo.subtitle);
        // if there is no subtitle returned from api, display this message
        if (!subtitle) {
          subtitle = 'No subtitle found for this book.';
        }
       
        const modalContent = document.getElementById('modal-book-details');
        if (!modalContent) {
          createModalContent(bookTitle, ulBookAuthor, isbn, ulBookThumb, ulBookdescription, ulBookPageCount, ulBookLink, subtitle);

        } else if (modalContent) {
          modalBody.removeChild(modalBody.firstElementChild);
          createModalContent(bookTitle, ulBookAuthor, isbn, ulBookThumb, ulBookdescription, ulBookPageCount, ulBookLink, subtitle);
        }

      })
      .catch(error => {   
        console.log(error);
      }); 
}


// MODAL CONTENT - STEP 3
function createModalContent(a, b, c, d, e, f, g, h) {

  const modalDiv = document.createElement('div');
  modalDiv.innerHTML = `
  <div id="modal-book-details" class="row mb-3">
    <div class="col">
          <ul class="list-group list-group-flush modal-content-list-titles mr-1">
            <li class="list-group-item"><h5>${a}</h5><p class="font-italic mb-0 mt-2">"${h}"</p></li>
            <li class="list-group-item"><span class="font-weight-bold">Author:</span> ${b}</li>
            <li class="list-group-item"><span class="font-weight-bold">ISBN:</span> ${c}</li>
            <li class="list-group-item"><span class="font-weight-bold">Pages:</span> ${f}</li>
            <li class="list-group-item"><span class="font-weight-bold">Full Details:</span> <a href="${g}" target="_blank">Google Books</a></li>
            <li class="list-group-item"><span class="font-weight-bold">Buy From:</span> <a href="amazon.com" target="_blank">Amazon</a> | <a href="https://www.fishpond.co.nz" target="_blank">Fishpond</a> | <a href="https://www.mightyape.co.nz/books" target="_blank">Mighty Ape</a></li>
          </ul>
    </div>  
  <div class="col-md-4 col-lg-3 mt-4 mt-md-0">
    <img class="modal-content-thumbnail" src="${d}">
  </div>
  <div class="modal-content-description p-4">
    <p>${e}</p>
  </div>
  `;
  modalBody.appendChild(modalDiv);
}


// FILTER BOOKS
function filterBooks(e) {
  const text = e.target.value.toLowerCase();

  document.querySelectorAll('.list-group-item').forEach(book => {
    const item = book.innerText;
    if (item.toLowerCase().indexOf(text) != -1) {
      book.style.display = 'list-item';
    } else {
      book.style.display = 'none';
    }
  })
}




// SEARCH BOOK - STEP 1 - Get Search Results
function searchFindBooks(e) {
  const searchTerm = searchBookInput.value;
  fetch('https://www.googleapis.com/books/v1/volumes?q=' + searchTerm + '&maxResults=5', {
      method: 'get',
    })
    .then(response => { return response.json(); })
    .then(data => {
      searchShowBooks(data.items[0], data.items[1], data.items[2], data.items[3], data.items[4]);
    })
    .catch(error => {   
      console.log(error);
    });
e.preventDefault();
}


// SEARCH BOOK - STEP 2 - Create UI
function searchShowBooks(first, second, third, fourth, fifth) {
  
  while (searchResults.firstChild) {
    searchResults.removeChild(searchResults.firstChild);
  }
  const results = [first, second, third, fourth, fifth];

  results.forEach(result => {
    const li = document.createElement('li');
    li.id = result.volumeInfo.industryIdentifiers[0].identifier;
    li.classList.add('list-group-item', 'list-group-item-action', 'numbered');
    li.innerText = result.volumeInfo.title;
    const btn = document.createElement('a');
    btn.classList.add('btn', 'btn-outline-secondary', 'btn-sm', 'btn-block', 'mt-1', 'mb-2', 'animated', 'flipInX');
    btn.innerText = 'Add to List';
    li.appendChild(btn);
    searchResults.appendChild(li);
  });
  searchBookInput.value = '';
}


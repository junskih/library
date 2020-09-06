/* isDescendant function: https://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-contained-within-another */
const library = [];
const libraryDiv = document.querySelector("#library");
const bookButtonContainer = document.querySelector("#addBookButtonContainer");
const bookButton = document.querySelector("#addBookButton");
const bookFormContainer = document.querySelector("#bookFormContainer");
const bookForm = document.querySelector("#bookForm");
const formReadCheckbox = bookForm.querySelector("#formReadCheckbox");
const formReadLabel = bookForm.querySelector("#formReadLabel");

/* Book object */
function Book(title, author, pages, isRead) {
  this.title = title;
  this.author = author;
  this.pages = pages;
  this.isRead = isRead;
  this.info = function() {
    return `${title} by ${author} - ${pages} pages - ${isRead}`;
  }
}

/* Utility functions */
function isDescendant(parent, child) {
  let node = child.parentNode;
  while (node != null) {
    if (node == parent) return true;
    node = node.parentNode;
  }
  return false;
}

function findParentWithClassname(child, className) {
  while (child.parentNode) {
    if (child.parentNode.classList.contains(className)) {
      return child.parentNode;
      break;
    }
    child = child.parentNode;
  }
  return null;
}

/* Event functions */
function showBookForm(e) {
  // Apply styles to show and emphasize form
  bookFormContainer.style.setProperty("visibility", "visible");
  bookForm.style.setProperty("visibility", "visible");
  bookFormContainer.style.setProperty("opacity", "1");
  bookForm.style.setProperty("opacity", "1");
  libraryDiv.style.setProperty("filter", "blur(0.25em)");
  
  bookButton.removeEventListener("click", showBookForm);
  window.setTimeout(function() {
    window.addEventListener("click", hideBookForm);
  }, 100);
}

function hideBookForm(e) {
  // Three ways to close form: cancel button, add button and clicking outside form
  if (e !== null 
      && e.target.id !== "cancel" 
      && (e.target.id === "addBookFormContainer" 
      || isDescendant(bookFormContainer, e.target))) {
    return;
  }
  bookFormContainer.style.setProperty("visibility", "hidden");
  bookForm.style.setProperty("visibility", "hidden");
  bookFormContainer.style.setProperty("opacity", "0");
  bookForm.style.setProperty("opacity", "0");
  libraryDiv.style.removeProperty("filter");
  
  window.removeEventListener("click", hideBookForm);
  bookButton.addEventListener("click", showBookForm);
  
  window.setTimeout(function() {
    bookForm.reset();
    toggleFormReadLabel();
  }, 300);
}

function addBookToLibrary(e) {
  // Prevent form from sending anything for now
  e.preventDefault();
  let bookData = bookForm.querySelectorAll("input");
  let title = bookData[0].value;
  let author = bookData[1].value;
  let pages = bookData[2].value;
  let isRead = Boolean(bookData[3].checked);
  let newBook = new Book(title, author, pages, isRead);
  
  library.push(newBook);
  renderBook(newBook);
  hideBookForm(null);
  exportLibrary();
}

function toggleBookRead(e) {
  // Get book index from data attributes
  let book = findParentWithClassname(e.target, "book");
  let bookIndex = book.dataset.libraryIndex;
  
  // Toggle read status and checkbox
  library[bookIndex].isRead = e.target.checked;
  
  // Add/remove classes...
  if (e.target.checked) {
    if (book.classList.contains("notRead")) {
      book.classList.remove("notRead");
    }
  } else {
    book.classList.add("notRead");
  }
}

function toggleFormReadLabel() {
  formReadLabel.textContent = isFormReadCheckedText();
}

function isFormReadCheckedText() {
  return formReadCheckbox.checked ? "I have read this book already" : "I have not yet read this book";
}

function removeBookFromLibrary(e) {
  // Remove book both from array and DOM
  let book = findParentWithClassname(e.target, "book")
  
  if (book) {
    let bookIndex = parseInt(book.dataset.libraryIndex);
    library.splice(bookIndex, 1);
    book.remove();
    exportLibrary();
  }
}

/* Display functions */
function renderLibrary() {
  library.forEach(book => {
    renderBook(book);
  });
}

function renderBook(book) {
  const bookTemplate = document.querySelector("#bookTemplate");
  let bookClone = bookTemplate.content.cloneNode(true);
  let paragraphs = bookClone.querySelectorAll("p");
  let bookReadCheckbox = bookClone.querySelector(".bookReadCheckbox");
  let bookRemoveButton = bookClone.querySelector(".bookRemoveButton");
  let bookIndex = library.indexOf(book);
  paragraphs[0].textContent = book.title;
  paragraphs[1].textContent = book.author;
  paragraphs[2].textContent = `${book.pages} pages`;
  bookReadCheckbox.checked = book.isRead;
  bookReadCheckbox.addEventListener("change", toggleBookRead);
  bookRemoveButton.addEventListener("click", removeBookFromLibrary);
  bookClone.querySelector(".book").dataset.libraryIndex = bookIndex.toString();
  libraryDiv.insertBefore(bookClone, addBookButtonContainer);
}

function initialize() {
  bookButton.addEventListener("click", showBookForm);
  bookForm.addEventListener("submit", addBookToLibrary);
  bookForm.querySelector("#cancel").addEventListener("click", hideBookForm);
  formReadCheckbox.addEventListener("change", toggleFormReadLabel);
  formReadLabel.textContent = isFormReadCheckedText();
  
  if (!localStorage.getItem("library")) {
    initializeLibrary();
  }
  importLibrary();
}

function initializeLibrary() {
  const hobbit = new Book("The Hobbit", "J.R.R. Tolkien", 304, true);
  const lotr = new Book("The Lord of the Rings", "J.R.R. Tolkien", 1241, true);
  const ncfom = new Book("No Country for Old Men", "Cormac McCarthy", 320, true);
  const blood = new Book("Blood Meridian", "Cormac McCarthy", 337, true);
  library.push(hobbit);
  library.push(lotr);
  library.push(ncfom);
  library.push(blood);
  exportLibrary();
}

function exportLibrary() {
  localStorage.setItem("library", JSON.stringify(library));
}

function importLibrary() {
  if (localStorage.getItem("library")) {
    let loadedLibrary = JSON.parse(localStorage.getItem("library"));
    loadedLibrary.forEach(book => {
      library.push(book);
    });
  }
}

initialize();
renderLibrary();

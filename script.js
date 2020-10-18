// isDescendant function: https://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-contained-within-another
// Singleton pattern using class syntax: https://www.sitepoint.com/javascript-design-patterns-singleton/

class Book {
  constructor(title, author, pages, isRead) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.isRead = isRead;
    this.info = function () {
      return `${title} by ${author} - ${pages} pages - ${isRead}`;
    };
  }
}

class Library {
  constructor() {
    if (!Library.instance) {
      this.booksArray = [];
      Library.instance = this;
    }
    return Library.instance;
  }

  static getInstance() {
    return Library.instance;
  }

  get books() {
    return this.booksArray;
  }

  init() {
    const hobbit = new Book("The Hobbit", "J.R.R. Tolkien", 304, true);
    const lotr = new Book("The Lord of the Rings", "J.R.R. Tolkien", 1241, true);
    const ncfom = new Book("No Country for Old Men", "Cormac McCarthy", 320, true);
    const blood = new Book("Blood Meridian", "Cormac McCarthy", 337, true);
    this.booksArray.push(hobbit);
    this.booksArray.push(lotr);
    this.booksArray.push(ncfom);
    this.booksArray.push(blood);
    this.export();
  }

  addBook(e) {
    // Prevent form from sending anything for now
    e.preventDefault();
    let bookData = Display.getInstance().getBookData();
    let title = bookData[0].value;
    let author = bookData[1].value;
    let pages = bookData[2].value;
    let isRead = Boolean(bookData[3].checked);
    let newBook = new Book(title, author, pages, isRead);
    
    Library.getInstance().booksArray.push(newBook);
    Display.getInstance().renderBook(newBook);
    Display.getInstance().hideBookForm(null);
    Library.getInstance().export();
  }

  removeBook(bookIndex) {
    if (this.books.splice(bookIndex, 1)) {
      this.export();
    }
  }

  setBookIsRead(bookIndex, isRead) {
    this.books[bookIndex].isRead = isRead;
  }

  export() {
    localStorage.setItem("library", JSON.stringify(this.booksArray));
  }

  import() {
    let library = localStorage.getItem("library");
    if (library && library !== {}) {
      let loadedLibrary = JSON.parse(localStorage.getItem("library"));
      loadedLibrary.forEach(book => {
        this.books.push(book);
      });
    }
  }
}

class Display {
  constructor() {
    // Singleton pattern
    if (!Display.instance) {
      this.libraryDiv = document.querySelector("#library");
      this.bookButtonContainer = document.querySelector("#addBookButtonContainer");
      this.bookButton = document.querySelector("#addBookButton");
      this.bookFormContainer = document.querySelector("#bookFormContainer");
      this.bookForm = document.querySelector("#bookForm");
      this.formReadCheckbox = bookForm.querySelector("#formReadCheckbox");
      this.formReadLabel = bookForm.querySelector("#formReadLabel");
      this.bookTemplate = document.querySelector("#bookTemplate");
      Display.instance = this;
    }
    return Display.instance;
  }

  static getInstance() {
    return Display.instance;
  }

  init() {
    this.bookButton.addEventListener("click", this.showBookForm.bind(this));
    this.bookForm.addEventListener("submit", Library.getInstance().addBook);
    this.bookForm.querySelector("#cancel").addEventListener("click", this.hideBookForm.bind(this));
    this.formReadCheckbox.addEventListener("change", this.toggleFormReadLabel.bind(this));
    this.formReadLabel.textContent = this.isFormReadCheckedText();
    
    let library = localStorage.getItem("library");
    if (library == "{}") {
      Library.getInstance().init();
    }
    Library.getInstance().import();
    this.renderLibrary();
  }

  renderLibrary() {
    Library.getInstance().books.forEach(book => {
      this.renderBook(book);
    });
  }

  renderBook(book) {
    let bookClone = this.bookTemplate.content.cloneNode(true);
    let paragraphs = bookClone.querySelectorAll("p");
    let bookReadCheckbox = bookClone.querySelector(".bookReadCheckbox");
    let bookRemoveButton = bookClone.querySelector(".bookRemoveButton");
    let bookIndex = Library.getInstance().books.indexOf(book);
    paragraphs[0].textContent = book.title;
    paragraphs[1].textContent = book.author;
    paragraphs[2].textContent = `${book.pages} pages`;
    bookReadCheckbox.checked = book.isRead;
    bookReadCheckbox.addEventListener("change", this.toggleBookRead.bind(this));
    bookRemoveButton.addEventListener("click", this.removeBook.bind(this));
    bookClone.querySelector(".book").dataset.libraryIndex = bookIndex.toString();
    this.libraryDiv.insertBefore(bookClone, this.bookButtonContainer);
  }

  toggleBookRead(e) {
    // Get book index from data attributes
    let book = this.findParentWithClassname(e.target, "book");
    let bookIndex = book.dataset.libraryIndex;
    
    // Toggle read status and checkbox
    Library.getInstance().setBookIsRead(bookIndex, e.target.checked);
    
    // Add/remove classes...
    if (e.target.checked) {
      if (book.classList.contains("notRead")) {
        book.classList.remove("notRead");
      }
    } else {
      book.classList.add("notRead");
    }
  }

  showBookForm(e) {
    // Apply styles to show and emphasize form
    this.bookFormContainer.style.setProperty("visibility", "visible");
    this.bookForm.style.setProperty("visibility", "visible");
    this.bookFormContainer.style.setProperty("opacity", "1");
    this.bookForm.style.setProperty("opacity", "1");
    this.libraryDiv.style.setProperty("filter", "blur(0.25em)");
    
    this.bookButton.removeEventListener("click", this.showBookForm);
    window.setTimeout(function() {
      window.addEventListener("click", Display.getInstance().hideBookForm);
    }, 100);
  }
  
  hideBookForm(e) {
    let disp = Display.getInstance();
    // Three ways to close form: cancel button, add button and clicking outside form
    if (e !== null 
        && e.target.id !== "cancel" 
        && (e.target.id === "addBookFormContainer" 
        || disp.isDescendant(disp.bookFormContainer, e.target))) {
      return;
    }
    disp.bookFormContainer.style.setProperty("visibility", "hidden");
    disp.bookForm.style.setProperty("visibility", "hidden");
    disp.bookFormContainer.style.setProperty("opacity", "0");
    disp.bookForm.style.setProperty("opacity", "0");
    disp.libraryDiv.style.removeProperty("filter");
    
    window.removeEventListener("click", disp.hideBookForm);
    disp.bookButton.addEventListener("click", disp.showBookForm.bind(disp));
    
    window.setTimeout(function() {
      disp.bookForm.reset();
      disp.toggleFormReadLabel();
    }.bind(disp), 300);
  }

  toggleFormReadLabel() {
    this.formReadLabel.textContent = this.isFormReadCheckedText();
  }

  isFormReadCheckedText() {
    return this.formReadCheckbox.checked ? "I have read this book already" : "I have not yet read this book";
  }

  isDescendant(parent, child) {
    let node = child.parentNode;
    while (node != null) {
      if (node == parent) return true;
      node = node.parentNode;
    }
    return false;
  }

  findParentWithClassname(child, className) {
    while (child.parentNode) {
      if (child.parentNode.classList.contains(className)) {
        return child.parentNode;
        break;
      }
      child = child.parentNode;
    }
    return null;
  }

  getBookData() {
    return this.bookForm.querySelectorAll("input");
  }

  removeBook(e) {
    let book = this.findParentWithClassname(e.target, "book");
    
    if (book) {
      let bookIndex = parseInt(book.dataset.libraryIndex);
      Library.getInstance().removeBook(bookIndex);
      book.remove();
    }
  }
}

const bookLibrary = new Library();
const libraryDisplay = new Display();
Display.getInstance().init();

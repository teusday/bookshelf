class Book extends HTMLElement {

  constructor() {
    super();

    var shadow = this.attachShadow({mode: 'open'});
    var style = document.createElement('style');

    style.textContent = '.rotate {' +
      'writing-mode: vertical-rl;'+
      'margin-top: 3px;'+
      '}'+
      '#spine {background: grey;'+
      'display: inline-block;'+
      'box-shadow: inset 0 0 0 1px black;}'

    shadow.appendChild(style);

    this._isbn = null;
    this._goodreadsID = null;
    this._title = null;
    this._author = null;
    this._noImageCallback = function(){};
    this._height = 200;
  }

  static get observedAttributes() {
    return ["isbn","goodreads","noCoverCallback","height","title","author"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "isbn":
        this._isbn = newValue;
        break;
      case "goodreads":
        console.error("Goodreads functionality is deprecated until fixed by OpenLibrary");
        this._goodreads = newValue;
        break;
      case "noCoverCallback":
        this._noImageCallback = newValue;
        break;
      case "height":
        this._height = newValue;
        break;
      case "title":
        this._title = newValue;
        break;
      case "author":
        this._author = newValue;
        break;
      default: console.error("There shouldn't be a non-matching key");
    }
    this._updateRendering();
  }
  connectedCallback() {
    this._updateRendering();
  }

  get isbn() {
    return this._isbn;
  }
  set isbn(v) {
    this.setAttribute("isbn", v);
  }

  get goodreads() {
    return this._goodreadsID;
  }
  set goodreads(v) {
    this.setAttribute("goodreads", v);
  }

  get height() {
    return this._height;
  }
  set height(v) {
    this.setAttribute("height", v);
  }

  get width() {
    var cover = this.shadowRoot.getElementById('cover');
    var spine = this.shadowRoot.getElementById("spine");
    if(cover) {
      if(!cover.complete){console.error("bad data because cover hasn't loaded");}return cover.width;}
    else if(spine) return spine.offsetWidth;
    else {console.error("no width info"); return 0;}
  }

  _getPathPair() {
    //FIXME: Not Great
    if(this._isbn){
      return 'isbn/'+this._isbn;
    }
    if(this._goodreads){
      return 'goodreads/'+this._goodreads;
    }
  }

  _updateRendering() {
    if(this.ownerDocument.defaultView){
      if(this._isbn){
        var cover = this.shadowRoot.getElementById("cover");
        if(!cover){cover = document.createElement('img');
        cover.setAttribute("id","cover");
        this.shadowRoot.appendChild(cover);}
        cover.height = this._height;
        const path = "https://covers.openlibrary.org/b/"+this._getPathPair()+"-L.jpg?default=false";
        const cb = this._noImageCallback;
        fetch("https://cors-anywhere.herokuapp.com/"+path,
          {mode: "cors",
          headers:new Headers({'origin': 'localhost'})
        })
        .then(function(response) {
          if (response.ok) {
            return response;
          }
          throw new Error('Network response was not ok.');
        }).then(function() {
          cover.src = path;
        }).catch(function(error) {
          console.log(path," has no cover.");
          cb();
        });
      }else if(this._title){
        var spine = this.shadowRoot.getElementById("spine");
        if(!spine){spine = document.createElement('div');
            spine.setAttribute("id","spine");
            var title = document.createElement("h3");
            title.setAttribute("id","title");
            title.setAttribute("class","rotate")
            var author = document.createElement("h5");
            author.setAttribute("id","author");
            author.setAttribute("class","rotate")
            spine.appendChild(author);
            spine.appendChild(title);
            this.shadowRoot.appendChild(spine);}
        author = this.shadowRoot.getElementById("author");
        author.textContent = this._author;
        title = this.shadowRoot.getElementById("title");
        title.textContent = this._title;
        spine.setAttribute("style","height: "+this._height+"px; width: -moz-max-content; width: max-content;");
      }
    }
  }
}

customElements.define("super-awesome-book", Book);

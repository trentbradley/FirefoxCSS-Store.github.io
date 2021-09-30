function sanatise (unsanatisedInput) {

  const tempEl = document.createElement('div')
        tempEl.innerText = unsanatisedInput

  const sanatisedOutput = tempEl.innerHTML
  return sanatisedOutput

}



class Card {

  constructor (data, id) {

    this._id           = id + 1
    this._title        = sanatise(data.title)
    this._description  = sanatise(data.description)
    this._link         = sanatise(data.link)
    this._image        = sanatise(data.image)

  }



  render (outputContainer) {

    const template = `
    <div id="theme-${this._id}" class="card">
      <header>
        <h3 class="theme-title">${this._title}</h3>
        <a href="${this._link}">
          <i class="fas fa-chevron-circle-down"></i>
        </a>
      </header>
      <div class="meta">
        <a href="${this._link}" tabindex="-1">
          <img src="${this._image}">
          <p class="description">${this._description}</p>
        </a>
      </div>
      <div class="button-wrapper">
        <button class="btn btn-lightbox" type="button" onClick="createLightbox(${this._id})"><i class="fas fa-search-plus"></i> Enlarge</button>
        <a href="${this._link}" class="btn btn-download"><i class="fas fa-file-download"></i> Download</a>
      </div>
    </div>
    `

    outputContainer.insertAdjacentHTML('beforeend', template)

  }
}




const removeLightbox = () => document.body.getElementsById('lightbox').remove()

function createLightbox (id) {

  const card = document.getElementById(`theme-${id}`)
  const themeTitle = card.querySelector('h3')
  const img = card.querySelector('img')

  const template = `
  <div id="lightbox" onclick="this.remove()">
    <h2>${themeTitle.innerText}</h2>
    <img src="${img.src}">
    <button type="button" class="btn btn-close-lightbox" onClick="removeLightbox"><i class="fas fa-times-circle"></i> Close</button>
  </div>
  `

  card.insertAdjacentHTML('afterend', template)

}





(() => { // IIFE to avoid globals

  /*  URL Parameter Handling
   *  ======================
   */

  const getParameterString = window.location.search.substr(1)
  const getParameters      = getParameterString.split('&')
  let   search

  getParameters.forEach(parameter => {

    const splitParameters = (parameter.split('='))
    const key             = splitParameters[0]
    const value           = splitParameters[1]

    if (key == 'search') search = sanatise(value)

  })





  /*  Load Content
   *  ============
   */

  const outputContainer = document.getElementById('themes_container')

  if (outputContainer) {
    fetch('themes.json')
    .then(data => data.json())
    .then(parsedData => {

      // sort from the most recent theme added
      // temporary since we're going to add a button to sort
      // in different ways
      parsedData.reverse()


      if (search) {

        function matches (text, partial) { return text.toLowerCase().indexOf(partial.toLowerCase()) > -1 }

        const parsedAsArray = Object.entries(parsedData)
        let   searchResults = parsedAsArray.filter(element => matches(`${element[1].title}, ${element[1].tags}`, search))


        searchResults.forEach(result => {

          const card = new Card(result[1], +result[0])
          card.render(outputContainer)

        })

      } else {

        const shuffledData = [...parsedData].sort(() => 0.5 - Math.random())
        const selectedData = shuffledData.slice(0, 20)

        selectedData.forEach((entry, index)  => {

          const card = new Card (entry, index)
          card.render(outputContainer)

        })

      }
    })
  }



  /*  Theme Handling
   *  ==============
   */

  const systemPref       = window.matchMedia("(prefers-color-scheme: dark)").matches ? 'night' : 'day',
        themeTrigger     = document.getElementById('js-themeSwitcher'),
        themeTriggerIcon = themeTrigger.querySelector('i')

  // when local storage is not populated set the system preferrence as value
  if (!localStorage['theme']) localStorage['theme'] = systemPref === 'day' ? 'day' : 'night'

  // set nightmode when according to local storage
  if (localStorage['theme'] === 'night') {

    themeTriggerIcon.classList.toggle('fa-sun')
    themeTriggerIcon.classList.toggle('fa-moon')

    document.documentElement.classList.add('nightmode')

  } else { document.documentElement.classList.add('daymode') }


  function toggleTheme () {

    document.documentElement.classList.toggle('nightmode')
    document.documentElement.classList.toggle('daymode')

    themeTriggerIcon.classList.toggle('fa-sun')
    themeTriggerIcon.classList.toggle('fa-moon')

    // update local storage
    if (localStorage['theme'] === 'night') localStorage['theme'] = 'day'
    else localStorage['theme'] = 'night'

  }

  themeTrigger.addEventListener('click', event => toggleTheme())

})()

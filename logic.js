const { prompt } = require('inquirer');
const out = require('./stdout')
const db = require('./db')
const model = require('./model')
const { toLower } = require('./utils')

const questions = {
  title: {
    type : 'input',
    name : 'title',
    message : 'Enter movie title ..'
  },
  year: {
    type : 'input',
    name : 'year',
    message : 'Release year ..'
  },
  rating:{
    type : 'input',
    name : 'rating',
    message : 'Rate as ..',
    default: function() {
      return 10
    }
  }
}

const addMovie = (movie, force = false) => {
  const emptyFields = []
  if (!movie.title)
    emptyFields.push(questions.title)
  if (!movie.year)
    if (!force)
      emptyFields.push(questions.year)
  if (!movie.rating && Number(movie.rating, 0) !== 0)
    if (!force) {
      emptyFields.push(questions.rating)
    } else {
      delete movie.rating
    }
  if (emptyFields.length) {
    prompt(emptyFields).then((answers) => {
      saveMovie({ ...model.Movie, ...movie, ...answers})
    })
  } else {
    saveMovie({ ...model.Movie, ...movie })
  }
}

const getMovie = (id) => {
  const _id = Number(id, 0)
  return db.get('movies').find({ id: _id }).value() || model.NotFound
}

const saveMovie = (movie) => {
  let exist = movie.id == 0 ? true : !!movie.id
  if (exist)
    db.get('movies')
      .find({ id: movie.id })
      .assign({ ...movie })
      .write()
  if (!exist) 
    db.get('movies')
      .push({ ...movie,  id: db.get('movies').size().value() })
      .write()
  updateTopRated()
  out.info('👍 ');
}

const updateMovie = (id, movie) => {
  const originalMovie = getMovie(id)
  let updatedFields = {}
  if (originalMovie.rating == 404)
    out.error(`Not found`)
  const { title, year, rating } = movie
  if (title)
    updatedFields.title = title
  if (year)
    updatedFields.year = year
  if (rating)
    updatedFields.rating = Number(rating, 0)
  saveMovie({ ...originalMovie, ...updatedFields })
}

const listMovies = () => {
  const rated = db.get('top_rated').value()
  rated.map(movieRateRow)  
  const amount = db.get('movies').size().value()
  out.br()
  out.info(`Total viewed: ${amount} films`)
}

const updateTopRated = () => {
  const sortFn = (a, b) => Number(b.rating, 0) - Number(a.rating, 0)
  const mapFn = (mov, ind) => ({ index: ind+1, id: mov.id })
  const allMovies = db.get('movies').value()
  const sorted = allMovies.sort(sortFn)
  const rated = sorted.map(mapFn)
  db.set('top_rated', [ ...rated ])
    .write()
}

const movieRateRow = (rateRow) => {
  const { index, id } = rateRow
  const movie = getMovie(id)
  movieRow({ index, ...movie })
}

const movieRow = (movie) => {
  const { index, id, title, year, rating, viewed_on } = movie
  out.info(`${index}. ${title} (${year}) #${id} ${rating}/10`)
}

const searchMovies = (search_phrase) => {
  const searchFn = (search_phrase) => {
    const filterFn = ({ title }) => title.toLowerCase().search(search_phrase) != -1
    const mapFn = (res, ind) => ({ index: ind+1, ...res })
    const allMovies = db.get('movies').value()
    const searchResultRaw = allMovies.filter(filterFn)
    const searchResult = searchResultRaw.map(mapFn)
    return !!searchResult.length ? searchResult : [{ index: 1, ...model.NotFound }]
  }
  const result = searchFn(search_phrase)
  result.map(movieRow)
}

module.exports = {
  addMovie,
  listMovies,
  updateMovie,
  searchMovies
}

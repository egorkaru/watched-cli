const { prompt } = require('inquirer');
const out = require('./stdout')
const db = require('./db')

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

const MovieModel = {
  title: '',
  year: 99,
  rating: 10,  
  viewed_on: Date.now()/1000 | 0,
}

const addMovie = (movie, force = false) => {
  const emptyFields = []
  if (!movie.title)
    emptyFields.push(questions.title)
  if (!movie.year)
    if (!force)
      emptyFields.push(questions.year)
  if (!movie.rating && movie.rating !== 0)
    if (!force) {
      emptyFields.push(questions.rating)
    } else {
      delete movie.rating
    }
  if (emptyFields.length) {
    prompt(emptyFields).then((answers) => {
      saveMovie({ ...MovieModel, ...movie, ...answers})
    })
  } else {
    saveMovie({ ...MovieModel, ...movie })
  }
}

const getMovie = (id) => {
  const _id = Number(id, 0)
  const notFound = {
    id: -404,
    title: "Not Found",
    year: 404,
    rating: 404
  }
  return db.get('movies').find({ id: _id }).value() || notFound
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
  console.log(id, movie)
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
  saveMovie({...originalMovie, ...updatedFields})
}

const listMovies = () => {
  const rated = db.get('top_rated').value()
  rated.map(rateRow => listMovieRow(rateRow))  
  const amount = db.get('movies').size().value()
  out.br()
  out.info(`Total viewed: ${amount} films`)
}

const updateTopRated = () => {
  const sorted = db.get('movies').sortBy('rating').value()
  const rated = sorted.reverse().map((m, i) => ({index: i+1, id: m.id}))
  db.set('top_rated', [...rated])
    .write()
}

const listMovieRow = (rateRow) => {
  const { index, id } = rateRow
  const { title, year, rating, viewed_on } = getMovie(id)
  out.info(`${index}. ${title} (${year}) #${id} ${rating}/10`)
}

module.exports = {
  addMovie,
  listMovies,
  updateMovie
}

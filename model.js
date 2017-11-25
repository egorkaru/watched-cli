const Movie = {
  title: '',
  year: 99,
  rating: 10,  
  viewed_on: Date.now()/1000 | 0,
}

const NotFound = {
  id: 0,
  title: "Not Found",
  year: 404,
  rating: 404
}

module.exports = {
  Movie,
  NotFound
}

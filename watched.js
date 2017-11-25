#!/usr/bin/env node

const program = require('commander');
const { addMovie, listMovies, updateMovie, searchMovies } = require('./logic')
const { toLower } = require('./utils')

program
  .version('0.0.3')
  .description('Watched movies tracking system')

program
  .command('add [title] [year] [rating]')
  .alias('a')
  .description('Add a movie')
  .option('-f, --force', 'add only by title')  
  .action((title, year, rating, options) => {
    addMovie({title, year, rating}, options.force);
  })

program
  .command('update <id>')
  .alias('u')
  .description('Update a movie')
  .option('-t, --title <title>', 'Title')
  .option('-y, --year <year>', 'Year')  
  .option('-r, --rating <rating>', 'Rating')    
  .action((id, options) => {
    let { title, year, rating } = options
    updateMovie(id, {title, year, rating});
  })

program
  .command('list')
  .alias('l')
  .description('List all watched')
  .action(() => listMovies())

program
  .command('search <search_phrase>')
  .alias('s')
  .description('Search in watched by title')
  .action((search_phrase) => {
    searchMovies(toLower(search_phrase))
  })

if (!process.argv.slice(2).length || !/[auls]/.test(process.argv.slice(2))) {
  program.outputHelp();
  process.exit();
}

program.parse(process.argv)

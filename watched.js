#!/usr/bin/env node

const program = require('commander');
const { addMovie, listMovies, updateMovie } = require('./logic')

program
  .version('0.0.1')
  .description('Watched movies tracking system')

program
  .command('add [title] [year] [rating]')
  .alias('a')
  .description('Add a movie')
  .option('-f, --force', 'force add only by name')  
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

if (!process.argv.slice(2).length || !/[arudl]/.test(process.argv.slice(2))) {
  program.outputHelp();
  process.exit();
}

program.parse(process.argv)

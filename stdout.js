const log = (message) => console.log(message)

const br = () => console.log(``)

const info = (message) => console.info(message)

const error = (message) => {
  console.error(message)
  process.exit()
}


module.exports = {
  log,
  br,
  info,
  error
}

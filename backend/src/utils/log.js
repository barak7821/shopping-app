// This utilities function logs messages to the console only in development mode.
export const log = (...args) => {
  if (process.env.MODE === 'development') {
    console.log(...args)
  }
}

export const errorLog = (...args) => {
  if (process.env.MODE === 'development') {
    console.error(...args)
  }
}
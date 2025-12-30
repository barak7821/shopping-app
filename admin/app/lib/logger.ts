// This utilities function logs messages to the console only in development mode.
export const log = (...args: any[]) : void => {
  if (process.env.NEXT_PUBLIC_MODE === 'development') {
    console.log(...args)
  }
}

export const errorLog = (...args: any[]) : void => {
  if (process.env.NEXT_PUBLIC_MODE === 'development') {
    console.error(...args)
  }
}
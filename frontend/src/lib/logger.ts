// This utilities function logs messages to the console only in development mode.
export const log = (...args: unknown[]) => {
  if (import.meta.env.VITE_MODE === 'development') {
    console.log(...args)
  }
}

export const errorLog = (...args: unknown[]) => {
  if (import.meta.env.VITE_MODE === 'development') {
    console.error(...args)
  }
}
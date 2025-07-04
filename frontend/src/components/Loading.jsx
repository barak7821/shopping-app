import React from 'react';
import { initTheme } from '../utils/darkMode';

export default function Loading() {
  initTheme()
  return (
    <div className="flex flex-col items-center justify-center h-screen select-none touch-none bg-neutral-100 dark:bg-neutral-900">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-neutral-400 dark:border-neutral-700 opacity-30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 dark:border-t-blue-800 border-b-transparent border-l-transparent border-r-transparent animate-spin"></div>
      </div>
      <span className="mt-4 font-medium tracking-wide text-neutral-800 dark:text-neutral-100 animate-pulse">Loading...</span>
    </div>
  )
}
import { initTheme } from '../utils/darkMode';

export default function Loading() {
  initTheme()
  return (
    <div className="flex flex-col items-center justify-center h-full select-none touch-none dark:bg-neutral-900">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-neutral-200 dark:border-neutral-800" />
        <div className="absolute inset-0 rounded-full border-4 border-t-[#c1a875]  border-b-transparent border-l-transparent border-r-transparent animate-spin" />
      </div>
      <span className="mt-4 font-medium tracking-wide text-neutral-800 dark:text-neutral-100 animate-pulse">Loading...</span>
    </div>
  )
}
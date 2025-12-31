"use client"
export default function LoadingSkeleton() {
    return (
        <div className="flex flex-col items-center animate-pulse">
            <div className="w-[170px] h-[210px] md:w-[220px] md:h-[280px] bg-gray-200 dark:bg-neutral-700 rounded-2xl mb-4 md:mb-5" />
            <div className="h-5 w-2/3 bg-gray-200 dark:bg-neutral-700 rounded mb-2" />
            <div className="h-4 w-1/3 bg-gray-100 dark:bg-neutral-600 rounded" />
        </div>
    )
}

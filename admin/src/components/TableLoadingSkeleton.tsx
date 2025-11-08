import SideBar from '../components/SideBar'

export default function TableLoadingSkeleton() {
    return (
        <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
            {/* Sidebar + Main */}
            <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">

                {/* Sidebar */}
                <SideBar />

                {/* Main Content */}
                <div className="flex-1 bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-8 flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-8 animate-pulse">
                        <div className="h-8 w-40 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                        <div className="h-10 w-32 bg-neutral-300 dark:bg-neutral-700 rounded-xl" />
                    </div>

                    {/* Table Skeleton */}
                    <div className="overflow-x-auto rounded-xl border border-[#eee] dark:border-neutral-700">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#f5f2ee] dark:bg-neutral-700/40">
                                <tr>
                                    {["Image", "Name", "Price", "Category", "Actions"].map((title) => (
                                        <th key={title} className="px-6 py-3 text-sm font-semibold text-[#c1a875] uppercase tracking-wide">
                                            {title}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(6)].map((_, i) => (
                                    <tr key={i} className="hover:bg-[#faf8f6] dark:hover:bg-neutral-700/60 transition animate-pulse">
                                        <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700">
                                            <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
                                        </td>
                                        <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700">
                                            <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                                        </td>
                                        <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700">
                                            <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                                        </td>
                                        <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700">
                                            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-md" />
                                        </td>
                                        <td className="px-6 py-4 border-t border-[#eee] dark:border-neutral-700">
                                            <div className="flex gap-3">
                                                <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                                <div className="w-6 h-6 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Placeholder */}
                    <div className="flex justify-center items-center mt-8 gap-2">
                        <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
                        <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
                        <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
                        <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
                    </div>

                </div>
            </div>
        </div>
    )
}

import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SideBar from "../components/SideBar";
import { fetchAdminLogsByQuery } from "../utils/api";
import { type AdminLog } from "../utils/types";
import { useApiErrorHandler, type ApiError } from "../utils/useApiErrorHandler";
import getPageNumbers from "../utils/getPageNumbers";
import { type ActionTone } from "../utils/types";

// Action details
const actionDetails: Record<string, { label: string; description: string; tone: ActionTone }> = {
    create_product: { label: "Product created", description: "New catalog item added", tone: "emerald" },
    update_product: { label: "Product updated", description: "Product details changed", tone: "amber" },
    archive_product: { label: "Product archived", description: "Product moved to archive", tone: "rose" },
    restore_product: { label: "Product restored", description: "Archived product restored", tone: "sky" },
    delete_user: { label: "User deleted", description: "Customer record removed", tone: "rose" },
    change_user_role: { label: "Role updated", description: "User permissions changed", tone: "violet" },
    update_order_status: { label: "Order status updated", description: "Order flow adjusted", tone: "cyan" },
    update_hero_section: { label: "Hero updated", description: "Homepage hero refreshed", tone: "indigo" },
    update_best_seller_section: { label: "Best seller updated", description: "Homepage spotlight changed", tone: "indigo" },
    update_contact_info_section: { label: "Contact info updated", description: "Support details refreshed", tone: "fuchsia" }
}

// Tone to class mapping
const toneToClass: Record<ActionTone, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30",
    amber: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30",
    rose: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/30",
    sky: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/30",
    violet: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-200 dark:border-violet-500/30",
    cyan: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-200 dark:border-cyan-500/30",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-200 dark:border-indigo-500/30",
    fuchsia: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-200 dark:border-fuchsia-500/30",
    slate: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-200 dark:border-slate-500/30"
}

// Relative time formatter
const relativeFormatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" })

// Get action label, description, and tone
const getActionLabel = (action: string) => actionDetails[action]?.label || action.split("_").map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(" ")
const getActionDescription = (action: string) => actionDetails[action]?.description || "Admin activity"
const getActionToneClass = (action: string) => {
    const tone = actionDetails[action]?.tone || "slate"
    return toneToClass[tone]
}

// Get link to target resource
const getTargetLink = (action: string, targetId?: string | null) => {
    if (!targetId) return null
    const productActions = new Set(["create_product", "update_product"])
    const archivedProductActions = new Set(["archive_product", "restore_product"])
    if (productActions.has(action)) {
        return { to: `/products/edit/${targetId}`, label: "View product" }
    }
    if (archivedProductActions.has(action)) {
        return { to: `/archivedProducts/edit/${targetId}`, label: "View archived product" }
    }
    if (action === "delete_user") {
        return { to: `/deletedCustomers/edit/${targetId}`, label: "View deleted customer" }
    }
    if (action === "change_user_role") {
        return { to: `/customers/edit/${targetId}`, label: "View customer" }
    }
    if (action === "update_order_status") {
        return { to: `/orders/edit/${targetId}`, label: "View order" }
    }
    return null
}

// Get relative time from now
const getRelativeTimeFromNow = (timestamp: string) => {
    const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
        { amount: 60, unit: "seconds" },
        { amount: 60, unit: "minutes" },
        { amount: 24, unit: "hours" },
        { amount: 7, unit: "days" },
        { amount: 4.34524, unit: "weeks" },
        { amount: 12, unit: "months" },
        { amount: Number.POSITIVE_INFINITY, unit: "years" }
    ]

    const now = Date.now()
    let duration = (new Date(timestamp).getTime() - now) / 1000

    for (let i = 0; i < divisions.length; i++) {
        const division = divisions[i]
        if (!division || Math.abs(duration) < division.amount) {
            const unit = division?.unit || "years"
            return relativeFormatter.format(Math.round(duration), unit)
        }
        duration /= division.amount
    }
    return ""
}

// Format date and time
const formatDateTime = (timestamp: string) => {
    try {
        return new Date(timestamp).toLocaleString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    } catch {
        return timestamp
    }
}

// Get admin summary
const getAdminSummary = (admin: AdminLog["adminId"]) => {
    if (admin && typeof admin === "object") {
        return {
            name: admin.name || "Unknown admin",
            email: admin.email || "No email",
            id: admin._id
        }
    }
    return {
        name: "Unknown admin",
        email: "",
        id: typeof admin === "string" ? admin : ""
    }
}

// Convert meta object into array of key-value pairs
const metaEntries = (meta?: Record<string, unknown>) => {
    return Object.entries(meta || {}).filter(([, value]) => value !== undefined && value !== null)
}

export default function ActivityLogs() {
    const [logs, setLogs] = useState<AdminLog[]>([])
    const [loading, setLoading] = useState(true)
    const [totalPages, setTotalPages] = useState(1) // Total number of pages for pagination
    const [totalLogs, setTotalLogs] = useState(0)
    const [searchParams, setSearchParams] = useSearchParams()
    const [selectedAction, setSelectedAction] = useState<string>("all")
    const [searchValue, setSearchValue] = useState("")
    const [metaPreview, setMetaPreview] = useState<{
        logId: string
        actionLabel: string
        meta: Record<string, unknown>
    } | null>(null)
    const { handleApiError } = useApiErrorHandler()

    // Get query params and set default values
    const currentPage = Math.max(1, +(searchParams.get("page") || 1))

    const loadLogs = async (signal?: AbortSignal) => {
        const query = { page: currentPage }

        setLoading(true)
        try {
            const data = await fetchAdminLogsByQuery(query, { signal })
            if (signal?.aborted) return // If the request was aborted, return early
            setLogs(data.items || [])
            setTotalLogs(data.total || 0)
            setTotalPages(Math.max(1, data.totalPages || 1))
        } catch (error) {
            if ((error as any)?.response?.data?.code === "page_not_found") {
                setSearchParams(prev => {
                    const params = new URLSearchParams(prev)
                    params.set("page", "1")
                    return params
                })
                return
            }
            handleApiError(error as ApiError, "fetchAdminLogsByQuery")
        } finally {
            setTimeout(() => {
                setLoading(false)
            }, 1000)
        }
    }

    // Fetch logs whenever the pagination query parameter changes
    useEffect(() => {
        const controller = new AbortController()
        loadLogs(controller.signal)
        return () => controller.abort()
    }, [searchParams])

    // Calculate unique admins
    const uniqueAdminsCount = useMemo(() => {
        const unique = new Set<string>()
        logs.forEach(log => {
            const admin = getAdminSummary(log.adminId)
            if (admin.id) unique.add(admin.id)
        })
        return unique.size
    }, [logs])

    // Calculate dominant action
    const dominantAction = useMemo(() => {
        if (logs.length === 0) return "-"
        const counts: Record<string, number> = {}
        logs.forEach(log => {
            counts[log.action] = (counts[log.action] || 0) + 1
        })
        const [topAction] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || []
        return topAction ? getActionLabel(topAction) : "-"
    }, [logs])

    // Last activity
    const lastActivity = logs[0]?.createdAt ? `${getRelativeTimeFromNow(logs[0].createdAt)} • ${formatDateTime(logs[0].createdAt)}` : "No activity yet"

    // Filter options
    const actionFilterOptions = useMemo(() => {
        const customActions = new Set<string>()
        logs.forEach(log => customActions.add(log.action))
        return ["all", ...new Set([...Object.keys(actionDetails), ...Array.from(customActions)])]
    }, [logs])

    // Filter logs
    const filteredLogs = useMemo(() => {
        const term = searchValue.toLowerCase().trim()
        return logs.filter(log => {
            const matchesAction = selectedAction === "all" || log.action === selectedAction
            if (!matchesAction) return false

            if (!term) return true

            const admin = getAdminSummary(log.adminId)
            const targetText = log.targetId || ""
            const actionLabel = getActionLabel(log.action)
            const searchable = `${admin.name} ${admin.email} ${log.action} ${actionLabel} ${targetText}`.toLowerCase()
            return searchable.includes(term)
        })
    }, [logs, selectedAction, searchValue])

    const handlePageChange = (page: number) => {
        const safePage = Math.min(Math.max(1, page), totalPages)
        setSearchParams(prev => {
            const params = new URLSearchParams(prev)
            params.set("page", String(safePage))
            return params
        })
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    const handleDownloadMeta = (logId: string, metaData: Record<string, unknown>) => {
        if (typeof window === "undefined") return
        const blob = new Blob([JSON.stringify(metaData, null, 2)], { type: "application/json" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `activity-log-${logId}-meta.json`
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
                <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">
                    {/* Sidebar */}
                    <SideBar />

                    {/* Main content */}
                    <main className="flex-1 bg-white/95 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 flex flex-col min-w-0">
                        {/* Header */}
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-[#c1a875] dark:text-[#c1a875]">
                                    Monitoring
                                </p>
                                <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100">
                                    Activity Logs
                                </h1>
                                <p className="text-sm text-[#666] dark:text-neutral-300 mt-2">
                                    Trace every admin change with searchable, paginated logs pulled straight from the server.
                                </p>
                            </div>

                            {/* Filters skeleton */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex bg-[#f5f2ee] dark:bg-neutral-700/60 rounded-xl px-4 py-2 items-center gap-2 shadow-inner">
                                    <div className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                                    <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                </div>

                                <div className="bg-[#f5f2ee] dark:bg-neutral-700/60 rounded-xl px-4 py-2 h-9 flex items-center">
                                    <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                </div>
                            </div>
                        </div>

                        {/* Stats skeleton */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="rounded-2xl border border-[#eee] dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 p-4 animate-pulse">
                                    <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full mb-3" />
                                    <div className="h-7 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full mb-2" />
                                    <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                </div>
                            ))}
                        </div>

                        {/* Logs skeleton list */}
                        <section className="flex-1 overflow-y-auto pr-1">
                            <div className="space-y-4">
                                {Array.from({ length: 2 }).map((_, idx) => (
                                    <div key={idx} className="border border-[#eee] dark:border-neutral-700 rounded-2xl p-5 bg-white/70 dark:bg-neutral-800/80 shadow-sm animate-pulse">
                                        {/* Top row: badge + time */}
                                        <div className="flex items-center justify-between mb-3 gap-4">
                                            <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                                <div className="h-3 w-28 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                            </div>
                                        </div>

                                        {/* Description line */}
                                        <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-700 rounded-full mb-4" />

                                        {/* Admin + target row */}
                                        <div className="mt-2 flex flex-wrap items-center gap-4">
                                            {/* Admin avatar + info */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                                                <div className="space-y-2">
                                                    <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                                    <div className="h-3 w-40 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                                </div>
                                            </div>

                                            {/* Target + link placeholder */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="h-7 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
                                                <div className="h-7 w-28 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
                                            </div>
                                        </div>

                                        {/* Metadata skeleton */}
                                        <div className="mt-4 space-y-2">
                                            <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                            <div className="flex flex-wrap gap-3">
                                                {Array.from({ length: 3 }).map((_, metaIdx) => (
                                                    <div key={metaIdx} className="px-3 py-2 rounded-xl bg-[#fdf9f2] dark:bg-neutral-700/60 border border-[#f0e6d6] dark:border-neutral-700">
                                                        <div className="h-2 w-14 bg-neutral-200 dark:bg-neutral-700 rounded-full mb-2" />
                                                        <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Pagination skeleton */}
                        <div className="flex justify-center items-center mt-10 gap-2 flex-wrap animate-pulse">
                            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
                        </div>
                    </main>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
                <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">

                    {/* Sidebar */}
                    <SideBar />

                    {/* Main content */}
                    <main className="flex-1 bg-white/95 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 flex flex-col min-w-0">

                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-8">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-[#c1a875] dark:text-[#c1a875]">Monitoring</p>
                                <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100">Activity Logs</h1>
                                <p className="text-sm text-[#666] dark:text-neutral-300 mt-2">
                                    Trace every admin change with searchable, paginated logs pulled straight from the server.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex bg-[#f5f2ee] dark:bg-neutral-700/60 rounded-xl px-4 py-2 items-center gap-2 shadow-inner">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-[#8f7a52]">
                                        <circle cx="8" cy="8" r="5" />
                                        <line x1="12.5" y1="12.5" x2="16" y2="16" />
                                    </svg>
                                    <input value={searchValue} onChange={e => setSearchValue(e.target.value)} className="bg-transparent outline-none text-sm text-[#2a2a2a] dark:text-neutral-100 placeholder:text-[#9d8f76] dark:placeholder:text-neutral-400 w-full" placeholder="Search by admin, action or target" />
                                </div>

                                <select value={selectedAction} onChange={e => setSelectedAction(e.target.value)} className="bg-[#f5f2ee] dark:bg-neutral-700/60 rounded-xl px-4 py-2 text-sm text-[#2a2a2a] dark:text-neutral-100 border border-transparent focus:border-[#c1a875] outline-none cursor-pointer">
                                    {actionFilterOptions.map(option => (
                                        <option key={option} value={option}>
                                            {option === "all" ? "All actions" : getActionLabel(option)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                            <div className="rounded-2xl border border-[#eee] dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 p-4">
                                <p className="text-sm text-[#8a7b5d] uppercase tracking-wide">Total events</p>
                                <p className="text-3xl font-semibold text-[#181818] dark:text-neutral-100">{totalLogs.toLocaleString()}</p>
                                <p className="text-xs text-[#8a8a8a] dark:text-neutral-400 mt-1">Showing {(logs || []).length} on this page</p>
                            </div>
                            <div className="rounded-2xl border border-[#eee] dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 p-4">
                                <p className="text-sm text-[#8a7b5d] uppercase tracking-wide">Active admins</p>
                                <p className="text-3xl font-semibold text-[#181818] dark:text-neutral-100">{uniqueAdminsCount}</p>
                                <p className="text-xs text-[#8a8a8a] dark:text-neutral-400 mt-1">Unique contributors on this page</p>
                            </div>
                            <div className="rounded-2xl border border-[#eee] dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 p-4">
                                <p className="text-sm text-[#8a7b5d] uppercase tracking-wide">Top action</p>
                                <p className="text-3xl font-semibold text-[#181818] dark:text-neutral-100">{dominantAction}</p>
                                <p className="text-xs text-[#8a8a8a] dark:text-neutral-400 mt-1">Most frequent on this page</p>
                            </div>
                            <div className="rounded-2xl border border-[#eee] dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 p-4">
                                <p className="text-sm text-[#8a7b5d] uppercase tracking-wide">Last activity</p>
                                <p className="text-base font-semibold text-[#181818] dark:text-neutral-100">{lastActivity}</p>
                                <p className="text-xs text-[#8a8a8a] dark:text-neutral-400 mt-1">Updated live from the server</p>
                            </div>
                        </div>

                        {/* Logs */}
                        <section className="flex-1 overflow-y-auto pr-1">
                            {filteredLogs.length === 0
                                ? <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-[#d2c3a1] dark:border-neutral-700 bg-white/60 dark:bg-neutral-800/70">
                                    <svg width="46" height="46" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#c1a875] mb-4">
                                        <path d="M21 2H7a5 5 0 00-5 5v26a5 5 0 005 5h20a5 5 0 005-5V13L21 2z" />
                                        <path d="M21 2v11h11" />
                                        <path d="M16 22h10" />
                                        <path d="M16 28h10" />
                                        <path d="M10 16h1v10" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-[#181818] dark:text-neutral-100 mb-2">No logs to display</h3>
                                    <p className="text-sm text-[#666] dark:text-neutral-400 max-w-md">
                                        Try adjusting the filters or head back to another page to trigger new admin actions.
                                    </p>
                                </div>
                                : <ul className="space-y-4">
                                    {filteredLogs.map(log => {
                                        const admin = getAdminSummary(log.adminId)
                                        const badgeClass = getActionToneClass(log.action)
                                        const metaObject = log.meta as Record<string, unknown> | undefined
                                        const meta = metaEntries(metaObject)
                                        const relative = getRelativeTimeFromNow(log.createdAt)
                                        const targetLink = getTargetLink(log.action, log.targetId)

                                        return (
                                            <li key={log._id} className="border border-[#eee] dark:border-neutral-700 rounded-2xl p-5 bg-white/70 dark:bg-neutral-800/80 shadow-sm hover:shadow-md transition">
                                                <div className="flex flex-wrap items-center gap-4 justify-between">
                                                    <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide rounded-full border ${badgeClass}`}>
                                                        {getActionLabel(log.action)}
                                                    </span>
                                                    <div className="text-sm text-[#666] dark:text-neutral-300 flex items-center gap-2">
                                                        <span className="font-semibold">{relative}</span>
                                                        <span className="hidden sm:inline-block text-[#c1a875]">•</span>
                                                        <span className="text-xs sm:text-sm">{formatDateTime(log.createdAt)}</span>
                                                    </div>
                                                </div>

                                                <p className="text-base text-[#444] dark:text-neutral-200 mt-3">{getActionDescription(log.action)}</p>

                                                <div className="mt-4 flex flex-wrap items-center gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-[#f0e8dd] dark:bg-neutral-700 flex items-center justify-center text-lg font-semibold text-[#8f7a52] uppercase">
                                                            {admin.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-[#181818] dark:text-neutral-100">{admin.name}</p>
                                                            <p className="text-xs text-[#666] dark:text-neutral-400">{admin.email}</p>
                                                        </div>
                                                    </div>

                                                    {log.targetId &&
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <div className="px-3 py-1 rounded-lg bg-[#f5f2ee] dark:bg-neutral-700/60 text-xs uppercase tracking-wide text-[#7a6b4c] dark:text-neutral-200">
                                                                Target #{log.targetId}
                                                            </div>
                                                            {targetLink?.to &&
                                                                <Link to={targetLink.to} className="px-3 py-1.5 rounded-lg bg-[#c1a875] text-white text-xs font-semibold tracking-wide hover:bg-[#b1925c] transition">
                                                                    {targetLink.label}
                                                                </Link>
                                                            }
                                                        </div>
                                                    }
                                                </div>

                                                {meta.length > 0 &&
                                                    <div className="mt-4">
                                                        <p className="text-xs uppercase tracking-wide text-[#8a7b5d] mb-2">Metadata</p>
                                                        <div className="flex flex-wrap gap-3">
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                <button type="button" onClick={() => metaObject && setMetaPreview({ logId: log._id, actionLabel: getActionLabel(log.action), meta: metaObject })} className="px-3 py-1.5 rounded-lg bg-[#f5f2ee] dark:bg-neutral-700/60 text-xs font-semibold tracking-wide text-[#7a6b4c] dark:text-neutral-100 cursor-pointer hover:bg-[#f0e8dd] dark:hover:bg-neutral-700">
                                                                    View JSON
                                                                </button>
                                                                <button type="button" onClick={() => metaObject && handleDownloadMeta(log._id, metaObject)} className="px-3 py-1.5 rounded-lg bg-[#c1a875] text-white text-xs font-semibold tracking-wide hover:bg-[#b1925c] cursor-pointer">
                                                                    Download JSON
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            </li>
                                        )
                                    })}
                                </ul>
                            }
                        </section>

                        {!loading && totalPages > 1 &&
                            <div className="flex justify-center items-center mt-10 gap-2 flex-wrap">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-2 rounded-lg bg-[#eee] dark:bg-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                </button>

                                {getPageNumbers(totalPages, currentPage).map((page, i) =>
                                    page === "..."
                                        ? <span key={`dots-${i}`} className="px-3 text-[#999] dark:text-neutral-400">...</span>
                                        :
                                        <button key={`page-${page}`} onClick={() => handlePageChange(page as number)} className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer ${currentPage === page
                                            ? "bg-[#c1a875] text-white"
                                            : "bg-[#eee] dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-200 hover:bg-[#c1a875]/30"
                                            }`}>
                                            {page}
                                        </button>
                                )}

                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-2 rounded-lg bg-[#eee] dark:bg-neutral-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed">
                                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        }
                    </main>
                </div>
            </div>
            {metaPreview &&
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8" role="dialog" aria-modal="true" onClick={() => setMetaPreview(null)}>
                    <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden" onClick={event => event.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#eee] dark:border-neutral-800">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-[#c1a875]">Metadata</p>
                                <h3 className="text-lg font-semibold text-[#181818] dark:text-neutral-50 mt-1">{metaPreview.actionLabel}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button type="button" className="px-3 py-1.5 rounded-lg bg-[#c1a875] text-white text-xs font-semibold tracking-wide hover:bg-[#b1925c] cursor-pointer" onClick={() => handleDownloadMeta(metaPreview.logId, metaPreview.meta)}>
                                    Download JSON
                                </button>
                                <button type="button" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer" onClick={() => setMetaPreview(null)} aria-label="Close metadata preview">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-4">
                            <pre className="bg-[#fdf9f2] dark:bg-neutral-800 rounded-2xl p-4 text-sm text-[#2c2c2c] dark:text-neutral-100 max-h-[60vh] overflow-auto">
                                {JSON.stringify(metaPreview.meta, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

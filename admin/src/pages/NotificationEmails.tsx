import { useEffect, useState, type ChangeEvent } from "react";
import SideBar from "../components/SideBar";
import { getNotificationEmails, updateNotificationEmails } from "../api/apiClient";
import Loading from "../components/Loading";
import { useApiErrorHandler, type ApiError } from "../hooks/useApiErrorHandler";
import { useNotyf } from "../hooks/useNotyf";

export default function NotificationEmails() {
    const notyf = useNotyf()
    const [emails, setEmails] = useState<string[]>([])
    const [newEmail, setNewEmail] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { handleApiError } = useApiErrorHandler()

    // fetch emails
    const loadEmails = async () => {
        setLoading(true)
        try {
            const data = await getNotificationEmails()
            setEmails(Array.isArray(data) ? data : [])
        } catch (error) {
            handleApiError(error as ApiError, "getNotificationEmails")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { // fetch emails on mount
        loadEmails()
    }, [])

    const handleNewEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewEmail(e.target.value)
    }

    const persistEmails = async (nextEmails: string[]) => {
        setSaving(true)
        try {
            const updated = await updateNotificationEmails(nextEmails)
            setEmails(Array.isArray(updated) ? updated : nextEmails)
            notyf?.success("Notification emails updated")
        } catch (error) {
            handleApiError(error as ApiError, "updateNotificationEmails")
        } finally {
            setSaving(false)
        }
    }

    const handleAdd = async () => {
        const trimmed = newEmail.trim().toLowerCase()

        // Check if email is provided
        if (!trimmed) {
            notyf?.error("Email is required")
            return
        }

        // Check if email is valid
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            notyf?.error("Invalid email address")
            return
        }

        // Check if email already exists
        if (emails.some(email => email.toLowerCase() === trimmed)) {
            notyf?.error("Email already exists")
            return
        }

        const nextEmails = [...emails, trimmed]
        setNewEmail("")
        await persistEmails(nextEmails)
    }

    const handleRemove = async (emailToRemove: string) => {
        setSaving(true)
        try {
            const nextEmails = emails.filter(email => email !== emailToRemove)
            await persistEmails(nextEmails)
        } catch (error) {
            handleApiError(error as ApiError, "handleRemove")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
                <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">
                    <SideBar />
                    <main className="flex-1 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-8 flex items-center justify-center">
                        <Loading />
                    </main>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
            <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">
                <SideBar />

                <main className="flex-1 bg-white dark:bg-neutral-800 rounded-2xl shadow-sm p-8 flex flex-col gap-8">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">Settings</p>
                            <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100">Notification Emails</h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Add a few trusted addresses to receive system alerts.</p>
                        </div>

                        <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-3 shadow-sm">
                            <input value={newEmail} onChange={handleNewEmailChange} type="email" placeholder="name@example.com" className="bg-transparent border-0 outline-none text-sm text-[#181818] dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 w-56" />
                            <button onClick={handleAdd} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                            <div>
                                <p className="text-sm font-semibold text-[#181818] dark:text-neutral-100">Recipients</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">A short list only. Keep it clean and current.</p>
                            </div>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">Total: {emails.length}</span>
                        </div>

                        {emails.length === 0
                            ? <div className="flex items-center justify-center px-6 py-12 text-neutral-500 dark:text-neutral-400 text-sm">
                                No notification emails yet. Add one above.
                            </div>
                            : <table className="min-w-full">
                                <thead className="bg-white dark:bg-neutral-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">#</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">Email</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {emails.map((email, index) =>
                                        <tr key={email} className="border-t border-neutral-200 dark:border-neutral-700">
                                            <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">{index + 1}</td>
                                            <td className="px-6 py-4 text-sm text-[#181818] dark:text-neutral-100">{email}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleRemove(email)} disabled={saving} className="px-3 py-1.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-100 hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-400 dark:hover:text-rose-300 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        }
                    </div>
                </main>
            </div>
        </div>
    )
}

"use client"
import { useEffect, useState, type ChangeEvent } from "react";
import SideBar from "../components/SideBar";
import { fetchHeroSection, updateHeroSection } from "../services/apiClient";
import { log } from "../lib/logger";
import Loading from "../components/Loading";
import { useApiErrorHandler, type ApiError } from "../hooks/useApiErrorHandler";
import { type HeroSection } from "../types/types";
import { useNotyf } from "../hooks/useNotyf";

export default function HeroSection() {
    const notyf = useNotyf()
    const [heroSection, setHeroSection] = useState<HeroSection | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEnabled, setIsEnabled] = useState(false)
    const [discardHeroSection, setDiscardHeroSection] = useState<HeroSection | null>(null)
    const { handleApiError } = useApiErrorHandler()

    // get hero section data from server
    const getHeroSection = async () => {
        setLoading(true)
        try {
            const data = await fetchHeroSection()
            log("Get hero section response:", data)
            setHeroSection(data)
            setDiscardHeroSection(data)
        } catch (error) {
            handleApiError(error as ApiError, "getHeroSection")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getHeroSection()
    }, [])

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setHeroSection((prev: any) => ({ ...(prev ?? {}), [id]: value }))
        setIsEnabled(true)
    }

    const handleSaveBtn = async () => {
        if (!heroSection) return // if heroSection is null

        // check if all fields are filled
        if (!heroSection.title || !heroSection.subtitle || !heroSection.description || !heroSection.buttonText || !heroSection.buttonLink || !heroSection.imageUrl || !heroSection.imageAlt) {
            notyf?.error("All fields are required!")
            return
        }

        // check if there are any changes
        if (heroSection.title === discardHeroSection?.title &&
            heroSection.subtitle === discardHeroSection?.subtitle &&
            heroSection.description === discardHeroSection?.description &&
            heroSection.buttonText === discardHeroSection?.buttonText &&
            heroSection.buttonLink === discardHeroSection?.buttonLink &&
            heroSection.imageUrl === discardHeroSection?.imageUrl &&
            heroSection.imageAlt === discardHeroSection?.imageAlt) {
            notyf?.error("No changes to save!")
            return
        }

        const newHeroSection = { // create a new object with the changes
            title: heroSection.title,
            subtitle: heroSection.subtitle,
            description: heroSection.description,
            buttonText: heroSection.buttonText,
            buttonLink: heroSection.buttonLink,
            imageUrl: heroSection.imageUrl,
            imageAlt: heroSection.imageAlt,
        }

        setLoading(true)
        try {
            await updateHeroSection(newHeroSection)
            log("Hero section data:", newHeroSection)
            setDiscardHeroSection(newHeroSection)
            notyf?.success("Changes saved successfully!")
            setIsEnabled(false)
        } catch (error) {
            handleApiError(error as ApiError, "handleSaveBtn")
        } finally {
            setLoading(false)
        }
    }

    // discard changes - clear the fields
    const handleDiscardBtn = () => {
        setHeroSection(discardHeroSection)
        notyf?.success("Changes discarded successfully!")
        setIsEnabled(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
                {/* Sidebar + Main */}
                <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">

                    {/* Sidebar */}
                    <SideBar />

                    {/* Main Content */}
                    <div className="flex-1 bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-10">

                        <Loading />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">

            {/* Sidebar + Main */}
            <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">

                {/* Sidebar */}
                <SideBar />

                {/* Main */}
                <div className="flex-1 flex flex-col gap-8">
                    {/* Header */}
                    <div className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100 tracking-tight">Hero Section</h1>
                            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Edit homepage hero copy, image and button</p>
                        </div>

                        {/* Discard btn */}
                        <div className="flex gap-3">
                            <button onClick={handleDiscardBtn} disabled={!isEnabled} className={`px-4 py-2 rounded-xl border border-gray-300 dark:border-neutral-700 transition shadow-sm 
                            ${!isEnabled
                                    ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-400 dark:border-neutral-700"
                                    : "bg-white dark:bg-neutral-700 text-[#181818] dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-600 cursor-pointer"}`}>
                                Discard
                            </button>

                            {/* Save btn */}
                            <button onClick={handleSaveBtn} disabled={!isEnabled} className={`px-6 py-2 rounded-2xl font-semibold transition shadow-md
                                ${!isEnabled
                                    ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-400 dark:border-neutral-700"
                                    : " bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] cursor-pointer"}`}>
                                Save Changes
                            </button>
                        </div>
                    </div>

                    {/* Editor + Preview */}
                    <div className="grid grid-cols-1 gap-8">
                        {/* Editor Card */}
                        <div className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-8 flex flex-col gap-7">
                            <h2 className="text-xl font-semibold text-[#c1a875]">Content</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Title */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="title" className="text-sm font-semibold text-[#232323] dark:text-neutral-200">Title (line 1)</label>
                                    <input onChange={handleChange} value={heroSection?.title} id="title" type="text" placeholder="Discover" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#181818] dark:text-neutral-100 focus:ring-2 focus:ring-[#c1a875] focus:outline-none" />
                                </div>

                                {/* Subtitle */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="subtitle" className="text-sm font-semibold text-[#232323] dark:text-neutral-200">Subtitle (line 2)</label>
                                    <input onChange={handleChange} value={heroSection?.subtitle} id="subtitle" type="text" placeholder="Timeless Fashion" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#181818] dark:text-neutral-100 focus:ring-2 focus:ring-[#c1a875] focus:outline-none" />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <label htmlFor="description" className="text-sm font-semibold text-[#232323] dark:text-neutral-200">Description</label>
                                    <textarea onChange={handleChange} value={heroSection?.description} rows={3} id="description" placeholder="Short paragraph..." className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#181818] dark:text-neutral-100 focus:ring-2 focus:ring-[#c1a875] focus:outline-none" />
                                </div>

                                {/* Button Text */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="buttonText" className="text-sm font-semibold text-[#232323] dark:text-neutral-200">Button Text</label>
                                    <input onChange={handleChange} value={heroSection?.buttonText} id="buttonText" type="text" placeholder="Shop Now" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#181818] dark:text-neutral-100 focus:ring-2 focus:ring-[#c1a875] focus:outline-none" />
                                </div>

                                {/* Button Link (route/id) */}
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="buttonLink" className="text-sm font-semibold text-[#232323] dark:text-neutral-200">Button Link</label>
                                    <input onChange={handleChange} value={heroSection?.buttonLink} id="buttonLink" type="text" placeholder="/collection or product id" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#181818] dark:text-neutral-100 focus:ring-2 focus:ring-[#c1a875] focus:outline-none" />
                                </div>

                                {/* Image URL */}
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <label htmlFor="imageUrl" className="text-sm font-semibold text-[#232323] dark:text-neutral-200">Image URL</label>
                                        <input onChange={handleChange} value={heroSection?.imageUrl} id="imageUrl" type="url" placeholder="https://..." className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#181818] dark:text-neutral-100 focus:ring-2 focus:ring-[#c1a875] focus:outline-none" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label htmlFor="imageAlt" className="text-sm font-semibold text-[#232323] dark:text-neutral-200">Alt Text</label>
                                        <input onChange={handleChange} value={heroSection?.imageAlt} id="imageAlt" type="text" placeholder="Fashion model" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#181818] dark:text-neutral-100 focus:ring-2 focus:ring-[#c1a875] focus:outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Live Preview */}
                        <div className="bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-6">
                            <h2 className="text-xl font-semibold text-[#c1a875] mb-4">Live Preview</h2>

                            <section className="bg-[#faf8f6] dark:bg-neutral-900 w-full flex flex-col lg:flex-row items-center justify-between min-h-[520px] px-6 lg:px-12 py-10 relative overflow-hidden rounded-xl border border-[#eee] dark:border-neutral-700">
                                {/* Text */}
                                <div className="flex-1 flex flex-col justify-center items-start z-10">
                                    <h1 className="text-5xl md:text-6xl font-prata font-bold leading-tight text-[#1a1a1a] dark:text-[#f5f5f5] mb-6">
                                        {heroSection?.title}<br />
                                        <span className="text-[#c1a875]">{heroSection?.subtitle}</span>
                                    </h1>
                                    <p className="text-lg md:text-xl text-[#444] dark:text-gray-400 font-montserrat mb-8 max-w-lg">
                                        {heroSection?.description}
                                    </p>
                                    <button className="px-10 py-4 bg-white dark:bg-[#1a1a1a] border border-[#1a1a1a] dark:border-[#f5f5f5] hover:bg-[#1a1a1a] dark:hover:bg-[#faf8f6] hover:text-white dark:hover:text-[#1a1a1a] transition rounded-2xl shadow-md font-semibold font-montserrat text-lg text-[#1a1a1a] dark:text-[#f5f5f5]">
                                        {heroSection?.buttonText}
                                    </button>
                                </div>

                                {/* Image */}
                                <div className="hidden lg:flex flex-1 items-center justify-center mt-10 lg:mt-0 relative z-10">
                                    <img src={heroSection?.imageUrl} alt={heroSection?.imageAlt} className="w-[320px] h-[440px] object-cover rounded-2xl shadow-xl border border-[#eee] dark:border-[#333] transition" />
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

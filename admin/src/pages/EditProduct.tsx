import { useEffect, useState, type ChangeEvent } from "react";
import SideBar from "../components/SideBar";
import { errorLog, log } from "../utils/log";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { updateProductById, getProductById } from "../utils/api";
import { useApiErrorHandler } from "../utils/useApiErrorHandler";
import { useNavigate, useParams } from "react-router-dom";

type Category = "men" | "women" | "kids";
type SizeOptions = Record<Exclude<Category, "">, string[]>

const sizeOptions: SizeOptions = {
    men: ["XS", "S", "M", "L", "XL", "XXL"],
    women: ["XS", "S", "M", "L", "XL"],
    kids: ["4", "6", "8", "10"],
}
export default function EditProduct() {
    const nav = useNavigate()
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const [category, setCategory] = useState<Category | "">("")
    const [selectedSizes, setSelectedSizes] = useState<string[]>([])
    const [type, setType] = useState("")
    const [name, setName] = useState("")
    const [price, setPrice] = useState("")
    const [image, setImage] = useState("")
    const [description, setDescription] = useState("")
    const { handleApiError } = useApiErrorHandler()
    const { id } = useParams()

    useEffect(() => {
        const fetchProductById = async () => {
            if (!id) return

            try {
                const data = await getProductById(id)
                log(data)

                setName(data.title)
                setPrice(data.price.toString())
                setCategory(data.category as Category)
                setSelectedSizes(data.sizes)
                setImage(data.image)
                setType(data.type)
                setDescription(data.description)
            } catch (error) {
                errorLog("Error in fetchProductById", error)
                notyf.error("Something went wrong. Please try again later.")
            }
        }

        fetchProductById()
    }, [])

    const toggleSize = (size: string): void => {
        setSelectedSizes((prev) =>
            prev.includes(size)
                ? prev.filter((s) => s !== size)
                : [...prev, size]
        )
    }

    const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>): void => {
        const selected = e.target.value as Category
        setCategory(selected)
        setSelectedSizes([])
    }

    const handleClick = async () => {
        const updateProduct: Record<string, any> = { id }

        if (name) updateProduct.title = name
        if (category) updateProduct.category = category
        if (price) updateProduct.price = +price
        if (selectedSizes.length > 0) updateProduct.sizes = selectedSizes
        if (image) updateProduct.image = image
        if (description) updateProduct.description = description
        if (selectedSizes.length) updateProduct.sizes = selectedSizes
        if (type) updateProduct.type = type

        log("New product:", updateProduct)

        try {
            await updateProductById(updateProduct) // API call to add product

            log("Adding product:", updateProduct)
            notyf.success("Product added successfully!")

            nav("/products")
        } catch (error) {
            handleApiError(error, "handleRegister")
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">

            <div className="flex flex-1 w-full mx-auto gap-12 pt-8 pb-20 px-4">
                {/* Sidebar */}
                <SideBar />

                {/* Title */}
                <div className="flex-1 bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100 mb-6 tracking-tight">
                        Edit Product
                    </h1>

                    {/* Main Content */}
                    <div className="space-y-6">

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                            <input value={name} onChange={e => setName(e.target.value)} id="name" type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#c1a875] focus:border-[#c1a875] dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" />
                        </div>

                        {/* Price */}
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                            <input value={price} onChange={e => setPrice(e.target.value)} id="price" type="number" step="0.01" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#c1a875] focus:border-[#c1a875] dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" />
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                            <select id="category" value={category} onChange={handleCategoryChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#c1a875] focus:border-[#c1a875] dark:bg-neutral-700 dark:border-neutral-600 dark:text-white cursor-pointer">
                                <option value="" disabled>Select Category</option>
                                <option value="men">Men</option>
                                <option value="women">Women</option>
                                <option value="kids">Kids</option>
                            </select>
                        </div>

                        {/* Sizes */}
                        {category && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Available Sizes
                                </label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {sizeOptions[category].map((size) => (
                                        <button key={size} type="button" onClick={() => toggleSize(size)} disabled={selectedSizes.includes("outOfStock")} className={`px-4 py-2 border rounded-md text-sm transition cursor-pointer ${selectedSizes.includes(size)
                                            ? "bg-[#c1a875] text-white border-[#c1a875]"
                                            : "border-gray-300 text-gray-700 hover:bg-[#c1a875]/10 dark:text-gray-300 dark:border-neutral-600"} ${selectedSizes.includes("outOfStock") && "opacity-50 cursor-not-allowed"}`}>
                                            {size}
                                        </button>
                                    ))}

                                    <div className="w-px h-6 bg-gray-300 dark:bg-neutral-600 mx-2"></div>

                                    {/* Out of stock Btn */}
                                    <button onClick={() => setSelectedSizes(prev => prev.includes("outOfStock") ? [] : ["outOfStock"])} className={`px-4 py-2 border rounded-md text-sm transition cursor-pointer font-semibold ${selectedSizes.includes("outOfStock")
                                        ? "bg-red-500 text-white border-red-500"
                                        : "border-gray-300 text-gray-700 hover:bg-red-500/10 hover:text-red-600 dark:text-gray-300 dark:border-neutral-600"
                                        }`}>
                                        Out of Stock
                                    </button>
                                </div>

                                {/* Text */}
                                {selectedSizes.includes("outOfStock") && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        Product is currently marked as out of stock. Click "Out of Stock" again to re-enable size selection.
                                    </p>
                                )}

                            </div>
                        )}

                        {/* Image */}
                        <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
                            <input value={image} onChange={e => setImage(e.target.value)} id="image" type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#c1a875] focus:border-[#c1a875] dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" />
                        </div>

                        {/* Type */}
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                            <select id="type" value={type} onChange={e => setType(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#c1a875] focus:border-[#c1a875] dark:bg-neutral-700 dark:border-neutral-600 dark:text-white cursor-pointer">
                                <option value="" disabled>Select Type</option>
                                <option value="t-shirt">T-Shirt</option>
                                <option value="shirt">Shirt</option>
                                <option value="hoodie">Hoodie</option>
                                <option value="dress">Dress</option>
                                <option value="pants">Pants</option>
                                <option value="shorts">Shorts</option>
                                <option value="skirt">Skirt</option>
                                <option value="jacket">Jacket</option>
                                <option value="leggings">Leggings</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <textarea value={description} id="description" onChange={e => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#c1a875] focus:border-[#c1a875] dark:bg-neutral-700 dark:border-neutral-600 dark:text-white" rows={4}></textarea>
                        </div>

                        {/* Button */}
                        <div>
                            <button onClick={handleClick} className="px-6 py-2 rounded-xl font-semibold bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer">
                                Update Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

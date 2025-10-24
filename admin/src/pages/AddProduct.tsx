import { useState, type ChangeEvent } from "react";
import SideBar from "../components/SideBar";
import { log } from "../utils/log";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { addProduct } from "../utils/api";
import { useApiErrorHandler } from "../utils/useApiErrorHandler";

type Category = "Men" | "Women" | "Kids";
type SizeOptions = Record<Exclude<Category, "">, string[]>

const sizeOptions: SizeOptions = {
  Men: ["XS", "S", "M", "L", "XL", "XXL"],
  Women: ["XS", "S", "M", "L", "XL"],
  Kids: ["4", "6", "8", "10"],
}

export default function AddProduct() {
  const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
  const [category, setCategory] = useState<Category | "">("")
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [type, setType] = useState("")
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [image, setImage] = useState("")
  const [description, setDescription] = useState("")
  const { handleApiError } = useApiErrorHandler()

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
    const newProduct = {
      title: name,
      category,
      price: +price,
      image,
      description,
      sizes: selectedSizes,
      type
    }

    log("New product:", newProduct)

    try {
      await addProduct(newProduct) // API call to add product

      // Reset form fields
      setName("")
      setPrice("")
      setCategory("")
      setSelectedSizes([])
      setImage("")
      setType("")
      setDescription("")

      log("Adding product:", newProduct)
      notyf.success("Product added successfully!")
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
            Add New Product
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
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Kids">Kids</option>
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
                    <button key={size} type="button" onClick={() => toggleSize(size)} className={`px-4 py-2 border rounded-md text-sm transition cursor-pointer ${selectedSizes.includes(size)
                      ? "bg-[#c1a875] text-white border-[#c1a875]"
                      : "border-gray-300 text-gray-700 hover:bg-[#c1a875]/10 dark:text-gray-300 dark:border-neutral-600"}`}>
                      {size}
                    </button>
                  ))}
                </div>
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
                Add Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

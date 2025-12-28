import { useState, type ChangeEvent, useEffect, useRef } from "react";
import { type Category, type ProductFormData, type ProductSizeFormValue, sizeOptions } from "../types/types";
import axios from "axios";
import { errorLog } from "../lib/logger";

const uploadImageToCloudinary = async (file: File) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error("Missing Cloudinary configuration. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.")
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", uploadPreset)

  const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" }
    }
  )

  return res.data.secure_url
}

const normalizeSizes = (sizes: (ProductSizeFormValue | { code: string; stock: number })[] | undefined): ProductSizeFormValue[] => {
  if (!sizes) return []
  return sizes.map(({ code, stock }) => ({
    code,
    stock: typeof stock === "number" ? stock.toString() : stock || ""
  }))
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  onSubmit: (productData: ProductFormData) => Promise<void>
  isEditing: boolean
  isArchived?: boolean
}

export default function ProductForm({ initialData, onSubmit, isEditing, isArchived }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    title: initialData?.title ?? "",
    category: initialData?.category ?? "",
    price: initialData?.price ?? "",
    image: initialData?.image ?? "",
    description: initialData?.description ?? "",
    type: initialData?.type ?? "",
    discountPercent: initialData?.discountPercent ?? "",
    onSale: initialData?.onSale ?? false,
    sizes: normalizeSizes(initialData?.sizes ?? []),
  })

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        sizes: normalizeSizes(initialData.sizes ?? prev.sizes)
      }))
    }
  }, [initialData])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target

    if (id === "discountPercent") {
      const numeric = Math.min(100, Math.max(0, Number(value)))
      setFormData(prev => ({ ...prev, discountPercent: Number.isNaN(numeric) ? "" : numeric.toString() }))
      return
    }

    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as Category
    const allowedSizes = selected ? sizeOptions[selected] : []
    setFormData((prev) => ({
      ...prev,
      category: selected,
      sizes: prev.sizes.filter(size => allowedSizes.includes(size.code)),
    }))
  }

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.some((s) => s.code === size)
        ? prev.sizes.filter((s) => s.code !== size)
        : [...prev.sizes, { code: size, stock: "" }],
    }))
  }

  const handleSizeStockChange = (sizeCode: string, rawValue: string) => {
    if (rawValue === "") {
      setFormData(prev => ({
        ...prev,
        sizes: prev.sizes.map(size => size.code === sizeCode ? { ...size, stock: "" } : size)
      }))
      return
    }

    const numeric = Math.max(0, Math.floor(Number(rawValue)))
    if (Number.isNaN(numeric)) return

    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map(size => size.code === sizeCode ? { ...size, stock: numeric.toString() } : size)
    }))
  }

  const handleSubmit = async () => {
    const allowedSizes = formData.category ? sizeOptions[formData.category] : []
    const sanitizedSizes = formData.sizes.filter(size => allowedSizes.includes(size.code))

    await onSubmit({ ...formData, sizes: sanitizedSizes })
    if (!isEditing) { // Reset form only for "Add Product"
      setFormData({
        title: "", category: "", price: "", image: "",
        description: "", sizes: [], type: "", discountPercent: "", onSale: false
      })
    }
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || isArchived) return
    const file = files[0]

    try {
      setIsUploadingImage(true)
      const url = await uploadImageToCloudinary(file)

      setFormData(prev => ({
        ...prev,
        image: url
      }))
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        errorLog("Cloudinary error response:", error.response?.data)
      }
      errorLog("Failed to upload image to Cloudinary", error)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const { title, category, price, image, description, sizes, type, discountPercent, onSale } = formData
  const availableSizes = category ? sizeOptions[category] : []

  return (
    <div className="flex-1 bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-10">
      <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100 mb-6 tracking-tight">
        {isArchived ? "Archived Product Details" : isEditing ? "Edit Product" : "Add Product"}
      </h1>

      {/* Grid Layout */}
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-[#c1a875] mb-1">Product Name</label>
          <input value={title} onChange={handleChange} id="title" type="text" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm disabled:cursor-not-allowed" disabled={isArchived} />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-[#c1a875] mb-1">Price</label>
          <input value={price} onChange={handleChange} id="price" type="number" step="0.01" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm disabled:cursor-not-allowed" disabled={isArchived} />
        </div>

        {/* On Sale */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <input id="onSale" type="checkbox" className="disabled:cursor-not-allowed" checked={onSale} onChange={(e) => setFormData((prev) => ({ ...prev, onSale: e.target.checked, discountPercent: e.target.checked ? prev.discountPercent : "" }))} disabled={isArchived} />
            <label htmlFor="onSale" className="text-sm font-semibold text-[#c1a875]">On Sale</label>
          </div>
          {onSale &&
            <div>
              <label htmlFor="discountPercent" className="block text-sm font-semibold text-[#c1a875] mb-1">Sale Percentage</label>
              <input value={discountPercent} onChange={handleChange} id="discountPercent" type="number" step="0.1" min="0" max="100" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm disabled:cursor-not-allowed" disabled={isArchived} />
            </div>
          }
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-[#c1a875] mb-1">Category</label>
          <select id="category" value={category} onChange={handleCategoryChange} className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-pointer disabled:cursor-not-allowed" disabled={isArchived}>
            <option value="" disabled>Select Category</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </select>
        </div>

        {/* Sizes */}
        {category &&
          <div>
            <label className="block text-sm font-semibold text-[#c1a875] mb-1">
              Available Sizes
            </label>
            <div className="mt-2 flex flex-col gap-3">
              {availableSizes.map((sizeCode) => {
                const selectedSize = sizes.find((size) => size.code === sizeCode)
                const isSelected = Boolean(selectedSize)
                return (
                  <div key={sizeCode} className="flex flex-col gap-2 rounded-xl border border-gray-200 dark:border-neutral-700 p-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSize(sizeCode)}
                        disabled={isArchived}
                        className={`px-4 py-2 border rounded-md text-sm font-semibold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 ${isSelected
                          ? "bg-[#c1a875] text-white border-[#c1a875]"
                          : "border-gray-300 text-gray-700 hover:bg-[#c1a875]/10 dark:text-gray-300 dark:border-neutral-600"}`}>
                        {sizeCode}
                      </button>
                      <span className="text-xs uppercase tracking-wide text-[#c1a875]">Toggle availability</span>
                    </div>
                    {isSelected && (
                      <div>
                        <label htmlFor={`stock-${sizeCode}`} className="block text-xs font-semibold text-[#c1a875] mb-1">Stock for {sizeCode}</label>
                        <input id={`stock-${sizeCode}`} type="number" min="0" step="1" value={selectedSize?.stock} onChange={(e) => handleSizeStockChange(sizeCode, e.target.value)} className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm disabled:cursor-not-allowed"
                          disabled={isArchived} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        }

        {/* Image Upload */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-[#c1a875] mb-1">
            Product Image
          </label>
          <div className={`w-full rounded-2xl border-2 border-dashed px-4 py-6 flex flex-col items-center justify-center text-center cursor-pointer transition
            ${isArchived ? "cursor-not-allowed opacity-60" : "hover:border-[#c1a875] hover:bg-[#c1a875]/5"}
            border-gray-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800`}
            onClick={() => {
              if (isArchived) return // Don't allow clicking if the product is archived
              fileInputRef.current?.click() // Click the hidden file input when the div is clicked
            }}
            onDragOver={(e) => { // Prevent default behavior to allow dropping files
              e.preventDefault()
              e.stopPropagation()
            }}
            onDrop={(e) => { // Handle dropped files
              e.preventDefault()
              e.stopPropagation()
              if (isArchived) return // Don't allow dropping if the product is archived
              void handleImageUpload(e.dataTransfer.files) // Upload the dropped files
            }}>
            {image
              ? <div className="flex flex-col items-center gap-3">
                <img src={image} alt="Product preview" className="max-h-40 rounded-xl object-contain shadow-sm" />
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Click or drop a new image to replace
                </span>
              </div>
              : <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  Drag &amp; drop an image here
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  or click to choose from your computer
                </span>
              </div>
            }
            {isUploadingImage &&
              <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                Uploading image...
              </div>
            }
          </div>

          {/* Hidden file input */}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" disabled={isArchived} onChange={(e) => void handleImageUpload(e.target.files)} />

          {/* Image URL input */}
          <div>
            <label htmlFor="image" className="block text-xs font-semibold text-[#c1a875] mb-1">
              Image URL (optional)
            </label>
            <input value={image} onChange={handleChange} id="image" type="text" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-2 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm disabled:cursor-not-allowed text-sm" disabled={isArchived} placeholder="Paste image URL or use the uploader above" />
          </div>
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-semibold text-[#c1a875] mb-1">Type</label>
          <select id="type" value={type} onChange={handleChange} className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-pointer disabled:cursor-not-allowed" disabled={isArchived}>
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
          <label htmlFor="description" className="block text-sm font-semibold text-[#c1a875] mb-1">Description</label>
          <textarea value={description} id="description" onChange={handleChange} className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm  disabled:cursor-not-allowed" rows={4} disabled={isArchived} />
        </div>

        {/* Button */}
        <div>
          <button onClick={handleSubmit} disabled={isUploadingImage} className="px-8 py-3 rounded-xl font-semibold bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-[#1a1a1a] disabled:hover:text-white">
            {isArchived ? "Restore Product" : isEditing ? "Update Product" : "Add Product"}
          </button>
        </div>
      </div>
    </div >
  )
}

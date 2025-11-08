import { useState, type ChangeEvent, useEffect } from "react";

type Category = "men" | "women" | "kids"
type SizeOptions = Record<Exclude<Category, "">, string[]>

const sizeOptions: SizeOptions = {
  men: ["XS", "S", "M", "L", "XL", "XXL"],
  women: ["XS", "S", "M", "L", "XL"],
  kids: ["4", "6", "8", "10"],
}

export interface ProductFormData {
  title: string
  category: Category | ""
  price: string
  image: string
  description: string
  sizes: string[]
  type: string
  discountPercent: string
  onSale: boolean
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  onSubmit: (productData: ProductFormData) => Promise<void>
  isEditing: boolean
}

export default function ProductForm({ initialData, onSubmit, isEditing }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    category: "",
    price: "",
    image: "",
    description: "",
    sizes: [],
    type: "",
    discountPercent: "",
    onSale: false,
    ...initialData,
  })

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
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
    setFormData((prev) => ({
      ...prev,
      category: selected,
      sizes: [], // Reset sizes when category changes
    }))
  }

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }))
  }

  const handleOutOfStock = () => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes("outOfStock") ? [] : ["outOfStock"]
    }))
  }

  const handleSubmit = async () => {
    await onSubmit(formData)
    if (!isEditing) { // Reset form only for "Add Product"
      setFormData({
        title: "", category: "", price: "", image: "",
        description: "", sizes: [], type: "", discountPercent: "", onSale: false,
      })
    }
  }

  const { title, category, price, image, description, sizes, type, discountPercent, onSale } = formData

  return (
    <div className="flex-1 bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-10">
      <h1 className="text-3xl font-prata text-[#181818] dark:text-neutral-100 mb-6 tracking-tight">
        {isEditing ? "Edit Product" : "Add New Product"}
      </h1>

      {/* Grid Layout */}
      <div className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-[#c1a875] mb-1">Product Name</label>
          <input value={title} onChange={handleChange} id="title" type="text" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm" />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-[#c1a875] mb-1">Price</label>
          <input value={price} onChange={handleChange} id="price" type="number" step="0.01" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm" />
        </div>

        {/* On Sale */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <input id="onSale" type="checkbox" checked={onSale} onChange={(e) => setFormData((prev) => ({ ...prev, onSale: e.target.checked }))} />
            <label htmlFor="onSale" className="text-sm font-semibold text-[#c1a875]">On Sale</label>
          </div>
          {onSale &&
            <div>
              <label htmlFor="discountPercent" className="block text-sm font-semibold text-[#c1a875] mb-1">Sale Percentage</label>
              <input value={discountPercent} onChange={handleChange} id="discountPercent" type="number" step="0.1" min="0" max="100" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm" />
            </div>
          }
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-[#c1a875] mb-1">Category</label>
          <select id="category" value={category} onChange={handleCategoryChange} className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-pointer">
            <option value="" disabled>Select Category</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="kids">Kids</option>
          </select>
        </div>

        {/* Sizes */}
        {category && (
          <div>
            <label className="block text-sm font-semibold text-[#c1a875] mb-1">
              Available Sizes
            </label>
            <div className="mt-2 flex flex-wrap gap-2 items-center">
              {sizeOptions[category].map((size) => (
                <button key={size} type="button" onClick={() => toggleSize(size)} disabled={isEditing && sizes.includes("outOfStock")} className={`px-4 py-2 border rounded-md text-sm transition cursor-pointer ${sizes.includes(size)
                  ? "bg-[#c1a875] text-white border-[#c1a875]"
                  : "border-gray-300 text-gray-700 hover:bg-[#c1a875]/10 dark:text-gray-300 dark:border-neutral-600"} ${isEditing && sizes.includes("outOfStock") && "opacity-50 cursor-not-allowed"}`}>
                  {size}
                </button>
              ))}

              {isEditing && (
                <>
                  <div className="w-px h-6 bg-gray-300 dark:bg-neutral-600 mx-2"></div>
                  <button onClick={handleOutOfStock} className={`px-4 py-2 border rounded-md text-sm transition cursor-pointer font-semibold ${sizes.includes("outOfStock")
                    ? "bg-red-500 text-white border-red-500"
                    : "border-gray-300 text-gray-700 hover:bg-red-500/10 hover:text-red-600 dark:text-gray-300 dark:border-neutral-600"
                    }`}>
                    Out of Stock
                  </button>
                </>
              )}
            </div>
            {isEditing && sizes.includes("outOfStock") && (
              <p className="text-xs text-gray-500 mt-2">
                Product is currently marked as out of stock. Click "Out of Stock" again to re-enable size selection.
              </p>
            )}
          </div>
        )}

        {/* Image */}
        <div>
          <label htmlFor="image" className="block text-sm font-semibold text-[#c1a875] mb-1">Image URL</label>
          <input value={image} onChange={handleChange} id="image" type="text" className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm" />
        </div>

        {/* Type */}
        <div>
          <label htmlFor="type" className="block text-sm font-semibold text-[#c1a875] mb-1">Type</label>
          <select id="type" value={type} onChange={handleChange} className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm cursor-pointer">
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
          <textarea value={description} id="description" onChange={handleChange} className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-700 text-[#1a1a1a] dark:text-neutral-100 px-4 py-3 focus:ring-2 focus:ring-[#c1a875] focus:outline-none shadow-sm" rows={4}></textarea>
        </div>

        {/* Button */}
        <div>
          <button onClick={handleSubmit} className="px-8 py-3 rounded-xl font-semibold bg-[#1a1a1a] text-white hover:bg-[#c1a875] hover:text-[#1a1a1a] transition shadow-md cursor-pointer">
            {isEditing ? "Update Product" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  )
}
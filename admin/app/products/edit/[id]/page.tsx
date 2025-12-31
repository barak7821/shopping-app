"use client"
import { useEffect, useState } from "react";
import SideBar from "@/app/components/SideBar";
import { log } from "@/app/lib/logger";
import { updateProductById, getProductById } from "@/app/services/apiClient";
import { useApiErrorHandler, type ApiError } from "@/app/hooks/useApiErrorHandler";
import ProductForm from "@/app/components/ProductForm";
import Loading from "@/app/components/Loading";
import { type Category, type ProductFormData, type ProductSize } from "@/app/types/types";
import { useNotyf } from "@/app/hooks/useNotyf";
import { useParams, useRouter } from "next/navigation";

export default function EditProduct() {
    const router = useRouter()
    const params = useParams()
    const notyf = useNotyf()
    const [product, setProduct] = useState<ProductFormData | null>(null)
    const [loading, setLoading] = useState(true)
    const { handleApiError } = useApiErrorHandler()
    const id = Array.isArray(params?.id) ? params?.id[0] : params?.id

    useEffect(() => {
        const fetchProductById = async () => {
            if (!id) return
            setLoading(true)
            try {
                const data = await getProductById(id)
                log(data)
                setProduct({
                    title: data.title,
                    price: data.price.toString(),
                    category: data.category as Category,
                    sizes: (data.sizes || []).map((size: ProductSize) => ({
                        code: size.code,
                        stock: size.stock?.toString() ?? ""
                    })),
                    image: data.image,
                    type: data.type,
                    description: data.description,
                    discountPercent: (data.discountPercent ?? 0).toString(),
                    onSale: data.onSale,
                })
            } catch (error) {
                handleApiError(error as ApiError, "fetchProductById")
            } finally {
                setLoading(false)
            }
        }

        fetchProductById()
    }, [id])

    const handleUpdateProduct = async (productData: ProductFormData) => {
        const normalizedSizes = productData.sizes.map(({ code, stock }) => {
            const numericStock = stock === "" ? 0 : Number(stock)
            return {
                code,
                stock: Number.isNaN(numericStock) ? 0 : numericStock
            }
        })

        const updatedProduct = {
            id,
            ...productData,
            price: +productData.price,
            discountPercent: productData.onSale ? +(productData.discountPercent || 0) : 0,
            sizes: normalizedSizes,
        }

        try {
            await updateProductById(updatedProduct)
            notyf?.success("Product updated successfully!")
            router.push("/products")
        } catch (error) {
            handleApiError(error as ApiError, "handleUpdateProduct")
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
            <div className="flex flex-1 w-full max-w-screen-2xl mx-auto gap-12 pt-8 pb-20 px-4">
                {/* Sidebar */}
                <SideBar />
                {loading || !product ? (
                    <div className="flex-1 bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-xl p-10">
                        <Loading />
                    </div>
                ) : (
                    <ProductForm isEditing={true} initialData={product} onSubmit={handleUpdateProduct} />
                )}
            </div>
        </div>
    )
}

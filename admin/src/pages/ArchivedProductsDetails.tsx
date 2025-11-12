import { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import { log } from "../utils/log";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { getArchivedProductById, restoreArchivedProduct } from "../utils/api";
import { useApiErrorHandler, type ApiError } from "../utils/useApiErrorHandler";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm from "../components/ProductForm";
import Loading from "../components/Loading";
import { type Category, type ProductFormData } from "../utils/types";

export default function ArchivedProductsDetails() {
    const nav = useNavigate()
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } })
    const [product, setProduct] = useState<ProductFormData | null>(null)
    const [loading, setLoading] = useState(true)
    const { handleApiError } = useApiErrorHandler()
    const { id } = useParams()

    useEffect(() => {
        const fetchProductById = async () => {
            if (!id) return
            setLoading(true)
            try {
                const data = await getArchivedProductById(id)
                log(data)
                setProduct({
                    title: data.title,
                    price: data.price.toString(),
                    category: data.category as Category,
                    sizes: data.sizes,
                    image: data.image,
                    type: data.type,
                    description: data.description,
                    discountPercent: data.discountPercent.toString(),
                    onSale: data.onSale,
                    stock: data.stock.toString(),
                })
            } catch (error) {
                handleApiError(error as ApiError, "fetchProductById")
            } finally {
                setLoading(false)
            }
        }

        fetchProductById()
    }, [id])


    const handleRestoreBtn = async () => {
        try {
            await restoreArchivedProduct(id as string)
            notyf.success("Product restored successfully!")
            nav("/archivedProducts")
        } catch (error) {
            handleApiError(error as ApiError, "handleRestoreBtn")
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
                    <ProductForm isEditing={false} initialData={product} onSubmit={handleRestoreBtn} isArchived={true} />
                )}
            </div>
        </div>
    )
}

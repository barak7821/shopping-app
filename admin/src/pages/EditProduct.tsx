import { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import { log } from "../utils/log";
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { updateProductById, getProductById } from "../utils/api";
import { useApiErrorHandler, type ApiError } from "../utils/useApiErrorHandler";
import { useNavigate, useParams } from "react-router-dom";
import ProductForm, { type ProductFormData } from "../components/ProductForm";
import Loading from "../components/Loading";

type Category = "men" | "women" | "kids";

export default function EditProduct() {
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
                const data = await getProductById(id)
                log(data)
                setProduct({
                    title: data.title,
                    price: data.price.toString(),
                    category: data.category as Category,
                    sizes: data.sizes,
                    image: data.image,
                    type: data.type,
                    description: data.description,
                });
            } catch (error) {
                handleApiError(error as ApiError, "fetchProductById")
            } finally {
                setLoading(false);
            }
        }

        fetchProductById()
    }, [id])

    const handleUpdateProduct = async (productData: ProductFormData) => {
        const updatedProduct = {
            id,
            ...productData,
            price: +productData.price,
        };

        log("Updating product:", updatedProduct)

        try {
            await updateProductById(updatedProduct)
            notyf.success("Product updated successfully!")
            nav("/products")
        } catch (error) {
            handleApiError(error as ApiError, "handleUpdateProduct")
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#faf8f6] dark:bg-neutral-900 font-montserrat">
            <div className="flex flex-1 w-full mx-auto gap-12 pt-8 pb-20 px-4">
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

import Express from 'express';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';
import { deleteAllProducts, deleteProductById, addProduct, addMultipleProducts, getProductById, updateProductById } from '../controllers/adminController.js';

const router = Express.Router()

// Define route handlers

// Products
router.post('/', adminAuthMiddleware, addProduct)
router.delete('/deleteById', adminAuthMiddleware, deleteProductById)
router.get('/getById', adminAuthMiddleware, getProductById)
router.patch('/updateById', adminAuthMiddleware, updateProductById)

// temp routes - SHOULD ONLY BE USED FOR TESTING!!!
router.delete('/deleteAll', deleteAllProducts)
router.post('/batch', addMultipleProducts)

export default router

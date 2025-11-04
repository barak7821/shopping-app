import Express from 'express';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';
import { deleteAllProducts, deleteProductById, addProduct, addMultipleProducts, getProductById, updateProductById, fetchUsers, deleteUserById, getUserById, seedUsers, fetchDeletedUsers, getDeletedUserById, makeAdmin, removeAdmin, fetchOrders, getOrderById, getProductsByIds, updateOrderStatus } from '../controllers/adminController.js';

const router = Express.Router()

// Define route handlers

// Products
router.post('/', adminAuthMiddleware, addProduct)
router.delete('/deleteById', adminAuthMiddleware, deleteProductById)
router.get('/getById', adminAuthMiddleware, getProductById)
router.patch('/updateById', adminAuthMiddleware, updateProductById)
router.post('/getProductsByIds', adminAuthMiddleware, getProductsByIds)

// Users
router.get('/users', adminAuthMiddleware, fetchUsers)
router.get('/getUserById', adminAuthMiddleware, getUserById)
router.get('/deletedUsers', adminAuthMiddleware, fetchDeletedUsers)
router.get('/getDeletedUserById', adminAuthMiddleware, getDeletedUserById)
router.delete('/deleteUserById', adminAuthMiddleware, deleteUserById)
router.patch('/makeAdmin', adminAuthMiddleware, makeAdmin)
router.patch('/removeAdmin', adminAuthMiddleware, removeAdmin)

// Orders
router.get('/orders', adminAuthMiddleware, fetchOrders)
router.get('/getOrderById', adminAuthMiddleware, getOrderById)
router.patch('/updateOrderStatus', adminAuthMiddleware, updateOrderStatus)

// temp routes - SHOULD ONLY BE USED FOR TESTING!!!
router.delete('/deleteAll', deleteAllProducts)
router.post('/batch', addMultipleProducts)
router.post('/userBatch', seedUsers)

export default router

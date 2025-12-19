import Express from 'express';
import adminAuthMiddleware from '../middlewares/adminAuthMiddleware.js';
import { deleteAllProducts, archiveProductById, addProduct, addMultipleProducts, getProductById, updateProductById, getUsersByQuery, deleteUserById, getUserById, seedUsers, getDeletedUsersByQuery, getDeletedUserById, makeAdmin, removeAdmin, getOrderByQuery, getOrderByOrderNumber, getProductsByIds, updateOrderStatus, heroSection, tempHeroSection, bestSellerSection, contactInfoSection, tempContactInfo, addNoteToUser, tempBestSeller, getProductsByQuery, getArchivedProductsByQuery, restoreArchivedProduct, getArchivedProductById, getLogsByQuery, getNotificationEmail, updateNotificationEmail } from '../controllers/adminController.js';

const router = Express.Router()

// Define route handlers

// Products
router.get('/', adminAuthMiddleware, getProductsByQuery) // Get products - pagination in Products page
router.post('/', adminAuthMiddleware, addProduct) // Add new product
router.post('/productArchive', adminAuthMiddleware, archiveProductById) // Move to archive
router.patch('/', adminAuthMiddleware, updateProductById) // Update product by id
router.post('/getByIds', adminAuthMiddleware, getProductsByIds) // Get List of products by their IDs - used for order details page
router.get('/getById', adminAuthMiddleware, getProductById) // Get product by id

// Archive Products
router.get('/archived', adminAuthMiddleware, getArchivedProductsByQuery) // Get archived products - pagination in Archived Products page
router.post('/archived', adminAuthMiddleware, restoreArchivedProduct) // Restore archived product
router.get('/archivedById', adminAuthMiddleware, getArchivedProductById) // Get archived product by id

// Users
router.get('/users', adminAuthMiddleware, getUsersByQuery) // Get users - pagination in Users page
router.delete('/users', adminAuthMiddleware, deleteUserById) // Delete user by id
router.patch('/users', adminAuthMiddleware, addNoteToUser) // Add note to user
router.get('/getUserById', adminAuthMiddleware, getUserById) // Get user by id
router.get('/deletedUsers', adminAuthMiddleware, getDeletedUsersByQuery) // Get deleted users - pagination in Deleted Users page
router.get('/getDeletedUserById', adminAuthMiddleware, getDeletedUserById) // Get deleted user by id
router.patch('/makeAdmin', adminAuthMiddleware, makeAdmin) // Make user admin
router.patch('/removeAdmin', adminAuthMiddleware, removeAdmin) // Remove admin role from user

// Orders
router.get('/orders', adminAuthMiddleware, getOrderByQuery) // Get orders - pagination in Orders page
router.get('/getOrderByOrderNumber', adminAuthMiddleware, getOrderByOrderNumber) // Get order by order number
router.patch('/updateOrderStatus', adminAuthMiddleware, updateOrderStatus) // Update order status by id

// Home Page
router.patch('/hero', adminAuthMiddleware, heroSection) // Update hero section
router.patch('/bestSeller', adminAuthMiddleware, bestSellerSection) // Update best seller section
router.patch('/contactInfo', adminAuthMiddleware, contactInfoSection) // Update contact info section

// Logs
router.get('/logs', adminAuthMiddleware, getLogsByQuery)

// Notifications
router.get('/notifications', adminAuthMiddleware, getNotificationEmail)
router.patch('/notifications', adminAuthMiddleware, updateNotificationEmail)

// temp routes - SHOULD ONLY BE USED FOR TESTING!!!
router.delete('/deleteAll', deleteAllProducts)
router.post('/batch', addMultipleProducts)
router.post('/userBatch', seedUsers)
router.patch('/heroTest', tempHeroSection)
router.patch('/contactInfoTemp', tempContactInfo)
router.patch('/bestSellerTemp', tempBestSeller)

export default router

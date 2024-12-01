import multer from 'multer';
import { v2 as cloudinaryV2 } from 'cloudinary';
import ServerConfig from './ServerConfig.js';
import cloudinary from 'cloudinary';
import { ApiError } from '../utils/ApiError.js';

cloudinaryV2.config({
    cloud_name: ServerConfig.CLOUDINARY_CLOUD_NAME,
    api_key: ServerConfig.CLOUDINARY_API_KEY,
    api_secret: ServerConfig.CLOUDINARY_API_SECRET,
});
const storage = multer.memoryStorage();

// File filter for allowing images and documents
const fileFilter = (req, file, cb) => { 
    if (file.mimetype.startsWith('image') || file.mimetype === 'application/pdf' || file.mimetype.includes('word')) {
        cb(null, true);
    } else {
        cb(new ApiError(400,"file is not include"), false);
    }
};

// Multer fields configuration: for images and document
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 25 * 1024 * 1024 },  // 25 MB limit
}).fields([
    { name: 'images', maxCount: 10 },  // For up to 10 images
    { name: 'document', maxCount: 1 }, // For one document (PDF/Word)
]);

// Debugging middleware to check uploaded files and body
const debugUploadMiddleware = (req, res, next) => {
    console.log("Multer Files:", req.files);  // Will now log multiple fields (images, document)
    console.log("Multer Body:", req.body);  // Logs any other data from the request body
    next();
};

const uploadToCloudinary = async (file, folder) => {
    return new Promise((resolve, reject) => {
        try {
            const stream = cloudinaryV2.uploader.upload_stream(
                { 
                    folder,  // Cloudinary folder
                    resource_type: 'auto',  // Automatically detect file type
                    access_mode: 'public',
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(new Error('Error uploading to Cloudinary'));
                    } else {
                        resolve(result);  // Return the result from Cloudinary (public_id, secure_url)
                    }
                }
            );

            // Pipe the buffer to the Cloudinary upload stream
            stream.end(file.buffer);  // Upload the buffer content
        } catch (error) {
            console.error('Cloudinary upload failed:', error);
            reject(new Error('Cloudinary upload failed'));
        }
    });
};

const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.v2.uploader.destroy(publicId);
    } catch (error) {
        console.error(`Failed to delete image with ID ${publicId} from Cloudinary`, error);
        throw new Error('Error deleting image from Cloudinary');
    }
};

export { upload, uploadToCloudinary, debugUploadMiddleware, deleteFromCloudinary };

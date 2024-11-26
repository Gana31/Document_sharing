import multer from 'multer';
import { v2 as cloudinaryV2 } from 'cloudinary';
import ServerConfig from './ServerConfig.js';
import cloudinary from 'cloudinary';

cloudinaryV2.config({
    cloud_name: ServerConfig.CLOUDINARY_CLOUD_NAME,
    api_key: ServerConfig.CLOUDINARY_API_KEY,
    api_secret: ServerConfig.CLOUDINARY_API_SECRET,
});
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image!'), false);
    }
};


const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, 
}).array('images', 10);

const debugUploadMiddleware = (req, res, next) => {
    console.log("Multer Files:", req.files); 
    console.log("Multer Body:", req.body);  
    next();
};

const uploadToCloudinary = async (file, folder) => {
    return new Promise((resolve, reject) => {
        try {
            // Upload the buffer to Cloudinary using the upload_stream method
            const stream = cloudinaryV2.uploader.upload_stream(
                { 
                    folder,               // Folder in Cloudinary
                    resource_type: 'auto' // Automatically detect the file type (image, video, etc.)
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(new Error('Error uploading to Cloudinary'));
                    } else {
                        resolve(result); // Return the result from Cloudinary (including public_id and secure_url)
                    }
                }
            );

            // Pipe the buffer to the Cloudinary upload stream
            stream.end(file.buffer); // 'end' method is used to upload the buffer content
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

export { upload, uploadToCloudinary ,debugUploadMiddleware,deleteFromCloudinary};

const { upload } = require('../config/cloudinary');

// Middleware for handling single image upload
const uploadImage = upload.single('image');

// Middleware to process uploaded image and add to request
const processUploadedImage = (req, res, next) => {
  // If no file was uploaded, continue without setting image URL
  if (!req.file) {
    return next();
  }

  // Add the Cloudinary URL to the request body
  req.body.image = req.file.path;
  next();
};

module.exports = {
  uploadImage,
  processUploadedImage
};

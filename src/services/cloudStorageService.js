// Cloud Storage Service for Profile Pictures
// This service handles uploading images to Cloudinary via backend API

class CloudStorageService {
  constructor() {
    // Configuration for cloud storage
    // Currently integrated with Cloudinary for reliable cloud storage
    this.config = {
      cloudProvider: 'Cloudinary',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png']
    };
  }

  // Upload image to cloud storage
  async uploadImage(file, folder = 'profiles') {
    try {
      // Validate the file first
      const validation = this.validateImage(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      // Upload to backend endpoint
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const uploadUrl = `${API_URL}/api/user/upload-image`;
      
      console.log('Uploading to:', uploadUrl);
      console.log('File:', file.name, file.size, file.type);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check if response is ok
      if (!response.ok) {
        return {
          success: false,
          error: `Upload failed with status: ${response.status}`
        };
      }

      const result = await response.json();

      if (result.success) {
        // URL is now from Cloudinary (https://res.cloudinary.com/...)
        // No need to convert, it's already absolute
        const imageUrl = result.url;
        
        return {
          success: true,
          url: imageUrl,
          publicId: result.publicId || result.url, // Use Cloudinary public_id for deletion
          fileName: file.name
        };
      } else {
        return {
          success: false,
          error: result.message || 'Upload failed'
        };
      }
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Convert file to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  // Delete image from Cloudinary
  async deleteImage(publicId) {
    try {
      // Call backend API to delete image from Cloudinary
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const deleteUrl = `${API_URL}/api/user/delete-image`;
      
      const response = await fetch(deleteUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publicId })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  }

  // Validate image file
  validateImage(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPG and PNG files are allowed' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    return { valid: true };
  }
}

// Create and export a singleton instance
const cloudStorageService = new CloudStorageService();
export default cloudStorageService;

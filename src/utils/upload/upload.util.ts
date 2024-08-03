import dotenv from 'dotenv';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
const bucketName = process.env.AWS_S3_BUCKET_NAME || 'users-images-bucket-1';

//s3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

export class UploadUtil {
  /**
   * Uploads an image to an S3 bucket using multer and multer-s3.
   *
   * @param {string} bucketName - The name of the S3 bucket to upload the image to. Defaults to the value of the environment variable AWS_S3_BUCKET_NAME or 'users-images-bucket-1'.
   * @returns {Function} - A middleware function that handles the image upload.
   */
  public static uploadImage() {
    /**
     * Filters the files to only allow image files with specific extensions.
     *
     * @param {Request} req - The request object.
     * @param {Express.Multer.File} file - The file object.
     * @param {Function} callback - The callback function to indicate whether the file is accepted or not.
     */
    const fileFilter = (req, file, callback) => {
      var ext = path.extname(file.originalname).toLowerCase();
      if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
        return callback(null, false);
      }
      callback(null, true);
    };

    /**
     * Configuration for multer-s3 to specify how the file should be stored in S3.
     */
    const multerS3Config = multerS3({
      s3,
      bucket: bucketName,
      /**
       * Sets the metadata for the uploaded file.
       *
       * @param {Request} req - The request object.
       * @param {Express.Multer.File} file - The file object.
       * @param {Function} cb - The callback function to set the metadata.
       */
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      /**
       * Sets the key (path) for the uploaded file in the S3 bucket.
       *
       * @param {Request} req - The request object.
       * @param {Express.Multer.File} file - The file object.
       * @param {Function} cb - The callback function to set the key.
       */
      key: function (req, file, cb) {
        cb(null, `users/${Date.now()}_${file.originalname}`);
      },
    });

    /**
     * Configuration for multer to handle the file upload.
     */
    const upload = multer({
      storage: multerS3Config,
      fileFilter: fileFilter,
      limits: {
        fileSize: 1024 * 1024 * 10, // Allow up to 10 MB files
      },
    });

    // Return the middleware function to handle a single file upload with the field name 'profileImage'
    return upload.single('profileImage'); // Replace 'image' with your actual field name
  }

  public static deleteImage(key: string) {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    return new Promise<boolean>((resolve, reject) => {
      const command = new DeleteObjectCommand(params);

      // Call S3 to delete the object
      s3.send(command, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
}

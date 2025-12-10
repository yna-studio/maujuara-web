import { v2 as cloudinary } from 'cloudinary';
import { env } from '$env/dynamic/private';

// Configure Cloudinary
cloudinary.config({
	cloud_name: env.CLOUDINARY_CLOUD_NAME,
	api_key: env.CLOUDINARY_API_KEY,
	api_secret: env.CLOUDINARY_API_SECRET,
	secure: true
});

export interface UploadResult {
	public_id: string;
	secure_url: string;
	format: string;
	bytes: number;
	width?: number;
	height?: number;
}

/**
 * Upload base64 image to Cloudinary
 * @param base64Data - Base64 image data (without data:image prefix)
 * @param organizerName - Name of the organizer for folder structure
 * @returns Promise<UploadResult>
 */
export async function uploadOrganizerAvatar(
	base64Data: string,
	organizerName: string
): Promise<UploadResult> {
	try {
		// Convert organizer name to kebab-case and lowercase
		const folderName = organizerName
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '') // Remove special characters
			.trim()
			.replace(/\s+/g, '-'); // Replace spaces with hyphens

		const folder = `${env.CLOUDINARY_DIR}/organizers/${folderName}`;

		// Upload to Cloudinary
		const result = await cloudinary.uploader.upload(base64Data, {
			folder,
			public_id: `avatar-${Date.now()}`,
			resource_type: 'image',
			format: 'webp',
			quality: 'auto:good',
			fetch_format: 'auto',
		});

		return {
			public_id: result.public_id,
			secure_url: result.secure_url,
			format: result.format,
			bytes: result.bytes,
			width: result.width,
			height: result.height
		};
	} catch (error) {
		console.error('Cloudinary upload error:', error);
		throw new Error('Failed to upload image to Cloudinary');
	}
}

/**
 * Upload base64 poster to Cloudinary for competitions
 * @param base64Data - Base64 image data (without data:image prefix)
 * @param competitionTitle - Title of the competition for folder structure
 * @param deadlineDate - Deadline date to extract year for folder structure
 * @returns Promise<UploadResult>
 */
export async function uploadCompetitionPoster(
	base64Data: string,
	competitionTitle: string,
	deadlineDate: string
): Promise<UploadResult> {
	try {
		// Extract year from deadline date
		const year = new Date(deadlineDate).getFullYear().toString();
		
		// Convert competition title to kebab-case and lowercase
		const titleFolder = competitionTitle
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '') // Remove special characters
			.trim()
			.replace(/\s+/g, '-'); // Replace spaces with hyphens

		const folder = `${env.CLOUDINARY_DIR}/competitions/${year}/${titleFolder}`;

		// Upload to Cloudinary
		const result = await cloudinary.uploader.upload(base64Data, {
			folder,
			public_id: `poster-${Date.now()}`,
			resource_type: 'image',
			format: 'webp',
			quality: 'auto:good',
			fetch_format: 'auto',
		});

		return {
			public_id: result.public_id,
			secure_url: result.secure_url,
			format: result.format,
			bytes: result.bytes,
			width: result.width,
			height: result.height
		};
	} catch (error) {
		console.error('Cloudinary upload error:', error);
		throw new Error('Failed to upload poster to Cloudinary');
	}
}

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @returns Promise<boolean>
 */
export async function deleteImage(publicId: string): Promise<boolean> {
	try {
		const result = await cloudinary.uploader.destroy(publicId);
		return result.result === 'ok';
	} catch (error) {
		console.error('Cloudinary delete error:', error);
		return false;
	}
}

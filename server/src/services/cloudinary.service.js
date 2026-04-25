import { cloudinary } from '../config/cloudinary.js'

/**
 * Delete a single file from Cloudinary by its public ID.
 * resource_type defaults to 'raw' for data files; pass 'image' for images.
 */
export async function deleteFile(publicId, resourceType = 'raw') {
  if (!publicId) return null
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

/**
 * Delete multiple files from Cloudinary in parallel.
 * Each item in the array should have { publicId, resourceType? }.
 */
export async function deleteFiles(fileList = []) {
  return Promise.allSettled(
    fileList.map(({ publicId, resourceType = 'raw' }) => deleteFile(publicId, resourceType)),
  )
}

/**
 * Fetch metadata about a Cloudinary resource by its public ID.
 */
export async function getResourceInfo(publicId, resourceType = 'raw') {
  return cloudinary.api.resource(publicId, { resource_type: resourceType })
}

/**
 * Generate a short-lived signed download URL for a private Cloudinary asset.
 * expiresInSeconds defaults to 3600 (1 hour).
 */
export async function getSignedUrl(publicId, resourceType = 'raw', expiresInSeconds = 3600) {
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds
  return cloudinary.utils.private_download_url(publicId, '', {
    resource_type: resourceType,
    expires_at: expiresAt,
  })
}

/**
 * Move (rename) a Cloudinary asset to a new public ID.
 */
export async function renameFile(fromPublicId, toPublicId, resourceType = 'raw') {
  return cloudinary.uploader.rename(fromPublicId, toPublicId, { resource_type: resourceType })
}

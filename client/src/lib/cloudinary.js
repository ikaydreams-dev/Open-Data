/**
 * src/lib/cloudinary.js
 *
 * Client-side Cloudinary utilities.
 *
 * The server (server/src/config/cloudinary.js) handles all uploads via
 * multer-storage-cloudinary and stores both `url` and `publicId` in MongoDB.
 * This file deals with the read side: building optimised delivery URLs from
 * a stored publicId so we can request exactly the size/format we need
 * without shipping oversized images.
 *
 * No Cloudinary SDK is imported here — URL construction follows the
 * documented transformation URL format:
 * https://cloudinary.com/documentation/image_transformations
 */

const CLOUD_NAME =
import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? ''

const BASE_URL = CLOUD_NAME
? `https://res.cloudinary.com/${CLOUD_NAME}`
: null

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Serialise a transformation object into a Cloudinary parameter string.
 * e.g. { w: 400, h: 400, c: 'fill', f: 'auto', q: 'auto' }
 *   → 'w_400,h_400,c_fill,f_auto,q_auto'
 */
function serializeTransform(t = {}) {
    return Object.entries(t)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}_${v}`)
    .join(',')
}

/**
 * Build a full Cloudinary delivery URL.
 *
 * @param {string}   publicId    The stored publicId (e.g. 'open-data/profiles/abc123')
 * @param {Object}   transform   Cloudinary transformation params (see serializeTransform)
 * @param {'image'|'video'|'raw'} resourceType  Default: 'image'
 * @returns {string|null}  Full URL, or null if CLOUD_NAME is not configured
 */
function buildUrl(publicId, transform = {}, resourceType = 'image') {
    if (!BASE_URL || !publicId) return null
        const t = serializeTransform(transform)
        const tSegment = t ? `${t}/` : ''
        return `${BASE_URL}/${resourceType}/upload/${tSegment}${publicId}`
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Build a generic image URL with arbitrary Cloudinary transformations.
 *
 * @param {string} publicId
 * @param {Object} [options]
 * @param {number} [options.width]
 * @param {number} [options.height]
 * @param {'fill'|'fit'|'crop'|'scale'|'thumb'} [options.crop]  Default: 'fill'
 * @param {string} [options.format]  'auto' | 'webp' | 'jpg' | etc. Default: 'auto'
 * @param {string|number} [options.quality]  'auto' | 1-100. Default: 'auto'
 * @param {string} [options.gravity]  'face' | 'center' | etc.
 * @returns {string|null}
 */
export function getImageUrl(publicId, options = {}) {
    const {
        width,
        height,
        crop = 'fill',
        format = 'auto',
            quality = 'auto',
            gravity,
    } = options

    return buildUrl(publicId, {
        w: width,
        h: height,
        c: width || height ? crop : undefined,
        f: format,
        q: quality,
        g: gravity,
    })
}

/**
 * Avatar URL — always square, face-aware crop, WebP when supported.
 *
 * The server stores avatars at 400×400; requesting a smaller size saves
 * bandwidth without a visible quality loss.
 *
 * @param {string} publicId
 * @param {number} [size=80]  Pixel dimensions (width = height)
 * @returns {string|null}
 */
export function getAvatarUrl(publicId, size = 80) {
    return buildUrl(publicId, {
        w: size,
        h: size,
        c: 'fill',
        g: 'face',
        f: 'auto',
        q: 'auto',
    })
}

/**
 * Thumbnail for dataset file previews, org logos, etc.
 *
 * @param {string} publicId
 * @param {number} [width=320]
 * @param {number} [height=200]
 * @returns {string|null}
 */
export function getThumbnailUrl(publicId, width = 320, height = 200) {
    return buildUrl(publicId, {
        w: width,
        h: height,
        c: 'fill',
        f: 'auto',
        q: 'auto:low',
    })
}

/**
 * Low-quality placeholder (blurred tiny image for progressive loading).
 *
 * @param {string} publicId
 * @returns {string|null}
 */
export function getBlurPlaceholderUrl(publicId) {
    return buildUrl(publicId, {
        w: 20,
        h: 20,
        c: 'fill',
        e: 'blur:400',
        f: 'auto',
        q: 1,
    })
}

/**
 * Return the raw Cloudinary delivery URL for a non-image asset (CSV, PDF…)
 * stored under resource_type 'raw'.
 *
 * @param {string} publicId
 * @returns {string|null}
 */
export function getRawFileUrl(publicId) {
    return buildUrl(publicId, {}, 'raw')
}

/**
 * True if a URL points to Cloudinary's CDN.
 *
 * Useful for deciding whether to run transformation helpers or just use
 * the URL as-is (e.g. for externally hosted images).
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isCloudinaryUrl(url) {
    if (!url) return false
        return url.includes('res.cloudinary.com')
}

/**
 * Extract the publicId from a full Cloudinary URL.
 *
 * Works with both /upload/<publicId> and /upload/<transform>/<publicId>
 * patterns. Returns null for non-Cloudinary URLs.
 *
 * @param {string} url
 * @returns {string|null}
 */
export function extractPublicId(url) {
    if (!isCloudinaryUrl(url)) return null
        // Match everything after /upload/ and optional transformation segment
        const match = url.match(/\/upload\/(?:[^/]+\/)*(.+?)(?:\.[a-z]{2,4})?$/)
        return match?.[1] ?? null
}

/**
 * Return the best src for a user avatar.
 *
 * Prefers a Cloudinary-transformed URL when we have a publicId;
 * falls back to the stored URL; ultimately falls back to null (let the
 * component render initials instead).
 *
 * @param {{ url?: string, publicId?: string }|null} avatar  The avatar object from User model
 * @param {number} [size=80]
 * @returns {string|null}
 */
export function resolveAvatarSrc(avatar, size = 80) {
    if (!avatar) return null
        if (avatar.publicId && BASE_URL) {
            return getAvatarUrl(avatar.publicId, size)
        }
        return avatar.url ?? null
}

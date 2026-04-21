const CLOUD_NAME =
import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? ''

const BASE_URL = CLOUD_NAME
? `https://res.cloudinary.com/${CLOUD_NAME}`
: null

// ─── Internal helpers ────────────────────────────────────────────────────────

function serializeTransform(t = {}) {
    return Object.entries(t)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}_${v}`)
    .join(',')
}

function buildUrl(publicId, transform = {}, resourceType = 'image') {
    if (!BASE_URL || !publicId) return null
        const t = serializeTransform(transform)
        const tSegment = t ? `${t}/` : ''
        return `${BASE_URL}/${resourceType}/upload/${tSegment}${publicId}`
}
 /** 
  * 
  * @param 
 */
// ─── Public API ──────────────────────────────────────────────────────────────

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

export function getThumbnailUrl(publicId, width = 320, height = 200) {
    return buildUrl(publicId, {
        w: width,
        h: height,
        c: 'fill',
        f: 'auto',
        q: 'auto:low',
    })
}

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

export function getRawFileUrl(publicId) {
    return buildUrl(publicId, {}, 'raw')
}

export function isCloudinaryUrl(url) {
    if (!url) return false
        return url.includes('res.cloudinary.com')
}

export function extractPublicId(url) {
    if (!isCloudinaryUrl(url)) return null
        // Match everything after /upload/ and optional transformation segment
        const match = url.match(/\/upload\/(?:[^/]+\/)*(.+?)(?:\.[a-z]{2,4})?$/)
        return match?.[1] ?? null
}

export function resolveAvatarSrc(avatar, size = 80) {
    if (!avatar) return null
        if (avatar.publicId && BASE_URL) {
            return getAvatarUrl(avatar.publicId, size)
        }
        return avatar.url ?? null
}

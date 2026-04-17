/**
 * Workspaces API
 *
 * Currently persists entirely in localStorage (keyed per user) since the
 * backend workspace routes are not yet implemented. The shape of every
 * function matches what a real API client would look like so that swapping
 * in real network calls later is a one-line change per function.
 *
 * Storage key: `odk_workspaces_<userId>`
 */

const STORAGE_KEY = (userId) => `odk_workspaces_${userId}`

function load(userId) {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY(userId)) ?? '[]')
    } catch {
        return []
    }
}

function save(userId, workspaces) {
    localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(workspaces))
}

function makeId() {
    return `ws_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// Simulate async so callers can treat this identically to real API calls
const delay = () => new Promise((r) => setTimeout(r, 60))

export const workspacesApi = {
    /** List all workspaces for this user */
    list: async (userId) => {
        await delay()
        return { data: load(userId) }
    },

    /** Get a single workspace by ID */
    get: async (userId, workspaceId) => {
        await delay()
        const ws = load(userId).find((w) => w.id === workspaceId)
        if (!ws) throw new Error('Workspace not found')
            return { data: ws }
    },

    /** Create a new workspace */
    create: async (userId, { name, description = '', visibility = 'private' }) => {
        await delay()
        const workspace = {
            id: makeId(),
            name,
            description,
            visibility,
            datasets: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        const all = load(userId)
        save(userId, [workspace, ...all])
        return { data: workspace }
    },

    /** Update name / description / visibility */
    update: async (userId, workspaceId, patch) => {
        await delay()
        const all = load(userId)
        const idx = all.findIndex((w) => w.id === workspaceId)
        if (idx === -1) throw new Error('Workspace not found')
            all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() }
            save(userId, all)
            return { data: all[idx] }
    },

    /** Delete a workspace */
    delete: async (userId, workspaceId) => {
        await delay()
        const all = load(userId)
        save(userId, all.filter((w) => w.id !== workspaceId))
        return { data: { ok: true } }
    },

    /** Add a dataset object to a workspace (passes the full dataset shape) */
    addDataset: async (userId, workspaceId, dataset) => {
        await delay()
        const all = load(userId)
        const idx = all.findIndex((w) => w.id === workspaceId)
        if (idx === -1) throw new Error('Workspace not found')
            const ws = all[idx]
            if (ws.datasets.some((d) => d.slug === dataset.slug)) {
                throw new Error('Dataset already in workspace')
            }
            ws.datasets = [{ ...dataset, addedAt: new Date().toISOString() }, ...ws.datasets]
            ws.updatedAt = new Date().toISOString()
            save(userId, all)
            return { data: ws }
    },

    /** Remove a dataset from a workspace by slug */
    removeDataset: async (userId, workspaceId, slug) => {
        await delay()
        const all = load(userId)
        const idx = all.findIndex((w) => w.id === workspaceId)
        if (idx === -1) throw new Error('Workspace not found')
            all[idx].datasets = all[idx].datasets.filter((d) => d.slug !== slug)
            all[idx].updatedAt = new Date().toISOString()
            save(userId, all)
            return { data: all[idx] }
    },
}

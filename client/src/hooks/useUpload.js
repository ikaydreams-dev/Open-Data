import { useState, useRef, useCallback } from 'react'
import { formatFileSize } from '../lib/utils'

/**
 * useUpload — manages a staged list of files before they are submitted.
 *
 * Encapsulates the file-picking, drag-and-drop, and file-list state that
 * DatasetUploadPage (and the avatar uploader) manage manually today.
 *
 * @param {Object}   options
 * @param {number}   options.maxFiles    Max number of files allowed (default: 10).
 * @param {string[]} options.accept      Accepted MIME type prefixes e.g. ['text/', 'application/json'].
 *                                       Empty means accept everything.
 *
 * @returns {Object}  See return block below.
 *
 * @example — dataset upload
 * const { files, addFiles, removeFile, clearFiles, dragging, dragProps, fileInputRef } = useUpload({ maxFiles: 10 })
 *
 * @example — single avatar upload
 * const { files, addFiles, fileInputRef } = useUpload({ maxFiles: 1 })
 */
export function useUpload({ maxFiles = 10, accept = [] } = {}) {
    const [files, setFiles]     = useState([])   // Array<FileEntry>
    const [dragging, setDragging] = useState(false)
    const fileInputRef            = useRef(null)

    /** Normalise a native File into the shape the UI expects */
    function normalise(file) {
        return {
            file,
            name:   file.name,
            size:   file.size,
            format: file.name.split('.').pop().toUpperCase(),
                sizeLabel: formatFileSize(file.size),
                mimeType: file.type,
                // Unique key so React lists are stable even when filenames repeat
                id: `${file.name}_${file.size}_${Date.now()}_${Math.random()}`,
        }
    }

    /** Check whether a File passes the accept filter */
    function isAccepted(file) {
        if (!accept.length) return true
            return accept.some(
                (pattern) =>
                file.type.startsWith(pattern) ||
                file.name.toLowerCase().endsWith(pattern.replace('*', '')),
            )
    }

    /** Add one or more files (FileList or Array<File>) */
    const addFiles = useCallback(
        (incoming) => {
            const incomingArr = Array.from(incoming)

            const accepted = incomingArr.filter(isAccepted)
            const rejected = incomingArr.length - accepted.length

            setFiles((prev) => {
                const available = maxFiles - prev.length
                if (available <= 0) return prev
                    const toAdd = accepted.slice(0, available).map(normalise)
                    return [...prev, ...toAdd]
            })

            return { rejected }
        },
        [maxFiles, accept],
    )

    /** Remove a file by its stable id */
    const removeFile = useCallback((id) => {
        setFiles((prev) => prev.filter((f) => f.id !== id))
    }, [])

    /** Remove a file by its numeric index (for backwards compat with DatasetUploadPage) */
    const removeFileAt = useCallback((index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }, [])

    /** Empty the list */
    const clearFiles = useCallback(() => setFiles([]), [])

    /** Open the hidden file-input picker */
    const openPicker = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    // ── Drag-and-drop event props ──────────────────────────────────────────────
    const dragProps = {
        onDragOver: (e) => { e.preventDefault(); setDragging(true) },
        onDragEnter: (e) => { e.preventDefault(); setDragging(true) },
        onDragLeave: (e) => {
            // Only clear when leaving the drop zone itself (not a child element)
            if (!e.currentTarget.contains(e.relatedTarget)) {
                setDragging(false)
            }
        },
        onDrop: (e) => {
            e.preventDefault()
            setDragging(false)
            addFiles(e.dataTransfer.files)
        },
        onClick: openPicker,
    }

    // ── Derived helpers ────────────────────────────────────────────────────────
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    const isFull    = files.length >= maxFiles
    const isEmpty   = files.length === 0

    return {
        /** Staged file entries — each has {file, name, size, format, sizeLabel, mimeType, id} */
        files,

        /** Add files from a FileList or Array<File> */
        addFiles,

        /** Remove by stable id */
        removeFile,

        /** Remove by index (matches DatasetUploadPage usage) */
        removeFileAt,

        /** Clear all staged files */
        clearFiles,

        /** true while the user is dragging over the drop zone */
        dragging,

        /** Spread onto the drop zone element: {...dragProps} */
        dragProps,

        /** Ref for <input type="file"> — attach to a hidden input */
        fileInputRef,

        /** Programmatically open the file picker */
        openPicker,

        /** Combined size of all staged files in bytes */
        totalSize,

        /** true when maxFiles has been reached */
        isFull,

        /** true when no files are staged */
        isEmpty,
    }
}

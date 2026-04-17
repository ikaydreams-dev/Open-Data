// src/components/shared/FileIcon.jsx
// Maps dataset file formats (from constants.js FILE_FORMATS) to visual icons.
// FILE_FORMATS: ['CSV', 'JSON', 'GeoJSON', 'Parquet', 'XLSX', 'Shapefile', 'PDF', 'Images']
import {
  Table2,
  Braces,
  MapPin,
  Database,
  Sheet,
  Map,
  FileText,
  ImageIcon,
  File,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const formatMap = {
  CSV: {
    icon: Table2,
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    label: 'CSV',
  },
  JSON: {
    icon: Braces,
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    label: 'JSON',
  },
  GEOJSON: {
    icon: MapPin,
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    label: 'GeoJSON',
  },
  PARQUET: {
    icon: Database,
    bg: 'bg-violet-100',
    text: 'text-violet-700',
    label: 'Parquet',
  },
  XLSX: {
    icon: Sheet,
    bg: 'bg-green-100',
    text: 'text-green-700',
    label: 'XLSX',
  },
  SHAPEFILE: {
    icon: Map,
    bg: 'bg-cyan-100',
    text: 'text-cyan-700',
    label: 'Shapefile',
  },
  PDF: {
    icon: FileText,
    bg: 'bg-red-100',
    text: 'text-red-700',
    label: 'PDF',
  },
  IMAGES: {
    icon: ImageIcon,
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    label: 'Images',
  },
}

const sizes = {
  sm: { wrapper: 'w-7 h-7', icon: 14, text: 'text-[9px]' },
  md: { wrapper: 'w-9 h-9', icon: 18, text: 'text-[10px]' },
  lg: { wrapper: 'w-12 h-12', icon: 22, text: 'text-xs' },
}

export function FileIcon({ format, size = 'md', showLabel = false, className }) {
  const key = format?.toUpperCase().replace(/\s/g, '')
  const config = formatMap[key] ?? {
    icon: File,
    bg: 'bg-stone-100',
    text: 'text-stone-500',
    label: format ?? 'File',
  }

  const { icon: Icon, bg, text, label } = config
  const s = sizes[size]

  return (
    <span className={cn('inline-flex flex-col items-center gap-1', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-lg shrink-0',
          bg,
          text,
          s.wrapper,
        )}
      >
        <Icon size={s.icon} strokeWidth={1.8} />
      </span>
      {showLabel && (
        <span className={cn('font-medium text-stone-600', s.text)}>
          {label}
        </span>
      )}
    </span>
  )
}

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Upload, X, FileText, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { datasetsApi } from '../../api/datasets.api'
import { Input } from '../../components/shared/Input'
import { Select } from '../../components/shared/Select'
import { Textarea } from '../../components/shared/Textarea'
import { Button } from '../../components/shared/Button'
import { Badge } from '../../components/shared/Badge'
import { DATASET_CATEGORIES, LICENSES, VISIBILITY, AFRICAN_COUNTRIES } from '../../lib/constants'
import { slugify, formatFileSize } from '../../lib/utils'

const STEPS = ['Basic Info', 'Files', 'Metadata', 'Review & Submit']

const categoryOptions = DATASET_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))
const licenseOptions = LICENSES
const visibilityOptions = [
  { value: 'public', label: 'Public — visible to everyone' },
  { value: 'private', label: 'Private — only you' },
  { value: 'organization', label: 'Organization — only your org members' },
]

export default function DatasetUploadPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [files, setFiles] = useState([])
  const [countries, setCountries] = useState([])
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({ defaultValues: { visibility: 'public' } })

  const titleValue = watch('title') ?? ''
  const generatedSlug = slugify(titleValue)

  const mutation = useMutation({
    mutationFn: (formData) => datasetsApi.create(formData),
    onSuccess: (res) => {
      toast.success('Dataset uploaded successfully!')
      navigate(`/datasets/${res.data.slug}`)
    },
    onError: () => toast.error('Upload failed. Please try again.'),
  })

  async function handleNext() {
    const fieldMap = {
      0: ['title', 'description', 'category', 'license', 'visibility'],
      1: [],
      2: [],
    }
    const valid = await trigger(fieldMap[step])
    if (step === 1 && files.length === 0) {
      toast.error('Please attach at least one file.')
      return
    }
    if (valid) setStep((s) => s + 1)
  }

  function handleBack() {
    setStep((s) => s - 1)
  }

  function addFiles(incoming) {
    const newFiles = Array.from(incoming).map((f) => ({ file: f, name: f.name, size: f.size, format: f.name.split('.').pop().toUpperCase() }))
    setFiles((prev) => [...prev, ...newFiles])
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function toggleCountry(country) {
    setCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    )
  }

  function onSubmit(data) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description ?? '')
    formData.append('category', data.category)
    formData.append('license', data.license)
    formData.append('visibility', data.visibility)
    formData.append('source', data.source ?? '')
    formData.append('temporalCoverage', data.temporalCoverage ?? '')
    formData.append('tags', data.tags ?? '')
    countries.forEach((c) => formData.append('geographicScope[]', c))
    files.forEach((f) => formData.append('files', f.file))
    mutation.mutate(formData)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-900 mb-2">Upload a Dataset</h1>
      <p className="text-sm text-stone-500 mb-8">Share data with researchers, governments, and NGOs across Africa.</p>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step ? 'bg-orange-700 text-white' : i === step ? 'bg-orange-100 text-orange-800 border-2 border-orange-700' : 'bg-stone-100 text-stone-400'
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? 'text-orange-700 font-medium' : 'text-stone-400'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-5 ${i < step ? 'bg-orange-700' : 'bg-stone-200'}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0 — Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <Input
              label="Title"
              required
              placeholder="e.g. Nigeria Agricultural Survey 2023"
              error={errors.title?.message}
              {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'Title must be at least 5 characters' } })}
            />
            {generatedSlug && (
              <p className="text-xs text-stone-400 -mt-2">Slug: <span className="font-mono text-stone-600">{generatedSlug}</span></p>
            )}
            <Textarea
              label="Description"
              placeholder="Describe what this dataset contains, its purpose, and how it was collected."
              rows={4}
              {...register('description')}
            />
            <Select
              label="Category"
              required
              placeholder="Select a category"
              options={categoryOptions}
              error={errors.category?.message}
              {...register('category', { required: 'Category is required' })}
            />
            <Select
              label="License"
              required
              placeholder="Select a license"
              options={licenseOptions}
              error={errors.license?.message}
              {...register('license', { required: 'License is required' })}
            />
            <Select
              label="Visibility"
              options={visibilityOptions}
              {...register('visibility')}
            />
          </div>
        )}

        {/* Step 1 — Files */}
        {step === 1 && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                dragging ? 'border-orange-400 bg-orange-50' : 'border-stone-300 hover:border-orange-300 hover:bg-stone-50'
              }`}
            >
              <Upload size={28} className="mx-auto mb-2 text-stone-400" />
              <p className="text-sm font-medium text-stone-700">Drag & drop files here</p>
              <p className="text-xs text-stone-400 mt-1">or click to browse — CSV, JSON, GeoJSON, Parquet, XLSX, Shapefile, PDF</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <ul className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 py-3 bg-white">
                    <FileText size={16} className="text-stone-400 shrink-0" />
                    <span className="flex-1 text-sm text-stone-700 truncate">{f.name}</span>
                    <Badge variant="default">{f.format}</Badge>
                    <span className="text-xs text-stone-400 shrink-0">{formatFileSize(f.size)}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-stone-400 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Step 2 — Metadata */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Geographic Scope</label>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto border border-stone-200 rounded-lg p-3 bg-white">
                {AFRICAN_COUNTRIES.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => toggleCountry(country)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                      countries.includes(country)
                        ? 'bg-orange-700 text-white border-orange-700'
                        : 'bg-white text-stone-600 border-stone-300 hover:border-orange-400'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
              {countries.length > 0 && (
                <p className="text-xs text-stone-500 mt-1">{countries.length} {countries.length === 1 ? 'country' : 'countries'} selected</p>
              )}
            </div>

            <Input
              label="Temporal Coverage"
              placeholder="e.g. 2010–2023 or January 2022"
              hint="The time period this dataset covers."
              {...register('temporalCoverage')}
            />

            <Input
              label="Data Source"
              placeholder="e.g. National Bureau of Statistics, WHO"
              {...register('source')}
            />

            <Input
              label="Tags"
              placeholder="e.g. malaria, vaccination, rural"
              hint="Comma-separated keywords to help people find this dataset."
              {...register('tags')}
            />
          </div>
        )}

        {/* Step 3 — Review & Submit */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-stone-50 rounded-lg border border-stone-200 divide-y divide-stone-200 text-sm overflow-hidden">
              <ReviewRow label="Title" value={watch('title')} />
              <ReviewRow label="Category" value={categoryOptions.find((c) => c.value === watch('category'))?.label} />
              <ReviewRow label="License" value={licenseOptions.find((l) => l.value === watch('license'))?.label} />
              <ReviewRow label="Visibility" value={watch('visibility')} />
              <ReviewRow label="Files" value={`${files.length} file${files.length !== 1 ? 's' : ''}`} />
              {countries.length > 0 && <ReviewRow label="Countries" value={countries.join(', ')} />}
              {watch('temporalCoverage') && <ReviewRow label="Temporal Coverage" value={watch('temporalCoverage')} />}
              {watch('source') && <ReviewRow label="Source" value={watch('source')} />}
              {watch('tags') && <ReviewRow label="Tags" value={watch('tags')} />}
            </div>
            <p className="text-xs text-stone-500">
              Your dataset will be submitted for review before it becomes publicly visible.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0}>
            <ChevronLeft size={16} /> Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Next <ChevronRight size={16} />
            </Button>
          ) : (
            <Button type="submit" loading={mutation.isPending}>
              <Upload size={16} /> Submit Dataset
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

function ReviewRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-3 px-4 py-3">
      <span className="text-stone-400 w-36 shrink-0">{label}</span>
      <span className="text-stone-800 font-medium">{value}</span>
    </div>
  )
}

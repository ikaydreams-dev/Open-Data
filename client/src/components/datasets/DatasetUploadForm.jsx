import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ChevronRight, ChevronLeft, Check, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { Input } from '../shared/Input'
import { Select } from '../shared/Select'
import { Textarea } from '../shared/Textarea'
import { Button } from '../shared/Button'
import { DATASET_CATEGORIES, LICENSES, AFRICAN_COUNTRIES } from '../../lib/constants'
import { slugify } from '../../lib/utils'
import { DatasetDropzone } from './DatasetDropzone'

const STEPS = ['Basic Info', 'Files', 'Metadata', 'Review & Submit']

const categoryOptions = DATASET_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))
const licenseOptions = LICENSES
const visibilityOptions = [
  { value: 'public', label: 'Public — visible to everyone' },
  { value: 'private', label: 'Private — only you' },
  { value: 'organization', label: 'Organization — only your org members' },
]

function ReviewRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-3 px-4 py-3">
      <span className="text-stone-400 w-36 shrink-0">{label}</span>
      <span className="text-stone-800 font-medium">{value}</span>
    </div>
  )
}

/**
 * Self-contained multi-step upload form.
 * Props:
 *   onSubmit(FormData) — called with FormData when the user clicks Submit
 *   isSubmitting — shows loading state on the Submit button
 */
export function DatasetUploadForm({ onSubmit, isSubmitting = false }) {
  const [step, setStep] = useState(0)
  const [files, setFiles] = useState([])
  const [countries, setCountries] = useState([])

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({ defaultValues: { visibility: 'public' } })

  const titleValue = watch('title') ?? ''
  const generatedSlug = slugify(titleValue)

  async function handleNext() {
    const fieldMap = {
      0: ['title', 'description', 'category', 'license', 'visibility'],
      1: [],
      2: [],
    }
    const valid = await trigger(fieldMap[step] ?? [])
    if (step === 1 && files.length === 0) {
      toast.error('Please attach at least one file.')
      return
    }
    if (valid) setStep((s) => s + 1)
  }

  function handleBack() {
    setStep((s) => s - 1)
  }

  function handleAddFiles(incoming) {
    const mapped = incoming.map((f) => ({
      file: f,
      name: f.name,
      size: f.size,
      format: f.name.split('.').pop().toUpperCase(),
    }))
    setFiles((prev) => [...prev, ...mapped])
  }

  function handleRemoveFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function toggleCountry(country) {
    setCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country],
    )
  }

  function buildFormData(data) {
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
    return formData
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(buildFormData(data)))}>
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < step
                  ? 'bg-orange-700 text-white'
                  : i === step
                  ? 'bg-orange-100 text-orange-800 border-2 border-orange-700'
                  : 'bg-stone-100 text-stone-400'
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

      {/* Step 0 — Basic Info */}
      {step === 0 && (
        <div className="space-y-4">
          <Input
            label="Title"
            required
            placeholder="e.g. Nigeria Agricultural Survey 2023"
            error={errors.title?.message}
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 5, message: 'Title must be at least 5 characters' },
            })}
          />
          {generatedSlug && (
            <p className="text-xs text-stone-400 -mt-2">
              Slug: <span className="font-mono text-stone-600">{generatedSlug}</span>
            </p>
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
          <Select label="Visibility" options={visibilityOptions} {...register('visibility')} />
        </div>
      )}

      {/* Step 1 — Files */}
      {step === 1 && (
        <DatasetDropzone
          files={files}
          onAdd={handleAddFiles}
          onRemove={handleRemoveFile}
        />
      )}

      {/* Step 2 — Metadata */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Geographic Scope
            </label>
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
              <p className="text-xs text-stone-500 mt-1">
                {countries.length} {countries.length === 1 ? 'country' : 'countries'} selected
              </p>
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
          <Button type="submit" loading={isSubmitting}>
            <Upload size={16} /> Submit Dataset
          </Button>
        )}
      </div>
    </form>
  )
}

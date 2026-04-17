import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { datasetsApi } from '../../api/datasets.api'
import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/shared/Input'
import { Select } from '../../components/shared/Select'
import { Textarea } from '../../components/shared/Textarea'
import { Button } from '../../components/shared/Button'
import { PageSpinner } from '../../components/shared/Spinner'
import { DATASET_CATEGORIES, LICENSES, AFRICAN_COUNTRIES } from '../../lib/constants'

const categoryOptions = DATASET_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))
const visibilityOptions = [
  { value: 'public', label: 'Public — visible to everyone' },
  { value: 'private', label: 'Private — only you' },
  { value: 'organization', label: 'Organization — only your org members' },
]

export default function DatasetEditPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [countries, setCountries] = useState([])

  const { data: dataset, isLoading, isError } = useQuery({
    queryKey: ['dataset', slug],
    queryFn: () => datasetsApi.get(slug).then((r) => r.data),
    retry: false,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (!dataset) return
    reset({
      title: dataset.title,
      description: dataset.description ?? '',
      category: dataset.category,
      license: dataset.license,
      visibility: dataset.visibility,
      temporalCoverage: dataset.temporalCoverage ?? '',
      source: dataset.source ?? '',
      tags: dataset.tags?.join(', ') ?? '',
    })
    setCountries(dataset.geographicScope ?? [])
  }, [dataset, reset])

  const mutation = useMutation({
    mutationFn: (data) => datasetsApi.update(slug, data),
    onSuccess: (res) => {
      toast.success('Dataset updated')
      navigate(`/datasets/${res.data.slug}`)
    },
    onError: () => toast.error('Failed to save changes'),
  })

  function toggleCountry(country) {
    setCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    )
  }

  function onSubmit(data) {
    mutation.mutate({
      ...data,
      geographicScope: countries,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    })
  }

  if (isLoading) return <PageSpinner />
  if (isError || !dataset) return null

  const isOwner = user?._id === dataset.uploader?._id || user?.role === 'admin'
  if (!isOwner) {
    navigate('/403')
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Edit Dataset</h1>
        <p className="text-sm text-stone-500 mt-1">{dataset.title}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Title"
          required
          error={errors.title?.message}
          {...register('title', {
            required: 'Title is required',
            minLength: { value: 5, message: 'Title must be at least 5 characters' },
          })}
        />

        <Textarea
          label="Description"
          rows={4}
          {...register('description')}
        />

        <Select
          label="Category"
          required
          options={categoryOptions}
          error={errors.category?.message}
          {...register('category', { required: 'Category is required' })}
        />

        <Select
          label="License"
          required
          options={LICENSES}
          error={errors.license?.message}
          {...register('license', { required: 'License is required' })}
        />

        <Select
          label="Visibility"
          options={visibilityOptions}
          {...register('visibility')}
        />

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
          hint="Comma-separated keywords."
          {...register('tags')}
        />

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
            <p className="text-xs text-stone-500 mt-1">
              {countries.length} {countries.length === 1 ? 'country' : 'countries'} selected
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={() => navigate(`/datasets/${slug}`)}>
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            <Save size={15} /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

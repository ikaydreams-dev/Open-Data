import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { FolderPlus, Lock, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { useWorkspaces } from '../../hooks/useWorkspaces'
import { Input } from '../../components/shared/Input'
import { Textarea } from '../../components/shared/Textarea'
import { Button } from '../../components/shared/Button'
import { cn } from '../../lib/utils'

const VISIBILITY_OPTIONS = [
    {
        value: 'private',
        label: 'Private',
        description: 'Only you can see and manage this workspace.',
        icon: Lock,
    },
{
    value: 'shared',
    label: 'Shared',
    description: 'Visible to anyone you share the link with.',
    icon: Globe,
},
]

export default function WorkspaceCreate() {
    const navigate = useNavigate()
    const { createWorkspace, isCreating } = useWorkspaces()

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: { name: '', description: '', visibility: 'private' },
    })

    const selectedVisibility = watch('visibility')

    async function onSubmit(data) {
        try {
            const { data: ws } = await createWorkspace(data)
            toast.success('Workspace created')
            navigate(`/workspaces/${ws.id}`)
        } catch {
            toast.error('Failed to create workspace')
        }
    }

    return (
        <div className="max-w-xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
        <FolderPlus size={22} className="text-orange-700" />
        </div>
        <div>
        <h1 className="text-2xl font-bold text-stone-900">New Workspace</h1>
        <p className="text-sm text-stone-500 mt-0.5">
        Group related datasets into a focused collection.
        </p>
        </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <Input
        label="Workspace Name"
        required
        placeholder="e.g. Nigeria Climate Research"
        error={errors.name?.message}
        {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'At least 2 characters' },
            maxLength: { value: 100, message: 'Max 100 characters' },
        })}
        />

        <Textarea
        label="Description"
        placeholder="What is this workspace for? Describe your research goal or project."
        rows={3}
        hint="Optional — helps you remember the purpose of this workspace."
        {...register('description')}
        />

        {/* Visibility picker */}
        <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700">Visibility</label>
        <div className="grid grid-cols-2 gap-3">
        {VISIBILITY_OPTIONS.map(({ value, label, description, icon: Icon }) => {
            const selected = selectedVisibility === value
            return (
                <button
                key={value}
                type="button"
                onClick={() => setValue('visibility', value)}
                className={cn(
                    'flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-colors',
                    selected
                    ? 'border-orange-600 bg-orange-50'
                    : 'border-stone-200 bg-white hover:border-stone-300',
                )}
                >
                <div className={cn(
                    'w-8 h-8 rounded-md flex items-center justify-center',
                    selected ? 'bg-orange-100 text-orange-700' : 'bg-stone-100 text-stone-500',
                )}>
                <Icon size={16} />
                </div>
                <div>
                <p className={cn(
                    'text-sm font-semibold',
                    selected ? 'text-orange-800' : 'text-stone-800',
                )}>
                {label}
                </p>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                {description}
                </p>
                </div>
                </button>
            )
        })}
        </div>
        {/* hidden input so RHF tracks the value */}
        <input type="hidden" {...register('visibility')} />
        </div>

        <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={isCreating}>
        <FolderPlus size={15} />
        Create Workspace
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate('/workspaces')}>
        Cancel
        </Button>
        </div>
        </form>
        </div>
    )
}

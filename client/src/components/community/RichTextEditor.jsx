import { useState } from 'react'
import { Textarea } from '../shared/Textarea'
import { Button } from '../shared/Button'
import { Bold, Italic, Link } from 'lucide-react'

export function RichTextEditor({ value, onChange, placeholder = "Write your content here..." }) {
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)

  const handleBold = () => {
    // Simple toggle - in a real rich editor, this would wrap selection
    setIsBold(!isBold)
  }

  const handleItalic = () => {
    setIsItalic(!isItalic)
  }

  const handleLink = () => {
    // Simple link insertion
    const url = prompt('Enter URL:')
    if (url) {
      onChange(value + ` [${url}](${url})`)
    }
  }

  return (
    <div className="border border-stone-300 rounded-md">
      <div className="flex items-center gap-1 p-2 border-b border-stone-200 bg-stone-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBold}
          className={`p-1 h-6 w-6 ${isBold ? 'bg-stone-200' : ''}`}
        >
          <Bold size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleItalic}
          className={`p-1 h-6 w-6 ${isItalic ? 'bg-stone-200' : ''}`}
        >
          <Italic size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLink}
          className="p-1 h-6 w-6"
        >
          <Link size={14} />
        </Button>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="border-0 rounded-none focus:ring-0"
      />
    </div>
  )
}
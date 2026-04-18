import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '../shared/Button'

export function VoteButtons({ initialVotes = 0 }) {
  const [votes, setVotes] = useState(initialVotes)
  const [userVote, setUserVote] = useState(null) // 'up', 'down', or null

  const handleUpvote = () => {
    if (userVote === 'up') {
      setVotes(votes - 1)
      setUserVote(null)
    } else if (userVote === 'down') {
      setVotes(votes + 2)
      setUserVote('up')
    } else {
      setVotes(votes + 1)
      setUserVote('up')
    }
  }

  const handleDownvote = () => {
    if (userVote === 'down') {
      setVotes(votes + 1)
      setUserVote(null)
    } else if (userVote === 'up') {
      setVotes(votes - 2)
      setUserVote('down')
    } else {
      setVotes(votes - 1)
      setUserVote('down')
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUpvote}
        className={`p-1 h-8 w-8 ${userVote === 'up' ? 'text-orange-600 bg-orange-50' : 'text-stone-600 hover:text-orange-600'}`}
      >
        <ChevronUp size={16} />
      </Button>

      <span className="text-sm font-medium text-stone-700 min-w-[2rem] text-center">
        {votes}
      </span>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownvote}
        className={`p-1 h-8 w-8 ${userVote === 'down' ? 'text-red-600 bg-red-50' : 'text-stone-600 hover:text-red-600'}`}
      >
        <ChevronDown size={16} />
      </Button>
    </div>
  )
}
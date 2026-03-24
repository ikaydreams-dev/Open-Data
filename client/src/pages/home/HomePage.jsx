import { Link } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import { DATASET_CATEGORIES } from '../../lib/constants'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-800 to-orange-600 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Africa's Open Data Platform
          </h1>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
            Access, share, and contribute curated datasets across every sector of the African continent.
          </p>
          <form action="/search" className="relative max-w-lg mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              name="q"
              placeholder="Search datasets — healthcare, agriculture, climate…"
              className="w-full pl-11 pr-4 py-3 rounded-full text-stone-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-700 text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-orange-800">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-stone-800">Browse by Category</h2>
          <Link to="/datasets" className="text-sm text-orange-700 font-medium flex items-center gap-1 hover:underline">
            All datasets <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {DATASET_CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              to={`/datasets?category=${cat.value}`}
              className="p-4 rounded-xl border border-stone-200 bg-white hover:border-orange-300 hover:shadow-sm transition-all text-center group"
            >
              <p className="text-sm font-medium text-stone-800 group-hover:text-orange-700">{cat.label}</p>
              <p className="text-xs text-stone-400 mt-0.5">{cat.subcategories.length} topics</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

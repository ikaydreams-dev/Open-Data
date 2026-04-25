export function DatasetPreviewTable({ headers = [], rows = [], maxRows = 10 }) {
  if (headers.length === 0 || rows.length === 0) {
    return (
      <p className="text-sm text-stone-400 text-center py-4">
        No preview data available.
      </p>
    )
  }

  const displayRows = rows.slice(0, maxRows)

  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-stone-50">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-3 py-2 font-medium text-stone-600 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {displayRows.map((row, i) => (
            <tr key={i} className="hover:bg-stone-50">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-3 py-2 text-stone-700 whitespace-nowrap max-w-48 truncate"
                >
                  {cell ?? <span className="text-stone-300 italic">null</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

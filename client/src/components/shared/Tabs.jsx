// src/components/shared/Tabs.jsx
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react'
import { cn } from '../../lib/utils'

// tabs shape: [{ label, content, icon?, disabled?, count? }]
export function Tabs({
  tabs = [],
  defaultIndex = 0,
  onChange,
  variant = 'underline',
  className,
}) {
  const tabVariants = {
    // Classic underline tabs (e.g. profile page sections)
    underline: {
      list: 'flex gap-1 border-b border-stone-200',
      tab: (selected) =>
        cn(
          'px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none',
          'border-b-2 -mb-px',
          selected
            ? 'border-orange-600 text-orange-700'
            : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300',
          'disabled:opacity-40 disabled:cursor-not-allowed',
        ),
    },
    // Pill/chip tabs (e.g. filter toggles)
    pills: {
      list: 'flex gap-2 flex-wrap',
      tab: (selected) =>
        cn(
          'px-3 py-1.5 text-sm font-medium rounded-full transition-colors focus:outline-none',
          'focus:ring-2 focus:ring-orange-500 focus:ring-offset-1',
          selected
            ? 'bg-orange-700 text-white'
            : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
          'disabled:opacity-40 disabled:cursor-not-allowed',
        ),
    },
    // Boxed tabs (e.g. dataset detail sections)
    boxed: {
      list: 'flex gap-1 bg-stone-100 p-1 rounded-lg',
      tab: (selected) =>
        cn(
          'px-4 py-1.5 text-sm font-medium rounded-md transition-colors focus:outline-none',
          'focus:ring-2 focus:ring-orange-500 focus:ring-offset-1',
          selected
            ? 'bg-white text-stone-900 shadow-sm'
            : 'text-stone-500 hover:text-stone-700',
          'disabled:opacity-40 disabled:cursor-not-allowed',
        ),
    },
  }

  const styles = tabVariants[variant]

  return (
    <TabGroup
      defaultIndex={defaultIndex}
      onChange={onChange}
      className={cn('flex flex-col gap-4', className)}
    >
      <TabList className={styles.list}>
        {tabs.map((tab) => (
          <Tab
            key={tab.label}
            disabled={tab.disabled}
            className={({ selected }) => styles.tab(selected)}
          >
            <span className="inline-flex items-center gap-1.5">
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium',
                    'bg-stone-200 text-stone-600',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </Tab>
        ))}
      </TabList>

      <TabPanels>
        {tabs.map((tab) => (
          <TabPanel key={tab.label} className="focus:outline-none">
            {tab.content}
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  )
}

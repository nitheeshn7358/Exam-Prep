import { useState } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Grid3X3, Layers, LayoutList } from 'lucide-react'

const SWIPE_THRESHOLD = 50

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

const layoutIcons = { stack: Layers, grid: Grid3X3, list: LayoutList }

export function MorphingCardStack({
  cards = [],
  className = '',
  defaultLayout = 'stack',
  onCardClick,
}) {
  const [layout, setLayout] = useState(defaultLayout)
  const [expandedCard, setExpandedCard] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  if (!cards.length) return null

  const handleDragEnd = (_event, info) => {
    const { offset, velocity } = info
    const swipe = Math.abs(offset.x) * velocity.x
    if (offset.x < -SWIPE_THRESHOLD || swipe < -1000) {
      setActiveIndex((prev) => (prev + 1) % cards.length)
    } else if (offset.x > SWIPE_THRESHOLD || swipe > 1000) {
      setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length)
    }
    setIsDragging(false)
  }

  const getStackOrder = () => {
    const reordered = []
    for (let i = 0; i < cards.length; i++) {
      const index = (activeIndex + i) % cards.length
      reordered.push({ ...cards[index], stackPosition: i })
    }
    return reordered.reverse()
  }

  const getLayoutStyles = (stackPosition) => {
    if (layout === 'stack') {
      return {
        top: stackPosition * 10,
        left: stackPosition * 10,
        zIndex: cards.length - stackPosition,
        rotate: (stackPosition - 1) * 2,
      }
    }
    return { top: 0, left: 0, zIndex: 1, rotate: 0 }
  }

  const containerStyles = {
    stack: 'relative h-72 w-72 sm:h-80 sm:w-80',
    grid: 'grid grid-cols-2 gap-4 w-full max-w-xl',
    list: 'flex flex-col gap-3 w-full max-w-sm',
  }

  const displayCards =
    layout === 'stack'
      ? getStackOrder()
      : cards.map((c, i) => ({ ...c, stackPosition: i }))

  return (
    <div className={cn('space-y-5', className)}>
      {/* Layout toggle */}
      <div className="flex items-center justify-center gap-1 rounded-xl bg-gray-100 p-1 w-fit mx-auto shadow-inner">
        {Object.keys(layoutIcons).map((mode) => {
          const Icon = layoutIcons[mode]
          return (
            <button
              key={mode}
              onClick={() => setLayout(mode)}
              className={cn(
                'rounded-lg p-2 transition-all duration-200',
                layout === mode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200',
              )}
              aria-label={`Switch to ${mode} layout`}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </div>

      {/* Cards container */}
      <LayoutGroup>
        <motion.div layout className={cn(containerStyles[layout], 'mx-auto')}>
          <AnimatePresence mode="popLayout">
            {displayCards.map((card) => {
              const styles = getLayoutStyles(card.stackPosition)
              const isExpanded = expandedCard === card.id
              const isTopCard = layout === 'stack' && card.stackPosition === 0

              return (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{
                    opacity: 1,
                    scale: isExpanded ? 1.04 : 1,
                    x: 0,
                    ...styles,
                  }}
                  exit={{ opacity: 0, scale: 0.85, x: -200 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  drag={isTopCard ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
                  onClick={() => {
                    if (isDragging) return
                    setExpandedCard(isExpanded ? null : card.id)
                    onCardClick?.(card)
                  }}
                  className={cn(
                    'relative rounded-2xl border bg-white p-5 shadow-sm',
                    'hover:border-indigo-300 hover:shadow-md transition-all duration-200',
                    layout === 'stack' && 'absolute w-64 h-52 sm:w-72 sm:h-56',
                    layout === 'stack' && isTopCard && 'cursor-grab active:cursor-grabbing',
                    layout === 'grid' && 'w-full aspect-square',
                    layout === 'list' && 'w-full',
                    isExpanded ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-gray-100',
                  )}
                >
                  <div className="flex items-start gap-3">
                    {card.icon && (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                        {card.icon}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-800 truncate">{card.title}</h3>
                      <p
                        className={cn(
                          'text-sm text-gray-500 mt-1 leading-relaxed',
                          layout === 'stack' && 'line-clamp-3',
                          layout === 'grid' && 'line-clamp-3',
                          layout === 'list' && 'line-clamp-2',
                        )}
                      >
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Subtle indigo accent line at bottom of top card */}
                  {isTopCard && (
                    <div className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-60" />
                  )}

                  {isTopCard && (
                    <div className="absolute bottom-3 left-0 right-0 text-center">
                      <span className="text-[10px] text-gray-300 tracking-wide">Swipe to navigate</span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {/* Dot navigation (stack mode only) */}
      {layout === 'stack' && cards.length > 1 && (
        <div className="flex justify-center gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                index === activeIndex
                  ? 'w-5 bg-indigo-500'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400',
              )}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

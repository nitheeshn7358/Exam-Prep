export function TestimonialCard({ text, author, href }) {
  const Card = href ? 'a' : 'div'

  return (
    <Card
      {...(href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={[
        'flex w-[22rem] shrink-0 flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm p-6 shadow-sm',
        href ? 'hover:shadow-md hover:border-blue-400/30 hover:bg-white/[0.08] transition-all duration-200 cursor-pointer' : '',
      ].join(' ')}
    >
      {/* Quote text */}
      <p className="text-sm text-gray-300 leading-relaxed flex-1">"{text}"</p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-1 border-t border-white/10">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{
            background: `linear-gradient(135deg, ${author.avatarColor ?? '#6366f1'}, ${author.avatarColor2 ?? '#9333ea'})`,
          }}
        >
          {author.name?.[0] ?? '?'}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">{author.name}</p>
          <p className="text-xs text-gray-500 truncate">{author.handle ?? author.role}</p>
        </div>

        {/* Optional star rating */}
        {author.rating && (
          <div className="ml-auto flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${i < author.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

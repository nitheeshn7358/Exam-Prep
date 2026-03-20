import { TestimonialCard } from './TestimonialCard'

export function TestimonialsSection({ title, description, testimonials, className = '' }) {
  return (
    <section className={`py-16 sm:py-24 px-0 ${className}`}>
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 text-center">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 px-8">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Loved by students
          </p>
          <h2 className="max-w-2xl text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            {title}
          </h2>
          <p className="max-w-xl text-sm sm:text-base text-gray-400 font-medium">
            {description}
          </p>
        </div>

        {/* Marquee */}
        <div className="group relative w-full overflow-hidden">
          {/*
            Single flex row with two identical copies of all cards.
            translateX(-50%) moves exactly one copy width — since both copies
            are identical the reset is invisible, giving a perfectly seamless loop.
            The gap between cards applies uniformly, including at the wrap point.
          */}
          <div
            className="flex w-max animate-marquee gap-6 group-hover:[animation-play-state:paused]"
          >
            {[0, 1].map(copy => (
              <div key={copy} className="flex gap-6 shrink-0">
                {testimonials.map((t, i) => (
                  <TestimonialCard key={i} {...t} />
                ))}
                {/* Small breathing gap after last card in each copy */}
                <div className="w-8 shrink-0" />
              </div>
            ))}
          </div>

          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-[#060d1f] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-[#060d1f] to-transparent" />
        </div>

      </div>
    </section>
  )
}

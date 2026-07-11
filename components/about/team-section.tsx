'use client'

import { FadeUp } from '@/components/motion/fade-up'
import { HoverZoom } from '@/components/motion/hover-zoom'
import { OptimizedImage } from '@/components/optimized-image'
import type { TeamMember } from '@/lib/data'

export interface TeamSectionProps {
  team: TeamMember[]
}

export function TeamSection({ team }: TeamSectionProps) {
  const aspectClasses = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-[3/5]', 'aspect-[4/5]']

  return (
    <section className="bg-background py-28 md:py-40">
      <div className="container-wide">
        <FadeUp className="mb-12 max-w-2xl">
          <h2 className="text-headline font-serif font-light text-ink">The Team</h2>
          <p className="mt-4 text-body text-ink/80">
            A carefully assembled group of experienced real estate professionals, each bringing distinctive expertise
            to the partnership.
          </p>
        </FadeUp>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, idx) => (
            <FadeUp key={member.name} delay={idx * 100}>
              <div className="group">
                <HoverZoom className={`${aspectClasses[idx % aspectClasses.length]} bg-border`}>
                  <OptimizedImage
                    src={member.image}
                    alt={member.name}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </HoverZoom>
                <div className="pt-6">
                  <h3 className="text-subhead font-serif font-light text-ink">
                    <span className="text-gold">{member.name.split(' ')[0]}</span>{' '}
                    {member.name.split(' ').slice(1).join(' ')}
                  </h3>
                  <div className="mt-2 flex items-center gap-3">
                    <p className="text-caption text-ink/70">{member.role}</p>
                    {member.linkedinUrl && (
                      <a
                        href={member.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                        className="text-ink/30 transition-colors hover:text-gold"
                      >
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

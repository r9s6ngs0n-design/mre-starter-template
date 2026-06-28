import { EnquiryForm } from "@/components/enquiry-form"

interface EnquirySectionProps {
  title?: string
  presetType?: string
}

export function EnquirySection({ title = "Start a conversation", presetType }: EnquirySectionProps) {
  return (
    <section className="border-t border-border bg-muted/20 py-12 md:py-16">
      <div className="container-wide max-w-xl">
        <h2 className="font-serif text-2xl font-light text-ink md:text-3xl">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Leave your details and we&apos;ll be in touch within one business day.
        </p>
        <div className="mt-8">
          <EnquiryForm compact presetType={presetType} />
        </div>
      </div>
    </section>
  )
}

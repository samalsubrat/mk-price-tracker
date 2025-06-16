import { ContactForm } from "@/components/ContactForm"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us | MK Price Tracker",
  description: "Get in touch with our team for support, feedback, or partnership inquiries.",
}

export default function ContactPage() {
  return (
    <div className="relative overflow-hidden pt-16 pb-20 sm:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 to-pink-50/20 z-0" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-400/10 rounded-full blur-3xl animate-pulse z-0" />

      <MaxWidthWrapper className="relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions about our price tracking service? Want to suggest a new feature or report an issue? We'd
              love to hear from you!
            </p>
          </div>

          <div className=" mx-auto">
            <ContactForm />
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  )
}

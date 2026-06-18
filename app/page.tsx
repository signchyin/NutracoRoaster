import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesGrid } from "@/components/features-grid"
import { FeatureShowcase } from "@/components/feature-showcase"
import { PricingSection } from "@/components/pricing-section"
import { CtaSection, SiteFooter } from "@/components/cta-footer"

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <FeaturesGrid />
        <FeatureShowcase />
        <PricingSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  )
}

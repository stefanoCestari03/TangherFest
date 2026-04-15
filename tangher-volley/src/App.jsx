import Hero from './Hero'
import InfoSection from './InfoSection'
import FormSection from './FormSection'
import Footer from './Footer'

export default function App() {
  const scrollToForm = () => {
    document.getElementById('iscrizione')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Hero onCta={scrollToForm} />
      <InfoSection />
      <FormSection />
      <Footer />
    </>
  )
}

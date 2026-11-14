import { Nav } from "@/components/kalibre/Nav"
import { Accounts, Community, Footer, Hero, Priority } from "@/components/kalibre/Sections"
import { Steps } from "@/components/kalibre/Steps"
import { Drawdown } from "@/components/kalibre/Drawdown"
import { Caroline } from "@/components/kalibre/Caroline"

export default function KalibrePage() {
  return (
    <div id="top" className="kt-page">
      <span className="kt-top-wash" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        <Steps />
        <Accounts />
        <Drawdown />
        <Caroline />
        <Community />
        <Priority />
      </main>
      <Footer />
    </div>
  )
}

/**
 * Landing Page
 * Combines all landing components
 */

import { useState } from 'react'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { UpcomingFeatures } from '@/components/landing/UpcomingFeatures'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Footer } from '@/components/landing/Footer'
import { LoginModal } from '@/components/auth/LoginModal'

export function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  const handleLoginClick = () => {
    setIsLoginModalOpen(true)
  }

  const handleLoginClose = () => {
    setIsLoginModalOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLoginClick={handleLoginClick} />
      <main className="flex-1">
        <Hero onGetStarted={handleLoginClick} />
        <Features />
        <UpcomingFeatures />
        <HowItWorks />
      </main>
      <Footer />
      <LoginModal isOpen={isLoginModalOpen} onClose={handleLoginClose} />
    </div>
  )
}

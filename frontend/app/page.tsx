'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header/header'
import Footer from '@/components/Footer/footer'
import LandingPage from '@/components/LandingPage/LandingPage'
import { getUserFromCookie } from '@/lib/cookie-utils'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    // Check if user is logged in using the new secure utility
    const user = getUserFromCookie()
    
    if (user) {
      // Redirect to chat page if user is already logged in
      router.push('/chat')
    }
  }, [router])

  return (
    <div>
      <Header />
      <LandingPage />
      <Footer />
    </div>
  );
}

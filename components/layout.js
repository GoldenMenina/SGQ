// components/Layout.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Box, Container } from '@chakra-ui/react'
import supabase from '../lib/supabaseClient'

const Layout = ({ children }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)

      // Redirect to login if not authenticated and not on the login page
      if (!session && router.pathname !== '/login') {
        router.push('/login')
      }

      // Redirect to homepage if authenticated and on the login page
      if (session && router.pathname === '/login') {
        router.push('/')
      }
    }

    checkSession()

    // Set up a listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
      if (!session && router.pathname !== '/login') {
        router.push('/login')
      } else if (session && router.pathname === '/login') {
        router.push('/')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [router])

  if (loading) {
    return <Box>Loading...</Box> // Optionally show a loading spinner or message
  }

  return (
    <Box>
      <Container maxW="container.lg" py={4}>
        {children}
      </Container>
    </Box>
  )
}

export default Layout
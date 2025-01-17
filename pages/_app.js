// pages/_app.js
import { ChakraProvider } from '@chakra-ui/react'
import Layout from '../components/layout'

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  )
}

export default MyApp
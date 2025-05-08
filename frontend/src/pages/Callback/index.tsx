import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { jwtToAddress } from '@mysten/sui/zklogin'
import {
  decodeIdToken,
  fetchSalt,
  parseIdTokenFromUrl,
  setZkloginAddress,
} from '../../service/SuiZkLoginService'

export default function Callback() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const idToken = parseIdTokenFromUrl()

        if (!idToken) throw new Error('Missing id_token in URL')

        sessionStorage.setItem('google-id-token', idToken)

        const decodedJwt = decodeIdToken(idToken)

        const salt = await fetchSalt(decodedJwt.iss, decodedJwt.sub)

        const zkLoginUserAddress = jwtToAddress(idToken, salt)

        setZkloginAddress(zkLoginUserAddress)
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
        navigate('/')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      {loading && (
        <>
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-lg">Logging you in via Zklogin...</p>
        </>
      )}
      {error && <p className="text-red-500 text-lg">❌ {error}</p>}
    </div>
  )
}

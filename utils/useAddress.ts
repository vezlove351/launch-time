import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

export function useAddress() {
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    async function getAddress() {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        try {
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          setAddress(address)
        } catch (error) {
          console.error('Error connecting to wallet:', error)
        }
      }
    }
    getAddress()
  }, [])

  return address
}


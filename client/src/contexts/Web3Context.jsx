import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

const Web3Context = createContext()

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  // Platform fee contract address (you'll deploy this)
  const PLATFORM_FEE_ADDRESS = "0x1234567890123456789012345678901234567890" // Replace with actual address
  const PLATFORM_FEE_AMOUNT = ethers.parseEther("0.001") // 0.001 ETH

  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          await connectWallet()
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed!')
      return false
    }

    setLoading(true)
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      setAccount(accounts[0])
      setProvider(provider)
      setSigner(signer)
      setIsConnected(true)

      toast.success('Wallet connected successfully!')
      return true
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast.error('Failed to connect wallet')
      return false
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setIsConnected(false)
    toast.success('Wallet disconnected')
  }

  const payPlatformFee = async () => {
    if (!isConnected || !signer) {
      toast.error('Please connect your wallet first')
      return false
    }

    setLoading(true)
    try {
      const tx = await signer.sendTransaction({
        to: PLATFORM_FEE_ADDRESS,
        value: PLATFORM_FEE_AMOUNT
      })

      toast.promise(
        tx.wait(),
        {
          loading: 'Processing payment...',
          success: 'Payment successful!',
          error: 'Payment failed'
        }
      )

      await tx.wait()
      return true
    } catch (error) {
      console.error('Error paying platform fee:', error)
      toast.error('Payment failed: ' + error.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const getBalance = async () => {
    if (!isConnected || !provider) return '0'
    try {
      const balance = await provider.getBalance(account)
      return ethers.formatEther(balance)
    } catch (error) {
      console.error('Error getting balance:', error)
      return '0'
    }
  }

  const switchNetwork = async (chainId) => {
    if (!isConnected) return false
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      })
      return true
    } catch (error) {
      console.error('Error switching network:', error)
      return false
    }
  }

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
        } else {
          disconnectWallet()
        }
      })

      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }
  }, [])

  const value = {
    account,
    provider,
    signer,
    isConnected,
    loading,
    connectWallet,
    disconnectWallet,
    payPlatformFee,
    getBalance,
    switchNetwork,
    PLATFORM_FEE_AMOUNT
  }

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  )
} 
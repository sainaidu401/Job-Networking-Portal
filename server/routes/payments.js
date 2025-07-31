const express = require('express')
const { body, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const { ethers } = require('ethers')

const router = express.Router()

// Platform fee configuration
const PLATFORM_FEE_AMOUNT = ethers.parseEther("0.001") // 0.001 ETH
const PLATFORM_WALLET_ADDRESS = process.env.PLATFORM_WALLET_ADDRESS || "0x1234567890123456789012345678901234567890"

// Validators
const isValidTxHash = value =>
  /^0x([A-Fa-f0-9]{64})$/.test(value)

const isValidEthAddress = value =>
  /^0x[a-fA-F0-9]{40}$/.test(value)

// --- POST /verify ---
router.post('/verify', auth, [
  body('transactionHash')
    .custom(isValidTxHash)
    .withMessage('Invalid transaction hash'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number'),
  body('to')
    .custom(isValidEthAddress)
    .withMessage('Invalid recipient address')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
    }

    const { transactionHash, amount, to } = req.body
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL)

    const tx = await provider.getTransaction(transactionHash)
    if (!tx) return res.status(400).json({ message: 'Transaction not found' })

    if (tx.to.toLowerCase() !== to.toLowerCase())
      return res.status(400).json({ message: 'Transaction recipient does not match' })

    if (tx.value.toString() !== amount)
      return res.status(400).json({ message: 'Transaction amount does not match' })

    const receipt = await tx.wait()
    if (receipt.status === 1) {
      return res.json({
        message: 'Payment verified successfully',
        transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      })
    } else {
      return res.status(400).json({ message: 'Transaction failed' })
    }
  } catch (error) {
    console.error('Transaction verification error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// --- POST /platform-fee ---
router.post('/platform-fee', auth, [
  body('transactionHash')
    .custom(isValidTxHash)
    .withMessage('Invalid transaction hash')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
    }

    const { transactionHash } = req.body
    const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL)

    const tx = await provider.getTransaction(transactionHash)
    if (!tx) return res.status(400).json({ message: 'Transaction not found' })

    if (tx.to.toLowerCase() !== PLATFORM_WALLET_ADDRESS.toLowerCase())
      return res.status(400).json({ message: 'Incorrect recipient for platform fee' })

    if (tx.value.toString() !== PLATFORM_FEE_AMOUNT.toString())
      return res.status(400).json({ message: 'Incorrect platform fee amount' })

    const receipt = await tx.wait()
    if (receipt.status === 1) {
      return res.json({
        message: 'Platform fee paid successfully',
        transactionHash,
        amount: ethers.formatEther(PLATFORM_FEE_AMOUNT),
        blockNumber: receipt.blockNumber
      })
    } else {
      return res.status(400).json({ message: 'Platform fee payment failed' })
    }
  } catch (error) {
    console.error('Platform fee error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// --- GET /platform-fee-info ---
router.get('/platform-fee-info', (req, res) => {
  res.json({
    amount: ethers.formatEther(PLATFORM_FEE_AMOUNT),
    currency: 'ETH',
    walletAddress: PLATFORM_WALLET_ADDRESS,
    description: 'Platform fee for job posting'
  })
})

// --- POST /escrow ---
router.post('/escrow', auth, [
  body('jobId').isMongoId().withMessage('Invalid job ID'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('recipientAddress').custom(isValidEthAddress).withMessage('Invalid recipient address')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
    }

    const { jobId, amount, recipientAddress } = req.body

    return res.json({
      message: 'Escrow created successfully',
      escrowId: `escrow_${Date.now()}`,
      amount: ethers.formatEther(amount),
      recipientAddress,
      status: 'pending'
    })
  } catch (error) {
    console.error('Escrow creation error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// --- POST /release-escrow ---
router.post('/release-escrow', auth, [
  body('escrowId').notEmpty().withMessage('Escrow ID is required'),
  body('transactionHash').custom(isValidTxHash).withMessage('Invalid transaction hash')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
    }

    const { escrowId, transactionHash } = req.body

    return res.json({
      message: 'Escrow released successfully',
      escrowId,
      transactionHash,
      status: 'released'
    })
  } catch (error) {
    console.error('Escrow release error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// --- GET /history ---
router.get('/history', auth, async (req, res) => {
  try {
    const { page = 1 } = req.query

    const mockPayments = [
      {
        id: 'payment_1',
        type: 'platform_fee',
        amount: '0.001',
        currency: 'ETH',
        status: 'completed',
        transactionHash: '0x1234567890abcdef...1',
        timestamp: new Date().toISOString()
      },
      {
        id: 'payment_2',
        type: 'escrow',
        amount: '0.5',
        currency: 'ETH',
        status: 'pending',
        transactionHash: '0xabcdef1234567890...2',
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ]

    res.json({
      payments: mockPayments,
      pagination: {
        current: parseInt(page),
        pages: 1,
        total: mockPayments.length,
        hasNext: false,
        hasPrev: false
      }
    })
  } catch (error) {
    console.error('Payment history error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router

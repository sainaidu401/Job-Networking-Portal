const express = require('express')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  })
}

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password')
    }
    return true
  })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { 
      name, 
      email, 
      password, 
      bio, 
      linkedinUrl, 
      skills, 
      experienceLevel, 
      location, 
      remote, 
      walletAddress 
    } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      bio,
      linkedinUrl,
      skills: skills || [],
      experienceLevel,
      location,
      remote,
      walletAddress
    })

    // Update profile completion status
    user.updateProfileCompletion()

    await user.save()

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        experienceLevel: user.experienceLevel,
        location: user.location,
        remote: user.remote,
        walletAddress: user.walletAddress,
        profileCompleted: user.profileCompleted,
        stats: user.stats
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Server error during registration' })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    // Generate token
    const token = generateToken(user._id)

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        experienceLevel: user.experienceLevel,
        location: user.location,
        remote: user.remote,
        walletAddress: user.walletAddress,
        profileCompleted: user.profileCompleted,
        stats: user.stats
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error during login' })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio must be less than 1000 characters'),
  body('linkedinUrl').optional().isURL().withMessage('Please provide a valid LinkedIn URL'),
  body('experienceLevel').optional().isIn(['entry', 'junior', 'mid', 'senior', 'lead']).withMessage('Invalid experience level'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('remote').optional().isBoolean().withMessage('Remote must be a boolean value')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update fields
    const updateFields = ['name', 'bio', 'linkedinUrl', 'experienceLevel', 'location', 'remote']
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field]
      }
    })

    // Handle skills separately
    if (req.body.skills) {
      user.skills = req.body.skills
    }

    // Update profile completion status
    user.updateProfileCompletion()

    await user.save()

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        experienceLevel: user.experienceLevel,
        location: user.location,
        remote: user.remote,
        walletAddress: user.walletAddress,
        profileCompleted: user.profileCompleted,
        stats: user.stats
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ message: 'Server error during profile update' })
  }
})

// @route   POST /api/auth/wallet-login
// @desc    Login with wallet signature
// @access  Public
router.post('/wallet-login', [
  body('walletAddress').isEthereumAddress().withMessage('Please provide a valid wallet address'),
  body('signature').exists().withMessage('Signature is required'),
  body('message').exists().withMessage('Message is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { walletAddress, signature, message } = req.body

    // Verify signature (you would implement proper signature verification here)
    // For demo purposes, we'll just check if the wallet address exists
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() })
    
    if (!user) {
      return res.status(400).json({ message: 'No user found with this wallet address' })
    }

    // Generate token
    const token = generateToken(user._id)

    res.json({
      message: 'Wallet login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        skills: user.skills,
        experienceLevel: user.experienceLevel,
        location: user.location,
        remote: user.remote,
        walletAddress: user.walletAddress,
        profileCompleted: user.profileCompleted,
        stats: user.stats
      }
    })
  } catch (error) {
    console.error('Wallet login error:', error)
    res.status(500).json({ message: 'Server error during wallet login' })
  }
})

// @route   POST /api/auth/connect-wallet
// @desc    Connect wallet to existing account
// @access  Private
router.post('/connect-wallet', auth, [
  body('walletAddress').isEthereumAddress().withMessage('Please provide a valid wallet address')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    const { walletAddress } = req.body

    // Check if wallet is already connected to another account
    const existingWalletUser = await User.findOne({ 
      walletAddress: walletAddress.toLowerCase(),
      _id: { $ne: req.user.id }
    })
    
    if (existingWalletUser) {
      return res.status(400).json({ message: 'This wallet is already connected to another account' })
    }

    // Update user's wallet address
    const user = await User.findById(req.user.id)
    user.walletAddress = walletAddress.toLowerCase()
    await user.save()

    res.json({
      message: 'Wallet connected successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress
      }
    })
  } catch (error) {
    console.error('Connect wallet error:', error)
    res.status(500).json({ message: 'Server error during wallet connection' })
  }
})

module.exports = router 
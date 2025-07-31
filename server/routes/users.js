const express = require('express')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/users/search
// @desc    Search users by skills, location, etc.
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const {
      q,
      skills,
      location,
      experienceLevel,
      page = 1,
      limit = 10
    } = req.query

    const filters = {}
    
    // Text search
    if (q) {
      filters.$text = { $search: q }
    }
    
    // Skills filter
    if (skills) {
      filters.skills = { $in: skills.split(',').map(s => new RegExp(s.trim(), 'i')) }
    }
    
    // Location filter
    if (location) {
      filters.location = new RegExp(location, 'i')
    }
    
    // Experience level filter
    if (experienceLevel) {
      filters.experienceLevel = experienceLevel
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const users = await User.find(filters)
      .select('-password -email -preferences')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await User.countDocuments(filters)

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + users.length < total,
        hasPrev: parseInt(page) > 1
      }
    })
  } catch (error) {
    console.error('Search users error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email -preferences')
      .populate('stats')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// @route   PUT /api/users/profile
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

// @route   POST /api/users/skills
// @desc    Add skill to user profile
// @access  Private
router.post('/skills', auth, [
  body('skill').trim().notEmpty().withMessage('Skill cannot be empty')
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

    const { skill } = req.body

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.addSkill(skill)
    user.updateProfileCompletion()
    await user.save()

    res.json({
      message: 'Skill added successfully',
      skills: user.skills
    })
  } catch (error) {
    console.error('Add skill error:', error)
    res.status(500).json({ message: 'Server error during skill addition' })
  }
})

// @route   DELETE /api/users/skills/:skill
// @desc    Remove skill from user profile
// @access  Private
router.delete('/skills/:skill', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.removeSkill(req.params.skill)
    user.updateProfileCompletion()
    await user.save()

    res.json({
      message: 'Skill removed successfully',
      skills: user.skills
    })
  } catch (error) {
    console.error('Remove skill error:', error)
    res.status(500).json({ message: 'Server error during skill removal' })
  }
})

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ stats: user.stats })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router 
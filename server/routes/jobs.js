const express = require('express')
const { body, validationResult } = require('express-validator')
const Job = require('../models/Job')
const User = require('../models/User')
const auth = require('../middleware/auth')
const natural = require('natural')

const router = express.Router()

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer()
const tfidf = new natural.TfIdf()

// @route   GET /api/jobs
// @desc    Get all jobs with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      skills,
      location,
      experienceLevel,
      jobType,
      remote,
      minBudget,
      maxBudget,
      search
    } = req.query

    const filters = {}
    
    // Add filters
    if (skills) {
      filters.skills = { $in: skills.split(',').map(s => new RegExp(s.trim(), 'i')) }
    }
    
    if (location) {
      filters.location = new RegExp(location, 'i')
    }
    
    if (experienceLevel) {
      filters.experienceLevel = experienceLevel
    }
    
    if (jobType) {
      filters.jobType = jobType
    }
    
    if (remote !== undefined) {
      filters.remote = remote === 'true'
    }
    
    if (minBudget || maxBudget) {
      filters['budget.min'] = {}
      if (minBudget) filters['budget.min'].$gte = parseFloat(minBudget)
      if (maxBudget) filters['budget.max'].$lte = parseFloat(maxBudget)
    }

    // Add search functionality
    if (search) {
      filters.$text = { $search: search }
    }

    // Add status filter
    filters.status = 'active'

    const skip = (parseInt(page) - 1) * parseInt(limit)
    
    const jobs = await Job.find(filters)
      .populate('employer', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await Job.countDocuments(filters)

    res.json({
      jobs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: skip + jobs.length < total,
        hasPrev: parseInt(page) > 1
      }
    })
  } catch (error) {
    console.error('Get jobs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Custom routes FIRST
router.get('/my-jobs', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id })
      .populate('employer', 'name location')
      .sort({ createdAt: -1 })
    res.json({ jobs })
  } catch (error) {
    console.error('Get my jobs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
});

router.get('/applications', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id })
      .populate('applications.applicant', 'name bio skills experienceLevel location')
      .sort({ createdAt: -1 })
    const applications = jobs.flatMap(job => 
      job.applications.map(app => ({
        ...app.toObject(),
        jobTitle: job.title,
        jobId: job._id
      }))
    )
    res.json({ applications })
  } catch (error) {
    console.error('Get applications error:', error)
    res.status(500).json({ message: 'Server error' })
  }
});

router.get('/recommended', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'active' })
      .populate('employer', 'name location')
      .sort({ createdAt: -1 })
    // Calculate match scores and filter
    const recommendedJobs = jobs
      .map(job => {
        const matchScore = job.calculateMatchScore(req.user)
        return { ...job.toObject(), matchScore }
      })
      .filter(job => job.matchScore > 30)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10)
    res.json({ jobs: recommendedJobs })
  } catch (error) {
    console.error('Get recommended jobs error:', error)
    res.status(500).json({ message: 'Server error' })
  }
});

// Generic ID route LAST
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name location bio skills experienceLevel')
      .populate('applications.applicant', 'name bio skills experienceLevel location')
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }
    // Increment views
    await job.incrementViews()
    res.json({ job })
  } catch (error) {
    console.error('Get job error:', error)
    res.status(500).json({ message: 'Server error' })
  }
});

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private
router.post('/', auth, [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
  body('skills').isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('experienceLevel').isIn(['entry', 'junior', 'mid', 'senior', 'lead']).withMessage('Invalid experience level'),
  body('jobType').isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship']).withMessage('Invalid job type'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('budget.min').isNumeric().withMessage('Minimum budget must be a number'),
  body('budget.max').isNumeric().withMessage('Maximum budget must be a number'),
  body('budget.currency').isIn(['USD', 'EUR', 'ETH', 'MATIC', 'SOL']).withMessage('Invalid currency')
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
      title,
      description,
      skills,
      experienceLevel,
      jobType,
      location,
      remote,
      budget,
      duration,
      paymentMethod,
      blockchainNetwork,
      tags,
      requirements,
      benefits
    } = req.body

    // Create new job
    const job = new Job({
      title,
      description,
      employer: req.user.id,
      skills,
      experienceLevel,
      jobType,
      location,
      remote: remote || false,
      budget,
      duration: duration || 'one-time',
      paymentMethod: paymentMethod || 'crypto',
      blockchainNetwork: blockchainNetwork || 'ethereum',
      tags: tags || [],
      requirements: requirements || [],
      benefits: benefits || []
    })

    await job.save()

    // Increment user's jobs posted count
    await req.user.incrementJobsPosted()
    await req.user.save()

    // Populate employer info
    await job.populate('employer', 'name location')

    res.status(201).json({
      message: 'Job posted successfully',
      job
    })
  } catch (error) {
    console.error('Create job error:', error)
    res.status(500).json({ message: 'Server error during job creation' })
  }
})

// @route   PUT /api/jobs/:id
// @desc    Update a job
// @access  Private
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  body('description').optional().trim().isLength({ min: 20, max: 5000 }).withMessage('Description must be between 20 and 5000 characters'),
  body('skills').optional().isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('experienceLevel').optional().isIn(['entry', 'junior', 'mid', 'senior', 'lead']).withMessage('Invalid experience level'),
  body('jobType').optional().isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship']).withMessage('Invalid job type'),
  body('location').optional().trim().notEmpty().withMessage('Location is required'),
  body('budget.min').optional().isNumeric().withMessage('Minimum budget must be a number'),
  body('budget.max').optional().isNumeric().withMessage('Maximum budget must be a number'),
  body('budget.currency').optional().isIn(['USD', 'EUR', 'ETH', 'MATIC', 'SOL']).withMessage('Invalid currency')
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

    const job = await Job.findById(req.params.id)
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    // Check if user is the employer
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this job' })
    }

    // Update fields
    const updateFields = [
      'title', 'description', 'skills', 'experienceLevel', 'jobType', 
      'location', 'remote', 'budget', 'duration', 'paymentMethod', 
      'blockchainNetwork', 'tags', 'requirements', 'benefits'
    ]

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        job[field] = req.body[field]
      }
    })

    await job.save()
    await job.populate('employer', 'name location')

    res.json({
      message: 'Job updated successfully',
      job
    })
  } catch (error) {
    console.error('Update job error:', error)
    res.status(500).json({ message: 'Server error during job update' })
  }
})

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    // Check if user is the employer
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this job' })
    }

    await Job.findByIdAndDelete(req.params.id)

    res.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Delete job error:', error)
    res.status(500).json({ message: 'Server error during job deletion' })
  }
})

// @route   POST /api/jobs/:id/apply
// @desc    Apply to a job
// @access  Private
router.post('/:id/apply', auth, [
  body('coverLetter').trim().isLength({ min: 10, max: 2000 }).withMessage('Cover letter must be between 10 and 2000 characters'),
  body('proposedBudget').isNumeric().withMessage('Proposed budget must be a number'),
  body('estimatedDuration').trim().notEmpty().withMessage('Estimated duration is required')
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

    const job = await Job.findById(req.params.id)
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    // Check if job is active
    if (job.status !== 'active') {
      return res.status(400).json({ message: 'This job is not accepting applications' })
    }

    // Check if user is the employer
    if (job.employer.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot apply to your own job' })
    }

    // Check if user has already applied
    const existingApplication = job.applications.find(
      app => app.applicant.toString() === req.user.id
    )
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' })
    }

    const { coverLetter, proposedBudget, estimatedDuration } = req.body

    // Calculate match score
    const matchScore = job.calculateMatchScore(req.user)

    // Create application
    const application = {
      applicant: req.user.id,
      coverLetter,
      proposedBudget,
      estimatedDuration,
      matchScore
    }

    await job.addApplication(application)

    // Increment user's applications count
    await req.user.incrementApplicationsSubmitted()
    await req.user.save()

    // Populate applicant info
    await job.populate('applications.applicant', 'name bio skills experienceLevel location')

    res.status(201).json({
      message: 'Application submitted successfully',
      application: job.applications[job.applications.length - 1]
    })
  } catch (error) {
    console.error('Apply to job error:', error)
    res.status(500).json({ message: 'Server error during application submission' })
  }
})

// @route   PUT /api/jobs/:jobId/applications/:applicationId
// @desc    Update application status
// @access  Private
router.put('/:jobId/applications/:applicationId', auth, [
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'hired', 'rejected']).withMessage('Invalid status')
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

    const job = await Job.findById(req.params.jobId)
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' })
    }

    // Check if user is the employer
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this application' })
    }

    const { status } = req.body

    await job.updateApplicationStatus(req.params.applicationId, status)

    // If hired, increment user's jobs hired count
    if (status === 'hired') {
      const application = job.applications.id(req.params.applicationId)
      if (application) {
        const applicant = await User.findById(application.applicant)
        if (applicant) {
          await applicant.incrementJobsHired()
          await applicant.save()
        }
      }
    }

    res.json({ message: 'Application status updated successfully' })
  } catch (error) {
    console.error('Update application status error:', error)
    res.status(500).json({ message: 'Server error during status update' })
  }
})

module.exports = router 
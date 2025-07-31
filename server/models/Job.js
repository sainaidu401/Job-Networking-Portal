const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead'],
    required: true
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  remote: {
    type: Boolean,
    default: false
  },
  budget: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'ETH', 'MATIC', 'SOL'],
      default: 'USD'
    }
  },
  duration: {
    type: String,
    enum: ['one-time', 'ongoing', 'fixed-term'],
    default: 'one-time'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled'],
    default: 'active'
  },
  paymentMethod: {
    type: String,
    enum: ['crypto', 'fiat', 'both'],
    default: 'crypto'
  },
  blockchainNetwork: {
    type: String,
    enum: ['ethereum', 'polygon', 'solana'],
    default: 'ethereum'
  },
  paymentVerified: {
    type: Boolean,
    default: false
  },
  paymentTransactionHash: {
    type: String,
    trim: true
  },
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    coverLetter: {
      type: String,
      required: true,
      maxlength: 2000
    },
    proposedBudget: {
      type: Number,
      required: true
    },
    estimatedDuration: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'hired', 'rejected'],
      default: 'pending'
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  }
}, {
  timestamps: true
})

// Index for search functionality
jobSchema.index({ 
  title: 'text', 
  description: 'text', 
  skills: 'text',
  location: 'text',
  tags: 'text'
})

// Index for filtering
jobSchema.index({ 
  status: 1, 
  experienceLevel: 1, 
  jobType: 1, 
  remote: 1,
  'budget.min': 1,
  'budget.max': 1,
  createdAt: -1
})

// Virtual for budget range
jobSchema.virtual('budgetRange').get(function() {
  return `${this.budget.currency} ${this.budget.min} - ${this.budget.max}`
})

// Virtual for time since posted
jobSchema.virtual('timeAgo').get(function() {
  const now = new Date()
  const diffInHours = Math.floor((now - this.createdAt) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`
  
  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths}m ago`
})

// Method to increment views
jobSchema.methods.incrementViews = function() {
  this.views += 1
  return this.save()
}

// Method to add application
jobSchema.methods.addApplication = function(applicationData) {
  this.applications.push(applicationData)
  this.applicationsCount = this.applications.length
  return this.save()
}

// Method to update application status
jobSchema.methods.updateApplicationStatus = function(applicationId, status) {
  const application = this.applications.id(applicationId)
  if (application) {
    application.status = status
    return this.save()
  }
  throw new Error('Application not found')
}

// Method to calculate match score for an applicant
jobSchema.methods.calculateMatchScore = function(applicant) {
  let score = 0
  
  // Skill match (50% weight)
  const jobSkills = this.skills.map(s => s.toLowerCase())
  const applicantSkills = applicant.skills.map(s => s.toLowerCase())
  const commonSkills = jobSkills.filter(skill => 
    applicantSkills.some(appSkill => 
      appSkill.includes(skill) || skill.includes(appSkill)
    )
  )
  const skillMatch = (commonSkills.length / Math.max(jobSkills.length, 1)) * 100
  score += skillMatch * 0.5
  
  // Experience level match (30% weight)
  const levels = ['entry', 'junior', 'mid', 'senior', 'lead']
  const jobLevel = levels.indexOf(this.experienceLevel)
  const applicantLevel = levels.indexOf(applicant.experienceLevel)
  
  if (jobLevel >= applicantLevel) {
    const experienceMatch = 100 - Math.abs(jobLevel - applicantLevel) * 20
    score += experienceMatch * 0.3
  } else {
    const experienceMatch = Math.max(0, 100 - Math.abs(jobLevel - applicantLevel) * 10)
    score += experienceMatch * 0.3
  }
  
  // Location match (20% weight)
  let locationMatch = 0
  if (this.location && applicant.location) {
    if (this.location.toLowerCase() === applicant.location.toLowerCase()) {
      locationMatch = 100
    } else if (this.remote && applicant.remote) {
      locationMatch = 80
    }
  }
  score += locationMatch * 0.2
  
  return Math.round(score)
}

// Static method to get jobs with filters
jobSchema.statics.getJobsWithFilters = function(filters = {}) {
  const query = { status: 'active' }
  
  if (filters.skills && filters.skills.length > 0) {
    query.skills = { $in: filters.skills.map(s => new RegExp(s, 'i')) }
  }
  
  if (filters.location) {
    query.location = new RegExp(filters.location, 'i')
  }
  
  if (filters.experienceLevel) {
    query.experienceLevel = filters.experienceLevel
  }
  
  if (filters.jobType) {
    query.jobType = filters.jobType
  }
  
  if (filters.remote !== undefined) {
    query.remote = filters.remote
  }
  
  if (filters.minBudget || filters.maxBudget) {
    query['budget.min'] = {}
    if (filters.minBudget) query['budget.min'].$gte = filters.minBudget
    if (filters.maxBudget) query['budget.max'].$lte = filters.maxBudget
  }
  
  return this.find(query)
    .populate('employer', 'name location')
    .sort({ createdAt: -1 })
}

// Ensure virtuals are included in JSON output
jobSchema.set('toJSON', { virtuals: true })
jobSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Job', jobSchema) 
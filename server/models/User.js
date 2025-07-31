const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  linkedinUrl: {
    type: String,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead'],
    default: 'entry'
  },
  location: {
    type: String,
    trim: true
  },
  remote: {
    type: Boolean,
    default: false
  },
  walletAddress: {
    type: String,
    trim: true,
    lowercase: true
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  subscription: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  subscriptionExpiresAt: {
    type: Date
  },
  preferences: {
    jobAlerts: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    jobsPosted: {
      type: Number,
      default: 0
    },
    applicationsSubmitted: {
      type: Number,
      default: 0
    },
    jobsHired: {
      type: Number,
      default: 0
    },
    totalEarned: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
})

// Index for search functionality
userSchema.index({ 
  name: 'text', 
  bio: 'text', 
  skills: 'text',
  location: 'text'
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject()
  delete userObject.password
  delete userObject.email
  delete userObject.preferences
  delete userObject.subscriptionExpiresAt
  return userObject
}

// Update profile completion status
userSchema.methods.updateProfileCompletion = function() {
  const requiredFields = ['name', 'bio', 'skills', 'experienceLevel', 'location']
  const completedFields = requiredFields.filter(field => 
    this[field] && (Array.isArray(this[field]) ? this[field].length > 0 : true)
  )
  
  this.profileCompleted = completedFields.length === requiredFields.length
  return this.profileCompleted
}

// Add skill method
userSchema.methods.addSkill = function(skill) {
  if (!this.skills.includes(skill)) {
    this.skills.push(skill)
  }
  return this
}

// Remove skill method
userSchema.methods.removeSkill = function(skill) {
  this.skills = this.skills.filter(s => s !== skill)
  return this
}

// Update stats methods
userSchema.methods.incrementJobsPosted = function() {
  this.stats.jobsPosted += 1
  return this
}

userSchema.methods.incrementApplicationsSubmitted = function() {
  this.stats.applicationsSubmitted += 1
  return this
}

userSchema.methods.incrementJobsHired = function() {
  this.stats.jobsHired += 1
  return this
}

userSchema.methods.addToTotalEarned = function(amount) {
  this.stats.totalEarned += amount
  return this
}

module.exports = mongoose.model('User', userSchema) 
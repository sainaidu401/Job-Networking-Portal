import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useJob } from '../contexts/JobContext'
import { useWeb3 } from '../contexts/Web3Context'
import { useAuth } from '../contexts/AuthContext'
import { 
  Plus, 
  X, 
  DollarSign, 
  MapPin, 
  Briefcase, 
  Clock,
  Wallet,
  Brain,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const JobPost = () => {
  const navigate = useNavigate()
  const { createJob, extractSkills } = useJob()
  const { payPlatformFee, isConnected, PLATFORM_FEE_AMOUNT } = useWeb3()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: [],
    experienceLevel: '',
    jobType: '',
    location: '',
    remote: false,
    budget: {
      min: '',
      max: '',
      currency: 'USD'
    },
    duration: 'one-time',
    paymentMethod: 'crypto',
    blockchainNetwork: 'ethereum',
    tags: [],
    requirements: [],
    benefits: []
  })

  const [skillInput, setSkillInput] = useState('')
  const [requirementInput, setRequirementInput] = useState('')
  const [benefitInput, setBenefitInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'junior', label: 'Junior (1-3 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior (5-8 years)' },
    { value: 'lead', label: 'Lead/Manager (8+ years)' }
  ]

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' }
  ]

  const currencies = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'ETH', label: 'ETH' },
    { value: 'MATIC', label: 'MATIC' },
    { value: 'SOL', label: 'SOL' }
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      })
    }
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      })
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const addRequirement = () => {
    if (requirementInput.trim() && !formData.requirements.includes(requirementInput.trim())) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, requirementInput.trim()]
      })
      setRequirementInput('')
    }
  }

  const removeRequirement = (requirementToRemove) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter(req => req !== requirementToRemove)
    })
  }

  const addBenefit = () => {
    if (benefitInput.trim() && !formData.benefits.includes(benefitInput.trim())) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, benefitInput.trim()]
      })
      setBenefitInput('')
    }
  }

  const removeBenefit = (benefitToRemove) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter(benefit => benefit !== benefitToRemove)
    })
  }

  const extractSkillsFromDescription = () => {
    const extractedSkills = extractSkills(formData.description)
    setFormData({
      ...formData,
      skills: [...new Set([...formData.skills, ...extractedSkills])]
    })
    toast.success(`Extracted ${extractedSkills.length} skills from description`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    setLoading(true)

    try {
      // Pay platform fee
      const paymentSuccess = await payPlatformFee()
      if (!paymentSuccess) {
        setLoading(false)
        return
      }

      // Create job
      const job = await createJob(formData)
      if (job) {
        toast.success('Job posted successfully!')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Job posting error:', error)
      toast.error('Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    return formData.title && 
           formData.description && 
           formData.skills.length > 0 && 
           formData.experienceLevel && 
           formData.jobType && 
           formData.location && 
           formData.budget.min && 
           formData.budget.max
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a New Job</h1>
          <p className="text-gray-600">Create a job posting and reach talented Web3 professionals</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 1 ? 'border-primary-600 bg-primary-600 text-black' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Job Details</span>
            </div>
            <div className={`w-16 h-0.5 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 2 ? 'border-primary-600 bg-primary-600 text-black' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
          </div>
        </div>

        {/* Wallet Connection Alert */}
        {!isConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800">
                Please connect your wallet to post a job. Platform fee: {PLATFORM_FEE_AMOUNT} ETH
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Job Details */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Senior Solidity Developer"
                  />
                </div>

                {/* Job Type and Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select job type</option>
                    {jobTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select experience level</option>
                    {experienceLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location and Remote */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., New York, NY or Remote"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="remote"
                    checked={formData.remote}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Remote work available
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                />
                <div className="mt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={extractSkillsFromDescription}
                    className="inline-flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Brain className="w-4 h-4 mr-1" />
                    Extract Skills
                  </button>
                  <span className="text-sm text-gray-500">
                    {formData.description.length}/5000 characters
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills *
                </label>
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Add a skill..."
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 bg-primary-600 text-black rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="number"
                    name="budget.min"
                    value={formData.budget.min}
                    onChange={handleChange}
                    required
                    placeholder="Min"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    name="budget.max"
                    value={formData.budget.max}
                    onChange={handleChange}
                    required
                    placeholder="Max"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <select
                    name="budget.currency"
                    value={formData.budget.currency}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {currencies.map(currency => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Requirements and Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements (Optional)
                  </label>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Add requirement..."
                    />
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="px-3 py-2 bg-gray-600 text-black rounded-lg hover:bg-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {formData.requirements.map((req, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="text-sm">{req}</span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(req)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits (Optional)
                  </label>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Add benefit..."
                    />
                    <button
                      type="button"
                      onClick={addBenefit}
                      className="px-3 py-2 bg-gray-600 text-black rounded-lg hover:bg-gray-700"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {formData.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                        <span className="text-sm">{benefit}</span>
                        <button
                          type="button"
                          onClick={() => removeBenefit(benefit)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canProceed()}
                  className="px-6 py-2 bg-primary-600 text-black rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment & Confirmation</h2>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Fee</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">Job posting fee:</span>
                  <span className="font-semibold text-gray-900">{PLATFORM_FEE_AMOUNT} ETH</span>
                </div>
                <div className="text-sm text-gray-600">
                  This fee helps maintain the platform and ensures quality job postings.
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-blue-900 mb-2">Job Summary</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div><strong>Title:</strong> {formData.title}</div>
                  <div><strong>Type:</strong> {formData.jobType}</div>
                  <div><strong>Location:</strong> {formData.location}</div>
                  <div><strong>Budget:</strong> {formData.budget.min} - {formData.budget.max} {formData.budget.currency}</div>
                  <div><strong>Skills:</strong> {formData.skills.join(', ')}</div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !isConnected}
                  className="px-6 py-2 bg-primary-600 text-black rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Pay & Post Job
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default JobPost 
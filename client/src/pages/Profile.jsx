import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useJob } from '../contexts/JobContext'
import { useWeb3 } from '../contexts/Web3Context'
import { 
  User, 
  Mail, 
  MapPin, 
  Linkedin, 
  Wallet, 
  Plus, 
  X, 
  Brain,
  CheckCircle,
  AlertCircle,
  Edit3,
  Save,
  Globe
} from 'lucide-react'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const { extractSkills } = useJob()
  const { connectWallet, account } = useWeb3()
  
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    linkedinUrl: '',
    skills: [],
    experienceLevel: '',
    location: '',
    remote: false
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        linkedinUrl: user.linkedinUrl || '',
        skills: user.skills || [],
        experienceLevel: user.experienceLevel || '',
        location: user.location || '',
        remote: user.remote || false
      })
    }
  }, [user])

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'junior', label: 'Junior (1-3 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior (5-8 years)' },
    { value: 'lead', label: 'Lead/Manager (8+ years)' }
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
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

  const extractSkillsFromBio = () => {
    const text = formData.bio + ' ' + formData.linkedinUrl
    const extractedSkills = extractSkills(text)
    setFormData({
      ...formData,
      skills: [...new Set([...formData.skills, ...extractedSkills])]
    })
    toast.success(`Extracted ${extractedSkills.length} skills from your bio`)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const success = await updateProfile(formData)
      if (success) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Profile update error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWalletConnect = async () => {
    await connectWallet()
  }

  const getProfileCompletion = () => {
    const requiredFields = ['name', 'bio', 'skills', 'experienceLevel', 'location']
    const completedFields = requiredFields.filter(field => 
      formData[field] && (Array.isArray(formData[field]) ? formData[field].length > 0 : true)
    )
    return Math.round((completedFields.length / requiredFields.length) * 100)
  }

  const profileCompletion = getProfileCompletion()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your profile and preferences</p>
        </div>

        {/* Profile Completion Alert */}
        {profileCompletion < 100 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Complete Your Profile</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Complete your profile to get better job matches and increase your visibility.
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-yellow-800">{profileCompletion}% Complete</div>
                <div className="w-32 bg-yellow-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder="Enter your full name"
                    />
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio *
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                    placeholder="Tell us about yourself, your experience, and what you're looking for..."
                  />
                  {isEditing && (
                    <div className="mt-2 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={extractSkillsFromBio}
                        className="inline-flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <Brain className="w-4 h-4 mr-1" />
                        Extract Skills
                      </button>
                      <span className="text-sm text-gray-500">
                        {formData.bio.length}/1000 characters
                      </span>
                    </div>
                  )}
                </div>

                {/* LinkedIn URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                    <Linkedin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills *
                  </label>
                  {isEditing && (
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
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-2 text-primary-600 hover:text-primary-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                    {formData.skills.length === 0 && (
                      <span className="text-gray-500 text-sm">No skills added yet</span>
                    )}
                  </div>
                </div>

                {/* Experience Level and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level *
                    </label>
                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                    >
                      <option value="">Select experience level</option>
                      {experienceLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50"
                        placeholder="City, Country"
                      />
                      <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Remote Work Preference */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="remote"
                    checked={formData.remote}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded disabled:opacity-50"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Open to remote work
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Profile Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Completion</span>
                  <span className="text-sm font-medium text-gray-900">{profileCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Skills</span>
                  <span className="text-sm font-medium text-gray-900">{formData.skills.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Jobs Posted</span>
                  <span className="text-sm font-medium text-gray-900">{user?.stats?.jobsPosted || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Applications</span>
                  <span className="text-sm font-medium text-gray-900">{user?.stats?.applicationsSubmitted || 0}</span>
                </div>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Wallet Connection</h3>
              {account ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-md">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium mb-1">Wallet Address:</div>
                    <div className="font-mono text-xs break-all">{account}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Not Connected</span>
                  </div>
                  <button
                    onClick={handleWalletConnect}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">{user?.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Member since {new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
                {user?.walletAddress && (
                  <div className="flex items-center text-sm">
                    <Wallet className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-600 font-mono text-xs break-all">{user.walletAddress}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 
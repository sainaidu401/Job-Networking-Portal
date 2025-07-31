import { useState, useEffect } from 'react'
import { useJob } from '../contexts/JobContext'
import { useAuth } from '../contexts/AuthContext'
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase,
  Star,
  Eye,
  Users,
  Calendar,
  Building,
  Globe
} from 'lucide-react'

const JobFeed = () => {
  const { jobs, loading, filters, setFilters, getRecommendedJobs } = useJob()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [recommendedJobs, setRecommendedJobs] = useState([])

  useEffect(() => {
    if (user) {
      const recommended = getRecommendedJobs(user)
      setRecommendedJobs(recommended.slice(0, 5))
    }
  }, [user, jobs])

  const filteredJobs = jobs.filter(job => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
        job.location.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'junior', label: 'Junior' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Lead' }
  ]

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' }
  ]

  const formatBudget = (budget) => {
    return `${budget.currency} ${budget.min.toLocaleString()} - ${budget.max.toLocaleString()}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const JobCard = ({ job, isRecommended = false }) => (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer ${
        isRecommended ? 'border-primary-200 bg-primary-50' : ''
      }`}
      onClick={() => setSelectedJob(job)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
            {isRecommended && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                <Star className="w-3 h-3 mr-1" />
                Recommended
              </span>
            )}
            {job.matchScore && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {job.matchScore}% Match
              </span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Building className="w-4 h-4 mr-1" />
            <span>{job.employer?.name || 'Anonymous'}</span>
            <span className="mx-2">•</span>
            <MapPin className="w-4 h-4 mr-1" />
            <span>{job.location}</span>
            {job.remote && (
              <>
                <span className="mx-2">•</span>
                <Globe className="w-4 h-4 mr-1" />
                <span>Remote</span>
              </>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">
            {formatBudget(job.budget)}
          </div>
          <div className="text-sm text-gray-600">{job.jobType}</div>
        </div>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.slice(0, 5).map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {skill}
          </span>
        ))}
        {job.skills.length > 5 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            +{job.skills.length - 5} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {job.timeAgo}
          </span>
          <span className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            {job.views} views
          </span>
          <span className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {job.applicationsCount} applications
          </span>
        </div>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
          {job.status}
        </span>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Opportunity</h1>
          <p className="text-gray-600">Discover Web3 jobs that match your skills and preferences</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs, skills, or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={filters.experienceLevel || ''}
                    onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    {experienceLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <select
                    value={filters.jobType || ''}
                    onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {jobTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="City, Country"
                    value={filters.location || ''}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Remote */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remote Work
                  </label>
                  <select
                    value={filters.remote || ''}
                    onChange={(e) => setFilters({ ...filters, remote: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="true">Remote Only</option>
                    <option value="false">On-site Only</option>
                  </select>
                </div>
              </div>

              {/* Budget Range */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range (USD)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.budget?.min || ''}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      budget: { ...filters.budget, min: e.target.value ? parseInt(e.target.value) : 0 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.budget?.max || ''}
                    onChange={(e) => setFilters({ 
                      ...filters, 
                      budget: { ...filters.budget, max: e.target.value ? parseInt(e.target.value) : 100000 }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recommended Jobs */}
        {user && recommendedJobs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended for You</h2>
            <div className="grid gap-4">
              {recommendedJobs.map(job => (
                <JobCard key={job._id} job={job} isRecommended={true} />
              ))}
            </div>
          </div>
        )}

        {/* All Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              All Jobs ({filteredJobs.length})
            </h2>
            <div className="text-sm text-gray-600">
              {loading ? 'Loading...' : `${filteredJobs.length} jobs found`}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map(job => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedJob.title}</h2>
                  <div className="flex items-center text-gray-600 mb-4">
                    <Building className="w-4 h-4 mr-1" />
                    <span>{selectedJob.employer?.name || 'Anonymous'}</span>
                    <span className="mx-2">•</span>
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{selectedJob.location}</span>
                    {selectedJob.remote && (
                      <>
                        <span className="mx-2">•</span>
                        <Globe className="w-4 h-4 mr-1" />
                        <span>Remote</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {selectedJob.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Benefits</h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {selectedJob.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="md:col-span-1">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Budget
                        </div>
                        <div className="font-semibold text-gray-900">
                          {formatBudget(selectedJob.budget)}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Briefcase className="w-4 h-4 mr-2" />
                          Job Type
                        </div>
                        <div className="font-semibold text-gray-900 capitalize">
                          {selectedJob.jobType.replace('-', ' ')}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Clock className="w-4 h-4 mr-2" />
                          Duration
                        </div>
                        <div className="font-semibold text-gray-900 capitalize">
                          {selectedJob.duration.replace('-', ' ')}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Calendar className="w-4 h-4 mr-2" />
                          Posted
                        </div>
                        <div className="font-semibold text-gray-900">
                          {selectedJob.timeAgo}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Eye className="w-4 h-4 mr-2" />
                          Views
                        </div>
                        <div className="font-semibold text-gray-900">
                          {selectedJob.views}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Users className="w-4 h-4 mr-2" />
                          Applications
                        </div>
                        <div className="font-semibold text-gray-900">
                          {selectedJob.applicationsCount}
                        </div>
                      </div>
                    </div>

                    {user && (
                      <button className="w-full mt-6 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors">
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobFeed 
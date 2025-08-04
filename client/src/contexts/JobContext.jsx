import { createContext, useContext, useState, useEffect } from 'react'
import api from '../config/axios'
import toast from 'react-hot-toast'

const JobContext = createContext()

export const useJob = () => {
  const context = useContext(JobContext)
  if (!context) {
    throw new Error('useJob must be used within a JobProvider')
  }
  return context
}

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([])
  const [myJobs, setMyJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    skills: [],
    location: '',
    budget: { min: 0, max: 100000 }
  })



  const fetchJobs = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/jobs')
      setJobs(response.data.jobs)
    } catch (error) {
      toast.error('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyJobs = async () => {
    try {
      const response = await api.get('/api/jobs/my-jobs')
      setMyJobs(response.data.jobs)
    } catch (error) {
      toast.error('Failed to fetch your jobs')
    }
  }

  const fetchApplications = async () => {
    try {
      const response = await api.get('/api/jobs/applications')
      setApplications(response.data.applications)
    } catch (error) {
      toast.error('Failed to fetch applications')
    }
  }

  const createJob = async (jobData) => {
    try {
      const response = await api.post('/api/jobs', jobData)
      setJobs(prev => [response.data.job, ...prev])
      setMyJobs(prev => [response.data.job, ...prev])
      toast.success('Job posted successfully!')
      return response.data.job
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post job')
      return null
    }
  }

  const applyToJob = async (jobId, applicationData) => {
    try {
      const response = await api.post(`/api/jobs/${jobId}/apply`, applicationData)
      setApplications(prev => [response.data.application, ...prev])
      toast.success('Application submitted successfully!')
      return response.data.application
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application')
      return null
    }
  }

  const updateJob = async (jobId, jobData) => {
    try {
      const response = await api.put(`/api/jobs/${jobId}`, jobData)
      setJobs(prev => prev.map(job => job._id === jobId ? response.data.job : job))
      setMyJobs(prev => prev.map(job => job._id === jobId ? response.data.job : job))
      toast.success('Job updated successfully!')
      return response.data.job
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update job')
      return null
    }
  }

  const deleteJob = async (jobId) => {
    try {
      await api.delete(`/api/jobs/${jobId}`)
      setJobs(prev => prev.filter(job => job._id !== jobId))
      setMyJobs(prev => prev.filter(job => job._id !== jobId))
      toast.success('Job deleted successfully!')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete job')
      return false
    }
  }

  // AI-powered skill extraction from text
  const extractSkills = (text) => {
    const words = text.toLowerCase().split(/\W+/);
    const commonSkills = [
      'javascript', 'react', 'node.js', 'python', 'java', 'solidity', 'rust',
      'typescript', 'vue', 'angular', 'mongodb', 'postgresql', 'mysql',
      'aws', 'docker', 'kubernetes', 'git', 'blockchain', 'web3',
      'machine learning', 'ai', 'data science', 'devops', 'frontend',
      'backend', 'fullstack', 'mobile', 'ios', 'android', 'flutter',
      'react native', 'graphql', 'rest api', 'microservices', 'agile',
      'scrum', 'ui/ux', 'design', 'testing', 'cypress', 'jest'
    ];

    const extractedSkills = [];
    const textLower = text.toLowerCase();

    commonSkills.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        extractedSkills.push(skill);
      }
    });

    return [...new Set(extractedSkills)];
  }

  // AI-powered job matching
  const calculateMatchScore = (job, userProfile) => {
    if (!userProfile || !userProfile.skills) return 0

    const jobSkills = job.skills || []
    const userSkills = userProfile.skills || []
    
    // Calculate skill overlap
    const commonSkills = jobSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    )

    const skillMatch = (commonSkills.length / Math.max(jobSkills.length, 1)) * 100

    // Calculate experience level match
    let experienceMatch = 0
    if (job.experienceLevel && userProfile.experienceLevel) {
      const levels = ['entry', 'junior', 'mid', 'senior', 'lead']
      const jobLevel = levels.indexOf(job.experienceLevel.toLowerCase())
      const userLevel = levels.indexOf(userProfile.experienceLevel.toLowerCase())
      
      if (jobLevel >= userLevel) {
        experienceMatch = 100 - Math.abs(jobLevel - userLevel) * 20
      } else {
        experienceMatch = Math.max(0, 100 - Math.abs(jobLevel - userLevel) * 10)
      }
    }

    // Calculate location match
    let locationMatch = 0
    if (job.location && userProfile.location) {
      if (job.location.toLowerCase() === userProfile.location.toLowerCase()) {
        locationMatch = 100
      } else if (job.remote && userProfile.remote) {
        locationMatch = 80
      }
    }

    // Weighted average
    const finalScore = (skillMatch * 0.5) + (experienceMatch * 0.3) + (locationMatch * 0.2)
    return Math.round(finalScore)
  }

  // Get recommended jobs for a user
  const getRecommendedJobs = (userProfile) => {
    if (!userProfile) return jobs

    return jobs
      .map(job => ({
        ...job,
        matchScore: calculateMatchScore(job, userProfile)
      }))
      .filter(job => job.matchScore > 30)
      .sort((a, b) => b.matchScore - a.matchScore)
  }

  // Filter jobs based on criteria
  const filterJobs = (jobsToFilter = jobs) => {
    return jobsToFilter.filter(job => {
      // Skills filter
      if (filters.skills.length > 0) {
        const hasRequiredSkill = filters.skills.some(skill =>
          job.skills?.some(jobSkill =>
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
        if (!hasRequiredSkill) return false
      }

      // Location filter
      if (filters.location && !job.location?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }

      // Budget filter
      if (job.budget) {
        const budget = parseFloat(job.budget)
        if (budget < filters.budget.min || budget > filters.budget.max) {
          return false
        }
      }

      return true
    })
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  const value = {
    jobs,
    myJobs,
    applications,
    loading,
    filters,
    setFilters,
    fetchJobs,
    fetchMyJobs,
    fetchApplications,
    createJob,
    applyToJob,
    updateJob,
    deleteJob,
    extractSkills,
    calculateMatchScore,
    getRecommendedJobs,
    filterJobs
  }

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  )
} 
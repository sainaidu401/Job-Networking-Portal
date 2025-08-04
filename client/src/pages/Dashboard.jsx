import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useJob } from '../contexts/JobContext'
import { 
  Briefcase, 
  Users, 
  DollarSign, 
  TrendingUp,
  Eye,
  Clock,
  Star,
  Plus,
  Settings,
  BarChart3,
  Target,
  Award
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const { myJobs, applications, fetchMyJobs, fetchApplications } = useJob()
  const [activeTab, setActiveTab] = useState('overview')

 useEffect(() => {
    if (user) {
      fetchMyJobs()
      fetchApplications()
    }
  }, [user])

  const stats = [
    {
      title: 'Jobs Posted',
      value: user?.stats?.jobsPosted || 0,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Applications',
      value: user?.stats?.applicationsSubmitted || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Jobs Hired',
      value: user?.stats?.jobsHired || 0,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Earned',
      value: `$${(user?.stats?.totalEarned || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const recentJobs = myJobs.slice(0, 5)
  const recentApplications = applications.slice(0, 5)

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'shortlisted': return 'bg-purple-100 text-purple-800'
      case 'hired': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Here's your activity overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'jobs', label: 'My Jobs', icon: Briefcase },
                { id: 'applications', label: 'Applications', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Profile Completion */}
                {!user?.profileCompleted && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Target className="w-5 h-5 text-yellow-600 mr-2" />
                      <div>
                        <h3 className="text-sm font-medium text-yellow-800">Complete Your Profile</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          Complete your profile to get better job matches and increase your visibility.
                        </p>
                        <Link
                          to="/profile"
                          className="inline-flex items-center mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
                        >
                          Complete Profile
                          <span className="ml-1">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Jobs */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Jobs</h3>
                      <Link
                        to="/post-job"
                        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Post New Job
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {recentJobs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No jobs posted yet</p>
                          <Link
                            to="/post-job"
                            className="inline-flex items-center mt-2 text-primary-600 hover:text-primary-700"
                          >
                            Post your first job
                          </Link>
                        </div>
                      ) : (
                        recentJobs.map((job) => (
                          <div key={job._id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{job.title}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                {job.status}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                              <span className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                {job.views} views
                              </span>
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {job.applicationsCount} applications
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {job.timeAgo}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Applications */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                      <Link
                        to="/jobs"
                        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                      >
                        Browse Jobs
                        <span className="ml-1">→</span>
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {recentApplications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No applications yet</p>
                          <Link
                            to="/jobs"
                            className="inline-flex items-center mt-2 text-primary-600 hover:text-primary-700"
                          >
                            Browse available jobs
                          </Link>
                        </div>
                      ) : (
                        recentApplications.map((application) => (
                          <div key={application._id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{application.jobTitle}</h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(application.status)}`}>
                                {application.status}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 space-x-4">
                              {application.matchScore && (
                                <span className="flex items-center">
                                  <Star className="w-4 h-4 mr-1" />
                                  {application.matchScore}% match
                                </span>
                              )}
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {new Date(application.appliedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600 mb-1">
                        {user?.skills?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Skills Identified</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {user?.profileCompleted ? '100%' : '60%'}
                      </div>
                      <div className="text-sm text-gray-600">Profile Completion</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {user?.stats?.jobsHired || 0}
                      </div>
                      <div className="text-sm text-gray-600">Successful Hires</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* My Jobs Tab */}
            {activeTab === 'jobs' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Job Postings</h3>
                  <Link
                    to="/post-job"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                  </Link>
                </div>
                <div className="space-y-4">
                  {myJobs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                      <p className="text-gray-600 mb-4">Start by posting your first job to find talented professionals</p>
                      <Link
                        to="/post-job"
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Post Your First Job
                      </Link>
                    </div>
                  ) : (
                    myJobs.map((job) => (
                      <div key={job._id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h4>
                            <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {job.skills.slice(0, 5).map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
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
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-6">
                            <span className="flex items-center">
                              <Eye className="w-4 h-4 mr-1" />
                              {job.views} views
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {job.applicationsCount} applications
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {job.timeAgo}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="text-primary-600 hover:text-primary-700">
                              <Settings className="w-4 h-4" />
                            </button>
                            <button className="text-primary-600 hover:text-primary-700">
                              View Applications
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Applications</h3>
                  <Link
                    to="/jobs"
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Browse Jobs
                  </Link>
                </div>
                <div className="space-y-4">
                  {applications.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                      <p className="text-gray-600 mb-4">Start applying to jobs to track your applications here</p>
                      <Link
                        to="/jobs"
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Browse Available Jobs
                      </Link>
                    </div>
                  ) : (
                    applications.map((application) => (
                      <div key={application._id} className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{application.jobTitle}</h4>
                            <p className="text-gray-600 mb-3 line-clamp-2">{application.coverLetter}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Proposed: ${application.proposedBudget}</span>
                              <span>Duration: {application.estimatedDuration}</span>
                              {application.matchScore && (
                                <span className="flex items-center">
                                  <Star className="w-4 h-4 mr-1" />
                                  {application.matchScore}% match
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getApplicationStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
                          <button className="text-primary-600 hover:text-primary-700">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 
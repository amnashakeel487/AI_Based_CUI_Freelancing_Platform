import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  Star,
  TrendingUp,
  Sparkles,
  Edit3,
  FolderOpen,
  Target,
  Trophy,
  Clock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  // Stats - clearly demo data
  const stats = [
    { name: 'Active Projects', value: '2', icon: Briefcase, color: '#1769E8', bgColor: '#EBF4FF' },
    { name: 'Pending Proposals', value: '4', icon: FileText, color: '#F59E0B', bgColor: '#FEF3C7' },
    { name: 'Completed Projects', value: '8', icon: CheckCircle2, color: '#10B981', bgColor: '#DCFCE7' },
    { name: 'Average Rating', value: '4.7', icon: Star, color: '#F59E0B', bgColor: '#FEF3C7', suffix: '/5.0' },
  ];

  // Recent projects - realistic sample data
  const recentProjects = [
    { 
      id: 1, 
      title: 'E-Learning Platform Backend', 
      client: 'Demo Client A', 
      status: 'in_progress', 
      deadline: 'Dec 15, 2026',
      progress: 65
    },
    { 
      id: 2, 
      title: 'Mobile App UI/UX Design', 
      client: 'Demo Client B', 
      status: 'active', 
      deadline: 'Dec 28, 2026',
      progress: 40
    },
  ];

  // AI Recommendations - mock data
  const recommendations = [
    {
      id: 1,
      title: 'Campus Event Management System',
      description: 'Develop a web-based system for managing university events, registrations, and attendee tracking.',
      budget: '15,000 - 25,000 PKR',
      deadline: 'Jan 30, 2027',
      skills: ['React', 'Node.js', 'MongoDB'],
      matchScore: 94,
      client: 'COMSATS Student Council'
    },
    {
      id: 2,
      title: 'AI-Powered Attendance System',
      description: 'Create a facial recognition-based attendance system with real-time analytics dashboard.',
      budget: '20,000 - 35,000 PKR',
      deadline: 'Feb 15, 2027',
      skills: ['Python', 'TensorFlow', 'FastAPI'],
      matchScore: 89,
      client: 'University IT Department'
    },
    {
      id: 3,
      title: 'Student Portfolio Website Builder',
      description: 'Build a drag-and-drop website builder specifically designed for student portfolios.',
      budget: '12,000 - 20,000 PKR',
      deadline: 'Jan 20, 2027',
      skills: ['React', 'Tailwind', 'Firebase'],
      matchScore: 87,
      client: 'Campus Startup'
    },
  ];

  // Recent activity
  const recentActivity = [
    { id: 1, text: 'New project recommendation available', time: '15 minutes ago', icon: Sparkles, color: '#1769E8' },
    { id: 2, text: 'Proposal viewed by client', time: '2 hours ago', icon: TrendingUp, color: '#10B981' },
    { id: 3, text: 'Project milestone completed', time: '1 day ago', icon: CheckCircle2, color: '#10B981' },
    { id: 4, text: 'New message from client', time: '2 days ago', icon: FileText, color: '#F59E0B' },
  ];

  // Profile completion
  const profileCompletion = 75; // Demo value

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#102B52' }}>
            Freelancer Dashboard
          </h1>
          <p className="mt-2 text-base" style={{ color: '#64748B' }}>
            Welcome back! Here's an overview of your freelance activity.
          </p>
        </div>

        {/* Profile Completion Alert */}
        {profileCompletion < 100 && (
          <div className="mb-6 rounded-lg border p-4" style={{ backgroundColor: '#EBF4FF', borderColor: '#1769E8' }}>
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#1769E8' }} />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold" style={{ color: '#102B52' }}>
                  Complete your profile to get better project matches
                </h3>
                <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
                  Your profile is {profileCompletion}% complete. Add your skills, portfolio, and experience to attract more clients.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link to="/freelancer/profile">
                    <Button size="sm" style={{ backgroundColor: '#1769E8', color: 'white' }}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Complete Profile
                    </Button>
                  </Link>
                  <Link to="/freelancer/projects">
                    <Button size="sm" variant="outline">
                      Browse Projects
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.name} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#64748B' }}>
                      {stat.name}
                    </p>
                    <p className="mt-2 text-3xl font-bold" style={{ color: '#102B52' }}>
                      {stat.value}
                      {stat.suffix && <span className="text-lg" style={{ color: '#64748B' }}>{stat.suffix}</span>}
                    </p>
                  </div>
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <Icon className="h-6 w-6" style={{ color: stat.color }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Recent Projects */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold" style={{ color: '#102B52' }}>
                  Recent Projects
                </h2>
                <Link to="/freelancer/my-projects">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
              
              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div 
                      key={project.id} 
                      className="border rounded-lg p-4 hover:border-blue-300 transition-colors"
                      style={{ borderColor: '#D6E5FA' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base" style={{ color: '#102B52' }}>
                            {project.title}
                          </h3>
                          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
                            Client: {project.client}
                          </p>
                        </div>
                        <StatusBadge status={project.status} />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center" style={{ color: '#64748B' }}>
                          <Clock className="h-4 w-4 mr-1" />
                          Due: {project.deadline}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xs font-medium" style={{ color: '#64748B' }}>
                            {project.progress}%
                          </div>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${project.progress}%`,
                                backgroundColor: '#1769E8'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4" style={{ color: '#D6E5FA' }} />
                  <p className="text-sm font-medium" style={{ color: '#102B52' }}>
                    No active projects yet
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#64748B' }}>
                    Browse available projects and submit proposals to get started.
                  </p>
                  <Link to="/freelancer/projects">
                    <Button size="sm" className="mt-4" style={{ backgroundColor: '#1769E8', color: 'white' }}>
                      Browse Projects
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* AI Recommendations */}
            <Card className="p-6" style={{ background: 'linear-gradient(135deg, #EBF4FF 0%, #F9FAFB 100%)' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" style={{ color: '#1769E8' }} />
                  <h2 className="text-lg font-semibold" style={{ color: '#102B52' }}>
                    Recommended for You
                  </h2>
                </div>
                <Link to="/freelancer/recommendations">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <p className="text-sm mb-4" style={{ color: '#64748B' }}>
                AI-powered project matches based on your skills and experience (demo data)
              </p>

              <div className="space-y-4">
                {recommendations.map((project) => (
                  <div 
                    key={project.id} 
                    className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                    style={{ borderColor: '#D6E5FA' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base" style={{ color: '#102B52' }}>
                            {project.title}
                          </h3>
                          <div 
                            className="px-2 py-0.5 rounded text-xs font-semibold"
                            style={{ 
                              backgroundColor: project.matchScore >= 90 ? '#DCFCE7' : '#FEF3C7',
                              color: project.matchScore >= 90 ? '#10B981' : '#F59E0B'
                            }}
                          >
                            {project.matchScore}% Match
                          </div>
                        </div>
                        <p className="text-sm" style={{ color: '#64748B' }}>
                          {project.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.skills.map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: '#EBF4FF', color: '#1769E8' }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div style={{ color: '#64748B' }}>
                        <div className="font-medium" style={{ color: '#102B52' }}>
                          {project.budget}
                        </div>
                        <div className="text-xs">Due: {project.deadline}</div>
                      </div>
                      <Button size="sm" style={{ backgroundColor: '#1769E8', color: 'white' }}>
                        View Project
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#102B52' }}>
                Quick Actions
              </h2>
              
              <div className="space-y-2">
                <Link to="/freelancer/projects" className="block">
                  <button className="w-full flex items-center px-4 py-3 rounded-lg border transition-colors hover:border-blue-300 hover:bg-blue-50" style={{ borderColor: '#D6E5FA' }}>
                    <Briefcase className="h-5 w-5 mr-3" style={{ color: '#1769E8' }} />
                    <span className="text-sm font-medium" style={{ color: '#102B52' }}>
                      Browse Projects
                    </span>
                  </button>
                </Link>

                <Link to="/freelancer/skills" className="block">
                  <button className="w-full flex items-center px-4 py-3 rounded-lg border transition-colors hover:border-blue-300 hover:bg-blue-50" style={{ borderColor: '#D6E5FA' }}>
                    <Target className="h-5 w-5 mr-3" style={{ color: '#1769E8' }} />
                    <span className="text-sm font-medium" style={{ color: '#102B52' }}>
                      Manage Skills
                    </span>
                  </button>
                </Link>

                <Link to="/freelancer/portfolio" className="block">
                  <button className="w-full flex items-center px-4 py-3 rounded-lg border transition-colors hover:border-blue-300 hover:bg-blue-50" style={{ borderColor: '#D6E5FA' }}>
                    <Trophy className="h-5 w-5 mr-3" style={{ color: '#1769E8' }} />
                    <span className="text-sm font-medium" style={{ color: '#102B52' }}>
                      Update Portfolio
                    </span>
                  </button>
                </Link>

                <Link to="/freelancer/proposals" className="block">
                  <button className="w-full flex items-center px-4 py-3 rounded-lg border transition-colors hover:border-blue-300 hover:bg-blue-50" style={{ borderColor: '#D6E5FA' }}>
                    <FileText className="h-5 w-5 mr-3" style={{ color: '#1769E8' }} />
                    <span className="text-sm font-medium" style={{ color: '#102B52' }}>
                      View Proposals
                    </span>
                  </button>
                </Link>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: '#102B52' }}>
                Recent Activity
              </h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${activity.color}15` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: activity.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: '#102B52' }}>
                          {activity.text}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link to="/freelancer/notifications">
                <button className="w-full mt-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-gray-50" style={{ borderColor: '#D6E5FA', color: '#1769E8' }}>
                  View All Activity
                </button>
              </Link>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
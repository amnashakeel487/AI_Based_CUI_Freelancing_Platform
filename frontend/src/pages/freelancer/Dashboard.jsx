import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import StatusBadge from '../../components/ui/StatusBadge';
import Button from '../../components/ui/Button';
import { 
  DollarSign, 
  Briefcase, 
  Star, 
  TrendingUp,
  FileText,
  MessageSquare 
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { name: 'Total Earnings', value: '$2,450', icon: DollarSign, change: '+12%' },
    { name: 'Active Projects', value: '3', icon: Briefcase, change: '+1' },
    { name: 'Rating', value: '4.8', icon: Star, change: '+0.2' },
    { name: 'Profile Views', value: '127', icon: TrendingUp, change: '+23%' },
  ];

  const recentProjects = [
    { id: 1, title: 'E-commerce Website Development', client: 'Tech Solutions Ltd.', status: 'active', deadline: '2024-11-15' },
    { id: 2, title: 'Mobile App UI Design', client: 'StartupCo', status: 'pending', deadline: '2024-11-20' },
    { id: 3, title: 'Database Optimization', client: 'DataCorp', status: 'completed', deadline: '2024-11-01' },
  ];

  return (
    <div className="p-6">
      <PageHeader 
        title="Dashboard"
        subtitle="Welcome back! Here's what's happening with your freelance work."
      />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-primary-blue" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-text">{stat.name}</p>
                  <p className="text-2xl font-bold text-primary-text">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-primary-text">Recent Projects</h3>
              <Button variant="outline" size="sm">View All</Button>
            </div>
            
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="border border-border-color rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-primary-text">{project.title}</h4>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="text-sm text-muted-text mb-2">Client: {project.client}</p>
                  <p className="text-sm text-muted-text">Deadline: {project.deadline}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-primary-text mb-6">Quick Actions</h3>
            
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Browse Projects
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages (3)
              </Button>
              
              <Button className="w-full justify-start" variant="outline">
                <Star className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
            </div>
          </Card>
          
          {/* Recent Activity */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-primary-text mb-4">Recent Activity</h3>
            
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-primary-text">New project match found</p>
                <p className="text-muted-text">2 hours ago</p>
              </div>
              
              <div className="text-sm">
                <p className="text-primary-text">Proposal submitted</p>
                <p className="text-muted-text">1 day ago</p>
              </div>
              
              <div className="text-sm">
                <p className="text-primary-text">Payment received</p>
                <p className="text-muted-text">2 days ago</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
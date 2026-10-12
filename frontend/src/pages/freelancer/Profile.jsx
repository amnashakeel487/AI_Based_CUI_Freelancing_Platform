import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/ui/StatusBadge';
import { Edit, Mail, Phone, MapPin, Star } from 'lucide-react';

const Profile = () => {
  return (
    <div className="p-6">
      <PageHeader 
        title="Profile"
        subtitle="Your public freelancer profile"
        actions={
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-primary-blue rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">JD</span>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-primary-text">John Doe</h2>
                <p className="text-lg text-muted-text mb-2">Full-Stack Developer</p>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">4.8 (25 reviews)</span>
                  </div>
                  <StatusBadge status="active" />
                </div>
                
                <div className="space-y-2 text-sm text-muted-text">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    john.doe@comsats.edu.pk
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    +92 300 1234567
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Islamabad, Pakistan
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-primary-text mb-3">About</h3>
              <p className="text-muted-text">
                Passionate full-stack developer with 3+ years of experience in web development. 
                Specializing in React, Node.js, and modern web technologies. Currently pursuing 
                Computer Science at COMSATS University Islamabad.
              </p>
            </div>
          </Card>
          
          {/* Portfolio */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-primary-text mb-4">Portfolio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="border border-border-color rounded-lg p-4">
                  <div className="w-full h-32 bg-gray-200 rounded-md mb-3"></div>
                  <h4 className="font-medium text-primary-text mb-1">Project {item}</h4>
                  <p className="text-sm text-muted-text">Project description goes here...</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-primary-text mb-4">Skills</h3>
            
            <div className="space-y-3">
              {['React', 'Node.js', 'JavaScript', 'Python', 'MySQL', 'MongoDB'].map((skill) => (
                <div key={skill} className="flex items-center justify-between">
                  <span className="text-sm text-primary-text">{skill}</span>
                  <div className="w-20 h-2 bg-gray-200 rounded">
                    <div className="h-2 bg-primary-blue rounded" style={{width: '85%'}}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Reviews */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-primary-text mb-4">Recent Reviews</h3>
            
            <div className="space-y-4">
              {[1, 2].map((review) => (
                <div key={review} className="border-b border-border-color pb-4 last:border-0">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-500 mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-text">Client {review}</span>
                  </div>
                  <p className="text-sm text-muted-text">
                    "Excellent work quality and great communication. Highly recommended!"
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Earnings Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-primary-text mb-4">Earnings</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-text">This Month</span>
                <span className="font-medium">$850</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-text">Total Earned</span>
                <span className="font-medium">$2,450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-text">Projects Completed</span>
                <span className="font-medium">12</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
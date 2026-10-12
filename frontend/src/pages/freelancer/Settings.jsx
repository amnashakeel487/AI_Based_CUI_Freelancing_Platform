import React from 'react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Shield, Bell, Eye } from 'lucide-react';

const Settings = () => {
  return (
    <div className="p-6">
      <PageHeader 
        title="Settings"
        subtitle="Manage your account preferences and security"
      />
      
      <div className="max-w-4xl space-y-6">
        {/* General Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-primary-text mb-6">General Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="First Name"
              value="John"
              placeholder="Enter your first name"
            />
            
            <Input
              label="Last Name"
              value="Doe"
              placeholder="Enter your last name"
            />
            
            <Input
              label="Email Address"
              type="email"
              value="john.doe@comsats.edu.pk"
              placeholder="Enter your email"
            />
            
            <Input
              label="Phone Number"
              type="tel"
              value="+92 300 1234567"
              placeholder="Enter your phone number"
            />
            
            <Input
              label="Location"
              value="Islamabad, Pakistan"
              placeholder="Enter your location"
            />
            
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Time Zone
              </label>
              <select className="w-full px-3 py-2 border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue">
                <option>Pakistan Standard Time (UTC+5)</option>
                <option>UTC</option>
                <option>Eastern Standard Time (UTC-5)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <Button>Save Changes</Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Bell className="h-5 w-5 text-primary-blue mr-2" />
            <h3 className="text-lg font-semibold text-primary-text">Notification Settings</h3>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Email notifications for new project matches', checked: true },
              { label: 'SMS notifications for urgent messages', checked: false },
              { label: 'Push notifications for proposal updates', checked: true },
              { label: 'Weekly summary emails', checked: true },
              { label: 'Marketing and promotional emails', checked: false },
            ].map((setting, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <span className="text-primary-text">{setting.label}</span>
                <input
                  type="checkbox"
                  defaultChecked={setting.checked}
                  className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-border-color rounded"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Eye className="h-5 w-5 text-primary-blue mr-2" />
            <h3 className="text-lg font-semibold text-primary-text">Privacy Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-text mb-2">
                Profile Visibility
              </label>
              <select className="w-full md:w-1/2 px-3 py-2 border border-border-color rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue">
                <option>Public - Visible to all clients</option>
                <option>Limited - Visible to matched clients only</option>
                <option>Private - Visible only when you apply</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-primary-text">Show online status</span>
                <p className="text-sm text-muted-text">Let clients know when you're online</p>
              </div>
              <input
                type="checkbox"
                defaultChecked={true}
                className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-border-color rounded"
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="text-primary-text">Show earnings publicly</span>
                <p className="text-sm text-muted-text">Display total earnings on your profile</p>
              </div>
              <input
                type="checkbox"
                defaultChecked={false}
                className="h-4 w-4 text-primary-blue focus:ring-primary-blue border-border-color rounded"
              />
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Shield className="h-5 w-5 text-primary-blue mr-2" />
            <h3 className="text-lg font-semibold text-primary-text">Security Settings</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-primary-text mb-2">Change Password</h4>
              <div className="space-y-3">
                <Input
                  label="Current Password"
                  type="password"
                  placeholder="Enter current password"
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Enter new password"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="Confirm new password"
                />
                <Button size="sm">Update Password</Button>
              </div>
            </div>
            
            <hr className="border-border-color" />
            
            <div>
              <h4 className="font-medium text-primary-text mb-2">Two-Factor Authentication</h4>
              <p className="text-muted-text mb-3">
                Add an extra layer of security to your account with two-factor authentication.
              </p>
              <Button variant="outline" size="sm">Enable 2FA</Button>
            </div>
            
            <hr className="border-border-color" />
            
            <div>
              <h4 className="font-medium text-primary-text mb-2">Login Sessions</h4>
              <p className="text-muted-text mb-3">
                Manage your active login sessions across different devices.
              </p>
              <Button variant="outline" size="sm">View Active Sessions</Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-red-200">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-primary-text mb-2">Deactivate Account</h4>
              <p className="text-muted-text mb-3">
                Temporarily deactivate your account. You can reactivate it anytime.
              </p>
              <Button variant="outline" size="sm">Deactivate Account</Button>
            </div>
            
            <hr className="border-red-200" />
            
            <div>
              <h4 className="font-medium text-primary-text mb-2">Delete Account</h4>
              <p className="text-muted-text mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button variant="danger" size="sm">Delete Account</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
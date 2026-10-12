import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">CUI</span>
            </div>
            <span className="ml-3 text-2xl font-bold text-slate-800">Freelance</span>
          </div>
        </div>
        
        {/* Title */}
        <h2 className="mt-6 text-center text-3xl font-bold text-slate-800">
          {title}
        </h2>
        
        {/* Subtitle */}
        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:px-10 border border-gray-200">
          {children}
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          © 2026 CUI Freelancing Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
import React from 'react';

const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  actions,
  className = '' 
}) => {
  return (
    <div className={`border-b border-gray-200 bg-white px-6 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          {breadcrumbs.length > 0 && (
            <nav className="mb-2">
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2">/</span>}
                    {crumb.href ? (
                      <a 
                        href={crumb.href} 
                        className="hover:text-blue-600 transition-colors"
                      >
                        {crumb.label}
                      </a>
                    ) : (
                      <span className={index === breadcrumbs.length - 1 ? 'text-gray-900' : ''}>
                        {crumb.label}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
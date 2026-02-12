import React from 'react';

/**
 * StatCard - Display metrics on Dashboard
 * Shows a title, value, and optional change percentage
 */
export const StatCard = ({
  title,
  value,
  subtitle = '',
  icon = null,
  variant = 'primary',
  change = null,
}) => {
  const variantClasses = {
    primary: 'stat-card-primary',
    secondary: 'stat-card-secondary',
    success: 'stat-card-success',
    warning: 'stat-card-warning',
    info: 'stat-card-info',
  };

  return (
    <div className={`${variantClasses[variant]} cursor-pointer relative overflow-hidden`}>
      <div className="flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
           <div>
              <p className="text-earth-700 text-xs font-bold uppercase tracking-wider mb-2">
                {title}
              </p>
              <h3 className="text-3xl font-extrabold text-earth-900 tracking-tight">
                {value}
              </h3>
           </div>
           {icon && (
              <div className="p-3 rounded-xl bg-white/30 backdrop-blur-sm text-2xl shadow-sm">
                {icon}
              </div>
            )}
        </div>
        
        <div>
          {subtitle && (
            <p className="text-earth-600 text-xs font-medium mt-3">{subtitle}</p>
          )}
          {change !== null && (
            <div className={`mt-2 text-sm font-bold flex items-center ${
              change >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              <span>{change >= 0 ? '↑' : '↓'}</span>
              <span className="ml-1">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * DataCard - Display field or labour information
 */
export const DataCard = ({
  title,
  value,
  subtitle = '',
  action = null,
  onClick = null,
  status = 'default',
}) => {
  const statusClasses = {
    default: 'bg-gradient-to-br from-earth-50 to-white border-earth-200 hover:border-primary-400 hover:shadow-lg',
    active: 'bg-gradient-to-br from-primary-50 to-primary-100 border-primary-300 shadow-md',
    warning: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 shadow-md',
    success: 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 shadow-md',
  };

  return (
    <div
      className={`rounded-xl border-2 p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 ${statusClasses[status]}`}
      onClick={onClick}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <p className="text-earth-700 text-xs font-bold uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-2xl font-extrabold text-earth-900 tracking-tight">
            {value}
          </p>
        </div>
        {subtitle && (
          <p className="text-earth-600 text-xs font-medium mt-3">
            {subtitle}
          </p>
        )}
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ListCard - Display list items with better readability
 */
export const ListCard = ({
  items = [],
  onItemClick = null,
  emptyMessage = 'No items found',
  renderItem = null,
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-earth-500 text-sm md:text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={item.id || index}
          className="card p-4 md:p-5 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onItemClick?.(item)}
        >
          {renderItem ? renderItem(item) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-earth-900 text-base md:text-sm">
                  {item.name || item.title || 'Item'}
                </p>
                {item.subtitle && (
                  <p className="text-earth-500 text-sm md:text-xs mt-1">
                    {item.subtitle}
                  </p>
                )}
              </div>
              {item.value && (
                <p className="font-bold text-primary-600 text-lg md:text-base">
                  {item.value}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * SectionCard - Container for form sections
 */
export const SectionCard = ({
  title,
  subtitle = '',
  children,
  action = null,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-earth-100 overflow-visible">
      <div className="bg-gradient-to-r from-earth-50 to-white border-b-2 border-earth-200 px-5 md:px-6 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-earth-900 tracking-tight mb-1">{title}</h3>
            {subtitle && (
              <p className="text-earth-600 text-sm font-medium">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </div>
      <div className="px-5 md:px-6 py-5 md:py-6">
        {children}
      </div>
    </div>
  );
};

/**
 * InfoBox - Display information with icon
 */
export const InfoBox = ({
  title,
  description,
  icon = null,
  variant = 'info',
}) => {
  const variantClasses = {
    info: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 text-blue-900',
    success: 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 text-green-900',
    warning: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 text-amber-900',
    error: 'bg-gradient-to-br from-red-50 to-red-100 border-red-300 text-red-900',
  };

  return (
    <div className={`rounded-xl p-4 md:p-5 border-l-4 shadow-md ${variantClasses[variant]}`}>
      <div className="flex gap-3 items-start">
        {icon && (
          <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm text-xl flex-shrink-0 shadow-sm">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-bold text-sm mb-1.5">{title}</h4>
          <p className="text-xs font-medium leading-relaxed opacity-90">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default {
  StatCard,
  DataCard,
  ListCard,
  SectionCard,
  InfoBox,
};

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
    default: 'border-earth-200 hover:border-primary-300',
    active: 'border-primary-400 bg-primary-50',
    warning: 'border-amber-300 bg-amber-50',
    success: 'border-green-300 bg-green-50',
  };

  return (
    <div
      className={`card p-4 md:p-5 cursor-pointer transition-all ${statusClasses[status]}`}
      onClick={onClick}
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
        <div className="flex-1 min-w-0 w-full">
          <p className="text-earth-600 text-xs md:text-xs font-semibold uppercase tracking-wide mb-1 break-words">
            {title}
          </p>
          <p className="text-xl md:text-xl font-bold text-earth-900 break-words">
            {value}
          </p>
          {subtitle && (
            <p className="text-earth-500 text-xs md:text-xs mt-1 break-words">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 mt-2 sm:mt-0 self-end sm:self-auto">
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
    <div className="card overflow-visible">
      <div className="border-b border-earth-200 px-4 md:px-6 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="section-subheading text-base sm:text-lg md:text-base">{title}</h3>
            {subtitle && (
              <p className="text-earth-600 text-xs sm:text-sm md:text-xs">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </div>
      <div className="px-4 md:px-6 py-4 md:py-5">
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
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className={`card p-4 md:p-5 border-l-4 ${variantClasses[variant]}`}>
      <div className="flex gap-3">
        {icon && <div className="text-2xl flex-shrink-0">{icon}</div>}
        <div className="flex-1">
          <h4 className="font-semibold text-sm sm:text-base md:text-sm mb-1">{title}</h4>
          <p className="text-xs sm:text-sm md:text-xs opacity-90">{description}</p>
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

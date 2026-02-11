import React from 'react';
import { useLanguage } from '../contexts/AppContext';

const Settings = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
          title={t('language')}
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 8 19h5c0-1.86.636-3.603 1.751-5M19 18v-2a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2z"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            {language === 'en' ? 'EN' : 'हि'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Settings;

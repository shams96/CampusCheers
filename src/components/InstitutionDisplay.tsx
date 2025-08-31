'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface InstitutionData {
  id: string;
  name: string;
  type: 'high_school' | 'university' | 'unknown';
}

interface InstitutionDisplayProps {
  className?: string;
  showType?: boolean;
  fallbackText?: string;
}

export default function InstitutionDisplay({
  className = '',
  showType = false,
  fallbackText = 'Campus'
}: InstitutionDisplayProps) {
  const [institution, setInstitution] = useState<InstitutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadInstitutionData();
  }, []);

  const loadInstitutionData = async () => {
    try {
      // Try to get from session storage first (faster)
      const sessionData = sessionStorage.getItem('selectedSchool');
      if (sessionData) {
        const schoolData = JSON.parse(sessionData);
        const institutionType = determineInstitutionType(schoolData.name);
        setInstitution({
          id: schoolData.id,
          name: schoolData.name,
          type: institutionType
        });
        setLoading(false);
        return;
      }

      // Fallback: try to get from user data
      const userData = sessionStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.school) {
          const institutionType = determineInstitutionType(user.school.name);
          setInstitution({
            id: user.school.id,
            name: user.school.name,
            type: institutionType
          });
        }
      }

      // If no data found, redirect to auth
      if (!institution) {
        router.push('/auth/zip-code');
      }
    } catch (error) {
      console.error('Error loading institution data:', error);
      // Don't redirect on error, just show fallback
    } finally {
      setLoading(false);
    }
  };

  const determineInstitutionType = (schoolName: string): 'high_school' | 'university' | 'unknown' => {
    const name = schoolName.toLowerCase();

    // University indicators
    if (name.includes('university') || name.includes('college') ||
        name.includes('institute') || name.includes('academy') ||
        name.includes('polytechnic')) {
      return 'university';
    }

    // High school indicators
    if (name.includes('high school') || name.includes('highschool') ||
        name.includes('secondary') || name.includes('hs') ||
        name.includes('grade') || name.includes('9-12')) {
      return 'high_school';
    }

    // Default to high school for CampusCheers target audience
    return 'high_school';
  };

  const getDisplayName = () => {
    if (!institution) return fallbackText;

    if (showType) {
      switch (institution.type) {
        case 'high_school':
          return `${institution.name} High School`;
        case 'university':
          return institution.name;
        default:
          return institution.name;
      }
    }

    return institution.name;
  };

  const getInstitutionIcon = () => {
    if (!institution) return '🏫';

    switch (institution.type) {
      case 'high_school':
        return '🏫';
      case 'university':
        return '🎓';
      default:
        return '🏫';
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-neutral-700 rounded w-48"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-2xl">{getInstitutionIcon()}</span>
      <h1 className="text-xl md:text-2xl font-bold text-white truncate">
        {getDisplayName()}
      </h1>
      {showType && institution?.type && (
        <span className="text-sm text-neutral-400 bg-neutral-800 px-2 py-1 rounded-full">
          {institution.type === 'high_school' ? 'High School' : 'University'}
        </span>
      )}
    </div>
  );
}

// Hook for using institution data in other components
export const useInstitution = () => {
  const [institution, setInstitution] = useState<InstitutionData | null>(null);

  useEffect(() => {
    const loadInstitution = () => {
      try {
        const sessionData = sessionStorage.getItem('selectedSchool');
        if (sessionData) {
          const schoolData = JSON.parse(sessionData);
          const institutionType = determineInstitutionType(schoolData.name);
          setInstitution({
            id: schoolData.id,
            name: schoolData.name,
            type: institutionType
          });
        }
      } catch (error) {
        console.error('Error loading institution:', error);
      }
    };

    loadInstitution();
  }, []);

  return institution;
};

// Helper function for institution type determination
const determineInstitutionType = (schoolName: string): 'high_school' | 'university' | 'unknown' => {
  const name = schoolName.toLowerCase();

  // University indicators
  if (name.includes('university') || name.includes('college') ||
      name.includes('institute') || name.includes('academy') ||
      name.includes('polytechnic')) {
    return 'university';
  }

  // High school indicators
  if (name.includes('high school') || name.includes('highschool') ||
      name.includes('secondary') || name.includes('hs') ||
      name.includes('grade') || name.includes('9-12')) {
    return 'high_school';
  }

  // Default to high school for CampusCheers target audience
  return 'high_school';
};
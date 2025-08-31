'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';

interface UserSearchResult {
  id: string;
  name: string | null;
  profileImage: string | null;
}

export default function FindFriendsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user data from new authentication system
    const userData = sessionStorage.getItem('userData');
    const selectedSchool = sessionStorage.getItem('selectedSchool');

    if (!userData || !selectedSchool) {
      // Redirect to authentication if not properly logged in
      router.push('/auth/quick-signup');
      return;
    }

    try {
      const user = JSON.parse(userData);
      const school = JSON.parse(selectedSchool);

      setCurrentUser(user);
      setSchoolInfo(school);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/auth/quick-signup');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (searchQuery.trim() === '' || !currentUser?.id || !schoolInfo?.id) {
      setSearchResults([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`/api/users/search`, {
          params: {
            query: searchQuery,
            userId: currentUser.id,
            schoolId: schoolInfo.id
          },
        });
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching for users:', error);
      }
    };

    const debounceTimeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, currentUser?.id, schoolInfo?.id]);

  const handleAddFriend = async (friendId: string) => {
    if (!currentUser?.id) {
      console.error('No current user found.');
      return;
    }
    try {
      await axios.post('/api/friends/add', {
        userId: currentUser.id,
        friendId,
        schoolId: schoolInfo?.id
      });
      setAddedFriends((prev) => new Set(prev).add(friendId));
    } catch (error) {
      console.error('Error adding friend:', error);
      alert('Failed to add friend. They may already be in your friends list.');
    }
  };

  const handleFinishOnboarding = () => {
    // Clear temporary session data now that onboarding is complete
    sessionStorage.removeItem('selectedSchool');

    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cheers-coral-500 mx-auto"></div>
          <p className="mt-4 text-neutral-400">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-900 text-white p-8">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-white">Find Classmates</h1>
        <p className="mt-2 text-md text-neutral-400">
          Connect with friends from {schoolInfo?.name || 'your school'}
        </p>

        {/* School Info Display */}
        <div className="mt-4 p-3 bg-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-300">
            🏫 {schoolInfo?.name || 'School'}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            You can only find and connect with students from your school
          </p>
        </div>

        <div className="mt-6 w-full">
          <InputField
            id="search"
            label="Search classmates by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter a classmate's name..."
          />
        </div>
        <div className="mt-6 w-full text-left h-64 overflow-y-auto">
          {searchResults.length > 0 && (
            <ul className="space-y-3">
              {searchResults.map((user) => (
                <li key={user.id} className="flex items-center justify-between bg-neutral-800 p-3 rounded-lg">
                  <div className="flex items-center">
                    <img
                      src={user.profileImage || `https://i.pravatar.cc/150?u=${user.id}`}
                      alt={user.name || 'User'}
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="ml-4 font-medium">{user.name}</span>
                  </div>
                  <Button
                    size="small"
                    label={addedFriends.has(user.id) ? 'Added' : 'Add'}
                    onClick={() => handleAddFriend(user.id)}
                    disabled={addedFriends.has(user.id)}
                    primary={!addedFriends.has(user.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-8">
          <Button size="large" label="Done" onClick={handleFinishOnboarding} />
        </div>
      </div>
    </main>
  );
}

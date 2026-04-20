// pages/blocked.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface BlockedUser {
  id: number;
  name: string;
  username: string;
  image: string;
  blockedDate: string;
  reason: string;
}

export default function BlockedUsers() {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Load blocked users on mount
  useEffect(() => {
    const loadBlockedUsers = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        
        if (!token) {
          setLoading(false);
          return;
        }

        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
        const response = await fetch(`${apiBase}/users/blocked`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBlockedUsers(data.blocked || []);
        }
      } catch (err) {
        console.error('Failed to load blocked users:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBlockedUsers();
  }, []);

  // Refresh blocked users
  const refreshBlockedUsers = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) return;

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
      const response = await fetch(`${apiBase}/users/blocked`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBlockedUsers(data.blocked || []);
      }
    } catch (err) {
      console.error('Failed to refresh blocked users:', err);
    }
  };

  const handleUnblock = (userId: number, userName: string) => {
    if (window.confirm(`Unblock ${userName}? They will be able to contact you again.`)) {
      setBlockedUsers(blockedUsers.filter((u) => u.id !== userId));
      alert(`${userName} has been unblocked`);
      // Refresh blocked users after unblocking
      refreshBlockedUsers();
    }
  };

  const handleViewProfile = (userId: number) => {
    alert("This would open the user profile in read-only mode");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="px-3 py-1 border rounded">←</button>
        <h1 className="text-xl font-bold">Blocked Users</h1>
        <div className="w-6" />
      </div>

      {/* Info Banner */}
      <div className="flex items-center bg-red-100 border border-red-300 p-4 rounded mb-4">
        <span className="text-2xl mr-3">🚫</span>
        <div>
          <p className="font-semibold">Privacy Protection</p>
          <p className="text-sm text-gray-600">
            Blocked users cannot contact you or see your profile
          </p>
        </div>
      </div>

      {/* Count */}
      <p className="mb-4 text-gray-600">
        {blockedUsers.length} {blockedUsers.length === 1 ? "User" : "Users"} Blocked
      </p>

      {/* Blocked Users List */}
      {blockedUsers.length > 0 ? (
        <div className="space-y-4">
          {blockedUsers.map((user) => (
            <div key={user.id} className="border rounded-lg overflow-hidden">
              <div
                className="flex p-4 cursor-pointer"
                onClick={() => handleViewProfile(user.id)}
              >
                {/* User Image with overlay */}
                <div className="relative mr-4">
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-full">
                    <span className="text-2xl">🚫</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <p className="font-bold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.username}</p>
                  <p className="text-xs text-gray-500">Blocked {user.blockedDate}</p>
                  <p className="text-xs mt-1">
                    <span className="font-semibold">Reason:</span>{" "}
                    <span className="text-red-500">{user.reason}</span>
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleUnblock(user.id, user.name)}
                className="w-full py-2 border-t text-pink-600 font-semibold"
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-10">
          <p className="text-6xl mb-4">✅</p>
          <p className="text-xl font-bold">No Blocked Users</p>
          <p className="text-gray-600">
            You have not blocked anyone yet. Users you block will appear here.
          </p>
        </div>
      )}

      {/* Bottom Info */}
      {blockedUsers.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          💡 Tip: You can unblock users anytime to restore communication
        </div>
      )}
    </div>
  );
}
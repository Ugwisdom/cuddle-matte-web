"use client";

// app/liked/page.tsx (client)
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";

interface LikedUser {
  id: number;
  name: string;
  username: string;
  role: string;
  image: string;
  distance: string;
  tags: string[];
  likedDate: string;
  isMatch: boolean;
  matchedDate?: string;
}

export default function LikedUsers() {
  const router = useRouter();
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
  const [filter, setFilter] = useState<"all" | "matches" | "pending">("all");
  const [loading, setLoading] = useState(true);

  // Load liked users on mount
  useEffect(() => {
    const loadLikedUsers = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        
        if (!token) {
          setLoading(false);
          return;
        }

        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
        const response = await fetch(`${apiBase}/users/likes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLikedUsers(data.likes || []);
        }
      } catch (err) {
        console.error('Failed to load liked users:', err);
      } finally {
        setLoading(false);
      }
    };

    loadLikedUsers();
  }, []);

  // Refresh liked users
  const refreshLikedUsers = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) return;

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
      const response = await fetch(`${apiBase}/users/likes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLikedUsers(data.likes || []);
      }
    } catch (err) {
      console.error('Failed to refresh liked users:', err);
    }
  };

  const filteredUsers = likedUsers.filter((u) => {
    if (filter === "matches") return u.isMatch;
    if (filter === "pending") return !u.isMatch;
    return true;
  });

  const handleUnlike = (id: number, name: string) => {
    if (window.confirm(`Unlike ${name}?`)) {
      setLikedUsers(likedUsers.filter((u) => u.id !== id));
      // Refresh liked users after unliking
      refreshLikedUsers();
    }
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="text-2xl leading-none"
        >
          ←
        </button>
        <h1 className="text-xl font-bold">Liked Users</h1>
        <div className="w-6" />
      </header>

      {/* Filter Tabs */}
  <div className="flex gap-2 mb-4">
        {( ["all", "matches", "pending"] as const ).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded ${
              filter === f ? "bg-pink-500 text-white" : "bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredUsers.length > 0 ? (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div key={user.id} className="border rounded p-4">
              <Image
                src={user.image}
                alt={user.name}
                width={80}
                height={80}
                unoptimized
                className="w-20 h-20 rounded-full mb-2 object-cover"
              />
              <h2 className="font-bold">{user.name}</h2>
              <p>{user.role}</p>
              <p>📍 {user.distance}</p>
              <p className="text-xs italic">Liked {user.likedDate}</p>
              {user.isMatch && (
                <p className="text-pink-600">Matched {user.matchedDate}</p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-pink-500 text-white px-3 py-1 rounded"
                  onClick={() => alert(`Message ${user.name}`)}
                >
                  💬 Message
                </button>
                <button
                  className="bg-gray-200 px-3 py-1 rounded"
                  onClick={() => handleUnlike(user.id, user.name)}
                >
                  💔 Unlike
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-10">
          <p>No liked users yet</p>
          <button
            onClick={() => router.push("/users")}
            className="bg-pink-500 text-white px-4 py-2 rounded mt-4"
          >
            Explore Users
          </button>
        </div>
      )}
    </div>
  );
}
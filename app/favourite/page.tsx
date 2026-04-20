// pages/favorites.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface FavoriteUser {
  id: number;
  name: string;
  username: string;
  role: string;
  rating: number;
  reviews: number;
  image: string;
  verified: boolean;
  distance: string;
  price: string;
  availability: string;
  favoritedDate: string;
  tags: string[];
  lastSession: string;
}

export default function FavoriteUsers() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favoriteUsers, setFavoriteUsers] = useState<FavoriteUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorite users on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        
        if (!token) {
          setLoading(false);
          return;
        }

        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
        const response = await fetch(`${apiBase}/users/favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFavoriteUsers(data.favorites || []);
        }
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Refresh favorites
  const refreshFavorites = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) return;

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
      const response = await fetch(`${apiBase}/users/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavoriteUsers(data.favorites || []);
      }
    } catch (err) {
      console.error('Failed to refresh favorites:', err);
    }
  };

  const filteredUsers = favoriteUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleRemoveFavorite = (userId: number, userName: string) => {
    if (window.confirm(`Remove ${userName} from favorites?`)) {
      setFavoriteUsers(favoriteUsers.filter((u) => u.id !== userId));
      // Refresh favorites after removing
      refreshFavorites();
    }
  };

  const handleViewProfile = (userId: number) => {
    router.push(`/user/${userId}`);
  };

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-4">
        <button onClick={() => router.back()}>← Back</button>
        <h1 className="text-xl font-bold">Favorites</h1>
        <button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
          {viewMode === "grid" ? "☰" : "⊞"}
        </button>
      </header>

      <div className="mb-4 flex items-center border p-2 rounded">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Search favorites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 ml-2"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")}>✕</button>
        )}
      </div>

      <p className="mb-4">{filteredUsers.length} Favorites</p>

      {filteredUsers.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-4"}>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="border rounded p-4 cursor-pointer"
              onClick={() => handleViewProfile(user.id)}
            >
              <img src={user.image} alt={user.name} className="w-full h-40 object-cover rounded" />
              <h2 className="font-bold mt-2">{user.name}</h2>
              <p>{user.role}</p>
              <p>⭐ {user.rating} · {user.reviews} reviews</p>
              <p>{user.price}</p>
              <button
                className="text-red-500 mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFavorite(user.id, user.name);
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center mt-10">
          <p>No Favorites Yet</p>
          <button onClick={() => router.push("/users")}>Explore Users</button>
        </div>
      )}
    </div>
  );
}
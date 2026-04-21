"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "next-auth/react";
import styles from "./home.module.css";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_USER = {
  name: "Alex Jordan",
  email: "alex@cuddlematte.app",
  avatar: "https://i.pravatar.cc/100?img=8",
};

const SERVICES = [
  { id: 1, icon: "💆", name: "Massage", count: 45, route: "../getapp" },
  { id: 2, icon: "🛋️", name: "Apartment", count: 89, route: "../getapp" },
  { id: 3, icon: "🎭", name: "Groups", count: 34, route: "../getapp" },
  { id: 4, icon: "🎵", name: "Ushering", count: 28, route: "../getapp" },
];

const STORIES_DATA = [
  {
    id: 1, name: "Your Story", image: "https://i.pravatar.cc/150?img=1",
    hasStory: false, isYourStory: true, segments: [],
  },
  {
    id: 2, name: "Sarah", image: "https://i.pravatar.cc/150?img=2", hasStory: true,
    segments: [
      { id: 1, image: "https://picsum.photos/400/700?random=1", duration: 5000, viewCount: 42 },
      { id: 2, image: "https://picsum.photos/400/700?random=2", duration: 5000, viewCount: 37 },
    ],
  },
  {
    id: 3, name: "Mike", image: "https://i.pravatar.cc/150?img=3", hasStory: true,
    segments: [
      { id: 1, image: "https://picsum.photos/400/700?random=4", duration: 5000, viewCount: 85 },
      { id: 2, image: "https://picsum.photos/400/700?random=5", duration: 5000, viewCount: 72 },
    ],
  },
  {
    id: 4, name: "Emma", image: "https://i.pravatar.cc/150?img=4", hasStory: true,
    segments: [
      { id: 1, image: "https://picsum.photos/400/700?random=6", duration: 5000, viewCount: 156 },
      { id: 2, image: "https://picsum.photos/400/700?random=7", duration: 5000, viewCount: 143 },
      { id: 3, image: "https://picsum.photos/400/700?random=8", duration: 5000, viewCount: 128 },
    ],
  },
  {
    id: 5, name: "James", image: "https://i.pravatar.cc/150?img=5", hasStory: true,
    segments: [{ id: 1, image: "https://picsum.photos/400/700?random=10", duration: 5000, viewCount: 54 }],
  },
  {
    id: 6, name: "Lisa", image: "https://i.pravatar.cc/150?img=6", hasStory: true,
    segments: [
      { id: 1, image: "https://picsum.photos/400/700?random=11", duration: 5000, viewCount: 91 },
      { id: 2, image: "https://picsum.photos/400/700?random=12", duration: 5000, viewCount: 78 },
    ],
  },
];

const POPULAR_SEARCHES = ["Massage", "Cuddle Session", "Movie Night", "Dinner Date"];

// ── Story Viewer ──────────────────────────────────────────────────────────────
interface StorySegment {
  id: number;
  image: string;
  duration: number;
  viewCount: number;
}

interface Story {
  id: number;
  name: string;
  image: string;
  hasStory: boolean;
  isYourStory?: boolean;
  segments: StorySegment[];
}

interface ServiceData {
  _id?: string;
  id?: string | number;
  name?: string;
  providersCount?: number;
}

function StoryViewer({ stories, storyIndex, segIndex, onClose, onNext, onPrev, onDelete }: {
  stories: Story[];
  storyIndex: number;
  segIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onDelete?: (storyIndex: number, segIndex: number) => void;
}) {
  const story = stories[storyIndex];
  const seg = story?.segments?.[segIndex];
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(null);
  const progressAtPause = useRef(0);

  const startAnim = useCallback((from: number) => {
    if (!seg) return;
    const began = performance.now();
    const tick = (now: number) => {
      const elapsed = now - began;
      const p = from + elapsed / seg.duration;
      if (p >= 1) { setProgress(1); onNext(); return; }
      setProgress(p);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [seg, onNext]);

  useEffect(() => {
    if (!seg) return;
    // Reset progress immediately when the story segment changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgress(0);
    startRef.current = null;
    progressAtPause.current = 0;
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [seg, storyIndex, segIndex, paused]);

  useEffect(() => {
    if (paused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      progressAtPause.current = progress;
    } else if (seg && !paused) {
      startAnim(progressAtPause.current);
    }
  }, [paused, seg, progress, startAnim]);

  if (!story || !seg) return null;

  return (
    <div className={styles.storyOverlay} onClick={(e) => e.stopPropagation()}>
      {/* progress bars */}
      <div className={styles.storyProgressRow}>
        {story.segments.map((_, i: number) => (
          <div key={i} className={styles.storyProgressBar}>
            <div
              className={styles.storyProgressFill}
              style={{ width: i < segIndex ? "100%" : i === segIndex ? `${progress * 100}%` : "0%" }}
            />
          </div>
        ))}
      </div>

      {/* header */}
      <div className={styles.storyHeader}>
        <div className={styles.storyHeaderLeft}>
          <img src={story.image} className={styles.storyAvatarSmall} alt={story.name} />
          <span className={styles.storyHeaderName}>{story.name}</span>
          <span className={styles.storyHeaderTime}>2h ago</span>
        </div>
        <div className={styles.storyHeaderRight}>
          {seg?.viewCount !== undefined && (
            <span className={styles.viewCount}>👁️ {seg.viewCount}</span>
          )}
          {story.isYourStory && (
            <button className={styles.deleteBtn} onClick={() => onDelete && onDelete(storyIndex, segIndex)} title="Delete story">🗑️</button>
          )}
          <button className={styles.storyClose} onClick={onClose}>✕</button>
        </div>
      </div>

      {/* image */}
      <img src={seg.image} className={styles.storyFullImg} alt="" />

      {/* gradient overlays */}
      <div className={styles.storyGradTop} />
      <div className={styles.storyGradBottom} />

      {/* tap zones */}
      <div className={styles.storyTapZones}>
        <div
          className={styles.storyTapLeft}
          onClick={onPrev}
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        />
        <div
          className={styles.storyTapRight}
          onClick={onNext}
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        />
      </div>

      {paused && (
        <div className={styles.pauseIndicator}>
          <div className={styles.pauseBar} />
          <div className={styles.pauseBar} />
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [storyOpen, setStoryOpen] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [segIndex, setSegIndex] = useState(0);
  const [addStoryOpen, setAddStoryOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [userStories, setUserStories] = useState<StorySegment[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [services, setServices] = useState(SERVICES);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  // Load services on mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
        const response = await fetch(`${apiBase}/massages/services`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Transform backend data to match UI format
          const responseItems = (data.services || data) as ServiceData[];
          const transformedServices = responseItems.map((service) => ({
            id: Number(service._id || service.id) || 0,
            icon: '💆',
            name: service.name || 'Service',
            count: service.providersCount || 0,
            route: '../getapp',
          }));
          setServices(transformedServices);
        } else {
          // Keep fallback SERVICES on error
          setServices(SERVICES);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
        // Keep fallback SERVICES on error
        setServices(SERVICES);
      }
    };

    loadServices();
  }, []);

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
        
        // For Google OAuth users, we might not have a backend token
        // In that case, we can use the session user data
        if (!token && user) {
          // Handle Google OAuth user - they might not have backend data yet
          console.log('Google OAuth user detected:', user);
          return;
        }

        if (!token) {
          return;
        }

        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
        const response = await fetch(`${apiBase}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // setCurrentUser(data.user); // Not used currently
          
          // Load user stories if available
          if (data.user?.stories?.length > 0) {
            setUserStories(data.user.stories);
          }
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
      }
    };

    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated, user]);

  // Refresh user data function for call after mutations
  const refreshUserData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) return;

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
      const response = await fetch(`${apiBase}/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // const data = await response.json(); // Not used
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  };

  const stories = [
    {
      ...STORIES_DATA[0],
      hasStory: userStories.length > 0,
      image: userStories.length > 0 ? userStories[userStories.length - 1].image : STORIES_DATA[0].image,
      segments: userStories,
    },
    ...STORIES_DATA.slice(1),
  ];

  // ── Story handlers
  const handleStoryClick = (i: number) => {
    const s = stories[i];
    if (s.isYourStory) { setAddStoryOpen(true); return; }
    if (s.hasStory && s.segments.length) {
      setStoryIndex(i); setSegIndex(0); setStoryOpen(true);
    }
  };

  const goNextSeg = () => {
    const s = stories[storyIndex];
    if (segIndex < s.segments.length - 1) { setSegIndex(segIndex + 1); }
    else goNextStory();
  };
  const goPrevSeg = () => {
    if (segIndex > 0) { setSegIndex(segIndex - 1); }
    else goPrevStory();
  };
  const goNextStory = () => {
    const n = storyIndex + 1;
    if (n < stories.length && stories[n].hasStory) { setStoryIndex(n); setSegIndex(0); }
    else setStoryOpen(false);
  };
  const goPrevStory = () => {
    const p = storyIndex - 1;
    if (p >= 0 && stories[p].hasStory) { setStoryIndex(p); setSegIndex(stories[p].segments.length - 1); }
  };

  // ── File picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
  };

  const postStory = async () => {
    if (!selectedImage) return;
    setIsPosting(true);
    await new Promise((r) => setTimeout(r, 600));
    setUserStories((prev) => [...prev, { id: Date.now(), image: selectedImage, duration: 5000, caption, viewCount: 0 }]);
    setSelectedImage(null); 
    setCaption(""); 
    setIsPosting(false); 
    setAddStoryOpen(false);
    
    // Refresh user data after posting story
    await refreshUserData();
  };

  const deleteStory = (storyIndex: number, segIndex: number) => {
    if (storyIndex === 0) {
      // Delete from userStories if it's your story
      setUserStories((prev) => prev.filter((_, i) => i !== segIndex));
      if (userStories.length <= 1) {
        setStoryOpen(false);
      }
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (token) {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
        try {
          await fetch(`${apiBase}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } catch (err) {
          console.warn('Logout request failed:', err);
        }
      }

      // Sign out from NextAuth as well
      await signOut({ callbackUrl: '/auth/login' });

      // Clear auth token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
      
      setDrawerOpen(false);
      router.push('/auth/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className={`${styles.root} ${isDark ? styles.dark : styles.light}`}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <button className={styles.avatarBtn} onClick={() => setDrawerOpen(true)}>
          <img src={MOCK_USER.avatar} className={styles.headerAvatar} alt="profile" />
        </button>
        <span className={styles.logo}>CuddleMatte</span>
        <button className={styles.iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </header>

      <main className={styles.scrollArea}>
        {/* ── Stories ── */}
        <section className={styles.storiesSection}>
          <h2 className={styles.storiesLabel}>Stories</h2>
          <div className={styles.storiesScroll}>
            {stories.map((s: Story, i: number) => (
              <button key={s.id} className={styles.storyBtn} onClick={() => handleStoryClick(i)}>
                <div className={`${styles.storyRing} ${s.hasStory ? styles.storyRingActive : ""} ${s.isYourStory ? styles.storyRingYou : ""}`}>
                  <img src={s.image} className={styles.storyThumb} alt={s.name} />
                  {s.isYourStory && <span className={styles.storyPlus}>+</span>}
                </div>
                <span className={styles.storyName}>{s.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Search bar ── */}
        <div className={styles.inlineSearch}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search mattes, services…"
            className={styles.inlineSearchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* ── Services ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Popular Services</h2>
          <div className={styles.servicesGrid}>
            {services.map((sv) => (
              <a key={sv.id} href={sv.route} className={styles.serviceCard}>
                <span className={styles.serviceIcon}>{sv.icon}</span>
                <span className={styles.serviceName}>{sv.name}</span>
                <span className={styles.serviceCount}>{sv.count} providers</span>
              </a>
            ))}
          </div>
        </section>

        <footer className={styles.footer}>
          <p className={styles.footerText}>© {new Date().getFullYear()} CuddleMatte · All rights reserved</p>
        </footer>
      </main>

      {/* ── Story Viewer Modal ── */}
      {storyOpen && (
        <div className={styles.modalBackdrop} onClick={() => setStoryOpen(false)}>
          <StoryViewer
            stories={stories}
            storyIndex={storyIndex}
            segIndex={segIndex}
            onClose={() => setStoryOpen(false)}
            onNext={goNextSeg}
            onPrev={goPrevSeg}
            onDelete={deleteStory}
          />
        </div>
      )}

      {/* ── Add Story Modal ── */}
      {addStoryOpen && (
        <div className={styles.modalBackdrop} onClick={() => { setAddStoryOpen(false); setSelectedImage(null); }}>
          <div className={styles.addStoryModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={() => { setAddStoryOpen(false); setSelectedImage(null); }}>✕</button>

            {!selectedImage ? (
              <div className={styles.pickerScreen}>
                <h2 className={styles.pickerTitle}>Add to Your Story</h2>
                <p className={styles.pickerSub}>Share a moment with your mattes</p>
                <div className={styles.pickerOptions}>
                  <button className={`${styles.pickerOption} ${styles.pickerGallery}`} onClick={() => fileInputRef.current?.click()}>
                    <span className={styles.pickerOptionIcon}>🖼️</span>
                    <span className={styles.pickerOptionLabel}>Gallery</span>
                    <span className={styles.pickerOptionSub}>Choose from photos</span>
                  </button>
                  <button className={`${styles.pickerOption} ${styles.pickerCamera}`} onClick={() => fileInputRef.current?.click()}>
                    <span className={styles.pickerOptionIcon}>📸</span>
                    <span className={styles.pickerOptionLabel}>Camera</span>
                    <span className={styles.pickerOptionSub}>Take a new photo</span>
                  </button>
                </div>
                {userStories.length > 0 && (
                  <button className={styles.previewExisting} onClick={() => { setAddStoryOpen(false); setStoryIndex(0); setSegIndex(0); setStoryOpen(true); }}>
                    ✅ Preview your {userStories.length} active {userStories.length === 1 ? "story" : "stories"}
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className={styles.hiddenFileInput} onChange={handleFileChange} title="Select image for story" />
              </div>
            ) : (
              <div className={styles.previewScreen}>
                <img src={selectedImage} className={styles.previewImg} alt="story preview" />
                <div className={styles.previewTopBar}>
                  <button className={styles.previewBackBtn} onClick={() => setSelectedImage(null)}>← Back</button>
                  <button className={styles.changeBtn} onClick={() => fileInputRef.current?.click()}>🖼️ Change</button>
                </div>
                <div className={styles.previewBottomBar}>
                  <textarea
                    className={styles.captionInput}
                    placeholder="Add a caption…"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    maxLength={150}
                  />
                  <div className={styles.previewActions}>
                    <button className={styles.discardBtn} onClick={() => { setAddStoryOpen(false); setSelectedImage(null); }}>Discard</button>
                    <button className={styles.postBtn} onClick={postStory} disabled={isPosting}>
                      {isPosting ? "Posting…" : "✈ Post Story"}
                    </button>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className={styles.hiddenFileInput} onChange={handleFileChange} title="Select image for story" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Drawer ── */}
      {drawerOpen && (
        <div className={styles.modalBackdrop} onClick={() => setDrawerOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHandle} />
            <div className={styles.drawerHeader}>
              <img src={MOCK_USER.avatar} className={styles.drawerAvatar} alt="user" />
              <span className={styles.drawerName}>{MOCK_USER.name}</span>
              <span className={styles.drawerEmail}>{MOCK_USER.email}</span>
            </div>
            <div className={styles.drawerMenu}>
              {[
                { icon: "👤", label: "My Profile", href: "/profile" },
                { icon: "💸", label: "Wallet", href: "/wallet" },
                { icon: "🪄", label: "Request Ushering", href: "/getapp" },
                { icon: "⚙️", label: "Settings", href: "/settings" },
                { icon: "💝", label: "Favorites", href: "/getapp" },
                { icon: "💬", label: "Messages", href: "/getapp" },
                { icon: "🔔", label: "Notifications", href: "/getapp" },
                { icon: "ℹ️", label: "Help & Support", href: "/support/help" },
              ].map((item) => (
                <a key={item.label} href={item.href} className={styles.drawerItem}>
                  <span className={styles.drawerItemIcon}>{item.icon}</span>
                  <span className={styles.drawerItemText}>{item.label}</span>
                </a>
              ))}
              <button className={styles.drawerItem} onClick={() => setIsDark(!isDark)}>
                <span className={styles.drawerItemIcon}>{isDark ? "🌙" : "☀️"}</span>
                <span className={styles.drawerItemText}>{isDark ? "Dark Mode" : "Light Mode"}</span>
                <div className={`${styles.toggle} ${isDark ? styles.toggleOn : ""}`}><div className={styles.toggleThumb} /></div>
              </button>
              <button className={`${styles.drawerItem} ${styles.drawerItemDanger}`} onClick={handleLogout} disabled={isLoggingOut}>
                <span className={styles.drawerItemIcon}>🚪</span>
                <span className={styles.drawerItemTextDanger}>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Search Modal ── */}
      {searchOpen && (
        <div className={styles.modalBackdrop} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>
          <div className={styles.searchModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.searchModalHeader}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                autoFocus
                type="text"
                placeholder="Search for mattes, services..."
                className={styles.searchModalInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className={styles.searchCloseBtn} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>✕</button>
            </div>
            <div className={styles.searchResults}>
              <p className={styles.searchCat}>Popular Searches</p>
              {POPULAR_SEARCHES.map((term, i) => (
                <button key={i} className={styles.searchResultItem}>
                  <span>🔍</span>
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
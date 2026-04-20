'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from './ProfileInfo.module.css'

interface Errors {
  [key: string]: string
}

const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other']
const distanceRanges = ['5 km', '10 km', '25 km', '50 km', '100 km', 'Anywhere']

export default function UpdateProfile() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [pronouns, setPronouns] = useState('')
  const [gender, setGender] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [distanceRange, setDistanceRange] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // UI states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Load user data on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
        
        if (!token) {
          setErrorMsg('You must be signed in to edit your profile')
          router.push('/auth/login')
          return
        }

        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'
        const response = await fetch(`${apiBase}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to load profile')
        }

        const data = await response.json()
        const user = data.user

        if (user) {
          setFullName(user.name || '')
          setUsername(user.username || '')
          setUserPhone(user.phone || '')
          setPronouns(user.pronouns || '')
          setGender(user.gender || '')
          setLocation(user.city || '')
          setBio(user.bio || '')
          
          if (user.preferences?.ageRange) {
            const ageStr = typeof user.preferences.ageRange === 'object'
              ? `${user.preferences.ageRange.min}-${user.preferences.ageRange.max}`
              : String(user.preferences.ageRange)
            setAgeRange(ageStr)
          }
          
          if (user.preferences?.maxDistance) {
            setDistanceRange(`${user.preferences.maxDistance} km`)
          }
          
          if (user.photos?.length > 0) {
            setAvatarUrl(user.photos[0])
          } else if (user.photo) {
            setAvatarUrl(user.photo)
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
        setErrorMsg('Failed to load your profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [router])

  function parseDistance(s: string) {
    if (!s) return undefined
    if (s.toLowerCase().includes('anywhere')) return 500
    const m = s.match(/(\d+)/)
    return m ? Number(m[1]) : undefined
  }

  const validateForm = () => {
    const e: Errors = {}
    
    if (fullName && (fullName.length < 2 || fullName.length > 50))
      e.name = 'Name must be between 2 and 50 characters'
    
    if (username) {
      if (username.length < 3 || username.length > 30)
        e.username = 'Username must be between 3 and 30 characters'
      else if (!/^[a-z0-9_]+$/i.test(username))
        e.username = 'Username can only contain letters, numbers, and underscores'
    }
    
    if (location) {
      if (location.length < 2 || location.length > 100)
        e.city = 'City must be between 2 and 100 characters'
      else if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(location))
        e.city = 'City contains invalid characters'
    }
    
    if (userPhone && !/^\+?[\d\s\-\(\)]{10,}$/.test(userPhone))
      e.phone = 'Phone number is invalid'
    
    if (bio && bio.length > 500)
      e.bio = 'Bio cannot exceed 500 characters'
    
    if (ageRange && !/^(\d{2,3})-(\d{2,3})$/.test(ageRange))
      e.ageRange = 'Select a valid age range'
    
    if (distanceRange && parseDistance(distanceRange) === undefined)
      e.distanceRange = 'Select a valid distance range'
    
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    setErrorMsg('')
    
    if (!validateForm()) {
      setErrorMsg('Please fix the errors above')
      return
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

    if (!token) {
      setErrorMsg('You must be signed in to update your profile')
      return
    }

    setSaving(true)
    try {
      const prefs: any = {}
      const ageMatch = String(ageRange).match(/(\d{2,3})\s*-\s*(\d{2,3})/)
      if (ageMatch) {
        prefs.ageRange = { min: Number(ageMatch[1]), max: Number(ageMatch[2]) }
      }
      const maxDistance = parseDistance(distanceRange)
      if (maxDistance !== undefined) {
        prefs.maxDistance = maxDistance
      }

      const body: any = {}
      if (fullName) body.name = fullName
      if (username) body.username = username
      if (userPhone) body.phone = userPhone
      if (pronouns) body.pronouns = pronouns
      if (gender) body.gender = gender
      if (location) body.city = location
      if (bio) body.bio = bio
      if (Object.keys(prefs).length > 0) body.preferences = prefs

      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'
      const response = await fetch(`${apiBase}/users/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data?.message) {
          setErrorMsg(data.message)
        } else if (data?.error) {
          setErrorMsg(data.error)
        } else {
          setErrorMsg('Failed to update profile')
        }
        return
      }

      setSuccessMsg('Profile updated successfully!')
      setTimeout(() => {
        router.back()
      }, 2000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Please try again')
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Please choose an image smaller than 5 MB')
      return
    }
    
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Please choose a JPG or PNG image')
      return
    }

    // Preview locally
    const localUrl = URL.createObjectURL(file)
    setAvatarUrl(localUrl)

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    
    if (!token) {
      setErrorMsg('You must be signed in to change your photo')
      return
    }

    setUploading(true)
    setErrorMsg('')
    
    try {
      const formData = new FormData()
      formData.append('photo', file)
      
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001'
      const res = await fetch(`${apiBase}/uploads/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data?.error || data?.message || 'Upload failed')
        return
      }

      setSuccessMsg('Photo uploaded successfully!')
      setTimeout(() => setSuccessMsg(''), 2000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed, please try again')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>←</button>
          <div className={styles.headerContent}>
            <h1 className={styles.headerTitle}>Edit Profile</h1>
          </div>
          <div className={styles.placeholder} />
        </header>
        <div className={styles.scrollView} style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p>Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>←</button>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Edit Profile</h1>
          <p className={styles.headerSubtitle}>Update your profile information</p>
        </div>
        <div className={styles.placeholder} />
      </header>

      <div className={styles.scrollView}>
        {/* Success Message */}
        {successMsg && (
          <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px 20px', textAlign: 'center', fontWeight: 600, margin: '12px 20px', borderRadius: '8px' }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 20px', textAlign: 'center', fontWeight: 600, margin: '12px 20px', borderRadius: '8px' }}>
            ✕ {errorMsg}
          </div>
        )}

        {/* Avatar */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatarPlaceholder}>
              {avatarUrl
                ? <img src={avatarUrl} alt="Avatar" />
                : <span>👤</span>
              }
            </div>
            <button className={styles.avatarBadge} onClick={() => fileInputRef.current?.click()} disabled={uploading} type="button">
              📷
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          <button className={styles.changePhotoText} onClick={() => fileInputRef.current?.click()} disabled={uploading} type="button">
            {uploading ? 'Uploading…' : 'Change Photo'}
          </button>
        </div>

        {/* Form */}
        <div className={styles.formSection}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>👤</span>
              <input className={styles.input} placeholder="Enter your full name" value={fullName} onChange={e => setFullName(e.target.value)} disabled={saving} />
            </div>
            {errors.name && <p className={styles.errorText}>{errors.name}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Username</label>
            <div className={styles.inputWrapper}>
              <span className={styles.atSymbol}>@</span>
              <input className={styles.input} placeholder="username" value={username} onChange={e => setUsername(e.target.value)} autoCapitalize="none" disabled={saving} />
            </div>
            {errors.username && <p className={styles.errorText}>{errors.username}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Phone Number</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>📞</span>
              <input className={styles.input} placeholder="Enter phone number" value={userPhone} onChange={e => setUserPhone(e.target.value)} type="tel" disabled={saving} />
            </div>
            {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Pronouns</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>💬</span>
              <input className={styles.input} placeholder="e.g., they/them, she/her, he/him" value={pronouns} onChange={e => setPronouns(e.target.value)} disabled={saving} />
            </div>
            {errors.pronouns && <p className={styles.errorText}>{errors.pronouns}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Gender</label>
            <div className={styles.optionsContainer}>
              {genderOptions.map(option => (
                <button
                  key={option}
                  className={`${styles.optionButton} ${gender === option ? styles.optionButtonActive : ''}`}
                  onClick={() => setGender(option)}
                  disabled={saving}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Location</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>📍</span>
              <input className={styles.input} placeholder="City, Country" value={location} onChange={e => setLocation(e.target.value)} disabled={saving} />
            </div>
            {errors.city && <p className={styles.errorText}>{errors.city}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Age Range</label>
            <div className={styles.optionsContainer}>
              {ageRanges.map(range => (
                <button
                  key={range}
                  className={`${styles.optionButton} ${ageRange === range ? styles.optionButtonActive : ''}`}
                  onClick={() => setAgeRange(range)}
                  disabled={saving}
                  type="button"
                >
                  {range}
                </button>
              ))}
            </div>
            {errors.ageRange && <p className={styles.errorText}>{errors.ageRange}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Distance Range</label>
            <div className={styles.optionsContainer}>
              {distanceRanges.map(range => (
                <button
                  key={range}
                  className={`${styles.optionButton} ${distanceRange === range ? styles.optionButtonActive : ''}`}
                  onClick={() => setDistanceRange(range)}
                  disabled={saving}
                  type="button"
                >
                  {range}
                </button>
              ))}
            </div>
            {errors.distanceRange && <p className={styles.errorText}>{errors.distanceRange}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Bio</label>
            <div className={`${styles.inputWrapper} ${styles.bioWrapper}`}>
              <textarea
                className={`${styles.input} ${styles.bioInput}`}
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={500}
                disabled={saving}
              />
            </div>
            <p className={styles.charCount}>{bio.length}/500</p>
            {errors.bio && <p className={styles.errorText}>{errors.bio}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.buttonContainer}>
          <button className={styles.saveButton} onClick={handleSave} disabled={saving} type="button">
            ✓ {saving ? 'Saving…' : 'Save Profile'}
          </button>
          <button className={styles.cancelButton} onClick={() => router.back()} disabled={saving} type="button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

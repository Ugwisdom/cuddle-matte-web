import User from '../models/User';

const calculateDistance = (coords1: number[], coords2: number[]): number => {
  const [lon1, lat1] = coords1;
  const [lon2, lat2] = coords2;
  
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

const calculateAge = (dateOfBirth: string | Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

const getPotentialMatches = async (userId: string) => {
  try {
    const currentUser = await User.findById(userId);
    
    if (!currentUser) {
      throw new Error('User not found');
    }

    if (!currentUser.location || 
        !currentUser.location.coordinates || 
        (currentUser.location.coordinates[0] === 0 && currentUser.location.coordinates[1] === 0)) {
      throw new Error('Please set your location to find matches');
    }

    const currentUserAge = calculateAge(currentUser.dateOfBirth);

    const excludedUsers = [
      userId,
      ...currentUser.likes,
      ...currentUser.dislikes,
      ...currentUser.matches
    ];

    const potentialMatches = await User.find({
      _id: { $nin: excludedUsers },
      gender: { $in: currentUser.interestedIn },
      interestedIn: { $in: [currentUser.gender] },
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: currentUser.location.coordinates
          },
          $maxDistance: currentUser.preferences.maxDistance * 1000
        }
      }
    })
    .select('-password -email -likes -dislikes -matches')
    .limit(50)
    .lean();

    const filteredMatches = potentialMatches.filter(match => {
      const matchAge = calculateAge(match.dateOfBirth);
      
      const meetsCurrentUserPrefs = 
        matchAge >= currentUser.preferences.ageRange.min && 
        matchAge <= currentUser.preferences.ageRange.max;
      
      const meetsMatchPrefs = 
        currentUserAge >= match.preferences.ageRange.min && 
        currentUserAge <= match.preferences.ageRange.max;
      
      return meetsCurrentUserPrefs && meetsMatchPrefs;
    });

    const matchesWithDistance = filteredMatches.map(match => {
      const distance = calculateDistance(
        currentUser.location.coordinates,
        match.location.coordinates
      );
      
      return {
        ...match,
        distance,
        age: calculateAge(match.dateOfBirth)
      };
    });

    matchesWithDistance.sort((a, b) => a.distance - b.distance);

    return matchesWithDistance;

  } catch (error) {
    throw error;
  }
};

const areUsersCompatible = (user1: any, user2: any) => {
  const user1InterestedInUser2 = user1.interestedIn.includes(user2.gender);
  const user2InterestedInUser1 = user2.interestedIn.includes(user1.gender);
  
  if (!user1InterestedInUser2 || !user2InterestedInUser1) {
    return false;
  }

  const user1Age = calculateAge(user1.dateOfBirth);
  const user2Age = calculateAge(user2.dateOfBirth);
  
  const user1AgeInUser2Range = 
    user1Age >= user2.preferences.ageRange.min && 
    user1Age <= user2.preferences.ageRange.max;
  
  const user2AgeInUser1Range = 
    user2Age >= user1.preferences.ageRange.min && 
    user2Age <= user1.preferences.ageRange.max;
  
  if (!user1AgeInUser2Range || !user2AgeInUser1Range) {
    return false;
  }

  const distance = calculateDistance(
    user1.location.coordinates,
    user2.location.coordinates
  );
  
  return distance <= Math.max(user1.preferences.maxDistance, user2.preferences.maxDistance);
};

export {
  calculateDistance,
  calculateAge,
  getPotentialMatches,
  areUsersCompatible
};

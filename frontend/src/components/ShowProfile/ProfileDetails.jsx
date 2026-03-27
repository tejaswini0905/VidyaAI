import React, { useState, useEffect } from 'react';

const ProfileDetails = () => {
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    lang: 'English',
    education: '',
    age: '',
    grades: '',
    school: '',
    profile_picture: null
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) return null;
      
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return null;
      
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log(payload.user_id)
      return payload.user_id || payload.sub || null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const fetchUserProfile = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    const currentUserId = getUserIdFromToken();

    const response = await fetch(`http://127.0.0.1:8000/api/v1/auth/profile/${currentUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile data');
    }

    const result = await response.json();
    
    // Debug: Log the entire response
    console.log('API Response:', result);
    
    const userData = result.user;
    
    // Debug: Log the user data
    console.log('User Data:', userData);
    console.log('Profile Picture URL:', userData.profile_picture);
    
    setUserData({
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      email: userData.email || '',
      lang: userData.lang || 'English',
      education: userData.education || '',
      age: userData.age || '',
      grades: userData.grades || '',
      school: userData.school || '',
      profile_picture: userData.profile_picture
    });

    // Set image preview if profile picture exists
    if (userData.profile_picture) {
      const profilePictureUrl = `http://127.0.0.1:8000${userData.profile_picture}`;
      console.log('Full Profile Picture URL:', profilePictureUrl);
      setImagePreview(profilePictureUrl);
    } else {
      console.log('No profile picture found');
      setImagePreview(null);
    }

  } catch (err) {
    setError(err.message);
    console.error('Error fetching profile:', err);
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfileImage(null);
    setImagePreview(null);
    // If there was an existing profile picture, we'll handle deletion in the save function
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      
      // Append all user data
      Object.keys(userData).forEach(key => {
        if (key !== 'profile_picture') {
          formData.append(key, userData[key]);
        }
      });

      // Append new profile picture if selected
      if (profileImage) {
        formData.append('profile_picture', profileImage);
      } else if (imagePreview === null && userData.profile_picture) {
        // If user removed the profile picture
        formData.append('remove_profile_picture', 'true');
      }

      // API call to update user profile
      const response = await fetch('http://127.0.0.1:8000/api/v1/auth/profile/', {
        method: 'PUT',
        body: formData,
        // Don't set Content-Type header for FormData
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      // If update is successful, exit edit mode and refetch
      setIsEditing(false);
      setProfileImage(null);
      fetchUserProfile();
      console.log('Profile updated successfully');
      
    } catch (err) {
      setError(err.message);
      console.error('Error updating profile:', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileImage(null);
    // Reset image preview to original
    if (userData.profile_picture) {
      setImagePreview(`http://127.0.0.1:8000${userData.profile_picture}`);
    } else {
      setImagePreview(null);
    }
    // Refetch original data to reset any changes
    fetchUserProfile();
  };

  // Handle Home button click
  const handleHomeClick = () => {
    window.location.href = '/teacher';
    console.log('Navigating to home page...');
  };

  // Format the current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get full name by combining first and last name
  const fullName = `${userData.first_name} ${userData.last_name}`.trim();
  const firstName = userData.first_name || 'User';

  // Get avatar initials from first and last name
  const getAvatarInitials = () => {
    if (userData.first_name && userData.last_name) {
      return `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase();
    } else if (userData.first_name) {
      return userData.first_name[0].toUpperCase();
    }
    return 'U';
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: '#f7f9fc', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <div style={{ textAlign: 'center', color: '#4a5568' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Loading...</div>
          <div>Fetching your profile information</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        backgroundColor: '#f7f9fc', 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}>
        <div style={{ textAlign: 'center', color: '#e53e3e' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>Error</div>
          <div style={{ marginBottom: '20px' }}>{error}</div>
          <button 
            onClick={fetchUserProfile}
            style={{
              background: 'linear-gradient(135deg, #4299e1, #3182ce)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Updated styles with profile picture upload styles
  const styles = {
    container: {
      backgroundColor: '#f7f9fc',
      minHeight: '100vh',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#333',
      lineHeight: 1.6,
    },
    topHeader: {
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      padding: '15px 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    headerContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '15px',
    },
    greeting: {
      flex: 1,
      minWidth: '200px',
    },
    greetingH1: {
      fontSize: '22px',
      fontWeight: 600,
      color: '#2d3748',
      marginBottom: '5px',
    },
    greetingP: {
      color: '#718096',
      fontSize: '14px',
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      flexWrap: 'wrap',
    },
    homeButton: {
      background: 'linear-gradient(135deg, #48bb78, #38a169)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
    },
    searchBar: {
      position: 'relative',
    },
    searchInput: {
      padding: '10px 15px 10px 40px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      width: '250px',
      transition: 'all 0.3s',
    },
    searchIcon: {
      position: 'absolute',
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#a0aec0',
    },
    notificationIcon: {
      position: 'relative',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7fafc',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    notificationBadge: {
      position: 'absolute',
      top: '5px',
      right: '5px',
      width: '8px',
      height: '8px',
      background: '#e53e3e',
      borderRadius: '50%',
    },
    profileAvatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #4299e1, #3182ce)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
    },
    mainContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
    },
    gradientCard: {
      background: 'linear-gradient(135deg, #4c6ef5, #3b5bdb)',
      borderRadius: '12px',
      padding: '25px',
      margin: '25px 0',
      color: 'white',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    gradientCardH2: {
      fontSize: '20px',
      marginBottom: '10px',
      fontWeight: 600,
    },
    gradientCardP: {
      opacity: 0.9,
      fontSize: '15px',
      maxWidth: '600px',
    },
    profileSection: {
      background: 'white',
      borderRadius: '12px',
      padding: '30px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      marginBottom: '30px',
    },
    profileHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '1px solid #e2e8f0',
      flexWrap: 'wrap',
      gap: '15px',
    },
    profileInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
    },
    profilePictureContainer: {
      position: 'relative',
      display: 'inline-block',
    },
    profilePicture: {
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: '3px solid #e2e8f0',
      background: 'linear-gradient(135deg, #4299e1, #3182ce)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '32px',
      fontWeight: 600,
    },
    profilePictureEditOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0,
      transition: 'opacity 0.3s',
      cursor: 'pointer',
    },
    profilePictureRemoveButton: {
      position: 'absolute',
      top: '-5px',
      right: '-5px',
      background: '#e53e3e',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 'bold',
    },
    profileDetails: {
      display: 'flex',
      flexDirection: 'column',
      gap: '5px',
    },
    profileName: {
      fontSize: '20px',
      fontWeight: 600,
      color: '#2d3748',
    },
    profileEmail: {
      color: '#718096',
      fontSize: '14px',
    },
    editButton: {
      background: 'linear-gradient(135deg, #4299e1, #3182ce)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 4px 6px rgba(66, 153, 225, 0.2)',
      whiteSpace: 'nowrap',
    },
    profilePictureUpload: {
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px dashed #cbd5e0',
    },
    uploadLabel: {
      display: 'block',
      marginBottom: '10px',
      fontWeight: '500',
      color: '#4a5568',
    },
    fileInput: {
      width: '100%',
      padding: '8px',
      border: '1px solid #e2e8f0',
      borderRadius: '4px',
      backgroundColor: 'white',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px',
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#4a5568',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    input: {
      padding: '12px 15px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.3s',
      backgroundColor: '#f7fafc',
      width: '100%',
    },
    select: {
      padding: '12px 15px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.3s',
      backgroundColor: '#f7fafc',
      width: '100%',
    },
    emailSection: {
      marginTop: '30px',
      paddingTop: '20px',
      borderTop: '1px solid #e2e8f0',
    },
    emailHeader: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#2d3748',
      marginBottom: '15px',
    },
    emailItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      padding: '15px',
      backgroundColor: '#f7fafc',
      borderRadius: '8px',
      marginBottom: '15px',
      flexWrap: 'wrap',
    },
    emailIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: '#e6fffa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#319795',
      flexShrink: 0,
    },
    emailDetails: {
      flex: 1,
      minWidth: '200px',
    },
    emailAddress: {
      fontWeight: 500,
      color: '#2d3748',
    },
    emailTime: {
      fontSize: '14px',
      color: '#718096',
    },
    addEmailButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'transparent',
      border: '1px dashed #cbd5e0',
      borderRadius: '8px',
      padding: '12px 15px',
      fontSize: '14px',
      fontWeight: 500,
      color: '#4a5568',
      cursor: 'pointer',
      transition: 'all 0.3s',
      width: '100%',
      justifyContent: 'center',
    },
    buttonGroup: {
      display: 'flex',
      gap: '15px',
      marginTop: '30px',
      flexWrap: 'wrap',
    },
    saveButton: {
      background: 'linear-gradient(135deg, #4299e1, #3182ce)',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 25px',
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 4px 6px rgba(66, 153, 225, 0.2)',
      flex: 1,
      minWidth: '140px',
    },
    cancelButton: {
      background: 'white',
      color: '#4a5568',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px 25px',
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s',
      flex: 1,
      minWidth: '140px',
    },
  };

  // Apply responsive styles
  const applyMediaQueries = (styleObj) => {
    const responsiveStyle = { ...styleObj };
    Object.keys(responsiveStyle).forEach(key => {
      if (key.startsWith('@media')) {
        delete responsiveStyle[key];
      }
    });
    return responsiveStyle;
  };

  return (
    <div style={applyMediaQueries(styles.container)}>
      {/* Top Header */}
      <header style={applyMediaQueries(styles.topHeader)}>
        <div style={applyMediaQueries(styles.headerContent)}>
          <div style={applyMediaQueries(styles.greeting)}>
            <h1 style={applyMediaQueries(styles.greetingH1)}>Welcome, {firstName}</h1>
            <p style={applyMediaQueries(styles.greetingP)}>{currentDate}</p>
          </div>
          <div style={applyMediaQueries(styles.headerRight)}>
            <button 
              style={applyMediaQueries(styles.homeButton)}
              onClick={handleHomeClick}
            >
              <span>🏠</span> Home
            </button>
            
            <div style={applyMediaQueries(styles.searchBar)}>
              <span style={applyMediaQueries(styles.searchIcon)}>🔍</span>
              <input 
                type="text" 
                placeholder="Search..." 
                style={applyMediaQueries(styles.searchInput)}
              />
            </div>
            <div style={applyMediaQueries(styles.notificationIcon)}>
              <span>🔔</span>
              <div style={applyMediaQueries(styles.notificationBadge)}></div>
            </div>
            <div style={applyMediaQueries(styles.profileAvatar)}>
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}
                />
              ) : (
                getAvatarInitials()
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={applyMediaQueries(styles.mainContent)}>
        {/* Gradient Card */}
        <div style={applyMediaQueries(styles.gradientCard)}>
          <h2 style={applyMediaQueries(styles.gradientCardH2)}>Profile Information</h2>
          <p style={applyMediaQueries(styles.gradientCardP)}>
            Update your personal information, contact details, and profile picture here.
          </p>
        </div>

        {/* Profile Section */}
        <div style={applyMediaQueries(styles.profileSection)}>
          <div style={applyMediaQueries(styles.profileHeader)}>
            <div style={applyMediaQueries(styles.profileInfo)}>
              <div style={applyMediaQueries(styles.profilePictureContainer)}>
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Profile" 
                    style={applyMediaQueries(styles.profilePicture)}
                  />
                ) : (
                  <div style={applyMediaQueries(styles.profilePicture)}>
                    {getAvatarInitials()}
                  </div>
                )}
                {isEditing && (
                  <>
                    <div 
                      style={applyMediaQueries(styles.profilePictureEditOverlay)}
                      onMouseEnter={(e) => e.target.style.opacity = '1'}
                      onMouseLeave={(e) => e.target.style.opacity = '0'}
                      onClick={() => document.getElementById('profile-picture-input').click()}
                    >
                      <span style={{color: 'white', fontSize: '14px', fontWeight: '600'}}>Change</span>
                    </div>
                    {imagePreview && (
                      <button 
                        style={applyMediaQueries(styles.profilePictureRemoveButton)}
                        onClick={removeProfilePicture}
                      >
                        ×
                      </button>
                    )}
                  </>
                )}
              </div>
              <div style={applyMediaQueries(styles.profileDetails)}>
                <h2 style={applyMediaQueries(styles.profileName)}>
                  {fullName || 'No Name Provided'}
                </h2>
                <p style={applyMediaQueries(styles.profileEmail)}>
                  {userData.email || 'No email provided'}
                </p>
              </div>
            </div>
            <button 
              style={applyMediaQueries(styles.editButton)}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </button>
          </div>

          {/* Profile Picture Upload Section (only shown in edit mode) */}
          {isEditing && (
            <div style={applyMediaQueries(styles.profilePictureUpload)}>
              <label style={applyMediaQueries(styles.uploadLabel)}>
                📷 Profile Picture
              </label>
              <input
                id="profile-picture-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={applyMediaQueries(styles.fileInput)}
              />
              <p style={{marginTop: '8px', fontSize: '12px', color: '#718096'}}>
                JPEG, PNG, GIF. Max 5MB. Click on your profile picture or use this input to change.
              </p>
            </div>
          )}

          <div style={applyMediaQueries(styles.formGrid)}>
            {/* First Name */}
            <div style={applyMediaQueries(styles.fieldGroup)}>
              <label style={applyMediaQueries(styles.label)}>
                <span>👤</span> First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={userData.first_name}
                onChange={handleInputChange}
                style={applyMediaQueries(styles.input)}
                disabled={!isEditing}
              />
            </div>

            {/* Last Name */}
            <div style={applyMediaQueries(styles.fieldGroup)}>
              <label style={applyMediaQueries(styles.label)}>
                <span>👤</span> Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={userData.last_name}
                onChange={handleInputChange}
                style={applyMediaQueries(styles.input)}
                disabled={!isEditing}
              />
            </div>

            {/* Email */}
            <div style={applyMediaQueries(styles.fieldGroup)}>
              <label style={applyMediaQueries(styles.label)}>
                <span>📧</span> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                style={applyMediaQueries(styles.input)}
                disabled={!isEditing}
              />
            </div>

            {/* Language */}
            <div style={applyMediaQueries(styles.fieldGroup)}>
              <label style={applyMediaQueries(styles.label)}>
                <span>🗣️</span> Language
              </label>
              <select
                name="lang"
                value={userData.lang}
                onChange={handleInputChange}
                style={applyMediaQueries(styles.select)}
                disabled={!isEditing}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
              </select>
            </div>

            {/* Education */}
            <div style={applyMediaQueries(styles.fieldGroup)}>
              <label style={applyMediaQueries(styles.label)}>
                <span>🎓</span> Education
              </label>
              <input
                type="text"
                name="education"
                value={userData.education}
                onChange={handleInputChange}
                style={applyMediaQueries(styles.input)}
                disabled={!isEditing}
              />
            </div>

            {/* Age */}
            <div style={applyMediaQueries(styles.fieldGroup)}>
              <label style={applyMediaQueries(styles.label)}>
                <span>🎂</span> Age
              </label>
              <input
                type="number"
                name="age"
                value={userData.age}
                onChange={handleInputChange}
                style={applyMediaQueries(styles.input)}
                disabled={!isEditing}
              />
            </div>

            {/* Grades */}
            <div style={applyMediaQueries(styles.fieldGroup)}>
              <label style={applyMediaQueries(styles.label)}>
                <span>📊</span> Grades
              </label>
              <input
                type="text"
                name="grades"
                value={userData.grades}
                onChange={handleInputChange}
                style={applyMediaQueries(styles.input)}
                disabled={!isEditing}
              />
            </div>

            {/* School */}
            <div style={applyMediaQueries(styles.fieldGroup)}>
              <label style={applyMediaQueries(styles.label)}>
                <span>🏫</span> School
              </label>
              <input
                type="text"
                name="school"
                value={userData.school}
                onChange={handleInputChange}
                style={applyMediaQueries(styles.input)}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Email Section */}
          <div style={applyMediaQueries(styles.emailSection)}>
            <h3 style={applyMediaQueries(styles.emailHeader)}>My Email Address</h3>
            <div style={applyMediaQueries(styles.emailItem)}>
              <div style={applyMediaQueries(styles.emailIcon)}>
                <span>📧</span>
              </div>
              <div style={applyMediaQueries(styles.emailDetails)}>
                <div style={applyMediaQueries(styles.emailAddress)}>
                  {userData.email || 'No email provided'}
                </div>
                <div style={applyMediaQueries(styles.emailTime)}>Verified • 1 month ago</div>
              </div>
              {isEditing && (
                <button style={{background: 'none', border: 'none', color: '#4299e1', cursor: 'pointer'}}>
                  <span>❌</span>
                </button>
              )}
            </div>
            {isEditing && (
              <button style={applyMediaQueries(styles.addEmailButton)}>
                <span>➕</span>
                Add Email Address
              </button>
            )}
          </div>

          {isEditing && (
            <div style={applyMediaQueries(styles.buttonGroup)}>
              <button style={applyMediaQueries(styles.saveButton)} onClick={handleSave}>
                Save Changes
              </button>
              <button style={applyMediaQueries(styles.cancelButton)} onClick={handleCancel}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Hidden file input for profile picture */}
      <input
        id="profile-picture-input"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{display: 'none'}}
      />
    </div>
  );
};

export default ProfileDetails;
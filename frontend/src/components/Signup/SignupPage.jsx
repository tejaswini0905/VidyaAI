import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    lang: "",
    education: "",
    age: "",
    grades: [],
    school: "",
    terms: false,
    profile_picture: null
  });

  const [errors, setErrors] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();

  const gradeOptions = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
    
    if (errors[id]) {
      setErrors({
        ...errors,
        [id]: ""
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          profile_picture: "Please select a valid image file (JPEG, PNG, GIF)"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          profile_picture: "File size should be less than 5MB"
        });
        return;
      }

      setFormData({
        ...formData,
        profile_picture: file
      });

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear any previous errors
      if (errors.profile_picture) {
        setErrors({
          ...errors,
          profile_picture: ""
        });
      }
    }
  };

  const removeProfilePicture = () => {
    setFormData({
      ...formData,
      profile_picture: null
    });
    setPreviewUrl(null);
  };

  const handleGradeChange = (e) => {
    const { value, checked } = e.target;
    let updatedGrades = [...formData.grades];
    
    if (checked) {
      updatedGrades.push(value);
    } else {
      updatedGrades = updatedGrades.filter(grade => grade !== value);
    }
    
    setFormData({
      ...formData,
      grades: updatedGrades
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    if (!formData.terms) {
      setErrors({ terms: "You must accept the terms to continue" });
      return;
    }

    if (formData.grades.length === 0) {
      setErrors({ grades: "Please select at least one grade" });
      return;
    }

    try {
      // Create FormData object to handle file upload
      const submitData = new FormData();
      submitData.append("first_name", formData.first_name);
      submitData.append("last_name", formData.last_name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("lang", formData.lang);
      submitData.append("education", formData.education);
      submitData.append("age", formData.age.toString());
      submitData.append("school", formData.school);
      
      // Append each grade individually (important for ListField)
      formData.grades.forEach(grade => {
        submitData.append("grades", grade);
      });
      
      // Append profile picture if exists
      if (formData.profile_picture) {
        submitData.append("profile_picture", formData.profile_picture);
      }

      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/signup/", {
        method: "POST",
        body: submitData,
        // Don't set Content-Type header when using FormData
      });

      const data = await res.json();

      if (res.ok) {
        setShowSuccessPopup(true);
      } else {
        // Handle validation errors from backend
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.detail) {
          alert("Error: " + data.detail);
        } else {
          alert("Error: " + JSON.stringify(data));
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("Something went wrong. Please check your connection and try again.");
    }
  };

  const closePopupAndRedirect = () => {
    setShowSuccessPopup(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign Up Successful!</h3>
              <p className="text-gray-600 mb-4">
                Welcome to VidyaAI, {formData.first_name}! Your account has been created successfully.
              </p>
              
              <p className="text-sm text-gray-600 mb-4">
                Your VidyaAI ID has been sent to your registered email address: <strong>{formData.email}</strong>
              </p>
              
              <button
                onClick={closePopupAndRedirect}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300"
              >
                Continue to Login
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">VidyaAI</h1>
          </div>
          <nav className="flex space-x-6">
            <a href="/" className="text-gray-700 hover:text-indigo-600 transition-colors">Home</a>
            <a href="/login" className="text-gray-700 hover:text-indigo-600 transition-colors">Login</a>
          </nav>
        </header>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Left side - Text content */}
            <div className="md:w-2/5 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white p-8 md:p-12">
              <div className="max-w-xs mx-auto md:mx-0">
                <h2 className="text-3xl font-bold mb-6">Create Your Account</h2>
                <p className="text-indigo-100 mb-6">
                  Join thousands of educators using VidyaAI to create personalized learning experiences in multiple languages.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-indigo-500 rounded-full p-2 mr-3">
                      <i className="fas fa-graduation-cap text-white"></i>
                    </div>
                    <p className="text-indigo-100">Multi-language support</p>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-indigo-500 rounded-full p-2 mr-3">
                      <i className="fas fa-book-open text-white"></i>
                    </div>
                    <p className="text-indigo-100">Personalized lesson plans</p>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-indigo-500 rounded-full p-2 mr-3">
                      <i className="fas fa-chalkboard-teacher text-white"></i>
                    </div>
                    <p className="text-indigo-100">Smart worksheet generation</p>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-indigo-500 rounded-full p-2 mr-3">
                      <i className="fas fa-layer-group text-white"></i>
                    </div>
                    <p className="text-indigo-100">Teach multiple grades</p>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-indigo-500 rounded-full p-2 mr-3">
                      <i className="fas fa-camera text-white"></i>
                    </div>
                    <p className="text-indigo-100">Profile customization</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="md:w-3/5 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-gray-600 mb-8">Create your VidyaAI account in minutes</p>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Profile Picture Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture (Optional)
                    </label>
                    <div className="flex items-center space-x-6">
                      <div className="flex-shrink-0">
                        {previewUrl ? (
                          <div className="relative">
                            <img
                              src={previewUrl}
                              alt="Profile preview"
                              className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200"
                            />
                            <button
                              type="button"
                              onClick={removeProfilePicture}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          JPEG, PNG, GIF. Max 5MB.
                        </p>
                        {errors.profile_picture && (
                          <p className="text-red-500 text-sm mt-1">{errors.profile_picture}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* First Name */}
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Your first name"
                    />
                    {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Your last name"
                    />
                    {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div className="md:col-span-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Create a strong password"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>

                  {/* Preferred Language */}
                  <div>
                    <label htmlFor="lang" className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Language *
                    </label>
                    <select
                      id="lang"
                      required
                      value={formData.lang}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-white"
                    >
                      <option value="">Select a language</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Gujarati">Gujarati</option>
                    </select>
                    {errors.lang && <p className="text-red-500 text-sm mt-1">{errors.lang}</p>}
                  </div>

                  {/* Age */}
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                      Age *
                    </label>
                    <input
                      id="age"
                      type="number"
                      required
                      min="18"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Your age"
                    />
                    {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                  </div>

                  {/* Education */}
                  <div>
                    <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                      Education *
                    </label>
                    <input
                      id="education"
                      type="text"
                      required
                      value={formData.education}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="e.g. B.Ed, M.Sc"
                    />
                    {errors.education && <p className="text-red-500 text-sm mt-1">{errors.education}</p>}
                  </div>

                  {/* Grades - Multiple Selection */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grades You Teach *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {gradeOptions.map((grade) => (
                        <label key={grade} className="flex items-center space-x-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            value={grade}
                            checked={formData.grades.includes(grade)}
                            onChange={handleGradeChange}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700">{grade}</span>
                        </label>
                      ))}
                    </div>
                    {errors.grades && <p className="text-red-500 text-sm mt-1">{errors.grades}</p>}
                    {formData.grades.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        Selected: {formData.grades.join(", ")}
                      </p>
                    )}
                  </div>

                  {/* School/College */}
                  <div className="md:col-span-2">
                    <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                      School/College *
                    </label>
                    <input
                      id="school"
                      type="text"
                      required
                      value={formData.school}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Name of your institution"
                    />
                    {errors.school && <p className="text-red-500 text-sm mt-1">{errors.school}</p>}
                  </div>

                  {/* Terms and Conditions */}
                  <div className="md:col-span-2 flex items-start mt-2">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        required
                        checked={formData.terms}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="font-medium text-gray-700">
                        I agree to the <a href="#" className="text-indigo-600 hover:text-indigo-500">Terms and Conditions</a> and <a href="#" className="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
                      </label>
                    </div>
                  </div>
                  {errors.terms && <p className="text-red-500 text-sm mt-1 md:col-span-2">{errors.terms}</p>}
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg shadow-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Account
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
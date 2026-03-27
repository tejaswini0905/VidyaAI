import loginImage from "./login.jpg";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";

function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });

    // Clear error when typing
    if (errors[id]) {
      setErrors({ ...errors, [id]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // save token if backend provides one
        if (data.access) localStorage.setItem("token", data.access);
        localStorage.setItem("authToken", data.token); // token returned from backend
        alert("Login successful! Redirecting...");
        navigate("/teacher");
      } else {
        setErrors(data.errors || { general: "Invalid credentials" });
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                V
              </div>
              <span className="text-xl font-bold text-gray-900">VidyaAI</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-gray-700 hover:text-indigo-600">Home</a>
              <a href="#help" className="text-gray-700 hover:text-indigo-600">Help</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Split layout */}
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left: Image + text */}
            <div className="relative order-2 lg:order-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome back to <span className="text-indigo-600">VidyaAI</span>
              </h1>
              <p className="text-gray-600 mb-8">
                Sign in to generate smart worksheets, lessons and more.
              </p>
              <img src={loginImage} alt="Login" className="rounded-2xl shadow-xl" />
              <div className="mt-6 text-sm text-gray-600">
                New to VidyaAI?{" "}
                <Link to="/signup" className="text-indigo-600 font-medium hover:underline">
                  Create an account
                </Link>
              </div>
            </div>

            {/* Right: Login Form */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Sign in</h2>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  
                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Your username"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm"
                    />
                    {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm"
                    />
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                  </div>

                  {/* General error */}
                  {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-md"
                  >
                    Sign in
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;

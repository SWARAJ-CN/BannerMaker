import React, { useState } from 'react';
import { FiInstagram, FiHeart, FiLock, FiMail, FiUser, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast'; 

export default function Login({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      setLoading(true);
      const loginData = {
        email: formData.email,
        password: formData.password,
      };
     
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/login`, loginData);
      
      // Save user data
      localStorage.setItem('userdata', JSON.stringify(response.data.data));
      
      // ✨ ADDED: Set the session token so App.js maintains authentication on reload
      localStorage.setItem('gridflow_session', response.data.token || 'true'); 
      
      toast.success(response.data.message || 'Login successful!');
      
      // ✨ ADDED: Trigger state update in App.js to switch to the Home component
      onAuthSuccess();
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
      console.error(error);
    } finally {
      // Use finally to ensure loading is always turned off
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        setLoading(false);
        return;
      }

      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/register`, userData);
      
      if (response) {
        toast.success(response.data.message || 'Registration successful!');
        // Optional: Switch to login view after successful registration
        setIsLogin(true);
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
      }

    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong!!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col antialiased">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded bg-zinc-950 flex items-center justify-center">
              <FiInstagram className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xs font-bold tracking-wider text-zinc-900 font-mono">
              GRIDFLOW PRO
            </h1>
          </div>
          <div className="flex items-center space-x-4 text-xs font-medium text-zinc-400">
            <span className="hover:text-zinc-900 transition-colors cursor-pointer">Developer</span>
            <span className="text-zinc-200">•</span>
            <span className="hover:text-zinc-900 transition-colors cursor-pointer">Donate</span>
          </div>
          <span className="hidden lg:flex items-center gap-1 text-[11px] text-zinc-400">
            Crafted with <FiHeart className="w-3 h-3 text-zinc-400 fill-zinc-200" /> in Kochi
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm p-8 border border-zinc-100 shadow-[0_0_40px_-15px_rgba(0,0,0,0.05)] rounded-2xl space-y-8 bg-white">
          
          {/* Titles */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-sm text-zinc-500">
              {isLogin ? 'Enter your details to access your dashboard.' : 'Sign up to configure your new account.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-5">
            
            {!isLogin && (
              <div className="space-y-1">
                <div className="relative border-b border-zinc-200 focus-within:border-zinc-900 transition-colors">
                  <FiUser className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input 
                    type="text" 
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Username"
                    required={!isLogin}
                    disabled={loading}
                    className="w-full bg-transparent py-2 pl-7 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="relative border-b border-zinc-200 focus-within:border-zinc-900 transition-colors">
                <FiMail className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  required
                  disabled={loading}
                  className="w-full bg-transparent py-2 pl-7 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative border-b border-zinc-200 focus-within:border-zinc-900 transition-colors">
                <FiLock className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  required
                  disabled={loading}
                  className="w-full bg-transparent py-2 pl-7 pr-10 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors p-1"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <div className="relative border-b border-zinc-200 focus-within:border-zinc-900 transition-colors">
                  <FiLock className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password"
                    required={!isLogin}
                    disabled={loading}
                    className="w-full bg-transparent py-2 pl-7 pr-10 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors p-1"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}</span>
                {!loading && <FiArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>

          {/* Toggle Login/Register */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                if (loading) return;
                setIsLogin(!isLogin);
                setShowPassword(false);
                setShowConfirmPassword(false);
                setFormData({ username: '', email: '', password: '', confirmPassword: '' }); // Reset form on switch
              }}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
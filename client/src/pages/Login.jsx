import React, { useState } from 'react';
import { FiInstagram, FiHeart, FiLock, FiMail, FiUser, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { registerUser, validateUser } from '../services/route';
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
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN ACTION ---
        const response = await validateUser();
        const usersList = response.data;

        const verifiedUser = usersList.find(
          (user) => user.email.toLowerCase() === formData.email.toLowerCase() && user.password === formData.password
        );

        if (verifiedUser) {
          // Commit active configuration to disk storage
          localStorage.setItem("gridflow_session", JSON.stringify({
            id: verifiedUser.id,
            username: verifiedUser.username,
            email: verifiedUser.email
          }));

          toast.success("Welcome back to your workspace.");
          
          // Switch view inside App state framework
          onAuthSuccess();
        } else {
          toast.error("Invalid email address or password.");
        }
        setLoading(false);

      } else {
        // --- REGISTER ACTION ---
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match.");
          setLoading(false);
          return;
        }

        const checkResponse = await validateUser();
        const emailExists = checkResponse.data.some(
          (user) => user.email.toLowerCase() === formData.email.toLowerCase()
        );

        if (emailExists) {
          toast.error("An account with this email already exists.");
          setLoading(false);
          return;
        }

        await registerUser(formData);
        toast.success("Account created successfully. Redirecting...");
        
        setTimeout(() => {
          setIsLogin(true);
          setFormData({ username: '', email: '', password: '', confirmPassword: '' });
          setShowPassword(false);
          setShowConfirmPassword(false);
          setLoading(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Authentication error:", err);
      toast.error("Could not connect to server. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col antialiased">
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
            <span>Developer</span>
            <span className="text-zinc-200">•</span>
            <span>Donate</span>
          </div>
          <span className="hidden lg:flex items-center gap-1 text-[11px] text-zinc-400">
            Crafted with <FiHeart className="w-3 h-3 text-zinc-400 fill-zinc-200" /> in Kochi
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm space-y-6">
          
          <div className="text-center space-y-1">
            <h2 className="text-sm font-medium text-zinc-900">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-xs text-zinc-400">
              {isLogin ? 'Enter your details to access your dashboard.' : 'Sign up to configure your new account.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLogin && (
              <div className="space-y-1">
                <div className="relative border-b border-zinc-200 focus-within:border-zinc-900 transition-colors">
                  <FiUser className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 w-3.5 h-3.5" />
                  <input 
                    type="text" 
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Username"
                    required
                    disabled={loading}
                    className="w-full bg-transparent py-2 pl-6 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="relative border-b border-zinc-200 focus-within:border-zinc-900 transition-colors">
                <FiMail className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 w-3.5 h-3.5" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  required
                  disabled={loading}
                  className="w-full bg-transparent py-2 pl-6 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative border-b border-zinc-200 focus-within:border-zinc-900 transition-colors">
                <FiLock className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 w-3.5 h-3.5" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  required
                  disabled={loading}
                  className="w-full bg-transparent py-2 pl-6 pr-10 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors p-1"
                >
                  {showPassword ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-1">
                <div className="relative border-b border-zinc-200 focus-within:border-zinc-900 transition-colors">
                  <FiLock className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-400 w-3.5 h-3.5" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm Password"
                    required
                    disabled={loading}
                    className="w-full bg-transparent py-2 pl-6 pr-10 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 transition-colors p-1"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium transition-colors disabled:opacity-40"
              >
                <span>{loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}</span>
                {!loading && <FiArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>

          </form>

          <div className="text-center">
            <button
              onClick={() => {
                if (loading) return;
                setIsLogin(!isLogin);
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {isLogin ? 'Create a new account' : 'Back to sign in'}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiSearch, FiMic, FiBell, FiUser } from 'react-icons/fi';
import { useApp } from '../context/AppContext';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

const Header = () => {
  const { state, dispatch } = useApp();
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: searchInput });
      navigate(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-youtube-dark border-b border-youtube-gray z-50 px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="p-2 hover:bg-youtube-gray rounded-full transition-colors"
          >
            <FiMenu size={20} />
          </button>
          <Link to="/" className="flex items-center space-x-1">
            <div className="bg-youtube-red p-2 rounded">
              <span className="text-white font-bold text-lg">YT</span>
            </div>
            <span className="text-xl font-semibold">YouTube</span>
          </Link>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearch} className="flex">
            <div className="flex flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search"
                className="flex-1 px-4 py-2 bg-youtube-dark border border-youtube-gray rounded-l-full focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-youtube-gray border border-l-0 border-youtube-gray rounded-r-full hover:bg-youtube-light-gray transition-colors"
              >
                <FiSearch size={20} />
              </button>
            </div>
            <button
              type="button"
              className="ml-4 p-2 bg-youtube-gray rounded-full hover:bg-youtube-light-gray transition-colors"
            >
              <FiMic size={20} />
            </button>
          </form>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-youtube-gray rounded-full transition-colors">
            <FiBell size={20} />
          </button>
          
          {state.user ? (
            <div className="flex items-center space-x-2">
              <img
                src={state.user.photoURL || '/default-avatar.png'}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <button
                onClick={handleSignOut}
                className="px-3 py-1 text-sm bg-youtube-red rounded hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center space-x-2 px-4 py-2 border border-youtube-gray rounded-full hover:bg-youtube-gray transition-colors"
            >
              <FiUser size={16} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
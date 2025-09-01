import React from 'react';
import { useApp } from '../context/AppContext';
import { FiUser, FiVideo, FiHeart, FiClock, FiList } from 'react-icons/fi';

const Profile = () => {
  const { state } = useApp();

  if (!state.user) {
    return (
      <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <div className="p-6 text-center">
          <FiUser size={48} className="mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-semibold mb-4">Sign in to view your profile</h2>
          <p className="text-gray-400">Access your channel and account settings</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: FiVideo,
      label: 'Videos Watched',
      value: state.history?.length || 0,
      color: 'text-blue-500'
    },
    {
      icon: FiHeart,
      label: 'Liked Videos',
      value: state.likedVideos?.length || 0,
      color: 'text-red-500'
    },
    {
      icon: FiList,
      label: 'Playlists',
      value: state.playlists?.length || 0,
      color: 'text-green-500'
    },
    {
      icon: FiUser,
      label: 'Subscriptions',
      value: state.subscriptions?.length || 0,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
      <div className="p-6">
        {/* Profile Header */}
        <div className="bg-youtube-gray rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-6">
            <img
              src={state.user.photoURL || '/default-avatar.png'}
              alt="Profile"
              className="w-24 h-24 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {state.user.displayName || 'YouTube User'}
              </h1>
              <p className="text-gray-400 mb-2">{state.user.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(state.user.metadata.creationTime).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-youtube-gray rounded-lg p-6 text-center">
              <stat.icon size={32} className={`mx-auto mb-3 ${stat.color}`} />
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Account Settings */}
        <div className="bg-youtube-gray rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-youtube-dark rounded-lg">
              <div>
                <h3 className="font-medium">Display Name</h3>
                <p className="text-sm text-gray-400">{state.user.displayName || 'Not set'}</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Edit
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-youtube-dark rounded-lg">
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-sm text-gray-400">{state.user.email}</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Edit
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-youtube-dark rounded-lg">
              <div>
                <h3 className="font-medium">Privacy Settings</h3>
                <p className="text-sm text-gray-400">Manage your privacy preferences</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                Manage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
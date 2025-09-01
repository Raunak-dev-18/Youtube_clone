import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiTrendingUp, 
  FiMusic, 
  FiFilm, 
  FiRadio, 
  FiMonitor,
  FiClock,
  FiThumbsUp,
  FiList,
  FiUser,
  FiPlay,
  FiUsers,
  FiHeart
} from 'react-icons/fi';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const { state } = useApp();
  const location = useLocation();

  const menuItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiPlay, label: 'Shorts', path: '/shorts' },
    { icon: FiTrendingUp, label: 'Trending', path: '/trending' },
    { icon: FiMusic, label: 'Music', path: '/music' },
    { icon: FiFilm, label: 'Movies', path: '/movies' },
    { icon: FiRadio, label: 'Live', path: '/live' },
    { icon: FiMonitor, label: 'Gaming', path: '/gaming' }
  ];

  const userMenuItems = [
    { icon: FiClock, label: 'History', path: '/history' },
    { icon: FiThumbsUp, label: 'Liked Videos', path: '/liked' },
    { icon: FiList, label: 'Playlists', path: '/playlists' },
    { icon: FiUsers, label: 'Subscriptions', path: '/subscriptions' },
    { icon: FiUser, label: 'Your Channel', path: '/profile' }
  ];

  if (!state.sidebarOpen) {
    return (
      <aside className="fixed left-0 top-16 w-16 h-full bg-youtube-dark border-r border-youtube-gray z-40">
        <nav className="p-2">
          {menuItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg hover:bg-youtube-gray transition-colors ${
                location.pathname === item.path ? 'bg-youtube-gray' : ''
              }`}
            >
              <item.icon size={18} />
              <span className="text-xs mt-1 text-center leading-tight">{item.label}</span>
            </Link>
          ))}
          
          {/* User menu items in collapsed mode */}
          {state.user && (
            <>
              <div className="border-t border-youtube-gray my-2"></div>
              {userMenuItems.slice(0, 3).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center p-2 rounded-lg hover:bg-youtube-gray transition-colors ${
                    location.pathname === item.path ? 'bg-youtube-gray' : ''
                  }`}
                >
                  <item.icon size={18} />
                  <span className="text-xs mt-1 text-center leading-tight">{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-16 w-64 h-full bg-youtube-dark border-r border-youtube-gray z-40 overflow-y-auto">
      <nav className="p-4">
        {/* Main Menu */}
        <div className="mb-6">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-4 p-3 rounded-lg hover:bg-youtube-gray transition-colors ${
                location.pathname === item.path ? 'bg-youtube-gray' : ''
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <hr className="border-youtube-gray mb-6" />

        {/* User Menu */}
        {state.user && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 px-3">Library</h3>
            {userMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-4 p-3 rounded-lg hover:bg-youtube-gray transition-colors ${
                  location.pathname === item.path ? 'bg-youtube-gray' : ''
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        <hr className="border-youtube-gray mb-6" />

        {/* Subscriptions */}
        {state.user && (
          <div>
            <h3 className="text-sm font-semibold mb-3 px-3">Subscriptions</h3>
            {state.subscriptions.length > 0 ? (
              state.subscriptions.map((channel) => (
                <Link
                  key={channel.id}
                  to={`/channel/${channel.id}`}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-youtube-gray transition-colors"
                >
                  <img
                    src={channel.thumbnail}
                    alt={channel.title}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="truncate">{channel.title}</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-400 px-3">No subscriptions yet</p>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
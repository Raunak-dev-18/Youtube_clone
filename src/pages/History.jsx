import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { database } from '../firebase/config';
import { ref, onValue, remove } from 'firebase/database';
import VideoCard from '../components/VideoCard';
import { FiTrash2, FiClock } from 'react-icons/fi';
import moment from 'moment';

const History = () => {
  const { state } = useApp();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state.user) {
      setLoading(false);
      return;
    }

    const historyRef = ref(database, `users/${state.user.uid}/history`);
    const unsubscribe = onValue(historyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const historyArray = Object.entries(data).map(([id, item]) => ({
          id,
          ...item
        }));
        // Sort by most recent first
        historyArray.sort((a, b) => b.watchedAt - a.watchedAt);
        setHistory(historyArray);
      } else {
        setHistory([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [state.user]);

  const clearHistory = async () => {
    if (!state.user) return;
    
    try {
      const historyRef = ref(database, `users/${state.user.uid}/history`);
      await remove(historyRef);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const removeFromHistory = async (itemId) => {
    if (!state.user) return;
    
    try {
      const itemRef = ref(database, `users/${state.user.uid}/history/${itemId}`);
      await remove(itemRef);
    } catch (error) {
      console.error('Error removing from history:', error);
    }
  };

  if (!state.user) {
    return (
      <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <div className="p-6 text-center">
          <FiClock size={48} className="mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-semibold mb-4">Sign in to view your watch history</h2>
          <p className="text-gray-400">Keep track of videos you've watched</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-youtube-gray aspect-video rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-youtube-gray rounded w-3/4"></div>
                  <div className="h-3 bg-youtube-gray rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Watch History</h1>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
            >
              <FiTrash2 size={16} />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item) => {
              // Convert history item to video format for VideoCard
              const video = {
                id: item.videoId,
                snippet: {
                  title: item.title,
                  channelTitle: item.channelTitle,
                  thumbnails: {
                    medium: { url: item.thumbnail }
                  },
                  publishedAt: new Date(item.watchedAt).toISOString()
                }
              };

              return (
                <div key={item.id} className="flex items-start space-x-4 p-4 bg-youtube-gray rounded-lg group">
                  <div className="flex-shrink-0">
                    <VideoCard video={video} layout="list" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 mb-2">
                      Watched {moment(item.watchedAt).fromNow()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromHistory(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiClock size={48} className="mx-auto mb-4 text-gray-500" />
            <h2 className="text-lg font-semibold mb-2">No watch history</h2>
            <p className="text-gray-400">Videos you watch will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
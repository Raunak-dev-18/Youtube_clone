import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { database } from '../firebase/config';
import { ref, onValue, remove } from 'firebase/database';
import VideoCard from '../components/VideoCard';
import { FiHeart, FiTrash2 } from 'react-icons/fi';
import moment from 'moment';

const LikedVideos = () => {
  const { state } = useApp();
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state.user) {
      setLoading(false);
      return;
    }

    const likedVideosRef = ref(database, `users/${state.user.uid}/likedVideos`);
    const unsubscribe = onValue(likedVideosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const likedArray = Object.entries(data).map(([id, item]) => ({
          id,
          ...item
        }));
        // Sort by most recent first
        likedArray.sort((a, b) => b.likedAt - a.likedAt);
        setLikedVideos(likedArray);
      } else {
        setLikedVideos([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [state.user]);

  const removeFromLiked = async (videoId) => {
    if (!state.user) return;
    
    try {
      const videoRef = ref(database, `users/${state.user.uid}/likedVideos/${videoId}`);
      await remove(videoRef);
    } catch (error) {
      console.error('Error removing from liked videos:', error);
    }
  };

  const clearAllLiked = async () => {
    if (!state.user) return;
    
    try {
      const likedVideosRef = ref(database, `users/${state.user.uid}/likedVideos`);
      await remove(likedVideosRef);
    } catch (error) {
      console.error('Error clearing liked videos:', error);
    }
  };

  if (!state.user) {
    return (
      <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <div className="p-6 text-center">
          <FiHeart size={48} className="mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-semibold mb-4">Sign in to view your liked videos</h2>
          <p className="text-gray-400">Keep track of videos you've liked</p>
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
          <h1 className="text-2xl font-bold">Liked Videos</h1>
          {likedVideos.length > 0 && (
            <button
              onClick={clearAllLiked}
              className="flex items-center space-x-2 px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
            >
              <FiTrash2 size={16} />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {likedVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {likedVideos.map((item) => {
              // Convert liked item to video format for VideoCard
              const video = {
                id: item.videoId,
                snippet: {
                  title: item.title,
                  channelTitle: item.channelTitle,
                  thumbnails: {
                    medium: { url: item.thumbnail }
                  },
                  publishedAt: new Date(item.likedAt).toISOString()
                }
              };

              return (
                <div key={item.id} className="relative group">
                  <VideoCard video={video} />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => removeFromLiked(item.videoId)}
                      className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center space-x-1 bg-black bg-opacity-75 px-2 py-1 rounded text-xs">
                      <FiHeart size={12} className="text-red-500" />
                      <span>{moment(item.likedAt).fromNow()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiHeart size={48} className="mx-auto mb-4 text-gray-500" />
            <h2 className="text-lg font-semibold mb-2">No liked videos</h2>
            <p className="text-gray-400">Videos you like will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedVideos;
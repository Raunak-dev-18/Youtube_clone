import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { youtubeApi } from '../services/youtubeApi';
import VideoCard from '../components/VideoCard';
import { FiMusic } from 'react-icons/fi';

const Music = () => {
  const { state } = useApp();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMusicVideos = async () => {
      try {
        setLoading(true);
        // Use search instead of category since it's more reliable
        const response = await youtubeApi.searchVideos('music video 2024', 24);
        setVideos(response.items);
        setError(null);
      } catch (err) {
        setError('Failed to load music videos');
        console.error('Error fetching music videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMusicVideos();
  }, []);

  if (loading) {
    return (
      <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-youtube-gray aspect-video rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-youtube-gray rounded w-3/4"></div>
                  <div className="h-3 bg-youtube-gray rounded w-1/2"></div>
                  <div className="h-3 bg-youtube-gray rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Unable to load music videos</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <FiMusic size={24} />
          <h1 className="text-2xl font-bold">Music</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Music;
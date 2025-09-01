import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { youtubeApi } from '../services/youtubeApi';
import VideoCard from '../components/VideoCard';
import { FiTrendingUp } from 'react-icons/fi';

const Trending = () => {
  const { state } = useApp();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingVideos = async () => {
      try {
        setLoading(true);
        // Use the same as popular videos since trending API might have issues
        const response = await youtubeApi.getPopularVideos(24);
        setVideos(response.items);
        setError(null);
      } catch (err) {
        setError('Failed to load trending videos');
        console.error('Error fetching trending videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingVideos();
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
            <h2 className="text-xl font-semibold mb-4">Unable to load trending videos</h2>
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
          <FiTrendingUp size={24} />
          <h1 className="text-2xl font-bold">Trending</h1>
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

export default Trending;
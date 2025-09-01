import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { youtubeApi } from '../services/youtubeApi';
import VideoCard from '../components/VideoCard';

const Home = () => {
  const { state } = useApp();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularVideos = async () => {
      try {
        setLoading(true);
        const response = await youtubeApi.getPopularVideos(24);
        setVideos(response.items);
        setError(null);
      } catch (err) {
        setError('Failed to load videos. Please check your API key.');
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularVideos();
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
            <h2 className="text-xl font-semibold mb-4">Unable to load videos</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              Make sure to add your YouTube API key in src/config/youtube.js
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Trending Videos</h1>
        
        {/* Test video link for debugging */}
        <div className="mb-6 p-4 bg-youtube-gray rounded-lg">
          <h3 className="font-semibold mb-2">Test Video (for debugging):</h3>
          <a 
            href="/watch/dQw4w9WgXcQ" 
            className="text-blue-400 hover:text-blue-300 underline"
          >
            Test with known video ID: dQw4w9WgXcQ
          </a>
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

export default Home;
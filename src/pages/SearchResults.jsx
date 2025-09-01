import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { youtubeApi } from '../services/youtubeApi';
import VideoCard from '../components/VideoCard';

const SearchResults = () => {
  const { state } = useApp();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchVideos = async () => {
      if (!query) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await youtubeApi.searchVideos(query, 24);
        setVideos(response.items);
      } catch (err) {
        setError('Failed to search videos');
        console.error('Error searching videos:', err);
      } finally {
        setLoading(false);
      }
    };

    searchVideos();
  }, [query]);

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
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Search Error</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-6">
          Search results for "{query}" ({videos.length} results)
        </h1>
        
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <VideoCard key={video.id?.videoId || video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-lg font-semibold mb-2">No results found</h2>
            <p className="text-gray-400">Try different keywords or check your spelling</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
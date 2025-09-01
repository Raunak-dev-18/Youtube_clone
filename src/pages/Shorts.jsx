import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { youtubeApi } from '../services/youtubeApi';
import ShortsPlayer from '../components/ShortsPlayer';

const Shorts = () => {
  const { state } = useApp();
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchShorts = async () => {
      try {
        setLoading(true);
        // Search for multiple types of short content with better queries
        const queries = [
          'shorts viral', 
          'funny short video', 
          'dance shorts', 
          'comedy shorts',
          'trending shorts',
          'viral moments',
          'quick tutorial',
          'amazing shorts'
        ];
        const allShorts = [];
        
        for (const query of queries) {
          try {
            const response = await youtubeApi.searchVideos(query, 8);
            allShorts.push(...response.items);
          } catch (err) {
            console.warn(`Failed to fetch ${query}:`, err);
          }
        }
        
        // Remove duplicates and shuffle
        const uniqueShorts = allShorts.filter((video, index, self) => 
          index === self.findIndex(v => (v.id?.videoId || v.id) === (video.id?.videoId || video.id))
        );
        
        const shuffled = uniqueShorts.sort(() => 0.5 - Math.random()).slice(0, 40);
        setShorts(shuffled);
        setError(null);
      } catch (err) {
        setError('Failed to load shorts');
        console.error('Error fetching shorts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShorts();
  }, []);

  const scrollToVideo = useCallback((index, smooth = true) => {
    if (containerRef.current && index >= 0 && index < shorts.length) {
      const container = containerRef.current;
      const targetScroll = index * container.clientHeight;
      container.scrollTo({
        top: targetScroll,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, [shorts.length]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current || isScrolling) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / containerHeight);
    
    if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < shorts.length) {
      setCurrentVideoIndex(newIndex);
    }

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling state
    setIsScrolling(true);
    
    // Reset scrolling state after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [currentVideoIndex, shorts.length, isScrolling]);

  const navigateToVideo = useCallback((direction) => {
    const newIndex = direction === 'next' 
      ? Math.min(currentVideoIndex + 1, shorts.length - 1)
      : Math.max(currentVideoIndex - 1, 0);
    
    if (newIndex !== currentVideoIndex) {
      setCurrentVideoIndex(newIndex);
      scrollToVideo(newIndex);
    }
  }, [currentVideoIndex, shorts.length, scrollToVideo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateToVideo('previous');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateToVideo('next');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [navigateToVideo]);

  // Preload adjacent videos
  useEffect(() => {
    const preloadRange = 2;
    const startIndex = Math.max(0, currentVideoIndex - preloadRange);
    const endIndex = Math.min(shorts.length - 1, currentVideoIndex + preloadRange);
    
    for (let i = startIndex; i <= endIndex; i++) {
      if (i !== currentVideoIndex && shorts[i]) {
        const videoId = shorts[i].id?.videoId || shorts[i].id;
        if (videoId) {
          // Preload video thumbnail
          const img = new Image();
          img.src = shorts[i].snippet?.thumbnails?.medium?.url || '';
        }
      }
    }
  }, [currentVideoIndex, shorts]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white text-lg">Loading Shorts...</p>
        </div>
      </div>
    );
  }

  if (error || shorts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-white">
            {error || 'No shorts available'}
          </h2>
          <p className="text-gray-400 mb-4">Try again later</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-youtube-red text-white rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Shorts Container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          scrollBehavior: 'smooth'
        }}
      >
        {shorts.map((video, index) => (
          <div
            key={`${video.id?.videoId || video.id}-${index}`}
            className="h-screen w-full snap-start flex items-center justify-center relative"
          >
            <ShortsPlayer
              video={video}
              videoIndex={index}
              isActive={index === currentVideoIndex}
              isPrevious={index === currentVideoIndex - 1}
              isNext={index === currentVideoIndex + 1}
              onNext={() => navigateToVideo('next')}
              onPrevious={() => navigateToVideo('previous')}
            />
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="fixed top-20 right-4 flex flex-col space-y-1 z-50">
        {shorts.slice(Math.max(0, currentVideoIndex - 3), currentVideoIndex + 4).map((_, relativeIndex) => {
          const actualIndex = Math.max(0, currentVideoIndex - 3) + relativeIndex;
          return (
            <button
              key={actualIndex}
              onClick={() => {
                setCurrentVideoIndex(actualIndex);
                scrollToVideo(actualIndex);
              }}
              className={`w-1 rounded-full transition-all duration-300 ${
                actualIndex === currentVideoIndex 
                  ? 'bg-white h-8' 
                  : 'bg-white bg-opacity-40 h-4'
              }`}
            />
          );
        })}
      </div>

      {/* Video Counter */}
      <div className="fixed top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm z-50 backdrop-blur-sm">
        {currentVideoIndex + 1} / {shorts.length}
      </div>

      {/* Loading indicator for next videos */}
      {currentVideoIndex >= shorts.length - 5 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm z-50 backdrop-blur-sm">
          Loading more shorts...
        </div>
      )}
    </div>
  );
};

export default Shorts;
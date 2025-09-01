import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { database } from '../firebase/config';
import { ref, push, set } from 'firebase/database';
import AddToPlaylistModal from './AddToPlaylistModal';
import { 
  FiThumbsUp, 
  FiThumbsDown, 
  FiMessageCircle, 
  FiShare, 
  FiMoreVertical,
  FiList,
  FiHeart,
  FiUser,
  FiUserPlus
} from 'react-icons/fi';
import moment from 'moment';

const ShortsPlayer = ({ video, videoIndex, isActive, isPrevious, isNext, onNext, onPrevious }) => {
  const { state } = useApp();
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);

  // Reset video loaded state when video changes
  useEffect(() => {
    setVideoLoaded(false);
  }, [videoId]);

  // Add to history if user is logged in and video is active
  useEffect(() => {
    if (state.user && video && isActive) {
      const addToHistory = async () => {
        try {
          const historyRef = ref(database, `users/${state.user.uid}/history`);
          await push(historyRef, {
            videoId: video.id?.videoId || video.id,
            title: video.snippet?.title || 'YouTube Short',
            thumbnail: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url,
            channelTitle: video.snippet?.channelTitle || 'Unknown Channel',
            watchedAt: Date.now(),
            isShort: true
          });
        } catch (error) {
          console.warn('Could not save to history:', error);
        }
      };
      
      const timer = setTimeout(addToHistory, 2000); // Add to history after 2 seconds of viewing
      return () => clearTimeout(timer);
    }
  }, [video, state.user, isActive]);

  // Preload iframe for next/previous videos
  useEffect(() => {
    if (isPrevious || isNext) {
      const preloadTimer = setTimeout(() => {
        setVideoLoaded(true);
      }, 500);
      return () => clearTimeout(preloadTimer);
    }
  }, [isPrevious, isNext]);

  const handleLike = async () => {
    if (!state.user || !video) return;
    
    try {
      const videoId = video.id?.videoId || video.id;
      const likedVideosRef = ref(database, `users/${state.user.uid}/likedVideos/${videoId}`);
      
      if (isLiked) {
        await set(likedVideosRef, null);
        setIsLiked(false);
      } else {
        await set(likedVideosRef, {
          videoId: videoId,
          title: video.snippet?.title || 'YouTube Short',
          thumbnail: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url,
          channelTitle: video.snippet?.channelTitle || 'Unknown Channel',
          likedAt: Date.now(),
          isShort: true
        });
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!state.user || !video?.snippet?.channelId) return;
    
    try {
      const subscriptionsRef = ref(database, `users/${state.user.uid}/subscriptions/${video.snippet.channelId}`);
      
      if (isSubscribed) {
        await set(subscriptionsRef, null);
        setIsSubscribed(false);
      } else {
        await set(subscriptionsRef, {
          channelId: video.snippet.channelId,
          title: video.snippet.channelTitle,
          thumbnail: video.snippet.thumbnails?.default?.url,
          subscribedAt: Date.now()
        });
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  const formatViews = (views) => {
    if (!views) return '0';
    const num = parseInt(views);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (!video) return null;

  const videoId = video.id?.videoId || video.id;

  return (
    <div className="relative w-full h-full max-w-md mx-auto bg-black">
      {/* Video Player */}
      <div className="relative w-full h-full bg-black">
        {/* Video Thumbnail (shown while loading) */}
        {!videoLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url}
              alt={video.snippet?.title || 'YouTube Short'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          </div>
        )}
        
        {/* YouTube Iframe */}
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${isActive ? 1 : 0}&controls=0&modestbranding=1&rel=0&loop=1&mute=${isActive ? 0 : 1}&playsinline=1&enablejsapi=1`}
          title={video.snippet?.title || 'YouTube Short'}
          className={`w-full h-full object-cover transition-opacity duration-300 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture; accelerometer; gyroscope"
          frameBorder="0"
          onLoad={() => setVideoLoaded(true)}
        />
        
        {/* Gradient overlays for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
        
        {/* Video loading indicator */}
        {isActive && !videoLoaded && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
            Loading...
          </div>
        )}
      </div>

      {/* Right Side Action Panel */}
      <div className="absolute right-3 bottom-20 flex flex-col items-center space-y-6">
        {/* Channel Avatar & Subscribe */}
        <div className="flex flex-col items-center space-y-2">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-white">
              <span className="text-white font-bold text-lg">
                {video.snippet?.channelTitle?.charAt(0) || 'Y'}
              </span>
            </div>
            {state.user && (
              <button
                onClick={handleSubscribe}
                className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all ${
                  isSubscribed 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isSubscribed ? <FiUser size={12} /> : <FiUserPlus size={12} />}
              </button>
            )}
          </div>
        </div>

        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`flex flex-col items-center space-y-1 p-2 rounded-full transition-all ${
            isLiked ? 'text-red-500 bg-white/10' : 'text-white hover:bg-white/10'
          }`}
        >
          {isLiked ? <FiHeart size={28} fill="currentColor" /> : <FiThumbsUp size={28} />}
          <span className="text-xs font-semibold">
            {formatViews(video.statistics?.likeCount) || 'Like'}
          </span>
        </button>

        {/* Dislike Button */}
        <button className="flex flex-col items-center space-y-1 text-white p-2 rounded-full hover:bg-white/10 transition-all">
          <FiThumbsDown size={28} />
          <span className="text-xs font-semibold">Dislike</span>
        </button>

        {/* Comments Button */}
        <button className="flex flex-col items-center space-y-1 text-white p-2 rounded-full hover:bg-white/10 transition-all">
          <FiMessageCircle size={28} />
          <span className="text-xs font-semibold">
            {formatViews(video.statistics?.commentCount) || 'Comment'}
          </span>
        </button>

        {/* Save to Playlist Button */}
        {state.user && (
          <button
            onClick={() => setShowPlaylistModal(true)}
            className="flex flex-col items-center space-y-1 text-white p-2 rounded-full hover:bg-white/10 transition-all"
          >
            <FiList size={28} />
            <span className="text-xs font-semibold">Save</span>
          </button>
        )}

        {/* Share Button */}
        <button className="flex flex-col items-center space-y-1 text-white p-2 rounded-full hover:bg-white/10 transition-all">
          <FiShare size={28} />
          <span className="text-xs font-semibold">Share</span>
        </button>

        {/* More Options */}
        <button className="flex flex-col items-center space-y-1 text-white p-2 rounded-full hover:bg-white/10 transition-all">
          <FiMoreVertical size={28} />
        </button>
      </div>

      {/* Bottom Info Panel */}
      <div className="absolute bottom-0 left-0 right-16 p-4">
        {/* Channel Info */}
        <div className="flex items-center space-x-3 mb-3">
          <span className="text-white font-bold text-base">
            @{video.snippet?.channelTitle || 'Unknown'}
          </span>
        </div>
        
        {/* Video Title */}
        <h3 
          className={`text-white font-medium mb-2 cursor-pointer transition-all ${
            showDescription ? 'text-sm' : 'text-base line-clamp-2'
          }`}
          onClick={() => setShowDescription(!showDescription)}
        >
          {video.snippet?.title || 'YouTube Short'}
        </h3>
        
        {/* Description (expandable) */}
        {showDescription && (
          <p className="text-gray-200 text-sm mb-2 line-clamp-3">
            {video.snippet?.description || 'No description available'}
          </p>
        )}
        
        {/* Metadata */}
        <div className="flex items-center space-x-3 text-gray-300 text-sm">
          <span>{formatViews(video.statistics?.viewCount)} views</span>
          <span>•</span>
          <span>{moment(video.snippet?.publishedAt).fromNow()}</span>
        </div>
      </div>

      {/* Navigation Areas (invisible touch targets) */}
      <div 
        className="absolute top-0 left-0 w-1/3 h-full cursor-pointer z-10"
        onClick={(e) => {
          e.preventDefault();
          onPrevious();
        }}
      />
      <div 
        className="absolute top-0 right-0 w-1/3 h-full cursor-pointer z-10"
        onClick={(e) => {
          e.preventDefault();
          onNext();
        }}
      />
      
      {/* Center tap area for play/pause */}
      <div 
        className="absolute top-0 left-1/3 w-1/3 h-full cursor-pointer z-10"
        onClick={(e) => {
          e.preventDefault();
          // Toggle play/pause by reloading iframe with different autoplay
          if (iframeRef.current) {
            const currentSrc = iframeRef.current.src;
            const newSrc = currentSrc.includes('autoplay=1') 
              ? currentSrc.replace('autoplay=1', 'autoplay=0')
              : currentSrc.replace('autoplay=0', 'autoplay=1');
            iframeRef.current.src = newSrc;
          }
        }}
      />

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        video={video}
      />
    </div>
  );
};

export default ShortsPlayer;
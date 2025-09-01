import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { youtubeApi } from '../services/youtubeApi';
import { database } from '../firebase/config';
import { ref, push, set } from 'firebase/database';
import VideoCard from '../components/VideoCard';
import Comments from '../components/Comments';
import { FiThumbsUp, FiThumbsDown, FiShare, FiDownload, FiMoreHorizontal } from 'react-icons/fi';
import moment from 'moment';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const { state } = useApp();
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching video with ID:', videoId);
        
        // First try to get the video data
        const videoData = await youtubeApi.getVideoById(videoId);
        console.log('Video data received:', videoData);
        
        if (!videoData) {
          setError('Video not found or may be private/deleted');
          return;
        }
        
        setVideo(videoData);
        
        // Then get related videos
        try {
          const relatedData = await youtubeApi.getRelatedVideos(videoId);
          setRelatedVideos(relatedData.items || []);
        } catch (relatedError) {
          console.warn('Could not fetch related videos:', relatedError);
          setRelatedVideos([]);
        }
        
        // Add to history if user is logged in
        if (state.user && videoData) {
          try {
            const historyRef = ref(database, `users/${state.user.uid}/history`);
            await push(historyRef, {
              videoId: videoData.id,
              title: videoData.snippet.title,
              thumbnail: videoData.snippet.thumbnails.medium?.url,
              channelTitle: videoData.snippet.channelTitle,
              watchedAt: Date.now()
            });
          } catch (historyError) {
            console.warn('Could not save to history:', historyError);
          }
        }
      } catch (error) {
        console.error('Error fetching video data:', error);
        setError(`Failed to load video: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideoData();
    }
  }, [videoId, state.user]);

  const formatViews = (views) => {
    if (!views) return '0 views';
    const num = parseInt(views);
    return num.toLocaleString() + ' views';
  };

  const handleLike = async () => {
    if (!state.user || !video) return;
    
    try {
      const likedVideosRef = ref(database, `users/${state.user.uid}/likedVideos/${video.id}`);
      
      if (isLiked) {
        await set(likedVideosRef, null);
        setIsLiked(false);
      } else {
        await set(likedVideosRef, {
          videoId: video.id,
          title: video.snippet.title,
          thumbnail: video.snippet.thumbnails.medium.url,
          channelTitle: video.snippet.channelTitle,
          likedAt: Date.now()
        });
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!state.user || !video) return;
    
    try {
      const subscriptionsRef = ref(database, `users/${state.user.uid}/subscriptions/${video.snippet.channelId}`);
      
      if (isSubscribed) {
        await set(subscriptionsRef, null);
        setIsSubscribed(false);
      } else {
        await set(subscriptionsRef, {
          channelId: video.snippet.channelId,
          title: video.snippet.channelTitle,
          thumbnail: video.snippet.thumbnails.default?.url,
          subscribedAt: Date.now()
        });
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  };

  if (loading) {
    return (
      <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="bg-youtube-gray aspect-video rounded-lg mb-4"></div>
            <div className="h-6 bg-youtube-gray rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-youtube-gray rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">
            {error || 'Video not found'}
          </h2>
          <p className="text-gray-400 mb-4">
            The video you're looking for might be private, deleted, or the ID might be incorrect.
          </p>
          <p className="text-sm text-gray-500">
            Video ID: {videoId}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-youtube-red text-white rounded hover:bg-red-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        {/* Main video section */}
        <div className="flex-1">
          {/* Video player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
              title={video.snippet?.title || 'YouTube Video'}
              className="w-full h-full"
              allowFullScreen
              allow="encrypted-media; picture-in-picture"
              frameBorder="0"
            />
          </div>

          {/* Video info */}
          <div className="mb-6">
            <h1 className="text-xl font-bold mb-3">{video.snippet.title}</h1>
            
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">
                  {formatViews(video.statistics.viewCount)} • {moment(video.snippet.publishedAt).fromNow()}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    isLiked ? 'bg-youtube-red text-white' : 'bg-youtube-gray hover:bg-youtube-light-gray'
                  }`}
                >
                  <FiThumbsUp size={16} />
                  <span>{parseInt(video.statistics.likeCount || 0).toLocaleString()}</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-youtube-gray rounded-full hover:bg-youtube-light-gray transition-colors">
                  <FiThumbsDown size={16} />
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-youtube-gray rounded-full hover:bg-youtube-light-gray transition-colors">
                  <FiShare size={16} />
                  <span>Share</span>
                </button>
                
                <button className="flex items-center space-x-2 px-4 py-2 bg-youtube-gray rounded-full hover:bg-youtube-light-gray transition-colors">
                  <FiDownload size={16} />
                  <span>Download</span>
                </button>
                
                <button className="p-2 bg-youtube-gray rounded-full hover:bg-youtube-light-gray transition-colors">
                  <FiMoreHorizontal size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Channel info */}
          <div className="flex items-center justify-between p-4 bg-youtube-gray rounded-lg mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-youtube-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {video.snippet.channelTitle.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{video.snippet.channelTitle}</h3>
                <p className="text-sm text-gray-400">Subscribers</p>
              </div>
            </div>
            
            {state.user && (
              <button
                onClick={handleSubscribe}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                  isSubscribed 
                    ? 'bg-youtube-gray text-white' 
                    : 'bg-youtube-red text-white hover:bg-red-600'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>

          {/* Description */}
          <div className="bg-youtube-gray rounded-lg p-4 mb-6">
            <p className="text-sm whitespace-pre-wrap">
              {video.snippet.description}
            </p>
          </div>

          {/* Comments */}
          <Comments videoId={videoId} />
        </div>

        {/* Related videos sidebar */}
        <div className="w-full lg:w-96">
          <h3 className="font-semibold mb-4">Related Videos</h3>
          <div className="space-y-2">
            {relatedVideos.map((relatedVideo) => (
              <VideoCard 
                key={relatedVideo.id?.videoId || relatedVideo.id} 
                video={relatedVideo} 
                layout="list" 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
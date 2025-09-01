import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { FiList, FiClock } from 'react-icons/fi';
import AddToPlaylistModal from './AddToPlaylistModal';
import { useApp } from '../context/AppContext';

const VideoCard = ({ video, layout = 'grid' }) => {
  const { state } = useApp();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const formatViews = (views) => {
    if (!views) return '0 views';
    const num = parseInt(views);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`;
    }
    return `${num} views`;
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '';
    
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    let formatted = '';
    if (hours) formatted += `${hours}:`;
    formatted += `${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    
    return formatted;
  };

  const videoId = video.id?.videoId || video.id;
  const thumbnail = video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url;
  const title = video.snippet?.title;
  const channelTitle = video.snippet?.channelTitle;
  const publishedAt = video.snippet?.publishedAt;
  const viewCount = video.statistics?.viewCount;
  const duration = video.contentDetails?.duration;

  if (layout === 'list') {
    return (
      <div className="flex space-x-4 p-2 hover:bg-youtube-gray rounded-lg transition-colors group">
        <Link to={`/watch/${videoId}`} className="flex-shrink-0">
          <div className="relative">
            <img
              src={thumbnail}
              alt={title}
              className="w-40 h-24 object-cover rounded-lg"
            />
            {duration && (
              <span className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                {formatDuration(duration)}
              </span>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${videoId}`}>
            <h3 className="font-medium text-sm line-clamp-2 hover:text-gray-300">
              {title}
            </h3>
          </Link>
          <p className="text-gray-400 text-xs mt-1">{channelTitle}</p>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center space-x-2 text-gray-400 text-xs">
              <span>{formatViews(viewCount)}</span>
              <span>•</span>
              <span>{moment(publishedAt).fromNow()}</span>
            </div>
            {state.user && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowPlaylistModal(true);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-youtube-light-gray rounded transition-all"
                title="Add to playlist"
              >
                <FiList size={14} />
              </button>
            )}
          </div>
        </div>
        <AddToPlaylistModal
          isOpen={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          video={video}
        />
      </div>
    );
  }

  return (
    <div className="group cursor-pointer relative">
      <Link to={`/watch/${videoId}`}>
        <div className="relative mb-3">
          <img
            src={thumbnail}
            alt={title}
            className="w-full aspect-video object-cover rounded-lg group-hover:rounded-none transition-all duration-200"
          />
          {duration && (
            <span className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(duration)}
            </span>
          )}
          
          {/* Add to playlist button overlay */}
          {state.user && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowPlaylistModal(true);
              }}
              className="absolute top-2 right-2 p-2 bg-black bg-opacity-70 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-opacity-90 transition-all"
              title="Add to playlist"
            >
              <FiList size={16} />
            </button>
          )}
        </div>
        <div className="px-1">
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-gray-300">
            {title}
          </h3>
          <p className="text-gray-400 text-sm mb-1">{channelTitle}</p>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <span>{formatViews(viewCount)}</span>
            <span>•</span>
            <span>{moment(publishedAt).fromNow()}</span>
          </div>
        </div>
      </Link>
      
      <AddToPlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        video={video}
      />
    </div>
  );
};

export default VideoCard;
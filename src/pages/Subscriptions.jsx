import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { database } from '../firebase/config';
import { ref, onValue } from 'firebase/database';
import { youtubeApi } from '../services/youtubeApi';
import VideoCard from '../components/VideoCard';
import { FiUser, FiUsers } from 'react-icons/fi';

const Subscriptions = () => {
  const { state } = useApp();
  const [subscriptions, setSubscriptions] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!state.user) {
      setLoading(false);
      return;
    }

    const subscriptionsRef = ref(database, `users/${state.user.uid}/subscriptions`);
    const unsubscribe = onValue(subscriptionsRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const subscriptionsArray = Object.entries(data).map(([id, subscription]) => ({
          id,
          ...subscription
        }));
        setSubscriptions(subscriptionsArray);

        // Fetch latest videos from subscribed channels
        try {
          const channelNames = subscriptionsArray.map(sub => sub.title).slice(0, 5);
          if (channelNames.length > 0) {
            const searchQuery = channelNames.join(' OR ');
            const videosResponse = await youtubeApi.searchVideos(searchQuery, 24);
            setVideos(videosResponse.items);
          }
        } catch (videoError) {
          console.warn('Could not fetch subscription videos:', videoError);
          setError('Could not load videos from subscriptions');
        }
      } else {
        setSubscriptions([]);
        setVideos([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [state.user]);

  if (!state.user) {
    return (
      <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <div className="p-6 text-center">
          <FiUser size={48} className="mx-auto mb-4 text-gray-500" />
          <h2 className="text-xl font-semibold mb-4">Sign in to view your subscriptions</h2>
          <p className="text-gray-400">Subscribe to channels to see their latest videos here</p>
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
        <div className="flex items-center space-x-3 mb-6">
          <FiUsers size={24} />
          <h1 className="text-2xl font-bold">Subscriptions</h1>
        </div>

        {subscriptions.length > 0 ? (
          <div>
            {/* Subscribed Channels */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Your Subscriptions ({subscriptions.length})</h2>
              <div className="flex space-x-4 overflow-x-auto pb-4">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex-shrink-0 text-center">
                    <div className="w-16 h-16 bg-youtube-red rounded-full flex items-center justify-center mb-2">
                      {subscription.thumbnail ? (
                        <img
                          src={subscription.thumbnail}
                          alt={subscription.title}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {subscription.title.charAt(0)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-center w-16 truncate">{subscription.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Videos */}
            {videos.length > 0 ? (
              <div>
                <h2 className="text-lg font-semibold mb-4">Latest Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {videos.map((video) => (
                    <VideoCard key={video.id?.videoId || video.id} video={video} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">No recent videos</h3>
                <p className="text-gray-400">
                  {error || 'Check back later for new videos from your subscriptions'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiUsers size={48} className="mx-auto mb-4 text-gray-500" />
            <h2 className="text-lg font-semibold mb-2">No subscriptions yet</h2>
            <p className="text-gray-400 mb-4">
              Subscribe to channels to see their latest videos here
            </p>
            <p className="text-sm text-gray-500">
              You can subscribe to channels by watching their videos and clicking the Subscribe button
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
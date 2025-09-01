import axios from 'axios';
import { YOUTUBE_API_KEY, YOUTUBE_BASE_URL, YOUTUBE_ENDPOINTS } from '../config/youtube';

const api = axios.create({
  baseURL: YOUTUBE_BASE_URL,
  params: {
    key: YOUTUBE_API_KEY
  }
});

export const youtubeApi = {
  // Get popular videos
  getPopularVideos: async (maxResults = 24) => {
    try {
      const response = await api.get(YOUTUBE_ENDPOINTS.VIDEOS, {
        params: {
          part: 'snippet,statistics,contentDetails',
          chart: 'mostPopular',
          regionCode: 'US',
          maxResults
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular videos:', error);
      throw error;
    }
  },

  // Search videos
  searchVideos: async (query, maxResults = 24) => {
    try {
      const response = await api.get(YOUTUBE_ENDPOINTS.SEARCH, {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults,
          order: 'relevance'
        }
      });

      // Get video details for statistics
      const videoIds = response.data.items.map(item => item.id.videoId).join(',');
      const detailsResponse = await api.get(YOUTUBE_ENDPOINTS.VIDEOS, {
        params: {
          part: 'statistics,contentDetails',
          id: videoIds
        }
      });

      // Merge search results with video details
      const videosWithDetails = response.data.items.map(item => {
        const details = detailsResponse.data.items.find(detail => detail.id === item.id.videoId);
        return {
          ...item,
          statistics: details?.statistics || {},
          contentDetails: details?.contentDetails || {}
        };
      });

      return {
        ...response.data,
        items: videosWithDetails
      };
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  },

  // Get video by ID
  getVideoById: async (videoId) => {
    try {
      console.log('Fetching video with ID:', videoId);
      const response = await api.get(YOUTUBE_ENDPOINTS.VIDEOS, {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoId
        }
      });
      console.log('API Response:', response.data);

      if (!response.data.items || response.data.items.length === 0) {
        console.warn('No video found with ID:', videoId);
        return null;
      }

      return response.data.items[0];
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  },

  // Get channel info
  getChannelInfo: async (channelId) => {
    try {
      const response = await api.get(YOUTUBE_ENDPOINTS.CHANNELS, {
        params: {
          part: 'snippet,statistics',
          id: channelId
        }
      });
      return response.data.items[0];
    } catch (error) {
      console.error('Error fetching channel info:', error);
      throw error;
    }
  },

  // Get video comments
  getVideoComments: async (videoId, maxResults = 20) => {
    try {
      const response = await api.get(YOUTUBE_ENDPOINTS.COMMENTS, {
        params: {
          part: 'snippet,replies',
          videoId,
          maxResults,
          order: 'relevance'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Get related videos
  getRelatedVideos: async (videoId, maxResults = 12) => {
    try {
      // Since YouTube removed related videos endpoint, we'll search for similar content
      const videoResponse = await api.get(YOUTUBE_ENDPOINTS.VIDEOS, {
        params: {
          part: 'snippet',
          id: videoId
        }
      });

      const video = videoResponse.data.items[0];
      if (!video) return { items: [] };

      // Search for videos with similar tags/title
      const searchQuery = video.snippet.title.split(' ').slice(0, 3).join(' ');
      return await this.searchVideos(searchQuery, maxResults);
    } catch (error) {
      console.error('Error fetching related videos:', error);
      throw error;
    }
  },

  // Get videos by category
  getVideosByCategory: async (categoryId, maxResults = 24) => {
    try {
      const response = await api.get(YOUTUBE_ENDPOINTS.VIDEOS, {
        params: {
          part: 'snippet,statistics,contentDetails',
          chart: 'mostPopular',
          videoCategoryId: categoryId,
          regionCode: 'US',
          maxResults
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching videos by category:', error);
      throw error;
    }
  },

  // Get trending videos
  getTrendingVideos: async (maxResults = 24) => {
    try {
      const response = await api.get(YOUTUBE_ENDPOINTS.VIDEOS, {
        params: {
          part: 'snippet,statistics,contentDetails',
          chart: 'mostPopular',
          regionCode: 'US',
          maxResults
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      throw error;
    }
  },

  // Get music videos (category 10)
  getMusicVideos: async (maxResults = 24) => {
    return await this.getVideosByCategory('10', maxResults);
  },

  // Get gaming videos (category 20)
  getGamingVideos: async (maxResults = 24) => {
    return await this.getVideosByCategory('20', maxResults);
  },

  // Get movie trailers (category 1)
  getMovieVideos: async (maxResults = 24) => {
    return await this.getVideosByCategory('1', maxResults);
  },

  // Get live videos
  getLiveVideos: async (maxResults = 24) => {
    try {
      const response = await api.get(YOUTUBE_ENDPOINTS.SEARCH, {
        params: {
          part: 'snippet',
          eventType: 'live',
          type: 'video',
          maxResults,
          order: 'viewCount'
        }
      });
      
      // Get video details for statistics
      const videoIds = response.data.items.map(item => item.id.videoId).join(',');
      if (videoIds) {
        const detailsResponse = await api.get(YOUTUBE_ENDPOINTS.VIDEOS, {
          params: {
            part: 'statistics,contentDetails',
            id: videoIds
          }
        });

        // Merge search results with video details
        const videosWithDetails = response.data.items.map(item => {
          const details = detailsResponse.data.items.find(detail => detail.id === item.id.videoId);
          return {
            ...item,
            statistics: details?.statistics || {},
            contentDetails: details?.contentDetails || {}
          };
        });

        return {
          ...response.data,
          items: videosWithDetails
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching live videos:', error);
      throw error;
    }
  },

  // Search videos by category keyword
  searchByCategory: async (category, maxResults = 24) => {
    return await this.searchVideos(category, maxResults);
  }
};
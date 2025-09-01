import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { database } from '../firebase/config';
import { ref, onValue, push, set } from 'firebase/database';
import { FiX, FiPlus, FiCheck } from 'react-icons/fi';

const AddToPlaylistModal = ({ isOpen, onClose, video }) => {
  const { state } = useApp();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state.user || !isOpen) return;

    const playlistsRef = ref(database, `users/${state.user.uid}/playlists`);
    const unsubscribe = onValue(playlistsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playlistsArray = Object.entries(data).map(([id, playlist]) => ({
          id,
          ...playlist
        }));
        setPlaylists(playlistsArray);
        
        // Check which playlists already contain this video
        const videoInPlaylists = new Set();
        playlistsArray.forEach(playlist => {
          if (playlist.videos && playlist.videos[video.id]) {
            videoInPlaylists.add(playlist.id);
          }
        });
        setSelectedPlaylists(videoInPlaylists);
      } else {
        setPlaylists([]);
        setSelectedPlaylists(new Set());
      }
    });

    return () => unsubscribe();
  }, [state.user, isOpen, video.id]);

  const createNewPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || !state.user) return;

    try {
      setLoading(true);
      const playlistsRef = ref(database, `users/${state.user.uid}/playlists`);
      const newPlaylistRef = await push(playlistsRef, {
        name: newPlaylistName,
        description: '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        videos: {}
      });

      // Add video to the new playlist
      const videoRef = ref(database, `users/${state.user.uid}/playlists/${newPlaylistRef.key}/videos/${video.id}`);
      await set(videoRef, {
        videoId: video.id,
        title: video.snippet?.title || 'Unknown Title',
        thumbnail: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url,
        channelTitle: video.snippet?.channelTitle || 'Unknown Channel',
        addedAt: Date.now()
      });

      setNewPlaylistName('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlaylist = async (playlistId) => {
    if (!state.user) return;

    try {
      const videoRef = ref(database, `users/${state.user.uid}/playlists/${playlistId}/videos/${video.id}`);
      const playlistRef = ref(database, `users/${state.user.uid}/playlists/${playlistId}/updatedAt`);
      
      if (selectedPlaylists.has(playlistId)) {
        // Remove from playlist
        await set(videoRef, null);
        setSelectedPlaylists(prev => {
          const newSet = new Set(prev);
          newSet.delete(playlistId);
          return newSet;
        });
      } else {
        // Add to playlist
        await set(videoRef, {
          videoId: video.id,
          title: video.snippet?.title || 'Unknown Title',
          thumbnail: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url,
          channelTitle: video.snippet?.channelTitle || 'Unknown Channel',
          addedAt: Date.now()
        });
        setSelectedPlaylists(prev => new Set([...prev, playlistId]));
      }
      
      // Update playlist timestamp
      await set(playlistRef, Date.now());
    } catch (error) {
      console.error('Error updating playlist:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-youtube-gray rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-youtube-light-gray">
          <h3 className="text-lg font-semibold">Save to playlist</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-youtube-light-gray rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {/* Create new playlist */}
          {showCreateForm ? (
            <form onSubmit={createNewPlaylist} className="mb-4 p-3 bg-youtube-dark rounded-lg">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Enter playlist name"
                className="w-full p-2 bg-youtube-gray border border-youtube-light-gray rounded mb-3 focus:border-blue-500 outline-none"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim() || loading}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2 w-full p-3 hover:bg-youtube-dark rounded-lg transition-colors mb-4"
            >
              <FiPlus size={20} />
              <span>Create new playlist</span>
            </button>
          )}

          {/* Existing playlists */}
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => togglePlaylist(playlist.id)}
                className="flex items-center justify-between w-full p-3 hover:bg-youtube-dark rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-youtube-light-gray rounded flex items-center justify-center">
                    {selectedPlaylists.has(playlist.id) ? (
                      <FiCheck size={16} className="text-blue-500" />
                    ) : (
                      <span className="text-xs">
                        {playlist.videos ? Object.keys(playlist.videos).length : 0}
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{playlist.name}</p>
                    <p className="text-sm text-gray-400">
                      {playlist.videos ? Object.keys(playlist.videos).length : 0} videos
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {playlists.length === 0 && !showCreateForm && (
            <div className="text-center py-8 text-gray-400">
              <p>No playlists yet</p>
              <p className="text-sm">Create your first playlist above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
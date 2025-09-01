import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { database } from '../firebase/config';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { FiPlus, FiPlay, FiTrash2, FiEdit } from 'react-icons/fi';
import VideoCard from '../components/VideoCard';

const Playlists = () => {
  const { state } = useApp();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');

  useEffect(() => {
    if (!state.user) return;

    const playlistsRef = ref(database, `users/${state.user.uid}/playlists`);
    const unsubscribe = onValue(playlistsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playlistsArray = Object.entries(data).map(([id, playlist]) => ({
          id,
          ...playlist
        }));
        setPlaylists(playlistsArray);
      } else {
        setPlaylists([]);
      }
    });

    return () => unsubscribe();
  }, [state.user]);

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || !state.user) return;

    try {
      const playlistsRef = ref(database, `users/${state.user.uid}/playlists`);
      await push(playlistsRef, {
        name: newPlaylistName,
        description: newPlaylistDescription,
        videos: {},
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!state.user) return;
    
    try {
      const playlistRef = ref(database, `users/${state.user.uid}/playlists/${playlistId}`);
      await remove(playlistRef);
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null);
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const removeVideoFromPlaylist = async (playlistId, videoId) => {
    if (!state.user) return;
    
    try {
      const videoRef = ref(database, `users/${state.user.uid}/playlists/${playlistId}/videos/${videoId}`);
      await remove(videoRef);
      
      // Update playlist timestamp
      const playlistRef = ref(database, `users/${state.user.uid}/playlists/${playlistId}/updatedAt`);
      await set(playlistRef, Date.now());
    } catch (error) {
      console.error('Error removing video from playlist:', error);
    }
  };

  if (!state.user) {
    return (
      <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">Sign in to view your playlists</h2>
          <p className="text-gray-400">Create and manage your video playlists</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`pt-16 ${state.sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Playlists</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-youtube-red rounded-lg hover:bg-red-600 transition-colors"
          >
            <FiPlus size={16} />
            <span>Create Playlist</span>
          </button>
        </div>

        {/* Create playlist form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-youtube-gray p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Create New Playlist</h3>
              <form onSubmit={createPlaylist}>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Playlist name"
                  className="w-full p-3 bg-youtube-dark border border-youtube-light-gray rounded mb-3 focus:border-blue-500 outline-none"
                  required
                />
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full p-3 bg-youtube-dark border border-youtube-light-gray rounded mb-4 focus:border-blue-500 outline-none resize-none"
                  rows="3"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-youtube-red text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Playlists grid */}
        {selectedPlaylist ? (
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="text-blue-500 hover:text-blue-400"
              >
                ← Back to playlists
              </button>
              <h2 className="text-xl font-semibold">{selectedPlaylist.name}</h2>
            </div>
            
            {selectedPlaylist.videos && Object.keys(selectedPlaylist.videos).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(selectedPlaylist.videos).map(([videoId, video]) => (
                  <div key={videoId} className="relative group">
                    <VideoCard video={video} />
                    <button
                      onClick={() => removeVideoFromPlaylist(selectedPlaylist.id, videoId)}
                      className="absolute top-2 right-2 p-2 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No videos in this playlist</h3>
                <p className="text-gray-400">Add videos to your playlist while watching them</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {playlists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {playlists.map((playlist) => {
                  const videoCount = playlist.videos ? Object.keys(playlist.videos).length : 0;
                  const firstVideo = playlist.videos ? Object.values(playlist.videos)[0] : null;
                  
                  return (
                    <div key={playlist.id} className="bg-youtube-gray rounded-lg overflow-hidden group">
                      <div 
                        className="relative aspect-video bg-youtube-light-gray cursor-pointer"
                        onClick={() => setSelectedPlaylist(playlist)}
                      >
                        {firstVideo ? (
                          <img
                            src={firstVideo.thumbnail}
                            alt={playlist.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <FiPlay size={48} className="text-gray-500" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiPlay size={32} />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-1 truncate">{playlist.name}</h3>
                        <p className="text-sm text-gray-400 mb-2">{videoCount} videos</p>
                        {playlist.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">{playlist.description}</p>
                        )}
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => deletePlaylist(playlist.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-lg font-semibold mb-2">No playlists yet</h2>
                <p className="text-gray-400 mb-4">Create your first playlist to organize your favorite videos</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-2 bg-youtube-red rounded-lg hover:bg-red-600 transition-colors"
                >
                  Create Playlist
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Playlists;
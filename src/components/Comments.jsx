import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { youtubeApi } from '../services/youtubeApi';
import { database } from '../firebase/config';
import { ref, push, onValue, off } from 'firebase/database';
import moment from 'moment';
import { FiThumbsUp, FiThumbsDown } from 'react-icons/fi';

const Comments = ({ videoId }) => {
  const { state } = useApp();
  const [comments, setComments] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await youtubeApi.getVideoComments(videoId);
        setComments(response.items || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch user comments from Firebase
    const fetchUserComments = () => {
      const commentsRef = ref(database, `comments/${videoId}`);
      onValue(commentsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const commentsArray = Object.entries(data).map(([id, comment]) => ({
            id,
            ...comment
          }));
          setUserComments(commentsArray.sort((a, b) => b.timestamp - a.timestamp));
        } else {
          setUserComments([]);
        }
      });

      return () => off(commentsRef);
    };

    fetchComments();
    const unsubscribe = fetchUserComments();

    return unsubscribe;
  }, [videoId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !state.user) return;

    try {
      const commentsRef = ref(database, `comments/${videoId}`);
      await push(commentsRef, {
        text: newComment,
        userId: state.user.uid,
        userName: state.user.displayName || 'Anonymous',
        userPhoto: state.user.photoURL || '',
        timestamp: Date.now(),
        likes: 0
      });
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const formatCommentText = (text) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Comments ({comments.length + userComments.length})
      </h3>

      {/* Add comment form */}
      {state.user ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex space-x-3">
            <img
              src={state.user.photoURL || '/default-avatar.png'}
              alt="Your avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 bg-youtube-dark border-b-2 border-youtube-gray focus:border-blue-500 resize-none outline-none"
                rows="2"
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => setNewComment('')}
                  className="px-4 py-2 text-sm hover:bg-youtube-gray rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-youtube-gray rounded-lg text-center">
          <p className="text-gray-400">Sign in to leave a comment</p>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {/* User comments from Firebase */}
        {userComments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <img
              src={comment.userPhoto || '/default-avatar.png'}
              alt={comment.userName}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-sm">{comment.userName}</span>
                <span className="text-gray-400 text-xs">
                  {moment(comment.timestamp).fromNow()}
                </span>
              </div>
              <p className="text-sm mb-2">{formatCommentText(comment.text)}</p>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                  <FiThumbsUp size={14} />
                  <span className="text-xs">{comment.likes || 0}</span>
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <FiThumbsDown size={14} />
                </button>
                <button className="text-gray-400 hover:text-white text-xs transition-colors">
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* YouTube API comments */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex space-x-3 animate-pulse">
                <div className="w-10 h-10 bg-youtube-gray rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-youtube-gray rounded w-1/4"></div>
                  <div className="h-4 bg-youtube-gray rounded w-3/4"></div>
                  <div className="h-3 bg-youtube-gray rounded w-1/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          comments.map((comment) => {
            const snippet = comment.snippet.topLevelComment.snippet;
            return (
              <div key={comment.id} className="flex space-x-3">
                <img
                  src={snippet.authorProfileImageUrl}
                  alt={snippet.authorDisplayName}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm">{snippet.authorDisplayName}</span>
                    <span className="text-gray-400 text-xs">
                      {moment(snippet.publishedAt).fromNow()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{formatCommentText(snippet.textDisplay)}</p>
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors">
                      <FiThumbsUp size={14} />
                      <span className="text-xs">{snippet.likeCount}</span>
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <FiThumbsDown size={14} />
                    </button>
                    <button className="text-gray-400 hover:text-white text-xs transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Comments;
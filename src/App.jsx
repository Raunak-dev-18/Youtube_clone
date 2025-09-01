import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import VideoPlayer from './pages/VideoPlayer';
import SearchResults from './pages/SearchResults';
import Profile from './pages/Profile';
import Playlists from './pages/Playlists';
import History from './pages/History';
import LikedVideos from './pages/LikedVideos';
import Subscriptions from './pages/Subscriptions';
import Trending from './pages/Trending';
import Music from './pages/Music';
import Movies from './pages/Movies';
import Live from './pages/Live';
import Gaming from './pages/Gaming';
import Shorts from './pages/Shorts';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-youtube-dark text-white">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 transition-all duration-300">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/watch/:videoId" element={<VideoPlayer />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/history" element={<History />} />
                <Route path="/liked" element={<LikedVideos />} />
                <Route path="/subscriptions" element={<Subscriptions />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/music" element={<Music />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/live" element={<Live />} />
                <Route path="/gaming" element={<Gaming />} />
                <Route path="/shorts" element={<Shorts />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
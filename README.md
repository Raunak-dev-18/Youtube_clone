# YouTube Clone

A modern, full-featured YouTube clone built with React, Firebase, and the YouTube Data API v3. Features include video streaming, user authentication, playlists, comments, history tracking, and more.

## Features

### 🎥 Core Features
- **Video Streaming**: Watch YouTube videos with embedded player
- **Search**: Search for videos using YouTube Data API
- **Trending Videos**: Display popular and trending content
- **Responsive Design**: Works on desktop, tablet, and mobile

### 👤 User Features
- **Google Authentication**: Sign in with Google account
- **Watch History**: Track and manage watched videos
- **Liked Videos**: Like and manage favorite videos
- **Playlists**: Create, manage, and organize custom playlists
- **Subscriptions**: Subscribe to channels (stored in Firebase)

### 💬 Social Features
- **Comments**: View YouTube comments and add custom comments
- **User Comments**: Firebase-powered comment system
- **Real-time Updates**: Live updates for user data

### 🎨 UI/UX Features
- **Dark Theme**: YouTube-inspired dark interface
- **Collapsible Sidebar**: Responsive navigation
- **Modern Design**: Clean, aesthetic interface with Tailwind CSS
- **Loading States**: Smooth loading animations
- **Error Handling**: Graceful error messages

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Authentication**: Firebase Auth (Google Sign-in)
- **Database**: Firebase Realtime Database
- **API**: YouTube Data API v3
- **Icons**: React Icons (Feather Icons)
- **HTTP Client**: Axios
- **Date Handling**: Moment.js

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Cloud Console account
- Firebase project

### 1. Clone the Repository
```bash
git clone <repository-url>
cd youtube-clone
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up YouTube Data API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy the API key

### 4. Set up Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication and set up Google sign-in
4. Enable Realtime Database
5. Copy your Firebase configuration

### 5. Configure Environment
Update the configuration files:

**src/config/youtube.js**:
```javascript
export const YOUTUBE_API_KEY = 'your-youtube-api-key-here';
```

**src/firebase/config.js**:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 6. Run the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Navigation header with search
│   ├── Sidebar.jsx     # Navigation sidebar
│   ├── VideoCard.jsx   # Video display component
│   └── Comments.jsx    # Comments system
├── pages/              # Main application pages
│   ├── Home.jsx        # Homepage with trending videos
│   ├── VideoPlayer.jsx # Video player page
│   ├── SearchResults.jsx # Search results page
│   ├── Playlists.jsx   # Playlist management
│   ├── History.jsx     # Watch history
│   ├── LikedVideos.jsx # Liked videos page
│   └── Profile.jsx     # User profile
├── context/            # React Context for state management
│   └── AppContext.jsx  # Global app state
├── services/           # API services
│   └── youtubeApi.js   # YouTube API integration
├── config/             # Configuration files
│   └── youtube.js      # YouTube API configuration
├── firebase/           # Firebase configuration
│   └── config.js       # Firebase setup
└── App.jsx            # Main application component
```

## Firebase Database Structure

```
users/
  {userId}/
    history/
      {historyId}/
        videoId: string
        title: string
        thumbnail: string
        channelTitle: string
        watchedAt: timestamp
    likedVideos/
      {videoId}/
        videoId: string
        title: string
        thumbnail: string
        channelTitle: string
        likedAt: timestamp
    playlists/
      {playlistId}/
        name: string
        description: string
        createdAt: timestamp
        updatedAt: timestamp
        videos/
          {videoId}/
            videoId: string
            title: string
            thumbnail: string
            channelTitle: string
    subscriptions/
      {channelId}/
        channelId: string
        title: string
        thumbnail: string
        subscribedAt: timestamp

comments/
  {videoId}/
    {commentId}/
      text: string
      userId: string
      userName: string
      userPhoto: string
      timestamp: timestamp
      likes: number
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features in Detail

### Authentication
- Google Sign-in integration
- Persistent user sessions
- User profile management

### Video Management
- YouTube video embedding
- Video metadata display
- Related videos suggestions
- View count and engagement metrics

### Playlists
- Create custom playlists
- Add/remove videos from playlists
- Playlist management interface
- Persistent playlist storage

### History & Likes
- Automatic history tracking
- Manual like/unlike functionality
- History and likes management
- Data persistence across sessions

### Comments
- Display YouTube API comments
- Custom comment system with Firebase
- Real-time comment updates
- User comment management

## Customization

### Styling
The app uses Tailwind CSS with custom YouTube-inspired colors:
- `youtube-red`: #FF0000
- `youtube-dark`: #0F0F0F
- `youtube-gray`: #272727
- `youtube-light-gray`: #3F3F3F

### API Limits
Be aware of YouTube API quotas:
- 10,000 units per day (default)
- Different operations consume different units
- Monitor usage in Google Cloud Console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Make sure to comply with YouTube's Terms of Service and API usage policies.

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Ensure YouTube Data API v3 is enabled
   - Check API key restrictions
   - Verify quota limits

2. **Firebase Issues**
   - Check Firebase configuration
   - Ensure Realtime Database rules allow read/write
   - Verify Authentication setup

3. **CORS Issues**
   - YouTube API should work from localhost
   - For production, configure proper domains

### Support

For issues and questions:
1. Check the console for error messages
2. Verify API keys and Firebase configuration
3. Check network connectivity
4. Review Firebase security rules

## Future Enhancements

- Video upload functionality
- Live streaming support
- Advanced search filters
- Channel pages
- Notification system
- Mobile app version
- Video recommendations algorithm
- Dark/light theme toggle
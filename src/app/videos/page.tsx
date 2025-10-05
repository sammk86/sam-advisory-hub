"use client";
import React, { useState, useEffect } from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { FaYoutube, FaCalendarAlt, FaPlay, FaExternalLinkAlt } from 'react-icons/fa';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  tags: string[];
}

const VideoCard: React.FC<{ video: Video }> = ({ video }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateDescription = (description: string, maxLength: number = 150) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:border-primary transition-all group">
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <FaPlay className="w-6 h-6 text-white ml-1" />
          </div>
        </div>
        <a
          href={`https://youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0"
          aria-label={`Watch ${video.title}`}
        />
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          {truncateDescription(video.description)}
        </p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <FaCalendarAlt className="w-3 h-3" />
          <span>{formatDate(video.publishedAt)}</span>
        </div>
        
        <a
          href={`https://youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all duration-200 gap-2 w-full hover:opacity-90"
        >
          <FaYoutube className="w-5 h-5" />
          <span>Watch on YouTube</span>
          <FaExternalLinkAlt className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

const VideosPage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/youtube/videos');
        
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        
        const data = await response.json();
        setVideos(data.videos || []);
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        setError('YouTube API key not configured. Please add YOUTUBE_API_KEY to your environment variables.');
        
        // Set empty videos array instead of placeholder videos
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <Header />
        <div className="container mt-24 mx-auto px-12 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-8">Videos & Tutorials</h1>
            <p className="text-muted-foreground text-lg mb-12">
              Watch my latest videos covering Data & AI topics, tutorials, and insights to help you advance your knowledge and career.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-lg border border-border p-6 animate-pulse">
                  <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-muted rounded mb-4 w-1/2"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="container mt-24 mx-auto px-12 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">Videos & Tutorials</h1>
          <p className="text-muted-foreground text-lg mb-12">
            Watch my latest videos covering Data & AI topics, tutorials, and insights to help you advance your knowledge and career.
          </p>
          
          {error && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-4">
                <FaYoutube className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-blue-800 font-medium mb-2">YouTube Integration Setup Required</h3>
                  <p className="text-blue-700 text-sm mb-4">{error}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="https://www.youtube.com/@aiiwisdom"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <FaYoutube className="w-4 h-4" />
                      <span>Visit YouTube Channel</span>
                      <FaExternalLinkAlt className="w-3 h-3" />
                    </a>
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <span>Get YouTube API Key</span>
                      <FaExternalLinkAlt className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : !loading && !error && (
            <div className="text-center py-16">
              <FaYoutube className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-foreground mb-4">No Videos Available</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Check back later for new videos from my YouTube channel, or visit the channel directly.
              </p>
              <a
                href="https://www.youtube.com/@aiiwisdom"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors text-lg font-medium"
              >
                <FaYoutube className="w-6 h-6" />
                <span>Visit YouTube Channel</span>
                <FaExternalLinkAlt className="w-5 h-5" />
              </a>
            </div>
          )}

          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-primary/10 to-accent-foreground/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                Subscribe to My YouTube Channel
              </h3>
              <p className="text-muted-foreground mb-6">
                Stay updated with the latest videos on Data & AI, technology trends, and career insights.
              </p>
              <a
                href="https://www.youtube.com/@aiiwisdom"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors gap-3"
              >
                <FaYoutube className="w-6 h-6" />
                <span className="font-medium">Subscribe Now</span>
                <FaExternalLinkAlt className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default VideosPage;
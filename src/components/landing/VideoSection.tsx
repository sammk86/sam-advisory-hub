"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaYoutube, FaCalendarAlt, FaPlay } from "react-icons/fa";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  channelTitle: string;
  tags: string[];
}

const YouTubeEmbed: React.FC<{ videoId: string; title: string }> = ({ videoId, title }) => {
  return (
    <div className="relative w-full pt-[56.25%]">
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

const VideoThumbnail: React.FC<{ videoId: string; thumbnail: string; title: string }> = ({ videoId, thumbnail, title }) => {
  return (
    <div className="relative w-full pt-[56.25%] overflow-hidden rounded-lg">
      <img
        src={thumbnail}
        alt={title}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
          <FaPlay className="w-6 h-6 text-white ml-1" />
        </div>
      </div>
      <a
        href={`https://youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0"
        aria-label={`Watch ${title}`}
      />
    </div>
  );
};

const VideoCard: React.FC<{ video: Video }> = ({ video }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateDescription = (description: string, maxLength: number = 120) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-card rounded-lg border border-border hover:border-primary transition-all overflow-hidden flex flex-col h-full">
      <VideoThumbnail videoId={video.id} thumbnail={video.thumbnail} title={video.title} />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 flex-grow">
          {truncateDescription(video.description)}
        </p>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <FaCalendarAlt className="w-3 h-3" />
          <span>{formatDate(video.publishedAt)}</span>
        </div>

        <div className="mt-auto pt-4">
          <a
            href={`https://youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all duration-200 gap-2 w-full hover:opacity-90"
          >
            <FaYoutube className="w-5 h-5" />
            <span>Watch on YouTube</span>
          </a>
        </div>
      </div>
    </div>
  );
};

const VideoSection = () => {
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
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Latest Videos</h2>
            <Link 
              href="/videos"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">Latest Videos</h2>
          <div className="flex items-center gap-4">
            <a
              href="https://www.youtube.com/@aiiwisdom"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2"
            >
              <FaYoutube className="w-5 h-5" />
              <span>Subscribe</span>
            </a>
            <Link 
              href="/videos"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              View All
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <FaYoutube className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-blue-800 text-sm font-medium">YouTube Integration Setup Required</p>
                <p className="text-blue-700 text-sm mt-1">{error}</p>
                <a
                  href="https://www.youtube.com/@aiiwisdom"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm mt-2 font-medium"
                >
                  <span>Visit YouTube Channel</span>
                  <FaExternalLinkAlt className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
        
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.slice(0, 6).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : !loading && !error && (
          <div className="text-center py-12">
            <FaYoutube className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Videos Available</h3>
            <p className="text-muted-foreground mb-6">
              Check back later for new videos from my YouTube channel.
            </p>
            <a
              href="https://www.youtube.com/@aiiwisdom"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
            >
              <FaYoutube className="w-5 h-5" />
              <span>Visit YouTube Channel</span>
              <FaExternalLinkAlt className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoSection;
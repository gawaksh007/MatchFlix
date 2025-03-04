import React, { useState, useRef, useEffect } from "react";

// Assuming this constant is defined elsewhere or needs to be defined
const AMBIENT_TRACKS = [
  { mood: "default", url: "/audio/default-ambient.mp3", title: "Default Mood" },
  { mood: "default", url: "/audio/default-ambient2.mp3", title: "Default Alternative" },
  { mood: "date", url: "/audio/date-ambient.mp3", title: "Date Night" },
  { mood: "date", url: "/audio/date-ambient2.mp3", title: "Romantic Evening" },
];

interface AmbientMusicProps {
  mood?: "default" | "date";
}

export function AmbientMusic({ mood = "default" }: AmbientMusicProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3; // Set initial volume
    }
  }, []);

  useEffect(() => {
    // When mood changes, switch to an appropriate track
    const moodTracks = AMBIENT_TRACKS.filter(track => track.mood === mood);
    if (moodTracks.length > 0) {
      const randomTrack = Math.floor(Math.random() * moodTracks.length);
      setCurrentTrack(AMBIENT_TRACKS.indexOf(moodTracks[randomTrack]));
    }
  }, [mood]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changeTrack = () => {
    const moodTracks = AMBIENT_TRACKS.filter(track => track.mood === mood);
    const nextTrack = moodTracks[(moodTracks.indexOf(AMBIENT_TRACKS[currentTrack]) + 1) % moodTracks.length];
    setCurrentTrack(AMBIENT_TRACKS.indexOf(nextTrack));
    if (isPlaying && audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="ambient-music-player">
      <audio
        ref={audioRef}
        src={AMBIENT_TRACKS[currentTrack]?.url}
        onEnded={changeTrack}
      />
      <div className="controls">
        <button onClick={togglePlay}>
          {isPlaying ? "Pause" : "Play"} Music
        </button>
        <button onClick={changeTrack}>Next Track</button>
        <div className="track-info">
          Now Playing: {AMBIENT_TRACKS[currentTrack]?.title || "Unknown Track"}
        </div>
      </div>
    </div>
  );
}
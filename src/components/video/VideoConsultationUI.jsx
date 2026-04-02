import React, { useState, useEffect, useRef } from 'react';
import { Video, Phone, PhoneOff, Loader2 } from 'lucide-react';

export default function VideoConsultationUI({ roomId, onEnd }) {
  const [connected, setConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const initVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setConnected(true);
        setLoading(false);
      } catch (error) {
        console.error('Video initialization error:', error);
        setLoading(false);
      }
    };

    initVideo();
  }, []);

  const toggleMute = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getAudioTracks();
      tracks.forEach(track => (track.enabled = !track.enabled));
      setIsMuted(!isMuted);
    }
  };

  const handleEndCall = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    onEnd?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-900 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
      {/* Remote video (large) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Local video (pip) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg border-2 border-white"
      />

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-colors ${
            isMuted
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Phone className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
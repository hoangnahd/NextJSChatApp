"use client"
import React, { useEffect, useRef } from 'react';
import { IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

interface RemoteVideoTrackProps {
  track: IRemoteVideoTrack;
}

const RemoteVideoTrack: React.FC<RemoteVideoTrackProps> = ({ track }) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      try {
        track.play(videoRef.current);
      } catch (error) {
        console.error('Error playing the remote video track:', error);
      }
    }

    return () => {
      try {
        track.stop();
      } catch (error) {
        console.error('Error stopping the remote video track:', error);
      }
    };
  }, [track]);

  return <div ref={videoRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default RemoteVideoTrack;

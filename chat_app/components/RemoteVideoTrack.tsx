import React, { useEffect, useRef } from 'react';
import { IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

interface RemoteVideoTrackProps {
  track: IRemoteVideoTrack;
}

const RemoteVideoTrack: React.FC<RemoteVideoTrackProps> = ({ track }) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      track.play(videoRef.current);
    }

    return () => {
      track.stop();
    };
  }, [track]);

  return <div ref={videoRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default RemoteVideoTrack;

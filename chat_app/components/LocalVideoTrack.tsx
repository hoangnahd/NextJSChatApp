import React, { useEffect, useRef } from 'react';
import { ILocalVideoTrack } from 'agora-rtc-sdk-ng';

interface LocalVideoTrackProps {
  track: ILocalVideoTrack;
}

const LocalVideoTrack: React.FC<LocalVideoTrackProps> = ({ track }) => {
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

export default LocalVideoTrack;

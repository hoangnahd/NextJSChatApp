import React, { useEffect } from 'react';
import { ILocalAudioTrack } from 'agora-rtc-sdk-ng';

interface LocalAudioTrackProps {
  track: ILocalAudioTrack;
}

const LocalAudioTrack: React.FC<LocalAudioTrackProps> = ({ track }) => {
  useEffect(() => {
    track.play();

    return () => {
      track.stop();
    };
  }, [track]);

  return null; // This component doesn't render any visible elements, only plays audio
};

export default LocalAudioTrack;

import React, { useEffect } from 'react';
import { IRemoteAudioTrack } from 'agora-rtc-sdk-ng';

interface RemoteAudioTrackProps {
  track: IRemoteAudioTrack;
}

const RemoteAudioTrack: React.FC<RemoteAudioTrackProps> = ({ track }) => {
  useEffect(() => {
    track.play();

    return () => {
      track.stop();
    };
  }, [track]);

  return null; // This component doesn't render any visible elements, only plays audio
};

export default RemoteAudioTrack;

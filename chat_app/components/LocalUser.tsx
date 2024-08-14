import React, { useState } from 'react';
import { ILocalVideoTrack, ILocalAudioTrack } from 'agora-rtc-sdk-ng';
import LocalVideoTrack from './LocalVideoTrack';
import LocalAudioTrack from './LocalAudioTrack';

interface LocalUserProps {
  videoTrack: ILocalVideoTrack | null;
  audioTrack: ILocalAudioTrack | null;
  minimized?: boolean; // Add a prop to handle minimized state
  onClick?: () => void; // Callback for when the user clicks to toggle size
}

const LocalUser: React.FC<LocalUserProps> = ({ videoTrack, audioTrack, minimized = false, onClick }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      cursor: 'pointer'
    }} onClick={onClick}>
      {videoTrack && <LocalVideoTrack track={videoTrack} />}
      {audioTrack && <LocalAudioTrack track={audioTrack} />}
    </div>
  );
};

export default LocalUser;

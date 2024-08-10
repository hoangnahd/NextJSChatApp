import React from 'react';
import { ILocalVideoTrack, ILocalAudioTrack } from 'agora-rtc-sdk-ng';
import LocalVideoTrack from './LocalVideoTrack';
import LocalAudioTrack from './LocalAudioTrack';

interface LocalUserProps {
  videoTrack: ILocalVideoTrack;
  audioTrack: ILocalAudioTrack;
}

const LocalUser: React.FC<LocalUserProps> = ({ audioTrack }) => {
  return (
    <div>
      {/* <LocalVideoTrack track={videoTrack} /> */}
      <LocalAudioTrack track={audioTrack} />
    </div>
  );
};

export default LocalUser;

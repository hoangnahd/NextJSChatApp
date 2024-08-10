import React, { useEffect, useRef } from 'react';
import { IRemoteAudioTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';

interface RemoteUserProps {
  audioTrack: IRemoteAudioTrack;
  videoTrack: IRemoteVideoTrack;
  audioDeviceId?: string; // Optional audio device ID
}

const RemoteUser: React.FC<RemoteUserProps> = ({ audioTrack, audioDeviceId }) => {
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current) {
    //   videoTrack.play(videoRef.current);
    }

    if (audioDeviceId) {
      audioTrack.setPlaybackDevice(audioDeviceId).then(() => {
        audioTrack.play();
      });
    } else {
      audioTrack.play();
    }

    return () => {
    //   videoTrack.stop();
      audioTrack.stop();
    };
  }, [audioTrack, audioDeviceId]);

  return <div ref={videoRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default RemoteUser;

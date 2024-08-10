"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Avatar } from './Avatar';
import { Call, Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material';
import AgoraRTC, { IAgoraRTCRemoteUser, ILocalAudioTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng';
import LocalUser from './LocalUser';
import RemoteUser from './RemoteUser';

function Calls({ appId, chat, currentUserId }) {
  const other = chat?.members[0]?._id == currentUserId 
                ? chat?.members[1] : chat?.members[0];
  const lastMessage = chat?.messages?.[chat?.messages.length - 1];
  const [elapsedTime, setElapsedTime] = useState(0);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const channelName = lastMessage?.audioCall?.randomString;
  appId = "6d5e386fdeff4bafad4927bbb15d5b10";
  const [uid, setUid] = useState<number | string | null>(null);
  const [localTracks, setLocalTracks] = useState<[ILocalAudioTrack | null, ILocalVideoTrack | null] | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<{ [key: string]: IAgoraRTCRemoteUser }>({});
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef(AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));

  const joinLocalStream = async () => {
    try {
      const client = clientRef.current;
      const UID = await client.join(appId, channelName, null, null);
      setUid(UID);
  
      let microphoneTrack: ILocalAudioTrack | undefined;
      let cameraTrack: ILocalVideoTrack | undefined;
  
      // Try creating microphone track
      try {
        microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();
      } catch (err) {
        console.warn("Microphone not available:", err);
      }
  
      // Try creating camera track
      try {
        cameraTrack = await AgoraRTC.createCameraVideoTrack();
      } catch (err) {
        console.warn("Camera not available:", err);
      }
  
      if (microphoneTrack && cameraTrack) {
        setLocalTracks([microphoneTrack, cameraTrack]);
        
        if (videoContainerRef.current) {
          cameraTrack.play(videoContainerRef.current);
        }
  
        await client.publish([microphoneTrack, cameraTrack]);
      } else if (microphoneTrack) {
        setLocalTracks([microphoneTrack, null]);
        await client.publish([microphoneTrack]);
      } else if (cameraTrack) {
        setLocalTracks([null, cameraTrack]);
        
        if (videoContainerRef.current) {
          cameraTrack.play(videoContainerRef.current);
        }
  
        await client.publish([cameraTrack]);
      } else {
        throw new Error("Neither camera nor microphone is available.");
      }
    } catch (error) {
      console.error("Error joining local stream:", error);
      alert("An error occurred. Please check your devices and try again.");
    }
  };
  
  const leaveAndRemoveLocalStream = async () => {
    if (localTracks) {
      localTracks.forEach(track => {
        if (track) {
          track.stop();
          track.close();
        }
      });
    }

    const client = clientRef.current;
    await client.leave();
    setLocalTracks(null);
    setUid(null);
  };

  const handleUserJoined = async (user: IAgoraRTCRemoteUser, mediaType: 'video' | 'audio') => {
    const client = clientRef.current;
    await client.subscribe(user, mediaType);

    setRemoteUsers(prevUsers => ({ ...prevUsers, [user.uid]: user }));
  };

  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    setRemoteUsers(prevUsers => {
      const updatedUsers = { ...prevUsers };
      delete updatedUsers[user.uid];
      return updatedUsers;
    });
  };

  const toggleMic = async () => {
    if (localTracks && localTracks[0]) {
      const isMuted = localTracks[0].muted;
      await localTracks[0].setMuted(!isMuted);
      setMicOn(!isMuted);
    }
  };

  const toggleCamera = async () => {
    if (localTracks && localTracks[1]) {
      const isMuted = localTracks[1].muted;
      await localTracks[1].setMuted(!isMuted);
      setCameraOn(!isMuted);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours < 10 ? '0' : ''}${hours}:${
        minutes < 10 ? '0' : ''
      }${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    } else {
      return `${minutes < 10 ? '0' : ''}${minutes}:${
        remainingSeconds < 10 ? '0' : ''
      }${remainingSeconds}`;
    }
  };

  const handleCall = async (status: string) => {
    if (!status) {
      console.log("Nothing to send");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('chatId', chat?._id);
      formData.append('currentUserId', currentUserId);
      formData.append('isCalling', "false");
      formData.append("response", status);
      formData.append("messageId", lastMessage._id.toString());
      await fetch("/api/call", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error('Error handling call response:', error);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prevTime => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const client = clientRef.current;
    
    if (lastMessage.audioCall.response === 'accept') {
      client.on('user-published', handleUserJoined);
      client.on('user-unpublished', handleUserLeft);
      joinLocalStream();
    } else if (lastMessage.audioCall.response === 'end') {
      leaveAndRemoveLocalStream();
    }

    return () => {
      leaveAndRemoveLocalStream();
      client.off('user-published', handleUserJoined);
      client.off('user-unpublished', handleUserLeft);
    };
  }, [lastMessage.audioCall.response]);

  return (
    <div>
      {lastMessage.audioCall.response !== "accept" ? (
        <div className="flex flex-col items-center justify-center mt-10 text-white">
          <Avatar user={other} />
          
          <div className="flex flex-row gap-5">
            {currentUserId !== lastMessage?.sender?._id && (
              <button
                onClick={() => handleCall("accept")}
                className="bg-green-500 text-white p-4 rounded-full shadow-md hover:bg-green-300 focus:outline-none"
              >
                Accept
              </button>
            )}
            <button
              onClick={() => handleCall("cancel")}
              className="bg-red-500 text-white p-4 rounded-full shadow-md hover:bg-red-300 focus:outline-none"
            >
              {currentUserId !== lastMessage?.sender?._id ? "Reject" : "Cancel"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-10 text-white gap-5">
          {cameraOn ? (
            <div className="flex flex-row">
              {localTracks && localTracks[1] && <div ref={videoContainerRef} />}
              {Object.values(remoteUsers).map(user =>
                user.audioTrack ? (
                  <RemoteUser
                    key={user.uid}
                    audioTrack={user.audioTrack}
                  />
                ) : null
              )}
            </div>
          ) : (
            <>
              <Avatar user={other} />
              <div className="text-lg">
                {formatTime(elapsedTime)}
              </div>
            </>
          )}
          <div className="flex flex-row gap-5">
            <button
              onClick={() => {
                setCameraOn(!cameraOn);
                toggleCamera();
              }}
              className="bg-white text-white p-4 rounded-full shadow-md hover:bg-neutral-300 focus:outline-none"
            >
              {cameraOn ? <Videocam sx={{ color: "black" }} /> : <VideocamOff sx={{ color: "black" }} />}
            </button>
            <button
              onClick={() => {
                setMicOn(!micOn);
                toggleMic();
              }}
              className="bg-white text-white p-4 rounded-full shadow-md hover:bg-neutral-300 focus:outline-none"
            >
              {micOn ? <Mic sx={{ color: "black" }} /> : <MicOff sx={{ color: "black" }} />}
            </button>
            <button
              onClick={() => {
                leaveAndRemoveLocalStream();
                handleCall("end");
              }}
              className="bg-red-500 text-white p-4 rounded-full shadow-md hover:bg-red-300 focus:outline-none"
            >
              <Call />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Calls;

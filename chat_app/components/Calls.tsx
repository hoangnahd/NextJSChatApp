"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Avatar } from './Avatar';
import { Call, CallEnd, Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material';
import AgoraRTC, { IAgoraRTCRemoteUser, ILocalAudioTrack, ILocalVideoTrack, IRemoteAudioTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import LocalUser from './LocalUser';
import RemoteAudioTrack from './RemoteAudioTrack';
import RemoteVideoTrack from './RemoteVideoTrack';
interface CallProps {
  appId: any;
  chat: any;
  currentUserId: any;
}
function Calls({ appId, chat, currentUserId }: CallProps) {
  const other = chat?.members[0]?._id == currentUserId 
                ? chat?.members[1] : chat?.members[0];
  let lastMessage = null;

  if (chat && Array.isArray(chat.messages) && chat.messages.length > 0) {
      // Iterate in reverse to find the last message with an audioCall
      for (let i = chat.messages.length - 1; i >= 0; i--) {
          const message = chat.messages[i];
          if (message.audioCall) {
            lastMessage = message;
              break; // Stop as soon as we find the last message with an audioCall
          }
      }
  }
  
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const channelName = lastMessage?.audioCall?._id.toString();
  appId = "6d5e386fdeff4bafad4927bbb15d5b10";
  const [uid, setUid] = useState<number | string | null>(null);
  const [localTracks, setLocalTracks] = useState<[ILocalAudioTrack | null, ILocalVideoTrack | null] | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<[IRemoteAudioTrack | null, IRemoteVideoTrack | null] | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef(AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localVideoMinimized, setLocalVideoMinimized] = useState(true); // New state to toggle the local video size
  const [elapsedTime, setElapsedTime] = useState(0);
  
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

      if (localTracks && !localTracks[1]) {
        setCameraOn(false);
      }
      else if(localTracks && localTracks[1]) {
        const isEnabled = localTracks[1].enabled;
        setCameraOn(isEnabled);
      }
      if(localTracks)
        setMicOn(localTracks[0]?.muted ? false : true)
    } catch (error) {
      console.error("Error joining local stream:", error);
      alert("An error occurred. Please check your devices and try again.");
    }
  };
  
  const updateRemoteUsers = () => {
    if (!remoteUsers || !localTracks) return;
  
    const updatedUsers = { ...remoteUsers };
  
    for (const uid in updatedUsers) {
      const user = updatedUsers[uid] as any;
      
      // Update video track based on local track state
      if (localTracks[1] === null || !localTracks[1].enabled) {
        user.videoTrack = null;
      } else {
        user.videoTrack = localTracks[1];
      }
  
      // Update audio track based on local track state
      user.audioTrack = !localTracks[0]?.muted ? localTracks[0] : null;
    }
  
    setRemoteUsers(updatedUsers);
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
    setRemoteUsers((prevUsers: any) => {
      const updatedUsers = { ...prevUsers };
      const existingUser = updatedUsers[user.uid] || { audioTrack: null, videoTrack: null };
      const updatedUser = {
        audioTrack: mediaType === 'audio' ? user.audioTrack : existingUser.audioTrack,
        videoTrack: mediaType === 'video' ? user.videoTrack : existingUser.videoTrack,
      };

      return {
        ...prevUsers,
        [user.uid]: updatedUser,
      };
    });
  };
  
  const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
    setRemoteUsers((prevUsers: any) => {
      const updatedUsers = { ...prevUsers };
      delete updatedUsers[user.uid];
      return updatedUsers;
    });
  };
  const toggleMic = async () => {
    if (localTracks && localTracks[0]) {
      const isMuted = localTracks[0].muted;
      await localTracks[0].setMuted(!isMuted);
      setMicOn(isMuted);
    }
  };
  
  
  const toggleCamera = async () => {
    if (localTracks && localTracks[1]) {
      const isEnabled = !localTracks[1].enabled;
      await localTracks[1].setEnabled(isEnabled);
      setCameraOn(isEnabled);
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
    if(lastMessage.audioCall.response === 'accept') {
      const interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lastMessage.audioCall.response]);
  

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
  console.log(lastMessage.audioCall.response)
  useEffect(() => {
    // Call updateRemoteUsers when localTracks changes (i.e., when toggling camera or mic)
    updateRemoteUsers();
  }, [localTracks]);
  return (
    <div className='h-full w-full'>
      {lastMessage.audioCall.response !== "accept" ? (
        <div className="flex flex-col -mt-10 gap-10 items-center justify-center h-full text-white">
          <div className="mb-6 gap-4 p-4 bg-white bg-opacity-10 rounded-lg shadow-lg"> {/* Spacing below the avatar */}
            <Avatar user={other} />
          </div>
          
          <div className="flex flex-row gap-6"> {/* Increased gap for better spacing */}
            {currentUserId !== lastMessage?.sender?._id && (
              <button
                onClick={() => handleCall("accept")}
                className="bg-green-500 text-white py-3 px-6 rounded-full shadow-md hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 transform transition-transform duration-150 ease-in-out hover:scale-105"
              >
                <Call sx={{ color: "white" }} />
              </button>
            )}
            <button
              onClick={() => handleCall("cancel")}
              className="bg-red-500 text-white py-3 px-6 rounded-full shadow-md hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 transform transition-transform duration-150 ease-in-out hover:scale-105"
            >
              <CallEnd sx={{color:"white"}} />
            </button>
          </div>
        </div>
      
      ) : (
        <div className="flex flex-col items-center justify-between py-24 text-white gap-10 h-full bg-gradient-to-r ">
          <div className='flex flex-row items-center justify-center gap-1 p-2 w-full h-full'>
            <div className="flex flex-row gap-4 bg-white bg-opacity-10 rounded-lg shadow-lg w-full h-full">
              {remoteUsers && Object.values(remoteUsers).length > 0 ? (
                Object.values(remoteUsers).map((user: any, index) =>
                  user ? (
                    <div key={index} className="flex flex-col gap-5 items-center justify-center bg-white bg-opacity-20 p-1 rounded-xl shadow-lg w-full">
                      {user.audioTrack && <RemoteAudioTrack track={user.audioTrack} />}
                      {user.videoTrack ? (
                        <RemoteVideoTrack track={user.videoTrack} />
                      ) : (
                        <>
                          <Avatar user={other} />
                          <div className="text-sm font-semibold text-white">
                            {formatTime(elapsedTime)}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div key={index} className="flex flex-col items-center justify-center text-white w-full h-full">
                      User data is unavailable.
                    </div>
                  )
                )
              ) : (
                <div className="flex items-center justify-center text-white w-full h-full">
                  No users available.
                </div>
              )}
            </div>

        
            {
              !localVideoMinimized && localTracks && cameraOn &&
              <div className="w-full h-full">
                <LocalUser
                  audioTrack={localTracks[0]}
                  videoTrack={localTracks[1]}
                  minimized={localVideoMinimized}
                  onClick={() =>
                    setLocalVideoMinimized((prevState) => !prevState)
                  }
                />
                
              </div>
            }
          </div>
          {
            localVideoMinimized && localTracks && cameraOn &&
            <div className="fixed bottom-5 right-5 bg-white bg-opacity-10 rounded-lg shadow-lg w-40 h-40 transform transition-transform duration-300 cursor-pointer hover:scale-105"
                onClick={() => setLocalVideoMinimized(false)}>
              <LocalUser
                audioTrack={localTracks[0]}
                videoTrack={localTracks[1]}
                minimized={localVideoMinimized}
              />
            </div>
          }
        <div className="flex flex-row gap-5 mb-5">
          <button
            onClick={() => {
              toggleCamera();
            }}
            className="bg-white p-4 rounded-full shadow-lg hover:bg-neutral-300 focus:outline-none transition-all duration-300"
          >
            {cameraOn ? <Videocam sx={{ color: "black" }} /> : <VideocamOff sx={{ color: "black" }} />}
          </button>
          <button
            onClick={() => {
              toggleMic();
            }}
            className="bg-white p-4 rounded-full shadow-lg hover:bg-neutral-300 focus:outline-none transition-all duration-300"
          >
            {micOn? <Mic sx={{ color: "black" }} /> : <MicOff sx={{ color: "black" }} />}
          </button>
          <button
            onClick={() => {
              leaveAndRemoveLocalStream();
              handleCall("end");
            }}
            className="bg-red-500 p-4 rounded-full shadow-lg hover:bg-red-400 focus:outline-none transition-all duration-300"
          >
            <Call sx={{ color: "white" }} />
          </button>
        </div>
        </div>

      )}
    </div>
  );
}

export default Calls;

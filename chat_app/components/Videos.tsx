import React, { useState, useEffect } from 'react';
import {
    LocalVideoTrack,
    RemoteUser,
    useJoin,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteAudioTracks,
    useRemoteUsers
} from "agora-rtc-react";
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Avatar } from './Avatar';
import { useSession } from 'next-auth/react';
import { Call, Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material';

export default function Videos(props: { channelName: string; AppID: string; chat }) {
    const { data: session } = useSession();
    const user = session?.user;
    const { AppID, channelName, chat } = props;

    const { isLoading: isLoadingMic, localMicrophoneTrack } = useLocalMicrophoneTrack();
    const [currentLocalCameraTrack, setCurrentLocalCameraTrack] = useState<AgoraRTC.ICameraVideoTrack | null>(null);
    const [currentLocalMicrophoneTrack, setCurrentLocalMicrophoneTrack] = useState<AgoraRTC.IAudioTrack | null>(null);
    const remoteUsers = useRemoteUsers();
    const { audioTracks } = useRemoteAudioTracks(remoteUsers);
    const [cameraOn, setCameraOn] = useState(true);
    const [microphoneOn, setMicrophoneOn] = useState(true);
    const [loading, setLoading] = useState(true);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callRejected, setCallRejected] = useState(false);
    

    useEffect(() => {
        setLoading(true);
        if (user) {
            setLoading(false);
        }
    }, [user]);

    usePublish([localMicrophoneTrack, currentLocalCameraTrack, currentLocalMicrophoneTrack]);
    useJoin({
        appid: AppID,
        channel: channelName,
        token: null,
    });

    useEffect(() => {
        if (audioTracks) {
            audioTracks.map((track) => track.play());
        }
    }, [audioTracks]);

    useEffect(() => {
        const handleCamera = async () => {
            if (cameraOn) {
                if (!currentLocalCameraTrack) {
                    try {
                        const newTrack = await AgoraRTC.createCameraVideoTrack();
                        setCurrentLocalCameraTrack(newTrack);
                    } catch (error) {
                        console.error('Error creating camera track:', error);
                    }
                }
            } else {
                if (currentLocalCameraTrack) {
                    currentLocalCameraTrack.stop();
                    setCurrentLocalCameraTrack(null);
                }
            }
        };

        handleCamera();
    }, [cameraOn]);

    useEffect(() => {
        const handleMicrophone = async () => {
            if (microphoneOn) {
                if (!currentLocalMicrophoneTrack) {
                    try {
                        const newTrack = await AgoraRTC.createMicrophoneAudioTrack();
                        setCurrentLocalMicrophoneTrack(newTrack);
                    } catch (error) {
                        console.error('Error creating microphone track:', error);
                    }
                }
            } else {
                if (currentLocalMicrophoneTrack) {
                    currentLocalMicrophoneTrack.stop();
                    setCurrentLocalMicrophoneTrack(null);
                }
            }
        };

        handleMicrophone();
    }, [microphoneOn]);

    const handleCameraToggle = () => {
        setCameraOn(!cameraOn);
    };

    const handleMicrophoneToggle = () => {
        setMicrophoneOn(!microphoneOn);
    };

    const handleAcceptCall = async () => {
        setCallAccepted(true);
        setCallRejected(false);
        try {
            const formData = new FormData();
            formData.append('chatId', chat?._id);
            formData.append('currentUserId', user?._id);
            formData.append('isCalling', "false");
            formData.append("isReponse", "true")

            await fetch("/api/call", {
                method: "POST",
                body: formData,
            });
        } catch (error) {
            console.error('Error handling reject call response:', error);
        }
    };

    const handleRejectCall = async () => {
        setCallAccepted(false);
        setCallRejected(true);
        try {
            const formData = new FormData();
            formData.append('chatId', chat?._id);
            formData.append('currentUserId', user?._id);
            formData.append('isCalling', "false");
            formData.append("isReponse", "false")

            await fetch("/api/call", {
                method: "POST",
                body: formData,
            });
        } catch (error) {
            console.error('Error handling reject call response:', error);
        }
        window.close();
    };

    const handleNoResponse = async () => {
        if (!callAccepted && !callRejected) {
            try {
                const formData = new FormData();
                formData.append('chatId', chat?._id);
                formData.append('currentUserId', user?._id);
                formData.append('isCalling', "false");
                formData.append("isReponse", "false")
    
                await fetch("/api/call", {
                    method: "POST",
                    body: formData,
                });
            } catch (error) {
                console.error('Error handling reject call response:', error);
            }
            window.close();
        }
    };

    useEffect(() => {
        const timer = setTimeout(handleNoResponse, 20000); // 20 seconds
        return () => clearTimeout(timer);
    }, [callAccepted, callRejected]);

    return loading ? (
        <div className="flex justify-center -mt-16 items-center h-full">
            <div className="loader"></div>
        </div>
    ) : (
        <div className="flex flex-col items-center w-full h-screen p-4 gap-4">
            {!callAccepted && !callRejected && (
                <div className="flex flex-col items-center">
                    <h1>Incoming Call</h1>
                    <button onClick={handleAcceptCall} className="bg-green-500 text-white p-4 rounded-full shadow-md hover:bg-green-300 focus:outline-none">
                        Accept
                    </button>
                    <button onClick={handleRejectCall} className="bg-red-500 text-white p-4 rounded-full shadow-md hover:bg-red-300 focus:outline-none">
                        Reject
                    </button>
                </div>
            )}
            {callAccepted && (
                <div className="flex flex-row justify-between w-full h-full p-2 gap-2">
                    {cameraOn ? (
                        currentLocalCameraTrack && (
                            <LocalVideoTrack
                                track={currentLocalCameraTrack}
                                play={true}
                                className="w-full h-full"
                                id="local-video"
                            />
                        )
                    ) : (
                        <Avatar user={user} />
                    )}
                    {remoteUsers.map((remoteUser) => {
                        const videoTrack = remoteUser.videoTrack;
                        return (
                            <div key={remoteUser.uid} className="w-full h-full">
                                {videoTrack ? (
                                    <video
                                        className="w-full h-full"
                                        ref={(video) => {
                                            if (video && videoTrack.track) {
                                                videoTrack.track.play(video);
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                    />
                                ) : (
                                    <Avatar user={remoteUser} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            <div className='flex flex-row gap-2'>
                <button onClick={handleCameraToggle} className="bg-white text-white p-4 rounded-full shadow-md hover:bg-neutral-300 focus:outline-none">
                    {cameraOn ? <Videocam sx={{ color: "black" }} /> : <VideocamOff sx={{ color: "black" }} />}
                </button>
                <button onClick={handleMicrophoneToggle} className="bg-white text-white p-4 rounded-full shadow-md hover:bg-neutral-300 focus:outline-none">
                    {microphoneOn ? <Mic sx={{ color: "black" }} /> : <MicOff sx={{ color: "black" }} />}
                </button>
                <button className="bg-red-500 text-white p-4 rounded-full shadow-md hover:bg-red-300 focus:outline-none" onClick={() => window.close()}>
                    <Call sx={{ color: "white" }} />
                </button>
            </div>
        </div>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';

const AudioRecorderComponent = ({ onStop }) => {
    const [isRecord, setIsRecord] = useState(true);
    const [isAudioVisible, setIsAudioVisible] = useState(false); // State to control audio display
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [error, setError] = useState(null);
    const audioRef = useRef(null);

    const recorderControls = useVoiceVisualizer();

    // Automatically handle recording completion
    useEffect(() => {
        if (recorderControls.recordedBlob) {
            setRecordedBlob(recorderControls.recordedBlob);
            setIsAudioVisible(true); // Show the audio when recordedBlob is available
            handleStop(); // Automatically handle stop logic
        }
    }, [recorderControls.recordedBlob]);

    useEffect(() => {
        if (recorderControls.error) {
            setError(recorderControls.error);
        }
    }, [recorderControls.error]);

    const handleStop = async () => {
        setIsRecord(false);

        if (recordedBlob) {
            // Convert Blob to Base64
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result.split(',')[1];
                
                // Notify parent component that recording is done
                if (onStop) {
                    onStop(base64String);
                }
            };
            reader.readAsDataURL(recordedBlob);
        }
    };

    return (
        <VoiceVisualizer controls={recorderControls} ref={audioRef} />
    );
};

export default AudioRecorderComponent;

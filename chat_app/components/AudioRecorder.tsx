"use client";
import React, { useState, useEffect } from 'react';
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';


const AudioRecorder = ({ onStop }) => {
    const [error, setError] = useState(null);
    
    const recorderControls = useVoiceVisualizer();

    // Automatically handle recording completion
    useEffect(() => {
        if (recorderControls.recordedBlob) {

            handleStop(); // Automatically handle stop logic
        }
    }, [recorderControls.recordedBlob]);

    useEffect(() => {
        if (recorderControls.error) {
            setError(recorderControls.error);
        }
    }, [recorderControls.error]);

    const handleStop = async () => {
        if (recorderControls.recordedBlob) {
            try {
                // Notify parent component that recording is done
                if (onStop) {
                    onStop(recorderControls.recordedBlob);
                }
            } catch (err) {
                setError(err.message);
            }
        }
    };

    return (
        <div>
            <VoiceVisualizer controls={recorderControls} />
            {error && <p>{error}</p>}
        </div>
    );
};

export default AudioRecorder;
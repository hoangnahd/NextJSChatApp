"use client";
import React, { useEffect } from 'react';
import { useVoiceVisualizer, VoiceVisualizer } from 'react-voice-visualizer';


const AudioRecorder = ({ onStop }:{onStop:any}) => {

    const recorderControls = useVoiceVisualizer();

    // Automatically handle recording completion
    useEffect(() => {
        if (recorderControls.recordedBlob) {
            handleStop(); // Automatically handle stop logic
        }
        else
            onStop(null);
    }, [recorderControls.recordedBlob]);


    const handleStop = async () => {
        if (recorderControls.recordedBlob) {
            try {
                // Notify parent component that recording is done
                if (onStop) {
                    onStop(recorderControls.recordedBlob);
                }
            } catch (err) {
                console.log(err)
            }
        }
    };

    return (
        <div>
            <VoiceVisualizer controls={recorderControls} />
        </div>
    );
};

export default AudioRecorder;
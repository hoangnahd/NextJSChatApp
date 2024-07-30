import { Stop } from '@mui/icons-material';
import { useState } from 'react';
import { Recorder } from 'react-audio-voice-recorder';

export const AudioRecorderComponent = () => {

  const addAudioElement = (blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    document.body.appendChild(audio);
  };

  return (
    <div className="absolute inset-y-0 right-6 flex items-center cursor-pointer w-10 h-6 mt-4">
      <Recorder
          record={true}
          title={"New recording"}
          audioURL={this.state.audioDetails.url}
          showUIAudio
          handleAudioStop={(data) => this.handleAudioStop(data)}
          handleAudioUpload={(data) => this.handleAudioUpload(data)}
          handleRest={() => this.handleRest()}
        />
    </div>
  );
};

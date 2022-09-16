import React from "react";
import ReactDOM from "react-dom";
// import { KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";
import InteractiveDemo from "./InteractiveDemo";

import "./styles.css";
import { PopUpWrapper } from "./Popup";

import GoogleSignIn from "./GoogleSignIn"

// webkitAudioContext fallback needed to support Safari
const audioContext = new (window.AudioContext || window.AudioContext)();
const soundfontHostname = "https://d1pzp51pvbm36p.cloudfront.net";

// const noteRange = {
//   first: MidiNumbers.fromNote("c3"),
//   last: MidiNumbers.fromNote("f4"),
// };

function App() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#071108",
      }}
    >
      <GoogleSignIn />
      <PopUpWrapper />
      <InteractiveDemo
        audioContext={audioContext}
        soundfontHostname={soundfontHostname}
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

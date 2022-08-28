import React from "react";
import ReactDOM from "react-dom";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";

import DimensionsProvider from "./DimensionsProvider";
import SoundfontProvider from "./SoundfontProvider";
import "./styles.css";

// webkitAudioContext fallback needed to support Safari
const audioContext = new (window.AudioContext || window.AudioContext)();
const soundfontHostname = "https://d1pzp51pvbm36p.cloudfront.net";

const noteRange = {
  first: MidiNumbers.fromNote("c3"),
  last: MidiNumbers.fromNote("f4"),
};
const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: noteRange.first,
  lastNote: noteRange.last,
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

function App() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffc2c2",
      }}
    >
      <h1>AI Jam [WIP]</h1>

      <div className="mt-5">
        <p>Use your keyboard to play the piano!</p>
        <ResponsivePiano className="PianoDarkTheme" />
      </div>
    </div>
  );
}

// function BasicPiano() {
//   return (
//     <SoundfontProvider
//       instrumentName="acoustic_grand_piano"
//       audioContext={audioContext}
//       hostname={soundfontHostname}
//       render={({ isLoading, playNote, stopNote }) => (
//         <Piano
//           noteRange={noteRange}
//           width={300}
//           playNote={playNote}
//           stopNote={stopNote}
//           disabled={isLoading}
//           keyboardShortcuts={keyboardShortcuts}
//         />
//       )}
//     />
//   );
// }

function ResponsivePiano(props) {
  return (
    <DimensionsProvider>
      {({ containerWidth, containerHeight }) => (
        <SoundfontProvider
          instrumentName="acoustic_grand_piano"
          audioContext={audioContext}
          hostname={soundfontHostname}
          render={({ isLoading, playNote, stopNote }) => (
            <Piano
              noteRange={noteRange}
              width={containerWidth}
              playNote={playNote}
              stopNote={stopNote}
              disabled={isLoading}
              keyboardShortcuts={keyboardShortcuts}
              {...props}
            />
          )}
        />
      )}
    </DimensionsProvider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

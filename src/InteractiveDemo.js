import React from "react";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";

import DimensionsProvider from "./DimensionsProvider";
import InstrumentListProvider from "./InstrumentListProvider";
import SoundfontProvider from "./SoundfontProvider";
import PianoConfig from "./PianoConfig";

class InteractiveDemo extends React.Component {
  state = {
    config: {
      instrumentName: "acoustic_grand_piano",
      noteRange: {
        first: MidiNumbers.fromNote("c3"),
        last: MidiNumbers.fromNote("f5"),
      },
      keyboardShortcutOffset: 0,
    },
  };

  render() {
    const keyboardShortcuts = KeyboardShortcuts.create({
      firstNote:
        this.state.config.noteRange.first +
        this.state.config.keyboardShortcutOffset,
      lastNote:
        this.state.config.noteRange.last +
        this.state.config.keyboardShortcutOffset,
      keyboardConfig: KeyboardShortcuts.HOME_ROW,
    });

    return (
      <SoundfontProvider
        audioContext={this.props.audioContext}
        instrumentName={this.state.config.instrumentName}
        hostname={this.props.soundfontHostname}
        render={({ isLoading, playNote, stopNote, stopAllNotes }) => (
          <div>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
              <div className="col-lg-8 offset-lg-2">
                {" "}
                Use the left and right arrow keys to adjust the range of the
                keyboard
                <InstrumentListProvider
                  hostname={this.props.soundfontHostname}
                  render={(instrumentList) => (
                    <PianoConfig
                      config={this.state.config}
                      setConfig={(config) => {
                        this.setState({
                          config: Object.assign({}, this.state.config, config),
                        });
                        stopAllNotes();
                      }}
                      instrumentList={
                        instrumentList || [this.state.config.instrumentName]
                      }
                      keyboardShortcuts={keyboardShortcuts}
                    />
                  )}
                />
              </div>
              <DimensionsProvider>
                {({ containerWidth }) => (
                  <Piano
                    noteRange={this.state.config.noteRange}
                    keyboardShortcuts={keyboardShortcuts}
                    playNote={playNote}
                    stopNote={stopNote}
                    disabled={isLoading}
                    width={containerWidth}
                  />
                )}
              </DimensionsProvider>
            </div>
            <div className="row mt-5"></div>
          </div>
        )}
      />
    );
  }
}

export default InteractiveDemo;
var AI_ACTIVE = false;
var OCTAVE_OFFSET = 0;
var RECORDING = false;
/*************************
 * Consts for everyone!
 ************************/
// button mappings.
const MAPPING_8 = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
};
const MAPPING_4 = { 0: 0, 1: 2, 2: 5, 3: 7 };
const BUTTONS_DEVICE = ["a", "s", "d", "f", "j", "k", "l", ";"];
const BUTTONS_MAKEY = [
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
  "w",
  "a",
  "s",
  "d",
];
const BUTTONS_MAKEY_DISPLAY = ["↑", "←", "↓", "→", "w", "a", "s", "d"];

let OCTAVES = 7;
let NUM_BUTTONS = 8;
let BUTTON_MAPPING = MAPPING_8;

let keyWhitelist;
let TEMPERATURE = getTemperature();

const heldButtonToVisualData = new Map();

// Which notes the pedal is sustaining.
let sustaining = false;
let sustainingNotes = [];

// Mousedown/up events are weird because you can mouse down in one element and mouse up
// in another, so you're going to lose that original element and never mouse it up.
let mouseDownButton = null;

const player = new Player();
const replayer = new mm.Player();
const genie = new mm.PianoGenie(CONSTANTS.GENIE_CHECKPOINT);
const recorder = new mm.Recorder();
const painter = new FloatyNotes();
const piano = new Piano();
var session = {};
let isUsingMakey = false;
initEverything();

/*************************
 * Basic UI bits
 ************************/
function initEverything() {
  genie.initialize().then(() => {
    console.log("🧞‍♀️ ready!");
    playBtn.textContent = "Play";
    playBtn.removeAttribute("disabled");
    playBtn.classList.remove("loading");
  });

  // Start the drawing loop.
  onWindowResize();
  updateButtonText();
  window.requestAnimationFrame(() => painter.drawLoop());

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("orientationchange", onWindowResize);
  window.addEventListener("hashchange", () => (TEMPERATURE = getTemperature()));
}

function updateNumButtons(num) {
  NUM_BUTTONS = num;
  const buttons = document.querySelectorAll(".controls > button.color");
  BUTTON_MAPPING = num === 4 ? MAPPING_4 : MAPPING_8;

  // Hide the extra buttons.
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].hidden = i >= num;
  }
}

function showMainScreen() {
  document.querySelector(".splash").hidden = true;
  document.querySelector(".loaded").hidden = false;

  document.addEventListener("keydown", onKeyDown);

  controls.addEventListener("touchstart", (event) => doTouchStart(event), {
    passive: true,
  });
  controls.addEventListener("touchend", (event) => doTouchEnd(event), {
    passive: true,
  });

  const hasTouchEvents = "ontouchstart" in window;
  if (!hasTouchEvents) {
    controls.addEventListener("mousedown", (event) => doTouchStart(event));
    controls.addEventListener("mouseup", (event) => doTouchEnd(event));
  }

  controls.addEventListener("mouseover", (event) => doTouchMove(event, true));
  controls.addEventListener("mouseout", (event) => doTouchMove(event, false));
  controls.addEventListener("touchenter", (event) => doTouchMove(event, true));
  controls.addEventListener("touchleave", (event) => doTouchMove(event, false));
  canvas.addEventListener("mouseenter", () => (mouseDownButton = null));

  // Output.
  radioMidiOutYes.addEventListener("click", () => {
    player.usingMidiOut = true;
    midiOutBox.hidden = false;
  });
  radioAudioYes.addEventListener("click", () => {
    player.usingMidiOut = false;
    midiOutBox.hidden = true;
  });
  // Input.
  radioMidiInYes.addEventListener("click", () => {
    player.usingMidiIn = true;
    midiInBox.hidden = false;
    isUsingMakey = false;
    updateButtonText();
  });
  radioDeviceYes.addEventListener("click", () => {
    player.usingMidiIn = false;
    midiInBox.hidden = true;
    isUsingMakey = false;
    updateButtonText();
  });
  radioMakeyYes.addEventListener("click", () => {
    player.usingMidiIn = false;
    midiInBox.hidden = true;
    isUsingMakey = true;
    updateButtonText();
  });

  // Figure out if WebMidi works.
  if (navigator.requestMIDIAccess) {
    midiNotSupported.hidden = true;
    radioMidiInYes.parentElement.removeAttribute("disabled");
    radioMidiOutYes.parentElement.removeAttribute("disabled");
    navigator.requestMIDIAccess().then(
      (midi) => player.midiReady(midi),
      (err) => console.log("Something went wrong", err)
    );
  } else {
    midiNotSupported.hidden = false;
    radioMidiInYes.parentElement.setAttribute("disabled", true);
    radioMidiOutYes.parentElement.setAttribute("disabled", true);
  }

  document.addEventListener("keyup", onKeyUp);

  // Slow to start up, so do a fake prediction to warm up the model.
  const note = genie.nextFromKeyWhitelist(0, keyWhitelist, TEMPERATURE);
  genie.resetState();
}

// Here touch means either touch or mouse.
function doTouchStart(event) {
  event.preventDefault();
  mouseDownButton = event.target;
  buttonDown(event.target.dataset.id, true);
}
function doTouchEnd(event) {
  event.preventDefault();
  if (mouseDownButton && mouseDownButton !== event.target) {
    buttonUp(mouseDownButton.dataset.id);
  }
  mouseDownButton = null;
  buttonUp(event.target.dataset.id);
}
function doTouchMove(event, down) {
  // If we're already holding a button down, start holding this one too.
  if (!mouseDownButton) return;

  if (down) buttonDown(event.target.dataset.id, true);
  else buttonUp(event.target.dataset.id, true);
}

/*************************
 * Button actions
 ************************/
function buttonDown(button, fromKeyDown) {
  // If we're already holding this button down, nothing new to do.
  if (heldButtonToVisualData.has(button)) {
    return;
  }

  const el = document.getElementById(`btn${button}`);
  if (!el) return;
  el.setAttribute("active", true);
  if (button == "8") {
    octaveDown();
    return;
  } else if (button == "9") {
    octaveUp();
    return;
  }
  const note = AI_ACTIVE
    ? genie.nextFromKeyWhitelist(
        BUTTON_MAPPING[button],
        keyWhitelist,
        TEMPERATURE
      )
    : BUTTON_MAPPING[button];

  // const note = BUTTON_MAPPING[button];

  const pitch = AI_ACTIVE
    ? CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE + note
    : CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE + OCTAVE_OFFSET * 6 + note;

  let idx;
  if (RECORDING) {
    const startTime = session.startTime;
    idx = session.notes.length;

    session.notes.push({
      pitch: pitch,
      startTime: Date.now() - startTime,
    });
  }
  // Hear it.
  player.playNoteDown(pitch, button);
  noteToDraw = AI_ACTIVE ? note : note + OCTAVE_OFFSET * 6;

  // See it.
  const rect = piano.highlightNote(noteToDraw, button);

  if (!rect) {
    debugger;
  }
  // Float it.
  const noteToPaint = painter.addNote(
    button,
    rect.getAttribute("x"),
    rect.getAttribute("width")
  );
  heldButtonToVisualData.set(button, {
    rect: rect,
    note: note,
    noteToPaint: noteToPaint,
    idx: RECORDING ? idx : null,
  });
}

function buttonUp(button) {
  const el = document.getElementById(`btn${button}`);
  if (!el) return;
  el.removeAttribute("active");

  // find the note that was just released
  const thing = heldButtonToVisualData.get(button);
  if (RECORDING) {
    const startTime = session.startTime;
    if (thing.idx > -1) {
      const now = Date.now();
      if (!thing.idx) {
        thing.idx = 0;
      }
      const endTime = now - startTime;
      session.notes[thing.idx].endTime = endTime;
    }
  }
  if (thing) {
    // Don't see it.
    piano.clearNote(thing.rect);

    // Stop holding it down.
    painter.stopNote(thing.noteToPaint);

    // Maybe stop hearing it.
    const pitch = CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE + thing.note;
    if (!sustaining) {
      player.playNoteUp(pitch, button);
    } else {
      sustainingNotes.push(CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE + thing.note);
    }
  }
  heldButtonToVisualData.delete(button);
}

/*************************
 * Events
 ************************/
function onKeyDown(event) {
  // Keydown fires continuously and we don't want that.
  if (event.repeat) {
    return;
  }
  if (event.key === " ") {
    // sustain pedal
    sustaining = true;
  } else if (event.key === "0" || event.key === "r") {
    console.log("🧞‍♀️ resetting!");
    genie.resetState();
  } else {
    const button = getButtonFromKeyCode(event.key);
    if (button != null) {
      buttonDown(button, true);
    }
  }
}

function onKeyUp(event) {
  if (event.key === " ") {
    // sustain pedal
    sustaining = false;

    // Release everything.
    sustainingNotes.forEach((note) => player.playNoteUp(note, -1));
    sustainingNotes = [];
  } else {
    const button = getButtonFromKeyCode(event.key);
    if (button != null) {
      buttonUp(button);
    }
  }
}

function onWindowResize() {
  OCTAVES = window.innerWidth > 700 ? 7 : 3;
  const bonusNotes = OCTAVES > 6 ? 4 : 0; // starts on an A, ends on a C.
  const totalNotes = CONSTANTS.NOTES_PER_OCTAVE * OCTAVES + bonusNotes;
  const totalWhiteNotes =
    CONSTANTS.WHITE_NOTES_PER_OCTAVE * OCTAVES + (bonusNotes - 1);
  keyWhitelist = Array(totalNotes)
    .fill()
    .map((x, i) => {
      if (OCTAVES > 6) return i;
      // Starting 3 semitones up on small screens (on a C), and a whole octave up.
      return i + 3 + CONSTANTS.NOTES_PER_OCTAVE;
    });

  piano.resize(totalWhiteNotes);
  painter.resize(piano.config.whiteNoteHeight);
  piano.draw();
}

/*************************
 * Utils and helpers
 ************************/
function getButtonFromKeyCode(key) {
  // 1 - 8
  if (key >= "1" && key <= String(NUM_BUTTONS)) {
    return parseInt(key) - 1;
  }

  const index = isUsingMakey
    ? BUTTONS_MAKEY.indexOf(key)
    : BUTTONS_DEVICE.indexOf(key);
  return index !== -1 ? index : null;
}

function getTemperature() {
  const hash = parseFloat(parseHashParameters()["temperature"]) || 0.25;
  const newTemp = Math.min(1, hash);
  console.log("🧞‍♀️ temperature = ", newTemp);
  return newTemp;
}

function parseHashParameters() {
  const hash = window.location.hash.substring(1);
  const params = {};
  hash.split("&").map((hk) => {
    let temp = hk.split("=");
    params[temp[0]] = temp[1];
  });
  return params;
}

function updateButtonText() {
  const btns = document.querySelectorAll(".controls button.color");
  for (let i = 0; i < 8; i++) {
    btns[i].innerHTML = isUsingMakey
      ? `<span>${BUTTONS_MAKEY_DISPLAY[i]}</span>`
      : `<span>${i + 1}</span><br><span>${BUTTONS_DEVICE[i]}</span>`;
  }
}

function octaveUp() {
  if (OCTAVES * 2 == OCTAVE_OFFSET) return;
  OCTAVE_OFFSET += 1;
  onWindowResize();
}

function octaveDown() {
  if (0 == OCTAVE_OFFSET) return;
  OCTAVE_OFFSET -= 1;
  onWindowResize();
}

function toggleAi() {
  AI_ACTIVE = !AI_ACTIVE;
  document.getElementById("ai").innerHTML = AI_ACTIVE
    ? `<span>AI: ON</span>`
    : `<span>AI: OFF</span>`;
  // change colour of button
  if (AI_ACTIVE) {
    document.getElementById("ai").style.backgroundColor = "#00ff00";
  } else {
    document.getElementById("ai").style.backgroundColor = "#ff0000";
  }
}

async function toggleRecording() {
  session.startTime = Date.now();
  if (RECORDING) {
    // convert to seconds
    session.notes.map((a) => {
      a.endTime = a.endTime / 1000;
      a.startTime = a.startTime / 1000;
      return a;
    });
    // get the total time elapßed in seconds
    session.totalTime =
      session.notes[session.notes.length - 1].endTime -
      session.notes[0].startTime;

    delete session.startTime;

    replayer.start(session);
    // post the session to the server
    try {
      await postData("/api/session", session);
    } catch (err) {
      console.log(err);
    }

    const data = await response.json();
    console.log(data);
  } else if (!RECORDING) {
    // start writing to session object
    session.notes = [];
    session.userId = "test";
    session.startTime = Date.now();
  }

  RECORDING = !RECORDING;
}

async function postData(url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "same-origin", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}
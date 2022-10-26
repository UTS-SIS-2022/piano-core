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
let SETTINGS_OPEN = false;

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
const genie = new mm.PianoGenie(CONSTANTS.GENIE_CHECKPOINT);
const painter = new FloatyNotes();
const piano = new Piano();
var session = {};
let isUsingMakey = false;
initEverything();

function toggleSettings() {
  SETTINGS_OPEN = !SETTINGS_OPEN;
  return;
}

function onInstrumentSelect() {
  player.changeInstrument();
}

// Check authentication status
// First thing since much of the UI is determined by its result

async function adjustLogInStatus() {
  const response = await fetch("/api/authenticated", {
    method: "GET",
  });
  const res = await response.json();

  console.log(response.status);

  if (response.status === 200) {
    const username = res.username;

    document.querySelectorAll(".username").forEach((element) => {
      element.innerText = ` ${username}`;
    });

    document.getElementById("logOutBtn").style.display = "block";
    document.getElementById("logInBtn").style.display = "none";
    document.getElementById("recording-switch").style.display = "block";
    document.getElementById("signUpBtn").style.display = "none";
    return username;
  } else {
    document.getElementById("signUpBtn").style.display = "block";
    document.getElementById("logOutBtn").style.display = "none";
    document.getElementById("logInBtn").style.display = "block";
    document.getElementById("recording-switch").style.display = "none";
  }
}

async function initialMethod() {
  const status = await adjustLogInStatus();
  if (status) {
    console.log(status);
    console.log("working");
    document.getElementById("infotext").innerHTML = "Press R to Record";
  }
}

initialMethod();

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
  document.querySelector("settingsBox");

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
  // Add event listener on keypress
  document.addEventListener("keypress", (event) => {
    if (event.key === "=") {
      octaveUp();
    }
    if (event.key === "-") {
      octaveDown();
    }
    if (event.key == "r") {
      toggleRecording();
      console.log("recording");
    }
  });

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
    : CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE + OCTAVE_OFFSET * 12 + note;

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
  noteToDraw = AI_ACTIVE ? note : note + OCTAVE_OFFSET * 12;

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
  if (SETTINGS_OPEN) {
    return;
  }

  // Keydown fires continuously and we don't want that.
  if (event.repeat) {
    return;
  }
  if (event.key === " ") {
    // sustain pedal
    sustaining = true;
  } else if (event.key === "0" || event.key === "y") {
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
  if (OCTAVES == OCTAVE_OFFSET + 1) return;
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
}

async function toggleRecording() {
  player.stop();
  session.startTime = Date.now();
  if (RECORDING) {
    document.querySelector("#record-button").removeAttribute("checked");
    document.querySelector("#infotext").style.color = "gray";
    document.querySelector("#infotext").innerHTML = "Press R to record";
    if (session.notes.length == 0) {
      RECORDING = !RECORDING;
      alert("You didn't record anything!");
      return;
    }

    session.name = prompt("Name your song!");

    session.notes.map((a) => {
      a.endTime = a.endTime / 1000;
      a.startTime = a.startTime / 1000;
      return a;
    });
    // get the total time elapsed in seconds
    session.totalTime =
      session.notes[session.notes.length - 1].endTime -
      session.notes[0].startTime;

    delete session.startTime;

    // post the session to the server
    try {
      session.notes.length != 0
        ? await postDataToAPI("/api/session", session)
        : null;
    } catch (err) {
      console.log(err);
    }
  } else if (!RECORDING) {
    document.querySelector("#record-button").setAttribute("checked", "");
    // start writing to session object
    console.log("press r to stop recording");
    document.querySelector("#infotext").style.color = "red";
    document.querySelector("#infotext").innerHTML = "Recording...";
    let timestamp = new Date();
    session.timestamp = timestamp;
    session.notes = [];
    const username = await adjustLogInStatus();
    session.username = username;
    session.startTime = Date.now();
  }
  RECORDING = !RECORDING;
}

adjustLogInStatus();
async function postDataToAPI(url = "", data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data), // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects/
}

function logIn() {
  const logInUsername = document.getElementById("logInUsername").value;
  const logInPassword = document.getElementById("logInPassword").value;

  postDataToAPI("/api/login", {
    user: {
      username: logInUsername,
      password: logInPassword,
    },
  })
    .then((data) => {
      if (data.success) {
        console.log("logged in");
        document.getElementById("logInUsername").value = "";
        document.getElementById("logInPassword").value = "";
        document.querySelector("#infotext").innerHTML = "Press R to record";
        document.getElementById("signUpBtn").style.display = "none";
        alert(data.message);
        document.getElementById("logOutBtn").style.display = "block";
        document.getElementById("logInBtn").style.display = "none";
        document.getElementById("loginModal").style.display = "none";
        document.getElementById("recording-switch").style.display = "block";
        adjustLogInStatus();
        // grabSessionUser();
      } else {
        alert(data.message);
        console.log("login failed");
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

async function logOut() {
  const response = await fetch("/api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: "",
  });
  const res = response.json();

  res.then((data) => {
    if (response.status === 200) {
      document.getElementById("signUpBtn").style.display = "block";
      document.getElementById("logOutBtn").style.display = "none";
      document.getElementById("logInBtn").style.display = "block";
      document.getElementById("signUpBtn").style.display = "block";
      document.getElementById("recording-switch").style.display = "none";
      document.querySelector("#infotext").innerHTML = "";
    }
    console.log(data.message);
    alert(data.message);
  });
}

function signUp() {
  const signUpUsername = document.getElementById("signUpUsername").value;
  const signUpPassword = document.getElementById("signUpPassword").value;
  console.log("you have clicked me");

  postDataToAPI("/api/signup", {
    user: {
      username: signUpUsername,
      password: signUpPassword,
    },
  }).then((data) => {
    if (data.success) {
      console.log("sign up success");
      // document.getElementById("signUpBtn").style.display = "none";
      // document.getElementById("logOut").style.display = "block";
      document.getElementById("signUpUsername").value = "";
      document.getElementById("signUpPassword").value = "";
      alert(" Created account for " + signUpUsername);
    } else {
      alert("Sign up failed." + `${data.message}`);
    }
  });
}

/* Log in Modal Form  */
// Get the modal
var logInModal = document.getElementById("loginModal");

// Get the button that opens the modal
var logInBtn = document.getElementById("logInBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("_close")[0];

// When the user clicks on the button, open the modal
logInBtn.onclick = function () {
  logInModal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  logInModal.style.display = "none";
};

/* Sign Up Modal Form */
// Get the modal
var signUpModal = document.getElementById("signUpModal");

// Get the button that opens the modal
var signUpBtn = document.getElementById("signUpBtn");

// Get the <span> element that closes the modal
var signUpSpan = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
signUpBtn.onclick = function () {
  signUpModal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
signUpSpan.onclick = function () {
  signUpModal.style.display = "none";
};

function hidePassword() {
  var x = document.getElementById("logInPassword");
  var y = document.getElementById("signUpPassword");

  if (x.type === "password" || y.type === "password") {
    x.type = "text";
    y.type = "text";
  } else {
    x.type = "password";
    y.type = "password";
  }
}

/* Retriving User Sessions */

async function grabSessionUser() {
  const response = await fetch("/api/authenticated", {
    method: "GET",
  });

  console.log(response.status);

  if (response.status === 200) {
    await retrieveUserSession();
    openSessionWindow();
  } else {
    alert("You must be logged in to view your sessions");
  }
}

/* Opens Sessions Window */

function openSessionWindow() {
  // console.log("window is open");

  /* Session Modal */
  // Get the modal
  var sessionModal = document.getElementById("sessionModal");
  // Get the button that opens the modal
  var sessionBtn = document.getElementById("recordedSessionsBtn");
  // Get the <span> element that closes the modal
  // When the user clicks on the button, open the modal
  sessionBtn.onclick = function () {
    grabSessionUser();
    sessionModal.style.display = "block";
  };
}

async function retrieveUserSession() {
  const response = await fetch(`/api/session`, {
    method: "GET",
  });
  const res = await response.json();
  const session = document.getElementById("sessionGrid");

  console.log(session);

  session.innerHTML = res
    .map(
      (session) =>
        `
    <div class="session">
    <h2><span>${session._id.substring(0, 8)}...</span></h2>
    <h3>Total Time ${Math.round(session.totalTime * 100) / 100}s</h3>
    <button class="viewButton">Download Session</button>
    </div>`
    )
    .join("");

  console.log(res);
  return res;
}

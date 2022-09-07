import React from "react";
function LandingPopup() {
  return (
    <div class="header">
      <div className="container">
        <div className="text-sm-center text-white py-5">
          <h1>AI Jam</h1>
          <p>
            An interactive piano keyboard for React. Supports custom sounds,
            <br className="d-none d-sm-block" /> touch/click/keyboard events,
            and fully configurable styling.
          </p>
          <div className="mt-4">
            <a
              className="btn btn-outline-light btn-lg"
              href="https://github.com/UTS-SIS-2022/piano-core"
            >
              View docs on Github
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
// const LandingPopup = () => {
//   //state variables for the Modal State
//   const [btnState, setBtnState] = useState(false);

//   //toggle the Modal Display State
//   const handleBtnClick = (e) => {
//     setBtnState((prev) => !prev);
//   };

//   return (
//     <StyledCustomPopUp id="grand-parent">
//       <StyledLabel>Click the button to open the Custom PopUp</StyledLabel>
//       <StyledButton>
//         <button className="btn" onClick={(e) => handleBtnClick(e)}>
//           Click
//         </button>
//       </StyledButton>
//       <StyledPopUpBackdrop
//         id="backdrop-parent"
//         className={btnState ? "show-modal" : ""}
//       >
//         <StyledPopUp id="popup">
//           <StyledCloseIcon onClick={(e) => handleBtnClick(e)}></StyledCloseIcon>
//           I am a Modal !!
//         </StyledPopUp>
//       </StyledPopUpBackdrop>
//     </StyledCustomPopUp>
//   );
// };

export default LandingPopup;

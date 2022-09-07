import React, { Component } from "react";
export default class PopUp extends Component {
  handleClick = () => {
   this.props.toggle();
  };
render() {
  return (
   <div className="modal">
     <div className="modal_content">
     <span className="close" onClick={this.handleClick}>&times;    </span>
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
                  <div className="bg-yellow mt-5 py-5">
      <div className="container">
        <div className="text-center text-secondary">
          Made by{" "}
          <a className="text-secondary" href="https://github.com/michael-nau">
            <strong>@michael-nau, </strong>
          </a>
          <a className="text-secondary" href="https://github.com/DaGev">
            <strong>@DaGev, </strong>
          </a>
        </div>
      </div>
    </div>
          </div>
          <div className="text-center">
              <p className="">
                Try it by clicking, tapping, or using your keyboard:
              </p>
              <div style={{ color: "#777" }}></div>
            </div>
   </div>
  );
 }
}

export class PopUpWrapper extends React.Component {
  state = {
   seen: false
   };
  togglePop = () => {
   this.setState({
    seen: !this.state.seen
   });
  };
render() {
  return (
   <div>
    <div className="btn" onClick={this.togglePop}>
      <button>About</button>
    </div>
    {this.state.seen ? <PopUp toggle={this.togglePop} /> : null}
   </div>
  );
 }
}
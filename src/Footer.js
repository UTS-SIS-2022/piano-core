import React from "react";

function Footer(props) {
  return (
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
  );
}

export default Footer;

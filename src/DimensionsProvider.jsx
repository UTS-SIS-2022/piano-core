import React from "react";
// @ts-ignore
import Dimensions from "react-dimensions";

// not sure how typing works with react
class DimensionsProvider extends React.Component {
  render() {
    return (
      <div>
        {this.props.children({
          containerWidth: this.props.containerWidth,
          containerHeight: this.props.containerHeight,
        })}
      </div>
    );
  }
}

export default Dimensions()(DimensionsProvider);

import React from "react";

const Notification = (props) => {
  if (!props.message) {
    return null;
  }

  const notifyStyle = {
    color: "red",
    border: "solid",
  };

  return <div style={notifyStyle}>{props.message}</div>;
};

export default Notification;

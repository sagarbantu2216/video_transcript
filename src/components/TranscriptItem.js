import React from "react";

const TranscriptItem = ({ speakerName, spokenText }) => {
  return (
    <div className="transcript-item">
      <strong>{speakerName}:</strong> {spokenText}
    </div>
  );
};

export default TranscriptItem;

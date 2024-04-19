import React from 'react';

const VideoViewer = ({ videoUrl }) => {
  return (
    <>
      <video
        src={videoUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        controls
        controlsList="nodownload"
        oncontextmenu="return false;"
        style={{ width: '100%', height: '500px' }}
      ></video>
    </>
  );
};

export default VideoViewer;
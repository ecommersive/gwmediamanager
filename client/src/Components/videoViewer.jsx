import React from 'react';

const VideoViewer = ({ currentViewUrl, isVideo }) => {
  
  return (
    <>
      {
        isVideo ?
          <video
            src={currentViewUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            controls
            controlsList="nodownload"
            autoPlay
            style={{ width: '100%', height: '500px' }}
          /> :
          <img src={currentViewUrl} style={{ width: '100%', height: '500px' }} alt="Content" />
      }
    </>
  );
};

export default VideoViewer;

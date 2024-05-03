import React from 'react';
import '../styles/headerbuttons.css'
const HeaderButtons = ({ currentData, isAdmin, handleModal, setMode, setCatData, handleLogout}) => {
  return (
    <div>
      {(currentData === 'Playlist' || currentData === 'Ads' || currentData === 'Archived') ? (
        isAdmin && (
          <>
            <button className="action-button" onClick={() => { handleModal(true); setMode('configureData'); setCatData('addData'); }}>Add Data</button>
            <button className="action-button" onClick={() => { handleModal(true); setMode('configureData'); setCatData('ExtendExpiry'); }}>Extend Expiry Data</button>
            <button className="action-button" onClick={() => { handleModal(true); setMode('configureData'); setCatData('DeleteData'); }}>Delete Data</button>
          </>
        )
      ) : (
        (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') && isAdmin && (
          <button className="action-button" onClick={() => { handleModal(true); setMode('configureData'); setCatData(currentData === 'Playlist Schedule' ? 'playlistSchedule' : 'adsSchedule'); }}>
            {currentData === 'Playlist Schedule' ? 'Configure Playlist Schedule' : 'Configure Ads Schedule'}
          </button>
        )
      )}
      <button className="action-button" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default HeaderButtons;

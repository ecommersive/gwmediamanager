import React from 'react';
import '../styles/headerbuttons.css'

const HeaderButtons = ({ currentData, isAdmin, handleModal, setMode, setCatData, handleLogout, data, setShowModal, setfolderViewNum, setScheduleEditMode, scheduleEditMode}) => {
  
  return (
    <div>
      {(currentData === 'Playlist' || currentData === 'Ads') ? (
        <> 
         {isAdmin && <> <button className="action-button" onClick={() => { handleModal(true); setMode('configureData'); setCatData('addData'); }}>Add Data</button>
          <button className="action-button" onClick={() => { handleModal(true); setMode('configureData'); setCatData('ExtendExpiry'); }}>Extend Expiry Data</button>
          <button className="action-button" onClick={() => { handleModal(true); setMode('configureData'); setCatData('DeleteData'); }}>Delete Data</button>
          {/* <button className="action-button" onClick={() => { handleModal(true); setMode('configureData'); setCatData('userData'); }}>Users</button> */}
          </>}
        </>
      ) : (
        (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') && (
          <>
            { isAdmin && (
              <>
                {(scheduleEditMode === 'off' || scheduleEditMode === '') && <>
                  <button className="action-button" onClick={() => { handleModal(true); setMode('configureData'); setCatData(currentData === 'Playlist Schedule' ? 'playlistSchedule' : 'adsSchedule'); }}>
                    {currentData === 'Playlist Schedule' ? 'Configure Content Schedule' : 'Configure Ads Schedule'}
                  </button>
                  <button className="action-button" onClick={()=>{handleModal(true); setMode('configureData'); setCatData('deleteScheduleData');}}>Delete {currentData}</button>
                </>}
                {scheduleEditMode === 'on' && 
                <>
                  <button className="action-button" onClick={() => { setShowModal(true); setMode('configureData'); setCatData('alterTable'); setfolderViewNum(data.folder) }}>Alter {currentData === 'Playlist Schedule' ? 'Content ' : 'Ads '} Schedule</button>
                </>}
              </>
              )
            }
            {scheduleEditMode === 'on' && <button onClick={() => {setScheduleEditMode('off')}} className="action-button">Go Back</button>}
          </>
        )
        
      )}
      <button className="action-button" onClick={() => { handleModal(true); setMode('configureData'); setCatData('requests'); }}>Requests</button>
      <button className="action-button" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default HeaderButtons;

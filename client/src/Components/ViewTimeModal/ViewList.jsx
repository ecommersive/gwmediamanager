import React from 'react';
import SearchInput from '../SearchInput';

const ViewList = ({ currentData, catData, data, modalSearchTerm, setModalSearchTerm, modalFilteredData, itemExists, state, setState, deleteItemFromSchedule, moveItemPlaylistSchedule, handleAddItem, fetchData, formatDate, formatTime, isEditingDuration, isEditingTime, setNewStartDate, setNewEndDate, setNewStartTime, setNewEndTime, handleSave, newStartDate, newEndDate, setIsEditingDuration, newStartTime, newEndTime, setIsEditingTime}) => {

  return (
    <>
      {((currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') && (catData === 'viewTimes' || catData === 'alterTable')) && (
        <>
          <h1>{currentData === 'Playlist Schedule' ? 'Playlist Schedule' : 'Ads Schedule'}</h1>
          {state === 'Add' && (
            <>
              <SearchInput searchTerm={modalSearchTerm} setSearchTerm={setModalSearchTerm} />
              <br />
              {modalSearchTerm.length > 0 ? (
                modalFilteredData.length > 0 ? (
                  
                  modalFilteredData.filter(modalItem => !itemExists(modalItem.FileName)).map((modalItem, index) => (
                    <div key={index}>
                      <span>{modalItem.FileName}</span>
                      <button onClick={() => {handleAddItem(modalItem, modalItem._id)}}>Add</button>                    
                    </div>
                  ))
                ) : (
                  <p>No data found. Please search for data.</p>
                )
              ) : (
                <p>No data found. Please search for data.</p>
              )}
            </>
          )}
          {data && (
            <div>
              {state === '' && (catData === 'viewTimes' || catData === 'alterTable') && (
                <>
                <div>
                  {isEditingDuration ? (
                    <div>
                      <input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} />
                      <input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} />
                      <button onClick={() => handleSave('duration')}>Done</button>
                    </div>
                  ) : (
                    <div style={{display: 'flex', gap: '1rem'}}>
                      <p>{currentData === 'Playlist Schedule' ? `Duration of Playlist ${data.folder}` : `Duration of Ads ${data.folder}`}: {formatDate(data.startDate)} - {formatDate(data.endDate)}</p>
                      <button onClick={() => setIsEditingDuration(true)}>Change</button>
                    </div>
                  )}
                </div>
          
                <div>
                  {isEditingTime ? (
                    <div>
                      <input type="time" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} />
                      <input type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} />
                      <button onClick={() => handleSave('time')}>Done</button>
                    </div>
                  ) : (
                    <div style={{display: 'flex', gap: '1rem'}}>
                      <p>{currentData === 'Playlist Schedule' ? `Times Playlist ${data.folder}` : `Times Ads ${data.folder}`} being played: {formatTime(data.startTime)} - {formatTime(data.endTime)}</p>
                      <button onClick={() => setIsEditingTime(true)}>Change</button>
                    </div>
                  )}
                </div>
              </>
              )}
              {state === '' && catData === 'alterTable' && (
                <>
                  <h1>Alter {currentData === 'Playlist Schedule' ? ` Playlist ${data.folder}` : ` Ads ${data.folder}`}</h1>
                  <div style={{ display: 'flex', margin: '0 10px' }}>
                    <button className='action-button' style={{ margin: '0 10px' }} onClick={() => setState('Add')}>Add</button>
                    <button className='action-button' style={{ margin: '0 10px' }} onClick={() => setState('Delete')}>Delete</button>
                    <button className='action-button' style={{ margin: '0 10px' }} onClick={() => setState('Move')}>Move</button>
                  </div>
                </>
              )}
              {data.items && (
                <div>
                  <h2>Items</h2>
                  <ul>
                    {data.items.map((item, index) => (
                      <li key={index}>
                        {item.FileName}
                        {state === 'Delete' && (
                          <button className='action-button' onClick={() => deleteItemFromSchedule(item)}>Delete</button>
                          
                        )}
                        {state === 'Move' && (
                          <>
                            {index !== 0 && <button className='action-button' onClick={() => moveItemPlaylistSchedule(item, 'up')}>Up</button>}
                            {index !== data.items.length - 1 && <button className='action-button' onClick={() => moveItemPlaylistSchedule(item, 'down')}>Down</button>}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(state === 'Add' || state === 'Delete' || state === 'Move') && (
                <button className='action-button' onClick={() => {setState('');  setModalSearchTerm(''); fetchData()}}>Exit</button>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ViewList;

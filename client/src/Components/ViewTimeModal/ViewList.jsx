import React from 'react';
import SearchInput from '../SearchInput';

const ViewList = ({ currentData, catData, data, modalSearchTerm, setModalSearchTerm, modalFilteredData, itemExists, modalState, setModalState, deleteItemFromSchedule, moveItemPlaylistSchedule, handleAddItem, fetchData, formatDate, formatTime, isEditingDuration, isEditingTime, setNewStartDate, setNewEndDate, setNewStartTime, setNewEndTime, handleSave, newStartDate, newEndDate, setIsEditingDuration, newStartTime, newEndTime, setIsEditingTime, isAdmin, saveEditedTimes, handleTimeChange, editedTimes}) => {

  return (
    <>
      {((currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') && (catData === 'viewTimes' || catData === 'alterTable')) && (
        <>
          <h1>{currentData === 'Playlist Schedule' ? 'Playlist Schedule' : 'Ads Schedule'}</h1>
          {modalState === 'Add' && (
            <>
              <SearchInput searchTerm={modalSearchTerm} setSearchTerm={setModalSearchTerm} />
              <br />
              {modalSearchTerm.length > 0 ? (
                modalFilteredData.length > 0 ? (
                  modalFilteredData.filter(modalItem => !itemExists(modalItem.FileName)).map((modalItem, index) => (
                    <div key={index}>
                      <span>{modalItem.FileName}</span>
                      <button onClick={() => { handleAddItem(modalItem, modalItem._id) }}>Add</button>
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
              {isEditingDuration ? (
                <div>
                  <input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} />
                  <input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} />
                  {isAdmin && catData === 'alterTable' && modalState === '' && <button onClick={() => handleSave('duration')}>Done</button>}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {catData === 'alterTable' && modalState === '' && <p>{currentData === 'Playlist Schedule' ? `Duration of Playlist ${data.folder}` : `Duration of Ads ${data.folder}`}: {formatDate(data.startDate)} - {formatDate(data.endDate)}</p>}
                  {isAdmin && catData === 'alterTable' && modalState === '' && <button onClick={() => setIsEditingDuration(true)}>Change</button>}
                </div>
              )}
              {isEditingTime ? (
                <div>
                  <input type="time" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} />
                  <input type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} />
                  {isAdmin && catData === 'alterTable' && modalState === '' && <button onClick={() => handleSave('time')}>Done</button>}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {catData === 'alterTable' && modalState === '' && <p>{currentData === 'Playlist Schedule' ? `Times Playlist ${data.folder}` : `Times Ads ${data.folder}`} being played: {formatTime(data.startTime)} - {formatTime(data.endTime)}</p>}
                  {isAdmin && catData === 'alterTable' && modalState === '' && <button onClick={() => setIsEditingTime(true)}>Change</button>}
                </div>
              )}
              {catData === 'alterTable' && modalState === '' && (
                <div style={{ display: 'flex', margin: '0 10px' }}>
                  <button className='action-button' style={{ margin: '0 10px' }} onClick={() => setModalState('Add')}>Add</button>
                  <button className='action-button' style={{ margin: '0 10px' }} onClick={() => setModalState('Delete')}>Delete</button>
                  <button className='action-button' style={{ margin: '0 10px' }} onClick={() => setModalState('Move')}>Move</button>
                  <button className='action-button' style={{ margin: '0 10px' }} onClick={() => setModalState('alterTimes')}>Alter Times</button>
                </div>
              )}

              {data.items && (
                <div>
                  <h2>Ordered Schedule</h2>
                  <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                    {data.items.map((item, index) => (
                      <li key={index}>
                        <p>{index + 1}. {item.FileName}</p>
                        {modalState === 'Delete' && (
                          <button className='action-button' onClick={() => deleteItemFromSchedule(item)}>Delete</button>
                        )}
                        {modalState === 'Move' && (
                          <>
                            {index !== 0 && <button className='action-button' onClick={() => moveItemPlaylistSchedule(item, 'up')}>Up</button>}
                            {index !== data.items.length - 1 && <button className='action-button' onClick={() => moveItemPlaylistSchedule(item, 'down')}>Down</button>}
                          </>
                        )}
                        {modalState === 'alterTimes' && (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem' }}>
                              <p>Start Time: </p>
                              <input 
                                type="time" 
                                value={editedTimes[index]?.startTime || item.startTime}
                                onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                            />
                              <p>End Time: </p>
                              <input
                                type="time"
                                value={editedTimes[index]?.endTime || item.endTime}
                                onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                              />
                              <button onClick={() => saveEditedTimes(index)}>Save</button>
                            </div>
                            <br />
                          </>
                        )}
                        {modalState === '' && item.startTime && item.endTime && (
                          <>
                            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem' }}>
                              <p>Start Time: {formatTime(item.startTime)}</p>
                              <p>End Time: {formatTime(item.endTime)}</p>
                            </div>
                            <br />
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(modalState === 'Add' || modalState === 'Delete' || modalState === 'Move' || modalState === 'alterTimes') && (
                <button className='action-button' onClick={() => { setModalState(''); setModalSearchTerm(''); fetchData() }}>Exit</button>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ViewList;

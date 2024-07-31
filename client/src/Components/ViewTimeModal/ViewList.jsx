import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableItem from '../DraggableItem';
import SearchInput from '../SearchInput';

const ViewList = ({
  currentData,
  catData,
  handleAddItem,
  data,
  modalSearchTerm,
  setModalSearchTerm,
  modalFilteredData,
  itemExists,
  modalState,
  setModalState,
  deleteItemFromSchedule,
  moveItemPlaylistSchedule,
  fetchData,
  formatDate,
  formatTime,
  isEditingDuration,
  isEditingTime,
  setNewStartDate,
  setNewEndDate,
  setNewStartTime,
  setNewEndTime,
  handleSave,
  newStartDate,
  newEndDate,
  setIsEditingDuration,
  newStartTime,
  newEndTime,
  setIsEditingTime,
  isAdmin,
  saveEditedTimes,
  handleTimeChange,
  editedTimes,
  itemSetToMove,
  setItemSetToMove,
  moveItem
}) => {
  return (
    <>
      {((currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') && (catData === 'viewTimes' || catData === 'alterTable')) && (
        <>
          <h1 style={{ textAlign: 'center' }}>{currentData === 'Playlist Schedule' ? 'Content Schedule' : 'Ads Schedule'}</h1>
          {modalState === 'Add' && (
            <>
              <SearchInput searchTerm={modalSearchTerm} setSearchTerm={setModalSearchTerm} />
              <br />
              {modalSearchTerm.length > 0 ? (
                modalFilteredData.length > 0 ? (
                  modalFilteredData.filter(modalItem => !itemExists(modalItem.FileName)).map((modalItem, index) => (
                    <div key={index}>
                      <span>{modalItem.FileName}</span>
                      <button onClick={() => { handleAddItem(modalItem, modalItem._id); fetchData() }}>Add</button>
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
            <div style={{ textAlign: 'center' }}>
              {isEditingDuration ? (
                <div>
                  <input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} />
                  <input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} />
                  {isAdmin && catData === 'alterTable' && modalState === '' && <button onClick={() => handleSave('duration')}>Done</button>}
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  {catData === 'alterTable' && modalState === '' && <p>{currentData === 'Playlist Schedule' ? `Duration of Content ${data.folder}` : `Duration of Ads ${data.folder}`}: {formatDate(data.startDate)} - {formatDate(data.endDate)}</p>}
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
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  {catData === 'alterTable' && modalState === '' && <p>{currentData === 'Playlist Schedule' ? `Times Content ${data.folder}` : `Times Ads ${data.folder}`} being played: {formatTime(data.startTime)} - {formatTime(data.endTime)}</p>}
                  {isAdmin && catData === 'alterTable' && modalState === '' && <button onClick={() => setIsEditingTime(true)}>Change</button>}
                </div>
              )}
              {catData === 'alterTable' && modalState === '' && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                  <button className='action-button' style={{ margin: '0 10px' }} onClick={() => setModalState('Add')}>Add to {currentData === 'Playlist Schedule' ? 'Content ' : 'Ad '}Schedule</button>
                  {/* <button className='action-button' style={{ margin: '0 10px' }} onClick={() => setModalState('Move')}>Move</button> */}
                </div>
              )}

              {data.items && (
                <div>
                  <h2 style={{ textAlign: 'center' }}>Ordered Schedule</h2>
                  <ul style={{ listStyleType: 'none', padding: 0, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.1rem' }}>
                    {data.items.map((item, index) => (
                      <li key={index} style={{ position: 'relative', flex: '0 0 calc(25% - 1rem)', textAlign: 'center', border: modalState === 'Move' ? '2px solid' : 'none', borderColor: itemSetToMove.FileName === item.FileName ? 'blue' : 'gray', borderRadius: '5px', padding: modalState === 'Move' ? '10px' : '0' }}>
                        <div style={{ height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={item.PhotoUrl} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} alt={item.FileName} />
                          <p style={{ margin: '5px 0', height: '20px', lineHeight: '20px', fontWeight: itemSetToMove.FileName === item.FileName ? 'bold' : 'normal' }}>
                            {index + 1}. <span>{item.FileName}</span>
                          </p>
                        </div>
                        {modalState === '' && (
                          <>
                            <button className='action-button' onClick={() => { deleteItemFromSchedule(item); fetchData() }}>Delete</button>
                            <button className='action-button' onClick={() => { setItemSetToMove(item); setModalState('Move') }}>Move</button>
                          </>
                        )}
                        {index % 4 !== 3 && <div style={{ position: 'absolute', top: 0, right: '-10px', bottom: 0, width: '2px', backgroundColor: modalState === 'Move' ? 'red' : '' }}></div>}
                      </li>
                    ))}
                  </ul>



                </div>
              )}

              {modalState === 'Move' && (
                <>
                  {modalState === 'Move' && (
                    <>
                      <b>{itemSetToMove.FileName} can now be moved</b>
                      <br />
                    </>
                  )}
                  <button className='action-button' onClick={() => { setModalState(''); setModalSearchTerm(''); setItemSetToMove('') }}>Exit</button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ViewList;

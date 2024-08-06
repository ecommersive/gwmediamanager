import React from 'react';
import SearchInput from '../SearchInput';
import Modal from '../Modal';

const ViewList = ({ currentData, catData, handleAddItem, data, modalSearchTerm, setModalSearchTerm, modalFilteredData, itemExists, modalState, setModalState, deleteItemFromSchedule, moveItemPlaylistSchedule, fetchData, formatDate, formatTime, isEditingDuration, isEditingTime, setNewStartDate, setNewEndDate, setNewStartTime, setNewEndTime, handleSave, newStartDate, newEndDate, setIsEditingDuration, newStartTime, newEndTime, setIsEditingTime, isAdmin, itemSetToMove, setItemSetToMove, secondaryModal, setSecondaryModal, setMoveIndex, moveIndex }) => {


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
                </div>
              )}

              {data.items && (
                <div>
                  <h2 style={{ textAlign: 'center' }}>Ordered Schedule</h2>
                  <ul style={{ listStyleType: 'none', padding: 0, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
                    {data.items.map((item, index) => (
                      <li
                        key={index}
                        style={{
                          position: 'relative',
                          flex: '0 0 calc(25% - 1rem)',
                          textAlign: 'center',
                          borderStyle: modalState === 'Move' ? 'solid' : 'none',
                          borderWidth: modalState === 'Move' ? '2px' : '0',
                          borderColor: itemSetToMove.FileName === item.FileName ? 'blue' : 'gray',
                          borderRadius: '5px',
                          padding: modalState === 'Move' ? '10px' : '0',
                          overflow: 'hidden' 
                        }}
                        onMouseEnter={(e) => {
                          if (modalState === 'Move' && itemSetToMove.FileName !== item.FileName) {
                            e.currentTarget.querySelector('.hover-overlay').style.display = 'flex';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (modalState === 'Move') {
                            e.currentTarget.querySelector('.hover-overlay').style.display = 'none';
                          }
                        }}
                      >
                        <div style={{ height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          {/* <img src={item.PhotoUrl} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} alt={item.FileName} /> */}
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
                        {modalState === 'Move' && (
                          <div className="hover-overlay" style={{
                            display: 'none',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(5px)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 'bold'
                          }}>
                            <button className='action-button' onClick={() => { setSecondaryModal(true); setItemSetToMove(itemSetToMove); setMoveIndex(index) }}>Switch to position {index + 1}</button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {modalState === 'Move' && !secondaryModal && (
                <div style={{
                  position: 'sticky',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  width: '100%',
                  textAlign: 'center',
                  zIndex: 1500
                }}>
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: '#fff',
                    padding: '10px 20px',
                    boxShadow: '0 -2px 6px rgba(0,0,0,0.1)'
                  }}>
                    <b>{itemSetToMove.FileName} can now be moved</b>
                    <br />
                    <button
                      className='action-button'
                      onClick={() => { setModalState(''); setModalSearchTerm(''); setItemSetToMove('') }}>
                      Exit
                    </button>
                  </div>
                </div>
              )}




            </div>
          )}
        </>
      )}

      {secondaryModal && (
        <Modal isOpen={secondaryModal} onClose={() => setSecondaryModal(false)} maxWidth="400px">
          <div style={{ textAlign: 'center' }}>
            <p>Are you sure you want to move {itemSetToMove.FileName} to position {moveIndex + 1}</p>
            <button className='action-button' onClick={() => { moveItemPlaylistSchedule(itemSetToMove, moveIndex); setSecondaryModal(false); }}>Yes</button>
            <button className='action-button' onClick={() => setSecondaryModal(false)}>No</button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ViewList;

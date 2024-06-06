import React, {useEffect} from 'react';
import SearchInput from '../SearchInput';

const ViewList = ({ currentData, catData, data, modalSearchTerm, setModalSearchTerm, modalFilteredData, itemExists, state, setState, deleteItemFromSchedule, addItemToSchedule, moveItemPlaylistSchedule  }) => {

  
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
                      <button onClick={() => addItemToSchedule(modalItem.FileName)}>Add</button>                    
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
                <p>
                  {currentData === 'Playlist Schedule' ? `Duration of Playlist ${data.folder}` : `Duration of Ads ${data.folder}`} : {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
                </p>
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
                        {item}
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
                <button className='action-button' onClick={() => setState('')}>Exit</button>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ViewList;

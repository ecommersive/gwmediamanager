import React, { useState } from 'react';
import SearchInput from '../SearchInput';

const ViewList = ({ currentData, catData, data, modalSearchTerm ,setModalSearchTerm, modalFilteredData, itemExists }) => {
  const [state, setState] = useState('');

  return (
    <>
      {((currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') && (catData === 'viewTimes' || catData === 'alterTable')) && (
        <>
          <h1>{currentData === 'Playlist Schedule' ? 'Playlist Schedule' : 'Ads Schedule'}</h1>
          {state === 'Add' && <>
            <SearchInput searchTerm={modalSearchTerm} setSearchTerm={setModalSearchTerm}/>
            <br />
            {modalSearchTerm.length > 0 ? (
              modalFilteredData.length > 0 ? (
                modalFilteredData.filter(modalItem => !itemExists(modalItem.FileName)).map((modalItem, index) => (
                  <div key={index}>
                    <span>{modalItem.FileName}</span>
                    {/* <button onClick={(event) => handleAddToSet(event, modalItem.FileName)}>
                      Add
                    </button> */}
                  </div>
                ))
              ) : (
                <p>No data found. Please search for data.</p>
              )
            ) : (
              <p>No data found. Please search for data.</p>
            )}
          </> }
          {data && (
            <div>
              <p>
                {currentData === 'Playlist Schedule' ? `Duration of Playlist ${data.folder}` : `Duration of Ads ${data.folder}`} : {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
              </p>
              {state === '' && catData === 'alterTable' && (
                <>
                  <h1>Alter {currentData === 'Playlist Schedule' ? ` Playlist ${data.folder}` : ` Ads ${data.folder}`}</h1>
                  <div style={{ display: 'flex', margin: '0 10px' }}>
                    <button className='action-button' style={{ margin: '0 10px' }} onClick={() => setState('Add')}>Add</button>
                    <button className='action-button' style={{ margin: '0 10px' }} onClick={() => setState('Delete')}>Delete</button>
                    <button className='action-button' style={{ margin: '0 10px' }} onClick={() => setState('MoveUp')}>Move Up</button>
                    <button className='action-button' style={{ margin: '0 10px' }} onClick={() => setState('MoveDown')}>Move Down</button>
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
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {
                (state === 'Add' || state === 'Delete' || state === 'MoveUp' || state === 'MoveDown') && <button className='action-button' onClick={() => setState('')}>Done Editing</button>
              }
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ViewList;

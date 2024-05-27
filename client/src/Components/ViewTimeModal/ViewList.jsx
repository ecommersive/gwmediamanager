import React from 'react';

const ViewList = ({ currentData, catData, folderViewNum, data }) => {
  return (
    <>
      {((currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') && (catData === 'viewTimes' || catData === 'alterTimes')) && (
        <>
          <h1>{currentData === 'Playlist Schedule' ? 'Playlist Schedule' : 'Ads Schedule'}</h1>
          {data && (
            <div>
              <p>
                {currentData === 'Playlist Schedule' ? `Duration of Playlist ${folderViewNum}` : `Duration of Ads ${folderViewNum}`}
                : {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
              </p>
              {data.items && (
                <div>
                  <h2>Items</h2>
                  <ul>
                    {data.items.map((item, index) => (
                      <li key={index}>
                        {item}
                        <button>Move up</button>
                        <button>Move down</button>
                        <button>Delete</button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ViewList;

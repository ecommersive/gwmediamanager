import React, { useEffect, useCallback, useState } from 'react';

const ViewList = ({ currentData, catData, folderViewNum, token }) => {
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    let baseUrl = process.env.REACT_APP_API_URL;
    let url = `${baseUrl}/`;
    switch(currentData) {
      case 'Playlist Schedule':
        url += `playlistSchedule/${folderViewNum}`;
        break;
      case 'Ads Schedule':
        url += `adsSchedule/${folderViewNum}`;
        break;
      default:
        return;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setData(data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  }, [currentData, folderViewNum, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      {(currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') && catData === 'viewTimes' && (
        <>
          <h1>{currentData === 'Playlist Schedule' ? 'Playlist Schedule' : 'Ads Schedule'}</h1>
          {data && (
            <div>

              <p>{currentData === 'Playlist Schedule' ? `Duration of Playlist ${folderViewNum}` : currentData === 'Ads Schedule' ? `Duration of Ads ${folderViewNum}`: ''}: {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}</p>
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
            </div>
          )}
        </>
      )}
    </>
  );
}

export default ViewList;

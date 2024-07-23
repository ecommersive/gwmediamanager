import React from 'react';
import '../styles/datatable.css';

const DataTable = ({ currentData, isAdmin, filteredData, setShowModal, setFileName, setMode, setNotes, setCatData, setfolderViewNum, formatDate, formatTime, scheduleEditMode, setScheduleEditMode, setCompareData, orderedScheduledData  }) => {

  return (
    <section className="table_body">
      {filteredData && filteredData.length > 0 ? (
        <table>
          <thead>
            <tr>
              {currentData === 'Playlist Schedule' || currentData === 'Ads Schedule' ? (
                scheduleEditMode === 'on' ? (
                  <>
                    <th>Order</th>
                    <th>File Name</th>
                    <th>File Type</th>
                    <th>Tag</th>
                    <th>Run Time</th>
                    <th>Type</th>
                    <th>Expiry</th>
                    <th>Comments</th>
                    {isAdmin && <th>Details</th>}
                  </>
                ) : (
                  <>
                    <th>Folder</th>
                    {currentData === 'Ads Schedule' && <th>Times set of ads being played at</th>}
                    <th>Expiry</th>
                  </>
                )
              ) : (
                <>
                  <th>File Name</th>
                  <th>File Type</th>
                  <th>Tag</th>
                  <th>Run Time</th>
                  <th>Type</th>
                  <th>Expiry</th>
                  <th>Comments</th>
                  {isAdmin && <th>Details</th>}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => {
              if (currentData === 'Playlist' || currentData === 'Ads') {
                return (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : '#f0f0f0' }}>
                    <td>{item.FileName}</td>
                    <td>{item.Type}</td>
                    <td>{item.Tag}</td>
                    <td>{item.Run_Time}</td>
                    <td>{item.Content}</td>
                    <td>{item.Expiry}</td>
                    <td><button className='action-button' onClick={() => { setShowModal(true); setFileName(item.FileName); setNotes(item.notes); setCatData('Comments'); setMode('configureData') }}>Comments</button></td>
                    {isAdmin && <td><button className='action-button' onClick={() => { setShowModal(true); setFileName(item.FileName); setMode('configureData'); setCatData('viewfile') }}>Details</button></td>}
                  </tr>
                );
              } else if (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') {
                return (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : '#f0f0f0' }}>
                    {scheduleEditMode !== 'on' && (
                      <>
                        <td>
                          <button className="action-button" onClick={() => { 
                            setMode('configureData'); 
                            setCatData('viewTimes'); 
                            setfolderViewNum(item.folder); 
                            setScheduleEditMode('on'); 
                            setCompareData(item);
                          }}>
                            {(currentData === 'Playlist Schedule' ? 'Eternal' : `Ads ${item.folder}`)}
                          </button>
                        </td>
                        {currentData === 'Ads Schedule' && <td>{formatTime(item.startTime)} - {formatTime(item.endTime)}</td>}
                        <td>{formatDate(item.startDate)} - {formatDate(item.endDate)}</td>
                      </>
                    )}
                  </tr>
                );
              }
            })}

            {scheduleEditMode === 'on' && orderedScheduledData.map((scheduledItem, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'transparent' : '#f0f0f0' }}>
                <td>{idx+1}</td>
                <td>{scheduledItem.FileName}</td>
                <td>{scheduledItem.Type}</td>
                <td>{scheduledItem.Tag}</td>
                <td>{scheduledItem.Run_Time}</td>
                <td>{scheduledItem.Content}</td>
                <td>{scheduledItem.Expiry}</td>
                <td><button className='action-button' onClick={() => { setShowModal(true); setFileName(scheduledItem.FileName); setNotes(scheduledItem.notes); setCatData('Comments'); setMode('configureData') }}>Comments</button></td>
                {isAdmin && <td><button className='action-button' onClick={() => { setShowModal(true); setFileName(scheduledItem.FileName); setMode('configureData'); setCatData('viewfile') }}>Details</button></td>}
              </tr>
            ))}

          </tbody>
        </table>
      ) : (
        <p className="no-data-message">No data found. Please add data to {currentData}</p>
      )}
    </section>
  );
};

export default DataTable;

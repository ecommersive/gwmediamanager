import React from 'react';
import '../styles/datatable.css';

const DataTable = ({ currentData, isAdmin, filteredData, setShowModal, setFileName, setMode, setNotes, setCatData, setfolderViewNum, formatDate, formatTime }) => {
  return (
    <section className="table_body">
      {filteredData && filteredData.length > 0 ? (
        <table>
          <thead>
            {currentData === 'Playlist Schedule' || currentData === 'Ads Schedule' ? (
              <tr>
                <th>Filename</th>
                <th>Starting Date</th>
                <th>Ending Date</th>
                <th>Times {currentData === 'Playlist Schedule' ? 'set of playlist' : currentData === 'Ads Schedule' ? 'set of ads' : ''} being played at</th>
                {isAdmin && <th>Alter {currentData}</th>}
              </tr>
            ) : (
              <tr>
                {/* <th>Photo</th> */}
                <th>File Name</th>
                <th>File Type</th>
                <th>Tag</th>
                <th>Run Time</th>
                <th>Type</th>
                <th>Expiry</th>
                {isAdmin && <th>Comments</th>}
                {isAdmin && <th>Details</th>}
              </tr>
            )}
          </thead>
          <tbody>
            {filteredData.map((item, index) => {
              if (currentData === 'Playlist' || currentData === 'Ads') {
                return (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : '#f0f0f0' }}>
                    {/* <td><img src={item.PhotoUrl} alt="Data" style={{ width: '50px', height: '50px' }} /></td> */}
                    <td>{item.FileName}</td>
                    <td>{item.Type}</td>
                    <td>{item.Tag}</td>
                    <td>{item.Run_Time}</td>
                    <td>{item.Content}</td>
                    <td>{item.Expiry}</td>
                    {isAdmin && <td><button className='action-button' onClick={() => { setShowModal(true); setFileName(item.FileName); setNotes(item.notes); setCatData('Comments'); setMode('configureData') }}>Comments</button></td>}
                    {isAdmin && <th><button className='action-button' onClick={() => { setShowModal(true); setFileName(item.FileName); setMode('configureData'); setCatData('viewfile') }}>Details</button></th>}
                  </tr>
                );
              } else if (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') {
                return (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : '#f0f0f0' }}>
                    <td>
                      <button className="action-button" onClick={() => { setShowModal(true); setMode('configureData'); setCatData('viewTimes'); setfolderViewNum(item.folder) }}>{(currentData === 'Playlist Schedule' ? 'Playlist ' : 'Ads ') + item.folder}</button>
                    </td>
                    <td>{formatDate(item.startDate)}</td>
                    <td>{formatDate(item.endDate)}</td>
                    <td>{formatTime(item.startTime)} - {formatTime(item.endTime)}</td>
                    {isAdmin && <td><button className="action-button" onClick={() => { setShowModal(true); setMode('configureData'); setCatData('alterTable'); setfolderViewNum(item.folder) }}>Alter {currentData === 'Playlist Schedule' ? 'Playlist ' : 'Ads '} Schedule</button></td>}
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      ) : (
        <p className="no-data-message">No data found. Please add data to {currentData}</p>
      )}
    </section>
  );
};

export default DataTable;

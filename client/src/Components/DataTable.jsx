// DataTable.js
import React from 'react';
import '../styles/datatable.css';

const DataTable = ({ currentData, isAdmin,handleVideoClick, filteredData, setShowModal, setFileName, setNotes, setMode, setCatData }) => {
  return (
    <section className="table_body">
        <table>
          <thead>
            {
              currentData === 'Playlist Schedule' || currentData === 'Ads Schedule' ?
                <tr>
                  <th>Folder</th>
                  <th>Starting Date</th>
                  <th>Ending Date</th>
                  <th>Starting Time</th>
                  <th>Ending Time</th>
                  <th>other times {currentData === 'Playlist Schedule' ? 'set of playlist' : currentData === 'Ads Schedule' ? 'set of ads' : 'Other Times Being Played At'} being played at</th>
                </tr>
                :
                <tr>
                  <th>Photo</th>
                  <th>File Name</th>
                  <th>File Type</th>
                  <th>Tag</th>
                  <th>Run Time</th>
                  <th>Type</th>
                  <th>Video Url</th>
                  <th>Expiry</th>
                  {isAdmin && <th>Notes</th>}
                  {isAdmin && <th>Alter Notes</th>}
                </tr>
            }
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map((item, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : '#f0f0f0' }}>
                <td><img src={item.PhotoUrl} alt="Data" style={{ width: '50px', height: '50px' }} /></td>
                <td>{item.FileName}</td>
                <td>{item.Type}</td>
                <td>{item.Tag}</td>
                <td>{item.Run_Time}</td>
                <td>{item.Content}</td>
                <td><button onClick={() => { handleVideoClick(item.videoUrl); setMode('viewvideo') }}>View</button></td>
                <td>{item.Expiry}</td>
                {isAdmin && <td><button onClick={() => { setShowModal(true); setFileName(item.FileName); setNotes(item.notes); setMode('configureData'); setCatData('viewNotes') }}>View</button></td>}
                {isAdmin &&
                  <td>
                    <button onClick={() => { setShowModal(true); setFileName(item.FileName); setNotes(item.notes); setMode('configureData'); setCatData('AddNote') }}>Add Notes</button>
                    <br />
                    <button onClick={() => { setShowModal(true); setFileName(item.FileName); setNotes(item.notes); setMode('configureData'); setCatData('UpdateNote') }}>Update Notes</button>
                    <br />
                    <button onClick={() => { setShowModal(true); setFileName(item.FileName); setNotes(item.notes); setMode('configureData'); setCatData('DeleteNote') }}>Delete Notes</button>
                  </td>
                }
              </tr>
            )) : (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center' }}>No data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
  );
};

export default DataTable;

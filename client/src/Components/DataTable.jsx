import React, {useState} from 'react';
import '../styles/datatable.css';

const DataTable = ({ currentData, isAdmin, handleVideoClick, filteredData, setShowModal, setFileName, setNotes, setCatData }) => {
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  
  return (
    <section className="table_body">
      <table>
        <thead>
          {
            currentData === 'Playlist Schedule' || currentData === 'Ads Schedule' ?
              <tr>
                <th>Filename</th>
                <th>Starting Date</th>
                <th>Ending Date</th>
                <th>Starting Time</th>
                <th>Ending Time</th>
                <th>Times {currentData === 'Playlist Schedule' ? 'set of playlist' : currentData === 'Ads Schedule' ? 'set of ads' : ''} being played at</th>
                {isAdmin && <th>Alter {currentData === 'Playlist Schedule' ? 'Playlist Schedule': currentData === 'Ads Schedule' ? 'Ads Schedule': ''}</th>}
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
          {filteredData && filteredData.length > 0 && filteredData.map((item, index) => {
            if ((currentData === 'Playlist' || currentData === 'Ads')) {
              return (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : '#f0f0f0' }}>
                  <td><img src={item.PhotoUrl} alt="Data" style={{ width: '50px', height: '50px' }} /></td>
                  <td>{item.FileName}</td>
                  <td>{item.Type}</td>
                  <td>{item.Tag}</td>
                  <td>{item.Run_Time}</td>
                  <td>{item.Content}</td>
                  <td><button onClick={() => { handleVideoClick(item.videoUrl); }}>View</button></td>
                  <td>{item.Expiry}</td>
                  {isAdmin && <td><button onClick={() => { setShowModal(true); setFileName(item.FileName); setNotes(item.notes); setCatData('viewNotes') }}>View</button></td>}
                  {isAdmin &&
                    <td>
                      <button onClick={() => { setShowModal(true); setFileName(item.FileName); setNotes(item.notes); setCatData('AddNote') }}>Add Notes</button>
                      <br />
                      <button onClick={() => { setShowModal(true); setFileName(item.FileName); setNotes(item.notes);  setCatData('UpdateNote') }}>Update Notes</button>
                      <br />
                      <button onClick={() => { setShowModal(true); setFileName(item.FileName); setNotes(item.notes);  setCatData('DeleteNote') }}>Delete Notes</button>
                    </td>
                  }
                </tr>
              );
            }else if(currentData === 'Playlist Schedule' || currentData === 'Ads Schedule'){
                return (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : '#f0f0f0' }}>
                    <td>
                      <button className="action-button">
                        {(currentData === 'Playlist Schedule' ? 'Playlist ' : 'Ads ') + item.folder}
                      </button>
                    </td>
                    <td>{formatDate(item.startDate)}</td>
                    <td>{formatDate(item.endDate)}</td>
                    <td>{formatTime(item.startTime)}</td>
                    <td>{formatTime(item.endTime)}</td>
                    <td>{item.otherTimes}</td>
                    {isAdmin && 
                      <th>
                        <button className="action-button">
                          Alter {currentData === 'Playlist Schedule' ? 'Playlist Times': currentData === 'Ads Schedule' ? 'Ad Times': ''}
                        </button>
                      </th>
                    }
                  </tr>
                );
            }
            
          })}

        </tbody>
      </table>
    </section>
  );
};

export default DataTable;

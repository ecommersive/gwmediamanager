import React from 'react';
import '../styles/datatable.css';

const DataTable = ({ currentData, isAdmin, filteredData, setShowModal, setFileName, setMode, setNotes, setCatData, setfolderViewNum }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes} ${period}`;
  };

  const notes = isAdmin ? <>
    <th>Notes</th>
    <th>Alter Notes</th>
    </> : null;


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
                <th>Times {currentData === 'Playlist Schedule' ? 'set of playlist' : currentData === 'Ads Schedule' ? 'set of ads' : ''} being played at</th>
                {notes}
              </tr>
              :
              <tr>
                <th>Photo</th>
                <th>File Name</th>
                <th>File Type</th>
                <th>Tag</th>
                <th>Run Time</th>
                <th>Type</th>
                <th>Expiry</th>
                {notes}
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
                  <td>{item.Expiry}</td>
                  {isAdmin && <td><button onClick={() => { setShowModal(true); setFileName(item.FileName); setNotes(item.notes); setCatData('viewNotes'); setMode('configureData')}}>View</button></td>}
                  {isAdmin &&
                    <td>
                      <button onClick={() => { setShowModal(true); setFileName(item.FileName); setNotes(item.notes); setCatData('AddNote'); setMode('configureData'); }}>Add Notes</button>
                      <br />
                      <button onClick={() => { setShowModal(true); setFileName(item.FileName); setNotes(item.notes);  setCatData('UpdateNote'); setMode('configureData'); }}>Update Notes</button>
                      <br />
                      <button onClick={() => { setShowModal(true); setFileName(item.FileName); setNotes(item.notes);  setCatData('DeleteNote'); setMode('configureData'); }}>Delete Notes</button>
                    </td>
                  }
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
                  {isAdmin && <td><button onClick={() => {setShowModal(true); setMode('configureData'); setCatData('viewNotes');}}>View</button></td>}
                  {isAdmin &&
                    <td>
                      <button onClick={() => {setShowModal(true); setMode('configureData'); setCatData('AddNote');}}>Add Notes</button>
                      <br />
                      <button onClick={() => {setShowModal(true); setMode('configureData'); setCatData('UpdateNote');}}>Update Notes</button>
                      <br />
                      <button onClick={() => {setShowModal(true); setMode('configureData'); setCatData('DeleteNote');}}>Delete Notes</button>
                    </td>
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

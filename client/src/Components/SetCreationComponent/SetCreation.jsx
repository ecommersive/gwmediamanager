import React, { useState } from 'react';
import SearchInput from '../SearchInput';

const SetCreation = ({
  catData,
  setShowModal,
  handleSubmitSetModal,
  modalSearchTerm,
  setModalSearchTerm,
  modalFilteredData,
  itemExists,
  handleAddToSet,
  item
}) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const handleStartDateChange = (event) => {
    const newStartDate = new Date(event.target.value);
    setStartDate(newStartDate);
    if (!endDate || newStartDate > endDate) {
      setEndDate(newStartDate);
    }
  };

  const handleStartTimeChange = (event) => {
    if (!startDate) {
      console.error("Start date is not set.");
      return; // Exit the function if startDate is null
    }
  
    const datePortion = startDate.toISOString().split('T')[0];
    const newStartTime = new Date(datePortion + ' ' + event.target.value);
    setStartTime(newStartTime);
  
    if (datePortion === endDate.toISOString().split('T')[0]) {
      document.querySelector('input[name="endTime"]').min = newStartTime.toTimeString().slice(0, 5);
    }
  };

  const isButtonDisabled = !startDate || !endDate || !startTime || !endTime

  return (
    (catData === 'playlistSchedule' || catData === 'adsSchedule') && <>
      <SearchInput searchTerm={modalSearchTerm} setSearchTerm={setModalSearchTerm} />
      <br />
      {modalSearchTerm.length > 0 ? (
        modalFilteredData.length > 0 ? (
          modalFilteredData.filter(modalItem => !itemExists(modalItem.FileName)).map((modalItem, index) => (
            <div key={index}>
              <span>{modalItem.FileName}</span>
              <button onClick={(event) => handleAddToSet(event, modalItem.FileName)}>
                Add
              </button>
            </div>
          ))
        ) : (
          <p>No data found. Please search for data.</p>
        )
      ) : (
        <p>No data found. Please search for data.</p>
      )}
      <br />
      {item.map((item, index) => (
        <div key={index}>
          <span>{item.FileName}</span>
          <br />
        </div>
      ))}
      <br />
      <div className="date-inputs">
        <label>
          Start Date:
          <input type="date" name="startDate" value={startDate ? startDate.toISOString().split('T')[0] : ''} onChange={handleStartDateChange} />
        </label>
        <label>
          End Date:
          <input type="date" name="endDate" value={endDate ? endDate.toISOString().split('T')[0] : ''} min={startDate ? startDate.toISOString().split('T')[0] : ''} onChange={(event) => setEndDate(new Date(event.target.value))} />
        </label>
      </div>
      <br />
      <div className="time-inputs">
        <label>
          Start Time:
          <input type="time" name="startTime" onChange={handleStartTimeChange} />
        </label>
        <label>
          End Time:
          <input type="time" name="endTime" min={startTime && startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0] ? startTime.toTimeString().slice(0, 5) : ''} onChange={(event) => setEndTime(new Date(endDate.toISOString().split('T')[0] + ' ' + event.target.value))} />
        </label>
      </div>
      <br />
      <button type="submit" onClick={(event) => { handleSubmitSetModal(event); setShowModal(false); setModalSearchTerm(''); }} disabled={isButtonDisabled}>Submit</button>
    </>
  );
};

export default SetCreation;

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
  item,
}) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [timeError, setTimeError] = useState('');

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
      return; 
    }
    const datePortion = startDate.toISOString().split('T')[0];
    const newStartTime = new Date(datePortion + ' ' + event.target.value);
    setStartTime(newStartTime);
    validateTimes(newStartTime, endTime);
  };

  const handleEndTimeChange = (event) => {
    if (!endDate) {
      console.error("End date is not set.");
      return;
    }
    const datePortion = endDate.toISOString().split('T')[0];
    const newEndTime = new Date(datePortion + ' ' + event.target.value);
    setEndTime(newEndTime);
    validateTimes(startTime, newEndTime);
  };

  const validateTimes = (start, end) => {
    if (startDate && endDate && startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0] && start && end && start >= end) {
      setTimeError('Start time must be earlier than end time on the same day.');
      return false;
    } else {
      setTimeError('');
      return true;
    }
  };

  const isButtonDisabled = !startDate || !endDate || !startTime || !endTime
  const checkedData = (startDate, endDate, startTime, endTime, item) =>{
    //need a function to check the type of data of startDate, endDate, startTime, endTime and item as well, no like we need like if it's a string or object and etc...
   
      // const startDateType = typeof startDate;
      // const endDateType = typeof endDate;
      // const startTimeType = typeof startTime;
      // const endTimeType = typeof endTime;
      // const itemType = typeof item;

      //it only says object, it doesn't say what type of object it is
      console.log('startDate:', startDate);
      console.log('endDate:', endDate);
      console.log('startTime:', startTime);
      console.log('endTime:', endTime);
      console.log('item:', item);
      // console.log('startDate type:', startDateType);
      // console.log('endDate type:', endDateType);
      // console.log('startTime type:', startTimeType);
      // console.log('endTime type:', endTimeType);
      // console.log('item type:', itemType);


  }
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
      {timeError && <p className="error">{timeError}</p>}
      <div className="date-inputs">
        <label>
          Start Date:
          <input type="date" name="startDate" value={startDate ? startDate.toISOString().split('T')[0] : ''} onChange={handleStartDateChange} />
        </label>
        <label>
          End Date:
          <input type="date" name="endDate" value={endDate ? endDate.toISOString().split('T')[0] : ''} min={startDate ? startDate.toISOString().split('T')[0] : ''} onChange={handleStartDateChange} />
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
          <input type="time" name="endTime" min={startTime && startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0] ? startTime.toTimeString().slice(0, 5) : ''} onChange={handleEndTimeChange} />
        </label>
      </div>
      <br />
      <button type="submit" onClick={(event) => { handleSubmitSetModal(event, startDate, endDate, startTime, endTime, item); setShowModal(false); setModalSearchTerm(''); }} disabled={isButtonDisabled}>Submit</button>
      {/* <button type="submit" onClick={(event) => { checkedData(startDate, endDate, startTime, endTime, item); setModalSearchTerm(''); }} disabled={isButtonDisabled}>test</button> */}
    </>
  );
};

export default SetCreation;

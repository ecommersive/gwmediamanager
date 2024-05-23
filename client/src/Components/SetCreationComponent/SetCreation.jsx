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

  const handleStartDateChange = (event) => {
    const newStartDate = new Date(event.target.value);
    setStartDate(newStartDate);
    if (!endDate || newStartDate > endDate) {
      setEndDate(newStartDate);
    }
  };

  const handleEndDateChange = (event) => {
    const newEndDate = new Date(event.target.value);
    setEndDate(newEndDate);
  };


  const isButtonDisabled = !startDate || !endDate;

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
          <input type="date" name="endDate" value={endDate ? endDate.toISOString().split('T')[0] : ''} min={startDate ? startDate.toISOString().split('T')[0] : ''} onChange={handleEndDateChange} />
        </label>
      </div>
      <br />
     
      <br />
      <button type="submit" onClick={(event) => { handleSubmitSetModal(event, startDate, endDate, item); setShowModal(false); setModalSearchTerm(''); }} disabled={isButtonDisabled}>Submit</button>
    </>
  );
};

export default SetCreation;

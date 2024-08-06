const SetCreation = ({
  catData,
  setShowModal,
  handleSubmitSetModal,
  modalSearchTerm,
  setModalSearchTerm,
  modalFilteredData,
  itemExists,
  item,
  startDate, 
  setStartDate,
  endDate, 
  setEndDate,
  startTime, 
  setStartTime,
  endTime,
  setEndTime,
  error, 
  setError
}) => {

  
  

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

  const handleTimeChange = (field, value) => {
    if (field === 'startTime') {
      setStartTime(value);
    } else if (field === 'endTime') {
      setEndTime(value);
    }
  };

  const convertTo24HourFormat = (time) => {
    const [hourMinute, period] = time.split(' ');
    let [hours, minutes] = hourMinute.split(':');
    if (period === 'PM' && hours !== '12') {
      hours = String(Number(hours) + 12);
    } else if (period === 'AM' && hours === '12') {
      hours = '00';
    }
    return `${hours}:${minutes}`;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const startTime24 = convertTo24HourFormat(startTime);
    const endTime24 = convertTo24HourFormat(endTime);

    // Validate time slot
    if (startTime24 >= endTime24) {
      setError('Start time must be earlier than end time.');
      return;
    }

    handleSubmitSetModal(event, startDate, endDate, item, {startTime: startTime24}, {endTime: endTime24});
    setShowModal(false);
    setModalSearchTerm('');
  };

  const isButtonDisabled = !startDate || !endDate || !startTime || !endTime;

  return (
    (catData === 'playlistSchedule' || catData === 'adsSchedule') && (
      <>
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
        <div className="time-slot">
          <h3>Time Slot</h3>
          <label>
            Start Time:
            <input
              type="time"
              value={startTime}
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
            />
          </label>
          <label>
            End Time:
            <input
              type="time"
              value={endTime}
              onChange={(e) => handleTimeChange('endTime', e.target.value)}
              min={startTime}
            />
          </label>
        </div>
        <br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" onClick={handleSubmit} disabled={isButtonDisabled}>Submit</button>
      </>
    )
  );
};

export default SetCreation;

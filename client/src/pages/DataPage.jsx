import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../Components/Modal';
import { v4 as uuidv4 } from 'uuid';
import SearchInput from '../Components/SearchInput';
import HeaderButtons from '../Components/HeaderButtons';
import VideoViewer from '../Components/videoViewer';
import DataTable from '../Components/DataTable';
import FormTitle from '../Components/FormMainComponents/FormTitle';
import FormAddDataBody from '../Components/FormMainComponents/FormAddDataBody';
import FormAllDataBody from '../Components/FormMainComponents/FormAllDataBody';
import FormExpiry from '../Components/FormMainComponents/FormExpiry';
import FormButton from '../Components/FormMainComponents/FormButton';
import NotesForm from '../Components/NotesFormComponent/NotesForm';
import SetCreation from '../Components/SetCreationComponent/SetCreation';
import SwitchSections from '../Components/SwitchSections';
import '../styles/datapage.css';
import ViewList from '../Components/ViewTimeModal/ViewList';
import RequestDetails from '../Components/RequestModal/RequestDetails';
import { mediaInfoFactory } from 'mediainfo.js';
import FormViewFile from '../Components/FormMainComponents/FormViewFile';
import apiService from '../api';
import Users from '../Components/UserModal/Users';

const DataPage = () => {
  const [folderViewNum, setfolderViewNum] = useState(0)
  const [mode, setMode] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [catData, setCatData] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentData, setCurrentData] = useState('Playlist');
  const [newRequestDescription, setNewRequestDescription] = useState('');
  const [requestError, setRequestError] = useState('');
  const [fileName, setFileName] = useState('');
  const [identifier, setIdentifier] = useState(folderViewNum);
  const [photoUrl, setPhotoUrl] = useState('');
  const [type, setType] = useState('');
  const [tag, setTag] = useState('');
  const [runTime, setRunTime] = useState('');
  const [content, setContent] = useState('');
  const [expiry, setExpiry] = useState('');
  const username = localStorage.getItem('username');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [modalData, setModalData] = useState([]);
  const [item, setItem] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [state, setState] = useState('');
  const [modalState, setModalState] = useState('');
  const [requests, setRequests] = useState([]);
  const [file, setFile] = useState(null);
  const [mediaInfo, setMediaInfo] = useState(null);
  const [result, setResult] = useState(null)
  const [addedItems, setAddedItems] = useState([]);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [fileDetails, setFileDetails] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [scheduleEditMode, setScheduleEditMode] = useState();
  const [scheduledData, setScheduledData] = useState([]);
  const [compareData, setCompareData] = useState([])
  const [videoUrl, setVideoURL] = useState('')
  const [currentViewUrl, setCurrentViewUrl] = useState('');
  const [videoKey, setVideoKey] = useState(uuidv4());
  const [previewUrl, setPreviewUrl] = useState(null);
  const [itemSetToMove, setItemSetToMove] = useState('');
  const [confirmMove, setConfirmMove] = useState(false);
  const [moveIndex, setMoveIndex] = useState(null);
  const [secondaryModal, setSecondaryModal] = useState(false);
  const [adminUserState, setAdminUserState] = useState('')
  const [users, setUsers] = useState([]);
  


  const [selectedUser, setSelectedUser] = useState(null);
  const [objectCount, setObjectCount] = useState(0);

  
  const fetchData = useCallback(async () => {
    try {
      const data = await apiService.fetchData(currentData);
      setData(data);
      setObjectCount(data.length);
      const adminStatus = localStorage.getItem('isAdmin') === 'true';
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [currentData])
  useEffect(() => {
    const fetchAllForSchedules = async () => {
      if (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') {
        const data = await apiService.fetchForSchedule(currentData);
        setScheduledData(data);
      }
    };

    fetchAllForSchedules();
  }, [currentData]);
  

  const fetchFileDetails = async (fileName) => {
    try {
      const data = await apiService.fetchFileDetails(fileName);
      setFileDetails(data);
    } catch (error) {
      console.error('Error fetching file details:', error);
    }
  };
  const fetchDataModals = useCallback(async () => {
    try {
      const data = await apiService.fetchDataModals(currentData);
      setModalData([...data]);
    } catch (error) {
      console.error('Error fetching data from API', error);
    }
  }, [currentData]);
  const fetchRequests = async () => {
    await apiService.fetchRequests(setRequests);
  };
  const handleSubmit = async (event) => {
    await apiService.handleSubmit({ event, catData, result, fileName, photoUrl, videoUrl, type, tag, runTime, content, expiry, notes, currentData, fetchData, setShowModal, resetAll, setFile, file/*generateThumbnailFromVideo, generateThumbnailFromImage*/});
  };
  const handleAddNoteSubmit = async (event, identifier) => {
    await apiService.handleAddNoteSubmit({ event, identifier, newNote, currentData, setNotes, fetchData });
  };
  const handleSubmitSetModal = async (event, startDate, endDate, item, startTime, endTime) => {
    await apiService.handleSubmitSetModal({ event, startDate, endDate, item, startTime, endTime, currentData, setData, setfolderViewNum, setItem, setAddedItems, setShowModal, setStartDate, setEndDate, setStartTime, setEndTime, setError });
  };

  const fetchItemsByFolder = useCallback(async () => {
    try {
      const data = await apiService.fetchItemsByFolder(currentData, folderViewNum);
      setCompareData(data);
    } catch (error) {
      console.error('Error fetching items by folder:', error);
    }
  }, [currentData, folderViewNum]);

  const addItemToSchedule = async (itemToAdd, id) => {
    await apiService.addItemToSchedule({ itemToAdd, id, currentData, folderViewNum, fetchData });
  };
  const handleAddRequest = async () => {
    await apiService.handleAddRequest({ newRequestDescription, fetchRequests, setNewRequestDescription, setRequestError });
  };
  const handleDoneEditNote = async (noteIndex, identifier) => {
    await apiService.handleDoneEditNote({ noteIndex, identifier, editingNoteId, editingNoteText, notes, currentData, setNotes, setEditingNoteId, setEditingNoteText, fetchData });
  };
  const handleSave = async (field) => {
    await apiService.handleSave({ field, currentData, folderViewNum, newStartDate, newEndDate, newStartTime, newEndTime, setNewStartDate, setNewEndDate, setIsEditingDuration, setNewStartTime, setNewEndTime, setIsEditingTime, fetchData, formatDate, formatTime });
  };
  const handleSaveSection = async () => {
    await apiService.handleSaveSection({ requests, fetchRequests });
  };
  const handleToggleStatus = async (request) => {
    await apiService.handleToggleStatus({ request, fetchRequests });
  };
  const moveItemPlaylistSchedule = async (itemToMove, oldIndex, newIndex) => {
    await apiService.moveItemPlaylistSchedule({ itemToMove, oldIndex, newIndex, currentData, folderViewNum, fetchData });
    await fetchItemsByFolder();
  };
  const handleDeleteNote = async (noteIndex, identifier) => {
    await apiService.handleDeleteNote({ noteIndex, identifier, notes, currentData, setNotes, fetchData });
  };
  const deleteItemFromSchedule = async (itemToDelete) => {
    await apiService.deleteItemFromSchedule({ itemToDelete, currentData, folderViewNum, fetchData });
    await fetchItemsByFolder();
  };
  const getUsers = async (setUsers) => {
    await apiService.getUsers({ setUsers });
  };
  // functions
  const handleModal = () => {
    setShowModal(!showModal);
  }
  const ModalClose = () => {
    setItem([])
    setAddedItems([])
    setState('')
    setShowModal(false)
    resetAll()
    setFile('')
    setStartDate(null)
    setEndDate(null)
    setStartTime('')
    setEndTime('')
    setError('')
    setModalState('')
    setPreviewUrl(null)
    setType('')
    setVideoURL('')
    setItemSetToMove('')
    setAdminUserState('')
  }
  const handleFileNameChange = (event) => {
    setFileName(event.target.value);
  };
  const handlePhotoUrlChange = (event) => {
    setPhotoUrl(event.target.value);
  };
  const handleVideoUrlChange = (event) =>{
    setVideoURL(event.target.value)
  }
  const handleTagChange = (event) => {
    setTag(event.target.value);
  };
  const handleRunTimeChange = (event) => {
    setRunTime(event.target.value);
  };
  const handleContentChange = (event) => {
    setContent(event.target.value);
  };
  const handleExpiryChange = (event) => {
    setExpiry(event.target.value);
  };
  const handleSelectedCategoryChange = (event) => {
    setCurrentData(event.target.value);
  };
  const handleDrop = async (event) => {
    event.preventDefault();
    setPreviewUrl(null)
    const file = event.dataTransfer.files[0];
    setFile(file);

    try {
      const mediaInfoInstance = await mediaInfoFactory({ locateFile: () => '/MediaInfoModule.wasm' });
      setMediaInfo(mediaInfoInstance);

      const fileSize = file.size;
      const readChunk = async (chunkSize, offset) => {
        const buffer = await file.slice(offset, offset + chunkSize).arrayBuffer();
        return new Uint8Array(buffer);
      };

      const result = await mediaInfoInstance.analyzeData(fileSize, readChunk);
      setResult(result);

      handleFileNameChange({ target: { value: file.name } });
      handleSelectedCategoryChange({ target: { value: currentData } });
      handlePhotoUrlChange({ target: { value: file.name } });
      handleVideoUrlChange({ target: { value: file.name } });

      if (result) {
        const videoInfo = result.media.track.find((track) => track['@type'] === 'Video');
        if (videoInfo) {
          handleRunTimeChange({ target: { value: formatDuration(videoInfo.Duration) } });
        } else {
          handleRunTimeChange({ target: { value: '0:00' } });
        }
      }
    } catch (error) {
      console.error('Error analyzing file:', error);
    }
    
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };
  const formatDuration = (duration) => {
    const seconds = Math.floor(duration);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  const resetAll = () => {
    setFileName('')
    setContent('')
    setTag('')
    setPhotoUrl('')
    setContent('')
    setRunTime('')
    setExpiry('')
    setType('')
    setVideoURL('')
  }

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (currentData === 'Playlist' || currentData === 'Ads') {
        return (
          item.FileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.Type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.Tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.Run_Time?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.Content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.Expiry?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else if (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') {
        return (
          item.folder?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.startDate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.endDate?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        return false; // Ensure that the filter function always returns a boolean
      }
    });

  }, [searchTerm, data, currentData]);
  const handleAddItem = async (modalItem, id) => {
    await addItemToSchedule(modalItem, id);
    console.log('modalitem ===', modalItem);
    
    setAddedItems(prevItems => [...prevItems, id]);  // Update the added items state
    await fetchItemsByFolder();
  };
  const modalFilteredData = useMemo(() => {
    return modalData.filter(item =>
      !addedItems.includes(item._id) &&  // Exclude added items
      (
        item.FileName?.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
        item.Type?.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
        item.Tag?.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
        item.Run_Time?.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
        item.Content?.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
        item.Expiry?.toLowerCase().includes(modalSearchTerm.toLowerCase())
      )
    );
  }, [modalSearchTerm, modalData, addedItems]);
  const handleDataSelection = async (e) => {
    setCurrentData(e.target.value);
    setCurrentData(e.target.value);
    setScheduleEditMode('off');
    await fetchItemsByFolder();
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('username');
    localStorage.removeItem('company');
    window.location.href = '/';
  }
  const handleEditNote = (noteId, text) => {
    setEditingNoteId(noteId);
    setEditingNoteText(text);
  };
  const handleUpdateNoteText = (event) => {
    setEditingNoteText(event.target.value);
  };
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
  const itemExists = (fileName) => {
    return item.some(item => item.FileName === fileName);
  };
  const matchAndOrderScheduledData = useCallback(() => {
    if (!compareData || !compareData.items) return [];
    const compareIDs = compareData.items.map(item => item._id);
    return compareIDs.map(id => scheduledData.find(scheduledItem => scheduledItem._id === id)).filter(item => item !== undefined);
  }, [compareData, scheduledData]);
  const orderedScheduledData = useMemo(() => matchAndOrderScheduledData(), [matchAndOrderScheduledData]);
  const handleUrlClick = (videoUrl, photoUrl) => {
    data.Type === 'Video' ?  setCurrentViewUrl(videoUrl) : setCurrentViewUrl(photoUrl)
    setShowModal(true);
    setVideoKey(uuidv4());
  };
  
  const isVideo = /\.(mp4|webm|ogg)$/i.test(currentViewUrl);
  const filteredUsers = users.filter(user => user.username !== username);
  const handleUserSelect = (event) => {
    const userId = event.target.value;
    const user = filteredUsers.find(user => user.id === userId);
    setSelectedUser(user);
  };

  const generateIntervals = (startTimeString) => {
    if (!startTimeString) return [];
    
    const intervals = [];
    let [startHours, startMinutes] = startTimeString.split(':').map(Number);

    for (let i = 0; i < 24; i += objectCount) {
        intervals.push(formatTimeSchedule(startHours, startMinutes));
        startHours = (startHours + 6) % 24;
    }

    return intervals;
};

  const formatTimeSchedule = (hours, minutes = 0) => {
    const period = hours >= 12 ? 'PM' : 'AM';
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes < 10 ? '0' : ''}${minutes} ${period}`;
  };


  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    if (catData === 'viewfile' && fileName) {
      fetchFileDetails(fileName);
    }
  }, [catData, fileName]);
  useEffect(() => {
    if (modalSearchTerm.length > 0) {
      fetchDataModals();
    }
  }, [modalSearchTerm, fetchDataModals]);

  useEffect(() => {
    if (catData === 'requests') {
      fetchRequests();
    }
  }, [catData]); // Only run the effect when catData changes

  useEffect(() => {
    if (['Playlist', 'Ads'].includes(currentData)) {
      setIdentifier(fileName);
    } else if (['Playlist Schedule', 'Ads Schedule'].includes(currentData)) {
      setIdentifier(folderViewNum); // Assuming `folder` is another state or prop
    }
  }, [currentData, fileName, folderViewNum]);

  console.log("scheduleEditMode =====", scheduleEditMode);
  
  
  useEffect(() => {
    getUsers(setUsers);
  }, []);
  
  return (
    <main className="table">
      <section className="table_header">
        <div className="data-display-container">
          <SwitchSections currentData={currentData} handleDataSelection={handleDataSelection} />
        </div>
        <div className="header-controls">
          {(currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? '' : <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
          <HeaderButtons currentData={currentData} isAdmin={isAdmin} handleModal={handleModal} setMode={setMode} setCatData={setCatData} handleLogout={handleLogout} catData={catData} data={data.find(d => d.folder === folderViewNum)} setShowModal={setShowModal} setfolderViewNum={setfolderViewNum} setScheduleEditMode={setScheduleEditMode} scheduleEditMode={scheduleEditMode}/>
        </div>
      </section>
      <DataTable currentData={currentData} isAdmin={isAdmin} setMode={setMode} handleUrlClick={handleUrlClick} filteredData={filteredData} setShowModal={setShowModal} setFileName={setFileName} setNotes={setNotes} setCatData={setCatData} setfolderViewNum={setfolderViewNum} formatDate={formatDate} formatTime={formatTime} catData={catData} setScheduleEditMode={setScheduleEditMode} scheduleEditMode={scheduleEditMode} scheduledData={scheduledData} setCompareData={setCompareData} orderedScheduledData={orderedScheduledData} generateIntervals={generateIntervals} formatTimeSchedule={formatTimeSchedule}/>
      <Modal style={mode === 'viewvideo' ? { height: '100%' } : {}} isOpen={showModal} onClose={() => { ModalClose(); if (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') { setModalSearchTerm(''); } }} maxWidth={catData === 'alterTable' ? '1000px' : '600px'}>
        {mode === 'viewvideo' && <VideoViewer key={videoKey} currentViewUrl={currentViewUrl} isVideo={isVideo}/>}
        {mode === 'configureData' &&
          <>
            <form onSubmit={handleSubmit}>
              <FormTitle catData={catData} currentData={currentData}/>
              <FormViewFile catData={catData} isAdmin={isAdmin} fileDetails={fileDetails} />
              <FormAddDataBody catData={catData} currentData={currentData} handleFileNameChange={handleFileNameChange} handleSelectedCategoryChange={handleSelectedCategoryChange} handleRunTimeChange={handleRunTimeChange} tag={tag} handleTagChange={handleTagChange} content={content} handleContentChange={handleContentChange} expiry={expiry} handleExpiryChange={handleExpiryChange} fileName={fileName} photoUrl={photoUrl} type={type} runTime={runTime} handleDrop={handleDrop} handleDragOver={handleDragOver} file={file} result={result} isAdmin={isAdmin} previewUrl={previewUrl} setPreviewUrl={setPreviewUrl} setType={setType}/>
              <FormAllDataBody catData={catData} currentData={currentData} handleSelectedCategoryChange={handleSelectedCategoryChange} fileName={fileName} handleFileNameChange={handleFileNameChange} ModalClose={ModalClose} />
              <FormExpiry catData={catData} expiry={expiry} handleExpiryChange={handleExpiryChange} />
              <FormButton catData={catData} identifier={identifier} photoUrl={photoUrl} type={type} runTime={runTime} content={content} handleSubmit={handleSubmit} />
            </form>
            <NotesForm catData={catData} data={data.find(d => d.folder === folderViewNum)} identifier={identifier} notes={notes} editingNoteId={editingNoteId} editingNoteText={editingNoteText} handleUpdateNoteText={handleUpdateNoteText} handleDoneEditNote={handleDoneEditNote} handleEditNote={handleEditNote} handleDeleteNote={handleDeleteNote} handleAddNoteSubmit={handleAddNoteSubmit} newNote={newNote} setNewNote={setNewNote} username={username} setCatData={setCatData} isAdmin={isAdmin} currentData={currentData} />
            <SetCreation catData={catData} setShowModal={setShowModal} handleSubmitSetModal={handleSubmitSetModal} modalSearchTerm={modalSearchTerm} setModalSearchTerm={setModalSearchTerm} modalFilteredData={modalFilteredData} itemExists={itemExists} handleAddItem={handleAddItem} item={item} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} startTime={startTime} setStartTime={setStartTime}  endTime={endTime} setEndTime={setEndTime} error={error} setError={setError} fetchData={fetchData}/>
            <ViewList currentData={currentData} catData={catData} data={data.find(d => d.folder === folderViewNum)} modalSearchTerm={modalSearchTerm} setModalSearchTerm={setModalSearchTerm} modalFilteredData={modalFilteredData} itemExists={itemExists} modalState={modalState} setModalState={setModalState} deleteItemFromSchedule={deleteItemFromSchedule} addItemToSchedule={addItemToSchedule}   moveItemPlaylistSchedule={(itemToMove, oldIndex, newIndex) => moveItemPlaylistSchedule(itemToMove, oldIndex, newIndex)} handleAddItem={handleAddItem}fetchData={fetchData} formatDate={formatDate} formatTime={formatTime} isEditingDuration={isEditingDuration} isEditingTime={isEditingTime} setNewStartDate={setNewStartDate} setNewEndDate={setNewEndDate} setNewStartTime={setNewStartTime} setNewEndTime={setNewEndTime} handleSave={handleSave} newStartDate={newStartDate} newEndDate={newEndDate} setIsEditingDuration={setIsEditingDuration} newStartTime={newStartTime} newEndTime={newEndTime} setIsEditingTime={setIsEditingTime} isAdmin={isAdmin} itemSetToMove={itemSetToMove} setItemSetToMove={setItemSetToMove} confirmMove={confirmMove} setConfirmMove={setConfirmMove}  setSecondaryModal={setSecondaryModal} secondaryModal={secondaryModal} setMoveIndex={setMoveIndex} moveIndex={moveIndex}/>
            
            <RequestDetails 
            catData={catData} 
            state={state} 
            setState={setState} 
            handleAddRequest={handleAddRequest} 
            newRequestDescription={newRequestDescription} 
            setNewRequestDescription={setNewRequestDescription} 
            error={requestError} 
            requests={requests} 
            handleToggleStatus={handleToggleStatus} 
            handleSaveSection={handleSaveSection} 
            isAdmin={isAdmin} 
            username={username} 
            users={users}
            />

            <Users catData={catData} adminUserState={adminUserState} setAdminUserState={setAdminUserState} selectedUser={selectedUser} handleUserSelect={handleUserSelect} filteredUsers={filteredUsers}/>
          </>
        }
      </Modal>
    </main>
  );
}
export default DataPage;

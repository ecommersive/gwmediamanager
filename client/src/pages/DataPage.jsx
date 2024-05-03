import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../Components/Modal';
import VideoViewer from '../Components/Videoviewer';
import SearchInput from '../Components/SearchInput';
import HeaderButtons from '../Components/HeaderButtons';
import DataTable from '../Components/DataTable';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/datapage.css';
import axios from 'axios';
const DataPage = () => {
  const [mode, setMode] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [catData, setCatData] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [videoKey, setVideoKey] = useState(uuidv4());
  const [data, setData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentData, setCurrentData] = useState('Playlist');
  const [fileName, setFileName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [type, setType] = useState('Video');
  const [tag, setTag] = useState('');
  const [runTime, setRunTime] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [expiry, setExpiry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Playlist');
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  //set of playlist and ads states
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [modalData, setModalData] = useState([]);
  const [item, setItem] = useState([]);
  //notes
  const [notes, setNotes] = useState('');
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');


  const handleVideoClick = (videoUrl) => {
    setCurrentVideoUrl(videoUrl);
    setShowModal(true);
    setVideoKey(uuidv4());
    console.log('embedUrl', videoUrl);
  };


  const handleModal = () => {
    setShowModal(!showModal);
  }
  const ModalClose = () => {
    setShowModal(false);
  }
  const fetchData = useCallback(async () => {
    let baseUrl = process.env.REACT_APP_API_URL
    let url = `${baseUrl}/`;
    switch (currentData) {
      case 'Playlist':
        url += 'playlists';
        break;
      case 'Ads':
        url += 'ads';
        break;
      case 'Archived':
        url += 'archived';
        break;
      case 'Playlist Schedule':
        url += 'playlistSchedule';
        break;
      case 'Ads Schedule':
        url += 'adsSchedule';
        break;
      default:
        console.error('Unexpected data type');
        return;
    }
    console.log('currentData = ', currentData);

    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  }, [currentData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  //create useEffect to console log catData
  useEffect(() => {
    console.log('catData:', catData);
  }, [catData]);
  
  const handleFileNameChange = (event) => {
    setFileName(event.target.value);
  };
  const handlePhotoUrlChange = (event) => {
    setPhotoUrl(event.target.value);
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
  };

  const handleTagChange = (event) => {
    setTag(event.target.value);
  };

  const handleRunTimeChange = (event) => {
    setRunTime(event.target.value);
  };

  const handleContentChange = (event) => {
    setContent(event.target.value);
  };

  const handleVideoUrlChange = (event) => {
    setVideoUrl(event.target.value);
  };

  const handleExpiryChange = (event) => {
    setExpiry(event.target.value);
  };

  const handleSelectedCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (catData === 'addData') {
      const formData = {
        FileName: fileName,
        PhotoUrl: photoUrl,
        Type: type,
        Tag: tag,
        Run_Time: runTime,
        Content: content,
        videoUrl: videoUrl,
        Expiry: expiry
      };

      if (notes.length > 0) {
        formData.notes = notes.map(noteText => ({
          text: noteText,
          addedOn: new Date()
        }));
      }

      const endpoint = selectedCategory === "Playlist" ? "uploadPlaylist" : "uploadAds";
      let baseUrl = process.env.REACT_APP_API_URL;

      try {
        const response = await axios.post(`${baseUrl}/${endpoint}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 201) {
          setShowModal(false);
          fetchData();
          console.log(`${selectedCategory} item added:`, response.data);
        } else {
          throw new Error(`Failed to add ${selectedCategory} item`);
        }
      } catch (error) {
        console.log('An error occurred. Please try again.', error);
      }
    } else if (catData === 'ExtendExpiry') {
      const encodedFileName = encodeURIComponent(fileName);
      let baseUrl = process.env.REACT_APP_API_URL;
      console.log("Handle Set Expiry = ", baseUrl);
      try {
        const response = await axios.post(`${baseUrl}/setExpiry/${selectedCategory.toLowerCase()}/${encodedFileName}`, {
          newExpiryDate: expiry
        }, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          console.log('Expiry date set successfully');
          fetchData();
          setShowModal(false);
        } else {
          throw new Error(`Failed to set expiry date for ${selectedCategory} item`);
        }
      } catch (error) {
        console.log('An error occurred. Please try again.', error);
      }
    } else if (catData === 'DeleteData') {
      const encodedFileName = encodeURIComponent(fileName);
      let baseUrl = process.env.REACT_APP_API_URL;
      console.log("Handle Delete = ", baseUrl);
      try {
        const response = await axios.delete(`${baseUrl}/deleteData/${selectedCategory.toLowerCase()}/${encodedFileName}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          console.log('Deletion successful');
          fetchData();
          setShowModal(false);
        } else {
          throw new Error(`Failed to delete ${selectedCategory} item`);
        }
      } catch (error) {
        console.log('An error occurred. Please try again.', error);
      }
    }
  };


  //regular search
  const filteredData = useMemo(() => {
    return data.filter(item =>
      item.FileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Run_Time.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.videoUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.Expiry?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, data]);


  const fetchDataModals = async () => {
    let baseUrl = process.env.REACT_APP_API_URL;
    let playlistUrl = `${baseUrl}/playlists`;
    let adsUrl = `${baseUrl}/ads`;

    try {
      const playlistResponse = await fetch(playlistUrl);
      const adsResponse = await fetch(adsUrl);

      if (!playlistResponse.ok || !adsResponse.ok) {
        throw new Error(`HTTP error! Status: ${playlistResponse.status}, ${adsResponse.status}`);
      }

      const playlistData = await playlistResponse.json();
      const adsData = await adsResponse.json();

      setModalData([...playlistData, ...adsData]);
    } catch (error) {
      console.error(`Error fetching data from ${playlistUrl} and ${adsUrl}:`, error);
    }
  };

  const modalFilteredData = useMemo(() => {
    return modalData.filter(item =>
      item.FileName.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      item.Type.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      item.Tag?.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      item.Run_Time.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      item.Content.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      item.videoUrl.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      item.Expiry?.toLowerCase().includes(modalSearchTerm.toLowerCase())
    );
  }, [modalSearchTerm, modalData]);

  useEffect(() => {
    if (modalSearchTerm.length > 0) {
      fetchDataModals();
    }
  }, [modalSearchTerm]);

  const handleDataSelection = (e) => {
    setCurrentData(e.target.value);
    setSelectedCategory(e.target.value);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/');
  }

  useEffect(() => {
    const handleUnload = () => {
      if (location.pathname !== '/') {
        console.log('User is navigating away from DataPage.');
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [location]);

  const handleAddNoteSubmit = async (event, fileName) => {
    event.preventDefault();
    const noteToAdd = {
      text: newNote,
      addedOn: new Date()
    };

    let baseUrl = process.env.REACT_APP_API_URL;
    try {
      const encodedFileName = encodeURIComponent(fileName);
      const response = await axios.post(`${baseUrl}/notes/add/${selectedCategory.toLowerCase()}/${encodedFileName}`, noteToAdd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        setShowModal(false);
        setNewNote('');
        fetchData();
      } else {
        throw new Error('Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };
  const handleEditNote = (noteId, text) => {
    setEditingNoteId(noteId);
    setEditingNoteText(text);
  };

  const handleUpdateNoteText = (event) => {
    setEditingNoteText(event.target.value);
  };
  const handleDoneEditNote = async (noteIndex) => {
    if (editingNoteId === null || editingNoteText.trim() === '') {
      alert('You must provide updated note text.');
      return;
    }

    const baseUrl = process.env.REACT_APP_API_URL;
    try {
      const encodedFileName = encodeURIComponent(fileName);
      const response = await axios.put(`${baseUrl}/notes/update/${selectedCategory.toLowerCase()}/${encodedFileName}`, {
        noteIndex,
        updatedText: editingNoteText
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        console.log('Note updated successfully');
        const updatedNotes = [...notes];
        updatedNotes[noteIndex] = { ...updatedNotes[noteIndex], text: editingNoteText, addedOn: new Date() };
        setNotes(updatedNotes);
        setEditingNoteId(null);
        setEditingNoteText('');
        fetchData();
      } else {
        throw new Error('Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error.response ? error.response.data : error);
    }
  };

  const handleDeleteNote = async (noteIndex, fileName) => {
    const baseUrl = process.env.REACT_APP_API_URL;
    const encodedFileName = encodeURIComponent(fileName);
    const category = selectedCategory.toLowerCase();
    const url = `${baseUrl}/notes/delete/${category}/${encodedFileName}/${noteIndex}`;

    try {
      const response = await axios.delete(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        console.log('Note deleted successfully');
        setNotes(notes.filter((_, index) => index !== noteIndex));
        fetchData();
      } else {
        throw new Error('Failed to delete the note');
      }
    } catch (error) {
      console.error('Error deleting note:', error.response ? error.response.data : error);
    }
  };


  const handleSubmitSetModal = (event) => {
    event.preventDefault();
    if (currentData === 'Playlist Schedule') {
      console.log('playlist schedule has been created');
    } else if (currentData === 'Ads Schedule') {
      console.log('ads schedule has been created');
    }

  }

  useEffect(() => {
    if (item.length > 0) {
      console.log('item updated:', item);
    }
  }, [item]);

  function handleAddToSet(event, fileName) {
    event.preventDefault();

    setItem(prevItem => [...prevItem, { FileName: fileName }]);
    console.log('item', item);
  }

  const itemExists = (fileName) => {
    return item.some(item => item.FileName === fileName);
  };

  let startDate;
  let endDate;
  let startTime;

  return (
    <main className="table">
      <section className="table_header">
        <div className="data-display-container">
          <h1>{currentData}</h1>
          <select value={currentData} onChange={handleDataSelection} className="data-selector">
            <option value="Playlist">Playlist</option>
            <option value="Ads">Ads</option>
            <option value="Archived">Archived</option>
            <option value="Playlist Schedule">Playlist Schedule</option>
            <option value="Ads Schedule">Ads Schedule</option>
          </select>
        </div>
        <div className="header-controls">
          <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
          <HeaderButtons currentData={currentData} isAdmin={isAdmin} handleModal={handleModal} setMode={setMode} setCatData={setCatData} handleLogout={handleLogout} />
        </div>
      </section>
      <DataTable currentData={currentData} isAdmin={isAdmin} searchTerm={searchTerm} handleVideoClick={handleVideoClick} filteredData={filteredData} setShowModal={setShowModal} setFileName={setFileName} setNotes={setNotes} setMode={setMode} setCatData={setCatData} />
      <Modal style={mode === 'viewvideo' ? { height: '100%' } : {}} isOpen={showModal} onClose={() => {ModalClose(); if (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') {setModalSearchTerm('');setItem([]);}}}>
        {mode === 'viewvideo' && <VideoViewer videoUrl={currentVideoUrl} key={videoKey} />}
        {mode === 'configureData' &&
          <>
            <form onSubmit={handleSubmit}>
              <h2>
                {
                  catData === 'addData' ?
                    'Add New Data' :
                    catData === 'ExtendExpiry' ?
                      'Extend Expiry Date' :
                      catData === 'DeleteData' ?
                        'Delete Data' :
                        catData === 'viewNotes' ?
                          'View Notes' :
                          catData === 'AddNote' ?
                            'Add Note' :
                            catData === 'UpdateNote' ?
                              'Update Note' :
                              catData === 'DeleteNote' ?
                                'Delete Note' :
                                catData === 'playlistSchedule' ?
                                  'Create Playlist Set' :
                                  catData === 'adsSchedule' ?
                                    'Create Ads Set' :
                                    ''
                }
              </h2>
              {
                <>
                  {(catData === 'addData' || catData === 'ExtendExpiry' || catData === 'DeleteData') && (
                    <>
                      <label>
                        Category:
                        <select value={selectedCategory} onChange={handleSelectedCategoryChange}>
                          <option value="Playlist">Playlist</option>
                          <option value="Ads">Ads</option>
                          {(catData === 'ExtendExpiry' || catData === 'DeleteData') && <option value="Archived">Archived</option>}
                        </select>
                      </label>
                      <br />
                    </>
                  )}
                </>
              }
              {
                (catData === 'addData' || catData === 'ExtendExpiry' || catData === 'DeleteData') && (
                  <>
                    <label>
                      File Name:
                      <input type="text" name="fileName" value={fileName} onChange={handleFileNameChange} required/>
                    </label>
                    <br />
                  </>
                )
              }
              {
                catData === 'addData' && (
                  <>
                    <label>
                      File Type:
                      <select name="type" value={type} onChange={handleTypeChange}>
                        <option value="Video">Video</option>
                        <option value="PNG">PNG</option>
                        <option value="JPG">JPG</option>
                      </select>
                    </label>
                    <br />
                    <label>
                      Tag:
                      <input name="tag" value={tag} onChange={handleTagChange} />
                    </label>
                    <br />
                    <label>
                      Photo URL:
                      <input type="text" name="photoUrl" value={photoUrl} onChange={handlePhotoUrlChange} required/>
                    </label>
                    <br />
                    <label>
                      Run Time:
                      <input type="text" name="runTime" value={runTime} onChange={handleRunTimeChange} required/>
                    </label>
                    <br />
                    <label>
                      Type:
                      <input type="text" name="content" value={content} onChange={handleContentChange} required/>
                    </label>
                    <br />
                    <label>
                      Video URL:
                      <input type="text" name="videoUrl" value={videoUrl} onChange={handleVideoUrlChange} required/>
                    </label>
                    <br />
                  </>
                )}
              {
                (catData === 'addData' || catData === 'ExtendExpiry') && (
                  <>
                    <label>
                      {catData === 'addData' ? 'Expiry Date:' : catData === 'ExtendExpiry' ? 'New Expiry Date:' : ''}
                      <input type="date" name="expiryDate" value={expiry} onChange={handleExpiryChange} />
                    </label>
                    <br />
                    <br />
                  </>
                )
              }

              <button type="submit" 
              disabled={
                catData === 'addData' ? !fileName || !photoUrl || !type || !runTime || !content || !videoUrl
                : (catData === 'DeleteData' || catData === 'ExtendExpiry') ? !fileName
                : null
              }>
                {catData === 'addData' ? 'Add Data' : catData === 'ExtendExpiry' ? 'Extend Expiry Date' : catData === 'DeleteData' ? 'Delete Data' : ''}
              </button>
            </form>
            <>
              {(catData === 'viewNotes' || catData === 'AddNote' || catData === 'UpdateNote' || catData === 'DeleteNote') && (
                <>
                  <p>Filename: {fileName}</p>
                  <br />
                  <p>Notes:</p>
                  <ul>
                    {Array.isArray(notes) && notes.length > 0 ? (
                      (catData === 'UpdateNote' || catData === 'AddNote' || catData === 'DeleteNote' || catData === 'viewNotes') && notes.map((note, index) => (
                        <li key={index}>
                          {catData === 'UpdateNote' && editingNoteId === index ? (
                            <>
                              <input type="text" value={editingNoteText} onChange={handleUpdateNoteText} />
                              <button onClick={() => handleDoneEditNote(index)}>Done</button>
                            </>
                          ) : (
                            <>
                              {note.text} - <small>Added on {new Date(note.addedOn).toLocaleDateString()}</small>
                              {catData === 'UpdateNote' && <button onClick={() => handleEditNote(index, note.text)}>Edit</button>}
                              {catData === 'DeleteNote' && <button onClick={() => handleDeleteNote(index, fileName)}>Delete</button>}
                            </>
                          )}
                        </li>
                      ))
                    ) : (
                      <p>No notes found for this file.</p>
                    )}
                  </ul>
                  <br />
                  {catData === 'AddNote' && (
                    <>
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Enter note here..."
                        style={{ width: '100%', height: '100px', resize: 'none' }}
                      />
                      <br />
                      <br />
                      <button type="submit" onClick={(e) => handleAddNoteSubmit(e, fileName)}>Submit Note</button>
                    </>
                  )}
                  <br />
                </>
              )}
            </>

            {
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
                    <input type="date" name="startDate" onChange={(event) => {
                      startDate = new Date(event.target.value);
                      const endDateInput = document.querySelector('input[name="endDate"]');
                      endDateInput.min = startDate.toISOString().split('T')[0];
                    }} />
                  </label>
                  <label>
                    End Date:
                    <input type="date" name="endDate" min={startDate ? startDate.toISOString().split('T')[0] : ''} />
                  </label>
                </div>
                <br />
                <div className="time-inputs">
                  <label>
                    Start Time:
                    <input type="time" name="startTime" onChange={(event) => {
                      startTime = new Date(startDate.toISOString().split('T')[0] + ' ' + event.target.value);
                      const endTimeInput = document.querySelector('input[name="endTime"]');
                      if (startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0]) {
                        endTimeInput.min = startTime.toTimeString().slice(0, 5);
                      }
                    }} />
                  </label>
                  <label>
                    End Time:
                    <input type="time" name="endTime" min={startTime && startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0] ? startTime.toTimeString().slice(0, 5) : ''} />
                  </label>
                </div>
                <br />
                <button type="submit" onClick={(event) => { handleSubmitSetModal(event); setShowModal(false); setModalSearchTerm(''); setItem([]); }}>Submit</button>
              </>
            }
          </>
        }
      </Modal>
    </main>
  );
}
export default DataPage;

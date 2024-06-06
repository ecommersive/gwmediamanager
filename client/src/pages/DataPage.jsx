import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../Components/Modal';
import SearchInput from '../Components/SearchInput';
import HeaderButtons from '../Components/HeaderButtons';
import DataTable from '../Components/DataTable';
import FormTitle from '../Components/FormMainComponents/FormTitle';
import FormAddDataBody from '../Components/FormMainComponents/FormAddDataBody';
import FormAllDataBody from '../Components/FormMainComponents/FormAllDataBody';
import FormExpiry from '../Components/FormMainComponents/FormExpiry';
import FormButton from '../Components/FormMainComponents/FormButton';
import NotesForm from '../Components/NotesFormComponent/NotesForm';
import SetCreation from '../Components/SetCreationComponent/SetCreation';
import SwitchSections from '../Components/SwitchSections';
import { useNavigate } from 'react-router-dom';
import '../styles/datapage.css';
import axios from 'axios';
import ViewList from '../Components/ViewTimeModal/ViewList';
import RequestDetails from '../Components/RequestModal/RequestDetails';
import mediaInfoFactory from 'mediainfo.js';

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
  const [photoUrl, setPhotoUrl] = useState('');
  const [type, setType] = useState('Video');
  const [tag, setTag] = useState('');
  const [runTime, setRunTime] = useState('');
  const [content, setContent] = useState('');
  const [expiry, setExpiry] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [modalData, setModalData] = useState([]);
  const [item, setItem] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [state, setState] = useState('');
  const [requests, setRequests] = useState([]);
  const [file, setFile] = useState(null);
  const [mediaInfo,setMediaInfo] = useState(null);
  const [result, setResult] = useState(null)
  
  const handleModal = () => {
    setShowModal(!showModal);
  }
  const ModalClose = () => {
    setItem([]);
    setState('');
    setShowModal(false);
    resetAll()
    setFile('')
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

  const handleExpiryChange = (event) => {
    setExpiry(event.target.value);
  };
  const handleSelectedCategoryChange = (event) => {
    setCurrentData(event.target.value);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
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
      console.log('result:', result);

      handleFileNameChange({ target: { value: file.name } });
      handleSelectedCategoryChange({ target: { value: currentData } });
      handlePhotoUrlChange({ target: { value: file.name } });

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
  const resetAll = () =>{
    setFileName('')
    setContent('')
    setTag('')
    setPhotoUrl('')
    setContent('')
    setRunTime('')
    setExpiry('')
  }
  const handleSubmit = async (event) => {
    event.preventDefault();
    let baseUrl = process.env.REACT_APP_API_URL;
    let logChange = ''
    if (catData === 'addData') {
      const formData = {
        FileName: fileName,
        PhotoUrl: photoUrl,
        Type: type,
        Tag: tag,
        Run_Time: runTime,
        Content: content,
        Expiry: expiry
      };
      if (notes.length > 0) {
        formData.notes = notes.map(noteText => ({
          text: noteText,
          addedOn: new Date()
        }));
      }
      const endpoint = currentData === "Playlist" ? "uploadPlaylist" : "uploadAds";
      try {
        const response = await axios.post(`${baseUrl}/${endpoint}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 201) {
          setShowModal(false);
          logChange = `${username} has added ${formData.FileName} into ${currentData === 'Playlist' ? ' the Content Pool' : currentData === 'Ads' ? 'Ads' : (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? currentData : ''}.`;
          fetchData();
          
        } else {
          throw new Error(`Failed to add ${currentData} item`);
        }
      } catch (error) {
        console.log('An error occurred. Please try again.', error);
      }
    } else if (catData === 'ExtendExpiry') {
      const encodedFileName = encodeURIComponent(fileName);
      try {
        const response = await axios.post(`${baseUrl}/setExpiry/${currentData.toLowerCase()}/${encodedFileName}`, {
          newExpiryDate: expiry
        }, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          logChange = `${username} has extended ${encodedFileName} in ${currentData === 'Playlist' ? ' the Content Pool' : currentData === 'Ads' ? 'Ads' : (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? currentData : ''} to ${expiry}.`;
          console.log('Expiry date set successfully');
          fetchData();
          setShowModal(false);
        } else {
          throw new Error(`Failed to set expiry date for ${currentData} item`);
        }
      } catch (error) {
        console.log('An error occurred. Please try again.', error);
      }
    } else if (catData === 'DeleteData') {
      const encodedFileName = encodeURIComponent(fileName);
      try {
        const response = await axios.delete(`${baseUrl}/deleteData/${currentData.toLowerCase()}/${encodedFileName}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          logChange = `${username} has deleted ${encodedFileName} in ${currentData === 'Playlist' ? ' the Content Pool' : currentData === 'Ads' ? 'Ads' : (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? currentData : ''}.`;
          console.log('Deletion successful');
          fetchData();
          setShowModal(false);
        } else {
          throw new Error(`Failed to delete ${currentData} item`);
        }
      } catch (error) {
        console.log('An error occurred. Please try again.', error);
      }
    }
    if (logChange) {
      try {
        await axios.post(`${baseUrl}/changelog`, { user:username, message: logChange }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.log('Failed to log change:', error);
      }
    }
    resetAll()
    setFile('')
  };
  const filteredData = useMemo(() => {
    
      return data.filter(item => {
        if(currentData === 'Playlist' || currentData === 'Ads'){
          return (
            item.FileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.Type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.Tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.Run_Time?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.Content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.Expiry?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }else if(currentData === 'Playlist Schedule' || currentData === 'Ads Schedule'){
          return (
            item.folder?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.startDate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.endDate?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }else {
          return false; // Ensure that the filter function always returns a boolean
        }
      });
    
  }, [searchTerm, data, currentData]);
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
      item.FileName?.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      item.Type?.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      item.Tag?.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      item.Run_Time?.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      item.Content?.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
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
    setCurrentData(e.target.value);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/');
  }
  //finished handleAddNoteSubmit
  const handleAddNoteSubmit = async (event, fileName) => {
    event.preventDefault();
    const noteToAdd = {
      text: newNote,
      addedOn: new Date(),
      user:username
    };
    let baseUrl = process.env.REACT_APP_API_URL;
    try {
      const encodedFileName = encodeURIComponent(fileName);
      const endpoint = `${baseUrl}/notes/add/${currentData.toLowerCase()}/${encodedFileName}`;
      const response = await axios.post(endpoint, noteToAdd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200) {
        setNotes(prevNotes => [...prevNotes, noteToAdd]);
        fetchData();
        const logMessage = `${username} has added a comment saying "${noteToAdd.text}" in ${currentData === 'Playlist' ? ' the Content Pool' : currentData === 'Ads' ? 'Ads' : (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? currentData : ''} to ${fileName}.`;
        try {
          await axios.post(`${baseUrl}/changelog`, { user:username, message: logMessage }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.log('Failed to log change:', error);
        }
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
  //finished handleDoneEditNote
  const handleDoneEditNote = async (noteIndex, fileName) => {
    if (editingNoteId === null || editingNoteText.trim() === '') {
      alert('You must provide updated note text.');
      return;
    }
    const baseUrl = process.env.REACT_APP_API_URL;
    try {
      const encodedFileName = encodeURIComponent(fileName);
      const oldComment = notes[noteIndex].text;
      const response = await axios.put(`${baseUrl}/notes/update/${currentData.toLowerCase()}/${encodedFileName}`, {
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
        const logMessage = `${username} has updated a comment: "${oldComment}" to "${editingNoteText}" in ${currentData === 'Playlist' ? ' the Content Pool' : currentData === 'Ads' ? 'Ads' : (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? currentData : ''} for ${fileName}.`;
        try {
          await axios.post(`${baseUrl}/changelog`, {user: username,message: logMessage }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.log('Failed to log change:', error);
        }
      } else {
        throw new Error('Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error.response ? error.response.data : error);
    }
  };
  //finished handleDeleteNote
  const handleDeleteNote = async (noteIndex, fileName) => {
    const baseUrl = process.env.REACT_APP_API_URL;
    const encodedFileName = encodeURIComponent(fileName);
    const category = currentData.toLowerCase();
    const url = `${baseUrl}/notes/delete/${category}/${encodedFileName}/${noteIndex}`;
    try {
      const oldComment = notes[noteIndex].text; // Capture the old comment
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
        const logMessage = `${username} has deleted comment: "${oldComment}" in ${currentData === 'Playlist' ? ' the Content Pool' : currentData === 'Ads' ? 'Ads' : (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? currentData : ''} for ${fileName}`;
        try {
          await axios.post(`${baseUrl}/changelog`, { user:username, message: logMessage }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.log('Failed to log change:', error);
        }
      } else {
        throw new Error('Failed to delete the note');
      }
    } catch (error) {
      console.error('Error deleting note:', error.response ? error.response.data : error);
    }
  };
  //finished handlesubmit
  const handleSubmitSetModal = async (event, startDate, endDate, item, startTime, endTime) => {
    event.preventDefault();
    let baseUrl = process.env.REACT_APP_API_URL;
    let url = `${baseUrl}/`;
    switch (currentData) {
      case 'Playlist Schedule':
        url += 'createPlaylistSchedule';
        break;
      case 'Ads Schedule':
        url += 'createAdsSchedule';
        break;
      default:
        return;
    }
  
    const requestData = {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      items: item, // Extract FileName
      startTime: startTime.startTime, // Ensure it's a string
      endTime: endTime.endTime         // Ensure it's a string
    };
  
  
    try {
      const response = await axios.post(url, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.status === 201 || response.status === 200) {
        console.log('Schedule created successfully');
        setData(prevData => [...prevData, response.data]);
        setfolderViewNum(response.data.folder);
        const itemsStringValues = requestData.items.map((i, index) => `${index + 1}.) ${i.FileName}`).join('\n');
        const logMessage = `${username} has created a new ${currentData === 'Playlist Schedule' ? 'Playlist Set' : 'Ads Set'}: \nStart Date: ${requestData.startDate}\nEnd Date: ${requestData.endDate}\nItems:\n${itemsStringValues}\nDuration of ${currentData === 'Playlist Schedule' ? 'Playlist Set' : 'Ads Set'}: ${requestData.startTime} - ${requestData.endTime}`;
        try {
          await axios.post(`${baseUrl}/changelog`, { user:username, message: logMessage }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.log('Failed to log change:', error);
        }
        setItem([])
        setShowModal(false);
      } else {
        throw new Error('Failed to create schedule');
      }
    } catch (error) {
      console.log('Error occurred. Please try again = ', error);
      setItem([])
    }
  };
  //finished addItemToSchedule
  const addItemToSchedule = async (itemToAdd) => {
    let baseUrl = process.env.REACT_APP_API_URL;
    let alterValue;
    if (currentData === 'Playlist Schedule') {
      alterValue = 'playlistSchedule';
    } else if (currentData === 'Ads Schedule') {
      alterValue = 'adsSchedule';
    }
  
    const url = `${baseUrl}/${alterValue}/${folderViewNum}/add`;
  
    try {
      const response = await axios.post(url, { item: itemToAdd }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        console.log('Item added successfully');
        fetchData();
        const logMessage = `${username} has added ${itemToAdd} to ${currentData} in ${currentData === 'Playlist Schedule' ? 'Playlist ' : 'Ads '} ${folderViewNum}`;
        try {
          await axios.post(`${baseUrl}/changelog`, { user:username, message: logMessage }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.log('Failed to log change:', error);
        }
      } else {
        throw new Error('Failed to add the item');
      }
    } catch (error) {
      console.error('Error adding item:', error.response ? error.response.data : error);
    }
  };
  //finished addItemToScheule
  const deleteItemFromSchedule = async (itemToDelete) => {
    let baseUrl = process.env.REACT_APP_API_URL;
    const encodedFileName = encodeURIComponent(itemToDelete);
    let alterValue;
    if (currentData === 'Playlist Schedule') {
      alterValue = 'playlistSchedule';
    } else if (currentData === 'Ads Schedule') {
      alterValue = 'adsSchedule';
    }
    const url = `${baseUrl}/${alterValue}/${folderViewNum}/${encodedFileName}`;
    try {
      const response = await axios.delete(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        console.log('Item deleted successfully');
        fetchData();
        const logMessage = `${username} has deleted ${itemToDelete} in ${currentData === 'Playlist Schedule' ? 'Playlist ' : 'Ads '} ${folderViewNum}.`
        try {
          await axios.post(`${baseUrl}/changelog`, { user:username, message: logMessage }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.log('Failed to log change:', error);
        }
      } else {
        throw new Error('Failed to delete the item');
      }
    } catch (error) {
      console.error('Error deleting item:', error.response ? error.response.data : error);
    }
  };
  //finished MoveItem
  const moveItemPlaylistSchedule = async (itemToMove, direction) => {
    let baseUrl = process.env.REACT_APP_API_URL;
    let alterValue;
    if (currentData === 'Playlist Schedule') {
      alterValue = 'playlistSchedule';
    } else if (currentData === 'Ads Schedule') {
      alterValue = 'adsSchedule';
    }

    const url = `${baseUrl}/${alterValue}/${folderViewNum}/move`;

  try {
    const response = await axios.post(url, { item: itemToMove, direction }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    if (response.status === 200) {
      console.log('Item moved successfully');
      fetchData();
      const logMessage = `${username} has moved ${itemToMove} in ${currentData === 'Playlist Schedule' ? 'Playlist ' : 'Ads '} ${folderViewNum} ${direction}.`
      try {
        await axios.post(`${baseUrl}/changelog`, { user:username, message: logMessage }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.log('Failed to log change:', error);
      }
    } else {
      throw new Error('Failed to move the item');
    }
  } catch (error) {
    console.error('Error moving item:', error.response ? error.response.data : error);
  }
  };
  

  //connect to endpoint to grab request data 
  const fetchRequests = async () => {
    let baseUrl = process.env.REACT_APP_API_URL;
    const url = `${baseUrl}/requests`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        setRequests(response.data);

      } else {
        throw new Error('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error.response ? error.response.data : error);
    }
  };
  //finished handleAddRequest
  const handleAddRequest = async () => {
      let baseUrl = process.env.REACT_APP_API_URL;
      const url = `${baseUrl}/request`;
  
      try {
        const response = await axios.post(url, {
          description: newRequestDescription,
          username
        }, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
  
        if (response.status === 201) {
          console.log('Request added successfully');
          setNewRequestDescription('');
          fetchRequests();
          const logMessage = `${username} has added a new request:\n${newRequestDescription}.`
          try {
            await axios.post(`${baseUrl}/changelog`, { user:username, message: logMessage }, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          } catch (error) {
            console.log('Failed to log change:', error);
          }
        } else {
          throw new Error('Failed to add request');
        }
      } catch (error) {
        console.error('Error adding request:', error.response ? error.response.data : error);
        setRequestError('An error occurred. Please try again.');
      }
  };
  //finished handleSaveSection
  const handleSaveSection = async () => {
    const baseUrl = process.env.REACT_APP_API_URL;
    const completedRequests = requests.filter(request => request.status === 'completed');
    const unfinishedRequests = requests.filter(request => request.status === 'unfinished');
    try {
        await Promise.all(completedRequests.map(async (request) => {
            const baseUrl = process.env.REACT_APP_API_URL;
            const url = `${baseUrl}/requests/${request._id}`;
            await axios.delete(url, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
        }));
        fetchRequests();
        const logMessage = `Following requests finished:\n${completedRequests.map(req => req.description).join('\n')}\nFollowing requests unfinished:\n${unfinishedRequests.map(req => req.description).join('\n')}`;
        try {
          await axios.post(`${baseUrl}/changelog`, { user:username, message: logMessage }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.log('Failed to log change:', error);
        }
      } catch (error) {
        console.error('Error deleting completed requests:', error);
    }
  };

  const handleToggleStatus = async (request) => {
    const newStatus = request.status === 'unfinished' ? 'completed' : 'unfinished';
    try {
        const baseUrl = process.env.REACT_APP_API_URL;
        const url = `${baseUrl}/requests/${request._id}/status`;
        await axios.put(url, { status: newStatus }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        fetchRequests();
    } catch (error) {
        console.error('Error updating request status:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [catData === 'requests']);
  
  
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
  return (
    <main className="table">
      <section className="table_header">
        <div className="data-display-container">
          <SwitchSections currentData={currentData} handleDataSelection={handleDataSelection}/>
        </div>
        <div className="header-controls">
          {(currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? '' : <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
          <HeaderButtons currentData={currentData} isAdmin={isAdmin} handleModal={handleModal} setMode={setMode} setCatData={setCatData} handleLogout={handleLogout} />
        </div>
      </section>
      <DataTable currentData={currentData} isAdmin={isAdmin} setMode={setMode} searchTerm={searchTerm}  filteredData={filteredData} setShowModal={setShowModal} setFileName={setFileName} setNotes={setNotes} setCatData={setCatData} setfolderViewNum={setfolderViewNum}/>
      <Modal isOpen={showModal} onClose={() => { ModalClose(); if (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') { setModalSearchTerm(''); } }}>
        {mode === 'configureData' &&
          <>
            <form onSubmit={handleSubmit}>
              <FormTitle catData={catData} />
              <FormAddDataBody catData={catData} currentData={currentData} handleFileNameChange={handleFileNameChange} handleSelectedCategoryChange={handleSelectedCategoryChange} handlePhotoUrlChange={handlePhotoUrlChange} handleRunTimeChange={handleRunTimeChange} tag={tag} handleTagChange={handleTagChange} content={content} handleContentChange={handleContentChange} expiry={expiry} handleExpiryChange={handleExpiryChange} fileName={fileName} photoUrl={photoUrl} type={type} runTime={runTime} handleDrop={handleDrop} handleDragOver={handleDragOver} file={file} result={result} />
              <FormAllDataBody catData={catData} currentData={currentData} handleSelectedCategoryChange={handleSelectedCategoryChange} fileName={fileName} handleFileNameChange={handleFileNameChange} />
              <FormExpiry catData={catData} expiry={expiry} handleExpiryChange={handleExpiryChange} />
              <FormButton catData={catData} fileName={fileName} photoUrl={photoUrl} type={type} runTime={runTime} content={content} handleSubmit={handleSubmit} />
            </form>
            <NotesForm catData={catData} fileName={fileName} notes={notes} editingNoteId={editingNoteId} editingNoteText={editingNoteText} handleUpdateNoteText={handleUpdateNoteText} handleDoneEditNote={handleDoneEditNote} handleEditNote={handleEditNote} handleDeleteNote={handleDeleteNote} handleAddNoteSubmit={handleAddNoteSubmit} newNote={newNote} setNewNote={setNewNote} username={username} setCatData={setCatData} isAdmin={isAdmin}/>
            <SetCreation catData={catData} setShowModal={setShowModal} handleSubmitSetModal={handleSubmitSetModal} modalSearchTerm={modalSearchTerm} setModalSearchTerm={setModalSearchTerm} modalFilteredData={modalFilteredData} itemExists={itemExists} handleAddToSet={handleAddToSet} item={item}/>
            <ViewList currentData={currentData} catData={catData} data={data.find(d => d.folder === folderViewNum)} modalSearchTerm={modalSearchTerm} setModalSearchTerm={setModalSearchTerm} modalFilteredData={modalFilteredData} itemExists={itemExists} state={state} setState={setState} deleteItemFromSchedule={deleteItemFromSchedule} addItemToSchedule={addItemToSchedule} moveItemPlaylistSchedule={moveItemPlaylistSchedule}/>
            <RequestDetails catData={catData} state={state} setState={setState} handleAddRequest={handleAddRequest} newRequestDescription={newRequestDescription} setNewRequestDescription={setNewRequestDescription} error={requestError} requests={requests} handleToggleStatus={handleToggleStatus} handleSaveSection={handleSaveSection} isAdmin={isAdmin} username={username}/>
          </>
        }
        
      </Modal>
    </main>
  );
}
export default DataPage;

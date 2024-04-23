import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../Components/Modal';
import VideoViewer from '../Components/Videoviewer';
import { v4 as uuidv4 } from 'uuid'; 
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/datapage.css';
import axios from 'axios';
const DataPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [notesModal, setNotesModal] = useState(false);
  const [videoKey, setVideoKey] = useState(uuidv4());
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExpiryForm, setShowExpiryForm] = useState(false);
  const [data, setData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentData, setCurrentData] = useState('Playlist');
  const [fileName, setFileName] = useState('');
  const [showDeleteForm, setShowDeleteForm] = useState(false); 
  const [photoUrl, setPhotoUrl] = useState('');
  const [type, setType] = useState('Video'); 
  const [tag, setTag] = useState('');
  const [runTime, setRunTime] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [expiry, setExpiry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Playlist'); 
  const [errorMessage, setErrorMessage] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [modalVidoeOpen, setModalVideoOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');


  //notes
  const [notes, setNotes] = useState('');  
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showUpdateNoteModal, setShowUpdateNoteModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState(''); 
  const [showDeleteNoteModal, setShowDeleteNoteModal] = useState(false);


  const handleVideoClick = (videoUrl) => {
    setCurrentVideoUrl(videoUrl);
    setModalVideoOpen(true);
    setVideoKey(uuidv4());
    console.log('embedUrl', videoUrl);
  };
  const closeModal = useCallback(() => {
    setModalVideoOpen(false);
    
  });

  const closeNotesModal = useCallback(() => {
    setNotesModal(false);
  })
  
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

  
  const handleSubmit = async (event) => {
    event.preventDefault();
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
        setShowAddForm(false);
        fetchData();
        console.log(`${selectedCategory} item added:`, response.data);
        setErrorMessage({});
      } else {
        throw new Error(`Failed to add ${selectedCategory} item`);
      }
    } catch (error) {
      console.error(`Error submitting ${selectedCategory} item:`, error.response ? error.response.data : error);
      setErrorMessage({ Upload: 'Failed to add data. Please try again.' });
    }
  };
  
  

  const handleDeleteSubmit = async (event) => {
    event.preventDefault();
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
        setShowDeleteForm(false); 
      } else {
        throw new Error(`Failed to delete ${selectedCategory} item`);
      }
    } catch (error) {
      console.error(`Error submitting delete:`, error.response ? error.response.data : error);
      setErrorMessage({ Delete: 'Failed to delete data. Please try again.' });
    }
  };

  const handleExtendExpiry = async (event) => {
    event.preventDefault();
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
        setShowExpiryForm(false); 
      } else {
        throw new Error(`Failed to set expiry date for ${selectedCategory} item`);
      }
    } catch (error) {
      console.error(`Error submitting set expiry for ${selectedCategory} item:`, error.response ? error.response.data : error);
      setErrorMessage({ SetExpiry: 'Failed to set expiry date. Please try again.' });
    }
  };
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


  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

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

  const handleDataSelection = (e) => {
    setCurrentData(e.target.value);
    setSelectedCategory(e.target.value);
  };

  

  const handleToggleAddForm = () => {
    setShowAddForm(!showAddForm);
    setShowDeleteForm(false); 
    setShowExpiryForm(false); 
  };

  const handleExpiryForm = () => {
    setShowExpiryForm(!showExpiryForm);
    setShowAddForm(false); 
    setShowDeleteForm(false); 
  };

  const handleToggleDeleteForm = () => {
    setShowDeleteForm(!showDeleteForm);
    setShowAddForm(false); 
    setShowExpiryForm(false); 
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
        console.log('Note added successfully');
        console.log('current data = ', currentData);
        console.log('selected category = ', selectedCategory);
        setShowAddNoteModal(false);
        setNewNote('');
        fetchData();
      } else {
        throw new Error('Failed to add note');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      setErrorMessage({ NoteAdd: 'Failed to add note. Please try again.' });
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
      setErrorMessage({ NoteUpdate: 'Failed to update note. Please try again.' });
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
        setNotes(notes.filter((_, index) => index !== noteIndex)); // Filter out the deleted note
        fetchData(); // Reload data or manually adjust the state to reflect changes
      } else {
        throw new Error('Failed to delete the note');
      }
    } catch (error) {
      console.error('Error deleting note:', error.response ? error.response.data : error);
    }
  };
  

  

  return (
    <main className="table">
      <section className="table_header">
      <div className="data-display-container">
        <h1>{currentData}</h1>
        <select value={currentData} onChange={handleDataSelection} className="data-selector">
          <option value="Playlist">Playlist</option>
          <option value="Ads">Ads</option>
          <option value="Archived">Archived</option>
        </select>
      </div>
        <div className="header-controls">
          <div className="input-group">
            <input
              type="search"
              placeholder="Search Data..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin && (<button onClick={handleToggleAddForm} className="add-button">Add Data</button>)}
          {isAdmin && (<button onClick={handleExpiryForm} className="add-button">Extend Expiry Data</button>)}
          {isAdmin && (<button onClick={handleToggleDeleteForm} className="add-button">Delete Data</button>)}
          <button onClick={handleLogout} className="add-button">Logout</button>
        </div>
      </section>
      <section className="table_body">
        <table>
          <thead>
            <tr>
              <th>#</th>
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
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map((item, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'transparent' : '#f0f0f0' }}>
                <td>{index + 1}</td>
                <td><img src={item.PhotoUrl} alt="Data" style={{ width: '50px', height: '50px' }} /></td>
                <td>{item.FileName}</td>
                <td>{item.Type}</td>
                <td>{item.Tag}</td>
                <td>{item.Run_Time}</td>
                <td>{item.Content}</td>
                <td><button onClick={() => handleVideoClick(item.videoUrl)}>View</button></td>
                <td>{item.Expiry}</td>
                {isAdmin && <td><button onClick={() => {setNotesModal(true); setFileName(item.FileName); setNotes(item.notes);}}>View</button></td>}
                {isAdmin && 
                <td>
                  <button onClick={() => { setShowAddNoteModal(true); setFileName(item.FileName); setNotes(item.notes) }}>Add Notes</button>
                  <br />
                  <button onClick={() => { setShowUpdateNoteModal(true); setFileName(item.FileName); setNotes(item.notes)}}>Update Notes</button>
                  <br />
                  <button onClick={() => { setShowDeleteNoteModal(true); setFileName(item.FileName); setNotes(item.notes)}}>Delete Notes</button>
                </td>
                }
              </tr>
            )) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>No data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
      
      <Modal style={{ height: '100%'}} isOpen={modalVidoeOpen} onClose={closeModal}>
        <VideoViewer videoUrl={currentVideoUrl} key={videoKey} />
      </Modal>
      <Modal isOpen={notesModal} onClose={closeNotesModal}>
        <h2>Notes</h2>
        {fileName && <p>Filename: {fileName}</p>}
        {Array.isArray(notes) && notes.length > 0 ? (
          <ul>
            {notes.map((note, index) => (
              <li key={index}>
                {note.text} - <small>Added on {new Date(note.addedOn).toLocaleDateString()}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No notes found for this file.</p>
        )}
      </Modal>

      <Modal isOpen={showAddForm} onClose={handleToggleAddForm}>
        <form onSubmit={handleSubmit}>
          <h2>Add New Data</h2>
          <label>
            Category:
            <select value={selectedCategory} onChange={handleSelectedCategoryChange}>
              <option value="Playlist">Playlist</option>
              <option value="Ads">Ads</option>
            </select>
          </label>
          <br />
          <label>
            File Name:
            <input type="text" name="fileName" value={fileName}onChange={handleFileNameChange} />
            {errorMessage.FileName && <div style={{ color: 'red' }}>{errorMessage.FileName}</div>}
          </label>
          <br />
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
            <input type="text" name="photoUrl" value={photoUrl} onChange={handlePhotoUrlChange} />
            {errorMessage.PhotoUrl && <div style={{ color: 'red' }}>{errorMessage.PhotoUrl}</div>}
          </label>
          <br />
          <label>
            Run Time:
            <input type="text" name="runTime" value={runTime} onChange={handleRunTimeChange} />
            {errorMessage.Run_Time && <div style={{ color: 'red' }}>{errorMessage.Run_Time}</div>}
          </label>
          <br />
          <label>
            Type:
            <input type="text" name="content" value={content} onChange={handleContentChange} />
            {errorMessage.Content && <div style={{ color: 'red' }}>{errorMessage.Content}</div>}
          </label>
          <br />
          <label>
            Video URL:
            <input type="text" name="videoUrl" value={videoUrl} onChange={handleVideoUrlChange} />
            {errorMessage.videoUrl && <div style={{ color: 'red' }}>{errorMessage.videoUrl}</div>}
          </label>
          <br />
          <label>
            Expiry Date:
            <input type="date" name="expiryDate" value={expiry} onChange={handleExpiryChange} />
          </label>
          
          <br />
          <br />
          <button type="submit">Add Data</button>
        </form>
      </Modal>
      <Modal isOpen={showExpiryForm} onClose={handleExpiryForm}>
        <form onSubmit={handleExtendExpiry}>
          <h2>Extend Expiry Date</h2>
          <label>
            Category:
            <select value={selectedCategory} onChange={handleSelectedCategoryChange}>
              <option value="Playlist">Playlist</option>
              <option value="Ads">Ads</option>
              <option value="Archived">Archived</option>
            </select>
          </label>
          <br />
          <label>
            New Expiry Date:
            <input type="date" name="expiryDate" value={expiry} onChange={handleExpiryChange} />
          </label>
          <br />
          <label>
            File Name:
            <input type="text" name="fileName" value={fileName} onChange={handleFileNameChange} />
          </label>
          {errorMessage.Delete && <div style={{ color: 'red' }}>{errorMessage.Delete}</div>}
          <br />
          <br />
          <button type="submit">Extend Expiry Date</button>
        </form>
      </Modal>
      <Modal isOpen={showDeleteForm} onClose={handleToggleDeleteForm}>
        <form onSubmit={handleDeleteSubmit}>
          <h2>Delete Data</h2>
          <label>
            Category:
            <select value={selectedCategory} onChange={handleSelectedCategoryChange}>
              <option value="Playlist">Playlist</option>
              <option value="Ads">Ads</option>
              <option value="Archived">Archived</option>
            </select>
          </label>
          <br />
          <label>
            File Name:
            <input type="text" name="fileName" value={fileName}onChange={handleFileNameChange} />
          </label>
          {errorMessage.Delete && <div style={{ color: 'red' }}>{errorMessage.Delete}</div>}
          <br />
          <br />
          <button type="submit">Delete Data</button>
        </form>
      </Modal>
      <Modal isOpen={showAddNoteModal} onClose={() => setShowAddNoteModal(false)}>
        <form onSubmit={(e) => handleAddNoteSubmit(e, fileName)}>
          <h2>Add Note</h2>
          <br />
          <p>Filename: {fileName}</p>
          <br />
          <p>Notes:</p>
          {Array.isArray(notes) && notes.length > 0 ? (
            <ul>
              {notes.map((note, index) => (
                <li key={index}>
                  {note.text} - <small>Added on {new Date(note.addedOn).toLocaleDateString()}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p>No notes found for this file.</p>
          )}
          <br />
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter note here..."
            style={{ width: '100%', height: '100px', resize: 'none' }}
          />
          <br />
          <br />
          <button type="submit">Submit Note</button>
        </form>
      </Modal>
      <Modal isOpen={showUpdateNoteModal} onClose={() => setShowUpdateNoteModal(false)}>
        <h2>Update Note</h2>
        <br />
        <p>Filename: {fileName}</p>
        <br />
        <p>Notes:</p>
        <ul>
          {Array.isArray(notes) && notes.length > 0 ? (
            notes.map((note, index) => (
              <li key={index}>
                {editingNoteId === index ? (
                  <>
                    <input
                      type="text"
                      value={editingNoteText}
                      onChange={handleUpdateNoteText}
                    />
                    <button onClick={() => handleDoneEditNote(index)}>Done</button>
                  </>
                ) : (
                  <>
                    {note.text} - <small>Added on {new Date(note.addedOn).toLocaleDateString()}</small>
                    <button onClick={() => handleEditNote(index, note.text)}>Edit</button>
                  </>
                )}
              </li>
            ))
          ) : (
            <p>No notes found for this file.</p>
          )}
        </ul>
        <br />
        <br />
        <button onClick={() => setShowUpdateNoteModal(false)}>Close</button>
      </Modal>
      <Modal isOpen={showDeleteNoteModal} onClose={() => setShowDeleteNoteModal(false)}>
        <h2>Delete Note</h2>
        <br />
        <p>Filename: {fileName}</p>
        <br />
        <p>Notes:</p>
        <ul>
          {Array.isArray(notes) && notes.length > 0 ? (
            notes.map((note, index) => (
              <li key={index}>
                {note.text} - <small>Added on {new Date(note.addedOn).toLocaleDateString()}</small>
                <button onClick={() => handleDeleteNote(index, fileName)}>Delete</button>
              </li>
            ))
          ) : (
            <p>No notes found for this file.</p>
          )}
        </ul>
        <br />
        <br />
        <button onClick={() => setShowDeleteNoteModal(false)}>Close</button>
      </Modal>
    </main>
  );
}

export default DataPage;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Modal from '../Components/Modal';
import VideoViewer from '../Components/Videoviewer';
import 'youtube-video-js';
import { v4 as uuidv4 } from 'uuid'; // For generating unique keys

import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/datapage.css';
import axios from 'axios';
const DataPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [videoKey, setVideoKey] = useState(uuidv4());
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExpiryForm, setShowExpiryForm] = useState(false);
  const [data, setData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentData, setCurrentData] = useState('Playlist');
  const [fileName, setFileName] = useState('');
  const [showDeleteForm, setShowDeleteForm] = useState(false); 
  const [photoUrl, setPhotoUrl] = useState('');
  const [type, setType] = useState('Video'); // Assuming 'JPG', 'Video', 'PNG' as options
  const [tag, setTag] = useState('');
  const [runTime, setRunTime] = useState('');
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [expiry, setExpiry] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Playlist'); // Default to 'Playlist'
  const [errorMessage, setErrorMessage] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [modalVidoeOpen, setModalVideoOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');


  const handleVideoClick = (videoUrl) => {
    const embedUrl = videoUrl.replace("shorts", "embed");
    setCurrentVideoUrl(embedUrl);
    setModalVideoOpen(true);
    setVideoKey(uuidv4());
    console.log('embedUrl', embedUrl);
  };
  const closeModal = useCallback(() => {
    setModalVideoOpen(false);
    setTimeout(() => {
      setCurrentVideoUrl(''); 
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      const videoElement = document.querySelector('youtube-video');
      if (videoElement) {
        videoElement.pause(); 
        videoElement.src = '';
      }
    };
  }, []);

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
      Expiry: expiry,
    };
  
    const endpoint = selectedCategory === "Playlist" ? "uploadPlaylist" : "uploadAds";
    let baseUrl = process.env.REACT_APP_API_URL;
    console.log("Handle Submit = ", baseUrl);
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
              <th>Type</th>
              <th>Tag</th>
              <th>Run Time</th>
              <th>Content</th>
              <th>Video Url</th>
              <th>Expiry</th>
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
        <youtube-video
          key={videoKey}
          width="560"
          height="360"
          src={currentVideoUrl}
          autoplay
          controls
        ></youtube-video>
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
            Type:
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
            Content:
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
    </main>
  );
}

export default DataPage;

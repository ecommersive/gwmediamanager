import axios from 'axios';
let baseURL = process.env.REACT_APP_API_URL
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

const apiService = {
    logChange: async (message) => {
        try {
          await axios.post(
            `${baseURL}/changelog`,{ user: username, message },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
        } catch (error) {
          console.log('Failed to log change:', error);
        }
    },
    fetchForSchedule: async (currentData) => {
      let url = `${baseURL}/mediaAll?type=`;
      
      switch(currentData) {
        case 'Playlist Schedule':
          url += 'Playlist Schedule';
          break;
        case 'Ads Schedule':
          url += 'Ads Schedule';
          break;
        default:
          console.error('Invalid data type');
          return;
      }
    
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching data:', error);
        return [];
      }
    },
    fetchData: async (currentData) => {
        let url = `${baseURL}/`
        switch(currentData){
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
                throw new Error('Unexpected data type');
        }
        const response = await axios.get(url);
        if(response.status !== 200){
            throw new Error(`HTTP error! Status ${response.status}`);
        }
        return response.data;
    },
    fetchFileDetails: async (fileName) => {
        const url = `${baseURL}/fileDetails/${fileName}`;
        try {
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          return response.data;
        } catch (error) {
          console.error('Error fetching file details:', error);
          throw error;
        }
    },
    fetchDataModals: async (currentData) => {
        let url = `${baseURL}`;
        if (currentData === 'Playlist Schedule') {
          url += '/playlists';
        } else if (currentData === 'Ads Schedule') {
          url += '/ads';
        }
        try {
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (response.status !== 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.data;
        } catch (error) {
          console.error(`Error fetching data from ${url}`, error);
          throw error;
        }
    },
    fetchRequests: async (setRequests) => {
        const url = `${baseURL}/requests`;
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
    },

    fetchItemsByFolder: async (currentData, folder) => {
      let alterValue;
      if (currentData === 'Playlist Schedule') {
        alterValue = 'playlistSchedule';
      } else if (currentData === 'Ads Schedule') {
        alterValue = 'adsSchedule';
      }
      const url = `${baseURL}/${alterValue}/${encodeURIComponent(folder)}`;
    
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.status === 200) {
          return response.data;
        } else {
          throw new Error('Failed to fetch items');
        }
      } catch (error) {
        console.error('Error fetching items:', error.response ? error.response.data : error);
        return [];
      }
    },
    handleSubmit: async ({event, catData, result, fileName,photoUrl, videoUrl,type,tag,runTime,content,expiry,notes,currentData,fetchData,setShowModal,resetAll,setFile}) => {
        event.preventDefault();
        let logChangeMessage = '';
    
        if (catData === 'addData') {
          const generalInfo = result?.media.track.find(track => track['@type'] === 'General');
          const videoInfo = result?.media.track.find(track => track['@type'] === 'Video');
          const audioInfo = result?.media.track.find(track => track['@type'] === 'Audio');
    
          const generalData = {
            OverallBitRate: generalInfo?.OverallBitRate || 'N/A',
          };
    
          const videoData = {
            ColorSpace: videoInfo?.ColorSpace || 'N/A',
            ChromaSubsampling: videoInfo?.ChromaSubsampling || 'N/A',
            BitDepth: videoInfo?.BitDepth || 'N/A',
            ScanType: videoInfo?.ScanType || 'N/A',
          };
    
          const audioData = {
            BitMode: audioInfo?.BitMode || 'N/A',
            BitRate: audioInfo?.BitRate_Mode || 'N/A',
            CompressionMode: audioInfo?.Compression_Mode || 'N/A',
          };
    
          const formData = {
            FileName: fileName,
            PhotoUrl: photoUrl,
            videoUrl: videoUrl,
            Type: type,
            Tag: tag,
            Run_Time: runTime,
            Content: content,
            Expiry: expiry,
            generalData,
            videoData,
            audioData,
          };
          console.log('formData ===========', formData);
    
          if (notes.length > 0) {
            formData.notes = notes.map(noteText => ({
              text: noteText,
              addedOn: new Date(),
            }));
          }
    
          const endpoint = currentData === 'Playlist' ? 'uploadPlaylist' : 'uploadAds';
          try {
            const response = await axios.post(`${baseURL}/${endpoint}`, formData, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
    
            if (response.status === 201) {
              setShowModal(false);
              logChangeMessage = `${username} has added ${formData.FileName} into ${currentData === 'Playlist' ? ' the Content Pool' : currentData === 'Ads' ? 'Ads' : (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? currentData : ''}.`;
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
            const response = await axios.post(
              `${baseURL}/setExpiry/${currentData.toLowerCase()}/${encodedFileName}`,
              { newExpiryDate: expiry },
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (response.status === 200) {
              logChangeMessage = `${username} has extended ${encodedFileName} in ${currentData === 'Playlist' ? ' the Content Pool' : currentData === 'Ads' ? 'Ads' : (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? currentData : ''} to ${expiry}.`;
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
            const response = await axios.delete(
              `${baseURL}/deleteData/${currentData.toLowerCase()}/${encodedFileName}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (response.status === 200) {
              logChangeMessage = `${username} has deleted ${encodedFileName} in ${currentData === 'Playlist' ? ' the Content Pool' : currentData === 'Ads' ? 'Ads' : (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? currentData : ''}.`;
              console.log('Deletion successful');
              fetchData();
              setShowModal(false);
            } else {
              throw new Error(`Failed to delete ${currentData} item`);
            }
          } catch (error) {
            console.log('An error occurred. Please try again.', error);
          }
        } else if (catData === 'deleteScheduleData') {
          const scheduleType = currentData === 'Playlist Schedule' ? 'playlistSchedule' : 'adsSchedule';
          const folderNumber = fileName;
          try {
            const response = await axios.delete(`${baseURL}/set/schedules/${scheduleType}/${folderNumber}`, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
            if (response.status === 200) {
              logChangeMessage = `${username} has deleted ${currentData === 'Playlist Schedule' ? 'Playlist ' : 'Ads '} ${folderNumber}.`;
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
        if (logChangeMessage) {
            await apiService.logChange(logChangeMessage);
        }
        resetAll();
        setFile('');
    },
    handleAddNoteSubmit: async ({ event, identifier, newNote, currentData, setNotes, fetchData }) => {
      let data;
      if(currentData === 'Playlist Schedule'){
        data = 'playlistSchedule'
      }else if(currentData === 'Ads Schedule'){
        data = 'adsSchedule'
      }else if(currentData === 'Playlist'){
        data = 'playlist'
      }else if(currentData === 'Ads'){
        data = 'ads'
      }
      event.preventDefault();
      const noteToAdd = {
        text: newNote,
        addedOn: new Date(),
        user: username
      };
      console.log(noteToAdd.user);
      try {
        console.log('currentdata =========', currentData);
        const encodedIdentifier = encodeURIComponent(identifier);
        const endpoint = `${baseURL}/notes/add/${data}/${encodedIdentifier}`;
        const response = await axios.post(endpoint, noteToAdd, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.status === 200) {
          setNotes(prevNotes => [...prevNotes, noteToAdd]);
          fetchData();
          const logChangeMessage = `${username} has added a comment saying "${noteToAdd.text}" in ${currentData === 'Playlist' ? ' the Content Pool' : currentData === 'Ads' ? 'Ads' : (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? currentData : ''} to ${identifier}.`;
          await apiService.logChange(logChangeMessage);
        } else {
          throw new Error('Failed to add note');
        }
      } catch (error) {
        console.error('Error adding note:', error);
      }
    },
    handleSubmitSetModal: async ({event,startDate,endDate,item,startTime,endTime,currentData,setData,setfolderViewNum,setItem,setAddedItems,setShowModal,setStartDate, setEndDate, setStartTime, setEndTime, setError}) => {
        event.preventDefault();
        let url = `${baseURL}/`;
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
          items: item.map(item => ({ FileName: item.FileName, FileID: item.FileID })),
          startTime: startTime.startTime, // Ensure it's a string
          endTime: endTime.endTime,         // Ensure it's a string
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
            const logChangeMessage = `${username} has created a new ${currentData === 'Playlist Schedule' ? 'Playlist Set' : 'Ads Set'}: \nStart Date: ${requestData.startDate}\nEnd Date: ${requestData.endDate}\nItems:\n${itemsStringValues}\nDuration of ${currentData === 'Playlist Schedule' ? 'Playlist Set' : 'Ads Set'}: ${requestData.startTime} - ${requestData.endTime}`;
            await apiService.logChange(logChangeMessage);
            setItem([]);
            setAddedItems([]);
            setShowModal(false);
            
          } else {
            throw new Error('Failed to create schedule');
          }
        } catch (error) {
          console.log('Error occurred. Please try again = ', error);
          setItem([]);
          setAddedItems([]);
        }
        setStartDate(null)
        setEndDate(null)
        setStartTime('')
        setEndTime('') 
        setError('')
    },
    addItemToSchedule: async ({itemToAdd,id,currentData,folderViewNum,fetchData,}) => {
        let alterValue;
        if (currentData === 'Playlist Schedule') {
          alterValue = 'playlistSchedule';
        } else if (currentData === 'Ads Schedule') {
          alterValue = 'adsSchedule';
        }
    
        const itemWithId = {
          ...itemToAdd,
          FileID: id, // Replace generateUniqueId with your method of generating IDs if needed
          startTime: '',  // Default start time
          endTime: ''     // Default end time
        };
        const url = `${baseURL}/${alterValue}/${folderViewNum}/add`;
    
        try {
          const response = await axios.post(url, { item: itemWithId }, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          });
          if (response.status === 200) {
            console.log('Item added successfully');
            fetchData();
            const logChangeMessage = `${username} has added ${itemToAdd.FileName} to ${currentData} in ${currentData === 'Playlist Schedule' ? 'Playlist ' : 'Ads '} ${folderViewNum}`;
            await apiService.logChange(logChangeMessage);
          } else {
            throw new Error('Failed to add the item');
          }
        } catch (error) {
          console.error('Error adding item:', error.response ? error.response.data : error);
        }
    },
    updateItemTimes: async ({ currentData, scheduleId, itemId, startTime, endTime }) => {
      let alterValue;
      if (currentData === 'Playlist Schedule') {
        alterValue = 'playlistSchedule';
      } else if (currentData === 'Ads Schedule') {
        alterValue = 'adsSchedule';
      }
      const url = `${baseURL}/${alterValue}/${scheduleId}/items/${itemId}`;
      try {
        const response = await axios.put(url, { startTime, endTime }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.status === 200) {
          console.log('Item check successful:', response.data);
          // Log the change
          const logChangeMessage = `${username} has updated item ${itemId} in ${alterValue} schedule ${scheduleId} with startTime: ${startTime} and endTime: ${endTime}.`;
          await apiService.logChange(logChangeMessage);
          return response.data;
        } else {
          throw new Error('Failed to check item');
        }
      } catch (error) {
        console.error('Error checking item:', error.response ? error.response.data : error);
        throw error;
      }
    },
    
    handleAddRequest: async ({newRequestDescription,fetchRequests,setNewRequestDescription,setRequestError,}) => {
        const url = `${baseURL}/request`;
    
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
            const logChangeMessage = `${username} has added a new request:\n${newRequestDescription}.`
            await apiService.logChange(logChangeMessage);
          } else {
            throw new Error('Failed to add request');
          }
        } catch (error) {
          console.error('Error adding request:', error.response ? error.response.data : error);
          setRequestError('An error occurred. Please try again.');
        }
    },
    handleDoneEditNote: async ({noteIndex,identifier,editingNoteId,editingNoteText,notes,currentData,setNotes,setEditingNoteId,setEditingNoteText,fetchData}) => {
        let data;
        if(currentData === 'Playlist Schedule'){
          data = 'playlistSchedule'
        }else if(currentData === 'Ads Schedule'){
          data = 'adsSchedule'
        }else if(currentData === 'Playlist'){
          data = 'playlist'
        }else if(currentData === 'Ads'){
          data = 'ads'
        }
        if (editingNoteId === null || editingNoteText.trim() === '') {
          alert('You must provide updated note text.');
          return;
        }
    
        try {
          const encodedIdentifier = encodeURIComponent(identifier);
          const oldComment = notes[noteIndex].text;
          const response = await axios.put(
            `${baseURL}/notes/update/${data}/${encodedIdentifier}`,
            {
              noteIndex,
              updatedText: editingNoteText
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          if (response.status === 200) {
            console.log('Note updated successfully');
            const updatedNotes = [...notes];
            updatedNotes[noteIndex] = { ...updatedNotes[noteIndex], text: editingNoteText, addedOn: new Date() };
            setNotes(updatedNotes);
            setEditingNoteId(null);
            setEditingNoteText('');
            fetchData();
            const logChangeMessage = `${username} has updated a comment: "${oldComment}" to "${editingNoteText}" in ${currentData === 'Playlist' ? ' the Content Pool' : currentData === 'Ads' ? 'Ads' : (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? currentData : ''} for ${identifier}.`;
            await apiService.logChange(logChangeMessage);
          } else {
            throw new Error('Failed to update note');
          }
        } catch (error) {
          console.error('Error updating note:', error.response ? error.response.data : error);
        }
    },
    handleSave: async ({field,currentData,folderViewNum,newStartDate,newEndDate,newStartTime,newEndTime,setNewStartDate,setNewEndDate,setIsEditingDuration,setNewStartTime,setNewEndTime,setIsEditingTime,fetchData,formatDate,formatTime}) => {
        let alterValue = currentData === 'Playlist Schedule' ? 'playlistSchedule' : 'adsSchedule';
        const url = `${baseURL}/${alterValue}/${folderViewNum}/update`;
        const updatedData = {};
        let logChangeMessage = '';
    
        if (field === 'duration') {
          updatedData.startDate = newStartDate;
          updatedData.endDate = newEndDate;
          logChangeMessage = `${username} has updated duration in ${currentData === 'Playlist Schedule' ? 'Playlist ' : 'Ads '} ${folderViewNum} to ${formatDate(newStartDate)} - ${formatDate(newEndDate)}.`;
        } else if (field === 'time') {
          updatedData.startTime = newStartTime;
          updatedData.endTime = newEndTime;
          logChangeMessage = `${username} has updated time in ${currentData === 'Playlist Schedule' ? 'Playlist ' : 'Ads '} ${folderViewNum} to ${formatTime(newStartTime)} - ${formatTime(newEndTime)}.`;
        }
    
        try {
          const response = await axios.put(url, updatedData, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          });
          if (response.status === 200) {
            console.log('Schedule updated successfully');
            fetchData();
            if (field === 'duration') {
              setNewStartDate('');
              setNewEndDate('');
              setIsEditingDuration(false);
            } else if (field === 'time') {
              setNewStartTime('');
              setNewEndTime('');
              setIsEditingTime(false);
            }
    
            await apiService.logChange(logChangeMessage);
          } else {
            throw new Error('Failed to update schedule');
          }
        } catch (error) {
          console.error('Error updating schedule:', error.response ? error.response.data : error);
        }
    },
    handleSaveSection: async ({requests,fetchRequests}) => {
        const completedRequests = requests.filter(request => request.status === 'completed');
        const unfinishedRequests = requests.filter(request => request.status === 'unfinished');
    
        try {
          await Promise.all(completedRequests.map(async (request) => {
            const url = `${baseURL}/requests/${request._id}`;
            console.log(`Attempting to delete request with ID: ${request._id}`); // Log the ID here
    
            try {
              await axios.delete(url, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                }
              });
              console.log(`Successfully deleted request with ID: ${request._id}`);
            } catch (deleteError) {
              console.error(`Failed to delete request with ID: ${request._id}`, deleteError);
            }
          }));
          await fetchRequests();
          const logChangeMessage = `Following requests finished:\n${completedRequests.map(req => req.description).join('\n')}\nFollowing requests unfinished:\n${unfinishedRequests.map(req => req.description).join('\n')}`;
          await apiService.logChange(logChangeMessage);
        } catch (error) {
          console.error('Error deleting completed requests:', error);
        }
    },
    handleToggleStatus: async ({ request, fetchRequests }) => {
        const newStatus = request.status === 'unfinished' ? 'completed' : 'unfinished';
        try {
          const url = `${baseURL}/requests/${request._id}/status`;
          await axios.put(url, { status: newStatus }, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          });
          await fetchRequests();
        } catch (error) {
          console.error('Error updating request status:', error);
        }
    },
    moveItemPlaylistSchedule: async ({itemToMove,direction,currentData,folderViewNum,fetchData}) => {
        let alterValue;
        if (currentData === 'Playlist Schedule') {
          alterValue = 'playlistSchedule';
        } else if (currentData === 'Ads Schedule') {
          alterValue = 'adsSchedule';
        }
    
        const url = `${baseURL}/${alterValue}/${folderViewNum}/move`;
    
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
            const logChangeMessage = `${username} has moved ${itemToMove.FileName} in ${currentData === 'Playlist Schedule' ? 'Playlist ' : 'Ads '} ${folderViewNum} ${direction}.`;
            await apiService.logChange(logChangeMessage);
          } else {
            throw new Error('Failed to move the item');
          }
        } catch (error) {
          console.error('Error moving item:', error.response ? error.response.data : error);
        }
    },
    handleDeleteNote: async ({noteIndex,identifier,notes,currentData,setNotes,fetchData}) => {
        let data;
        if(currentData === 'Playlist Schedule'){
          data = 'playlistSchedule'
        }else if(currentData === 'Ads Schedule'){
          data = 'adsSchedule'
        }else if(currentData === 'Playlist'){
          data = 'playlist'
        }else if(currentData === 'Ads'){
          data = 'ads'
        }
        const encodedIdentifier = encodeURIComponent(identifier);
        const url = `${baseURL}/notes/delete/${data}/${encodedIdentifier}/${noteIndex}`;
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
            const logChangeMessage = `${username} has deleted comment: "${oldComment}" in ${currentData === 'Playlist' ? ' the Content Pool' : currentData === 'Ads' ? 'Ads' : (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? currentData : ''} for ${identifier}`;
            await apiService.logChange(logChangeMessage);
          } else {
            throw new Error('Failed to delete the note');
          }
        } catch (error) {
          console.error('Error deleting note:', error.response ? error.response.data : error);
        }
    },
    deleteItemFromSchedule: async ({itemToDelete,currentData,folderViewNum,fetchData}) => {
        const encodedFileName = encodeURIComponent(JSON.stringify(itemToDelete));
        let alterValue;
        if (currentData === 'Playlist Schedule') {
          alterValue = 'playlistSchedule';
        } else if (currentData === 'Ads Schedule') {
          alterValue = 'adsSchedule';
        }
        const url = `${baseURL}/${alterValue}/${folderViewNum}/${encodedFileName}`;
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
            const logChangeMessage = `${username} has deleted ${itemToDelete.FileName} in ${currentData === 'Playlist Schedule' ? 'Playlist ' : 'Ads '} ${folderViewNum}.`;
            await apiService.logChange(logChangeMessage);

          } else {
            throw new Error('Failed to delete the item');
          }
        } catch (error) {
          console.error('Error deleting item:', error.response ? error.response.data : error);
        }
    },
}

export default apiService;





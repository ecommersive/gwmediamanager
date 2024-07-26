const NotesForm = ({ catData, identifier, data, notes, editingNoteId, editingNoteText, handleUpdateNoteText, handleEditNote, handleDoneEditNote, handleDeleteNote, handleAddNoteSubmit, newNote, setNewNote = { setNewNote }, username, isAdmin, currentData }) => {
  const shouldRenderNotes = catData === 'viewNotes' || catData === 'Comments'
  return (
    <>
      {shouldRenderNotes && (
        <>
          <p>{(currentData === 'Playlist' || currentData === 'Ads') ? 'Filename: ' : 'Folder: '}{(currentData === 'Playlist' || currentData === 'Ads') ? identifier : data.folder}</p>

          <br />
          <ul style={(currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? { listStyleType: 'none', padding: 0, margin: 0 } : {}}>
            {Array.isArray(notes) && notes.length > 0 ? (
              notes.map((note, index) => (
                <li key={index}>
                  {catData === 'Comments' && (editingNoteId === index) ? (
                    <>
                      <input type="text" value={editingNoteText} onChange={handleUpdateNoteText} />
                      <button onClick={() => handleDoneEditNote(index, identifier)}>Done</button>
                    </>
                  ) : (
                    <div style={{ display: 'flex' }}>
                      <p>{(currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? `${index + 1}. ` : ''}{note.text} - <small>Added on {new Date(note.addedOn).toLocaleDateString()} by {note.user}</small></p>
                      {(note.user === username || isAdmin) && (
                        <div>
                          <button style={{ marginLeft: '1rem' }} onClick={() => { handleEditNote(index, note.text) }}>Edit</button>
                          <button style={{ marginLeft: '1rem' }} onClick={() => handleDeleteNote(index, identifier)}>Delete</button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))
            ) : (
              <p>{(currentData === 'Playlist' || currentData === 'Ads') ? `No comments found for ${identifier}` : `No Requests for ${currentData} ${data.folder}`}</p>
            )}
          </ul>
          <br />
          <>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter note here..."
              style={{ width: '100%', height: '100px', resize: 'none' }}
            />
            <br />
            <br />
            <button onClick={(e) => { handleAddNoteSubmit(e, identifier); setNewNote(''); }} onChange={handleUpdateNoteText} >Submit Comment</button>
            
          </>
          <br />
        </>
      )}
    </>
  );
};

export default NotesForm
const NotesForm = ({ catData, identifier, data, notes, editingNoteId, editingNoteText, handleUpdateNoteText, handleEditNote, handleDoneEditNote, handleDeleteNote, handleAddNoteSubmit, newNote, setNewNote = { setNewNote }, username, isAdmin, currentData }) => {
  const shouldRenderNotes = catData === 'viewNotes' || catData === 'Comments'
  console.log('data=======', data);
  return (
    <>
      {shouldRenderNotes && (
        <>
          <p>{(currentData === 'Playlist' || currentData === 'Ads') ? 'Filename: ' : 'Folder: '}{(currentData === 'Playlist' || currentData === 'Ads') ? identifier : data.folder}</p>

          <br />
          <p>Comments</p>
          <ul>
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
                      <p>{note.text} - <small>Added on {new Date(note.addedOn).toLocaleDateString()} by {username}</small></p>
                      {(note.username === username || isAdmin) && (
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
              <p>No comments found for this File.</p>

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
            <button onClick={(e) => { handleAddNoteSubmit(e, identifier); setNewNote(''); }} onChange={handleUpdateNoteText} >Submit Note</button>
          </>
          <br />
        </>
      )}
    </>
  );
};

export default NotesForm
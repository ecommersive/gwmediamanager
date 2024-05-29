const NotesForm = ({ catData, fileName, notes, editingNoteId, editingNoteText, handleUpdateNoteText, handleEditNote, handleDoneEditNote, handleDeleteNote, handleAddNoteSubmit, newNote, setNewNote = { setNewNote }, setCatData, username, isAdmin }) => {
  const shouldRenderNotes = catData === 'viewNotes' || catData === 'UpdateNote'
  return (
    <>
      {shouldRenderNotes && (
        <>
          <p>Filename: {fileName}</p>
          <br />
          <p>Comments</p>
          <ul>
            {Array.isArray(notes) && notes.length > 0 ? (
              notes.map((note, index) => (
                <li key={index}>
                  {catData === 'UpdateNote' && (editingNoteId === index) ? (
                    <>
                      <input type="text" value={editingNoteText} onChange={handleUpdateNoteText} />
                      <button onClick={() => handleDoneEditNote(index)}>Done</button>
                    </>
                  ) : (
                    <div style={{ display: 'flex' }}>
                      <p>{note.text} - <small>Added on {new Date(note.addedOn).toLocaleDateString()} by {username}</small></p>
                      {(note.username === username || isAdmin) && (
                        <div>
                          <button style={{ marginLeft: '1rem' }} onClick={() => { handleEditNote(index, note.text); setCatData('UpdateNote'); }}>Edit</button>
                          <button style={{ marginLeft: '1rem' }} onClick={() => handleDeleteNote(index, fileName)}>Delete</button>
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
            <button onClick={(e) => { handleAddNoteSubmit(e, fileName); setNewNote(''); }} onChange={handleUpdateNoteText} >Submit Note</button>
          </>
          <br />
        </>
      )}
    </>
  );
};

export default NotesForm
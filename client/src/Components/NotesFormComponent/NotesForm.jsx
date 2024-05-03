const NotesForm = ({ catData, fileName, notes, editingNoteId, editingNoteText, handleUpdateNoteText, handleEditNote,handleDoneEditNote, handleDeleteNote, handleAddNoteSubmit, newNote, setNewNote={setNewNote} }) => {
    const shouldRenderNotes = catData === 'viewNotes' || catData === 'AddNote' || catData === 'UpdateNote' || catData === 'DeleteNote';
  
    return (
      <>
        {shouldRenderNotes && (
          <>
            <p>Filename: {fileName}</p>
            <br />
            <p>Notes:</p>
            <ul>
              {Array.isArray(notes) && notes.length > 0 ? (
                notes.map((note, index) => (
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
    );
  };

export default NotesForm
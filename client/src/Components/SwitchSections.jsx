import React from 'react'

const SwitchSections = ({currentData, handleDataSelection, isAdmin}) => {
  return (
    <>
        <h1>{currentData}</h1>
        <select value={currentData} onChange={handleDataSelection} style={{ background: '#454749', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '2rem', cursor: 'pointer', padding: '0.5em', fontSize: '16px' }}>
            <option value="Playlist">Content</option>
            <option value="Ads">Ads</option>
            
            {isAdmin &&
              <>
                <option value="Playlist Schedule">Playlist Schedule</option>
                <option value="Ads Schedule">Ads Schedule</option>
              </>
            }
        </select>
    </>
  )
}

export default SwitchSections
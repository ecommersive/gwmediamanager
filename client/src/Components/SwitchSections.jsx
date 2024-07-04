import React from 'react'

const SwitchSections = ({currentData, handleDataSelection}) => {
  return (
    <>
        <h1>{currentData === 'Playlist' ? 'Content': currentData === 'Playlist Schedule' ? 'Content Schedule' : currentData}</h1>
        <select value={currentData} onChange={handleDataSelection} style={{ background: '#454749', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '2rem', cursor: 'pointer', padding: '0.5em', fontSize: '16px' }}>
            <option value="Playlist">Content Files</option>
            <option value="Ads">Ads Files</option>
            <option value="Playlist Schedule">Content Schedule</option>
            <option value="Ads Schedule">Ads Schedule</option>
        </select>
    </>
  )
}

export default SwitchSections
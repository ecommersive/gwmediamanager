import React from 'react'

const FormViewFile = ({catData, isAdmin}) => {
  return (
    <>
    {isAdmin && catData === 'viewfile' && (
      <>
        <h3>General Info:</h3>
        <p>Overall BitRate: {}</p>

        <h3>Video Info:</h3>
        <p>ColorSpace: {}</p>
        <p>ChromaSubsampling: {}</p>
        <p>BitDepth: {}</p>
        <p>ScanType: {}</p>

        <h3>Audio Info:</h3>
        <p>BitMode: {}</p>
        <p>BitRate: {}</p>
        <p>Compression Mode: {}</p>
      </>
    )}
  </>
  )
}

export default FormViewFile
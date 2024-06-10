import React from 'react'

const FormViewFile = ({catData, isAdmin, fileDetails}) => {
    if (!fileDetails) return null;

    return (
        <>
        {isAdmin && catData === 'viewfile' && (
         <>
            <h3>General Info:</h3>
            <p>Overall BitRate: {fileDetails ? fileDetails?.generalData.OverallBitRate : 'N/A'}</p>

            <h3>Video Info:</h3>
            <p>ColorSpace: {fileDetails ? fileDetails?.videoData.ColorSpace : 'N/A'}</p>
            <p>ChromaSubsampling: {fileDetails ? fileDetails?.videoData.ChromaSubsampling : 'N/A'}</p>
            <p>BitDepth: {fileDetails ? fileDetails?.videoData.BitDepth : 'N/A'}</p>
            <p>ScanType: {fileDetails ? fileDetails?.videoData.ScanType : 'N/A'}</p>

            <h3>Audio Info:</h3>
            <p>BitMode: {fileDetails ? fileDetails?.audioData.BitMode : 'N/A'}</p>
            <p>BitRate: {fileDetails ? fileDetails?.audioData.BitRate : 'N/A'}</p>
            <p>Compression Mode: {fileDetails ? fileDetails?.audioData.CompressionMode : 'N/A'}</p>
        </>
        )}
    </>
  )
}

export default FormViewFile
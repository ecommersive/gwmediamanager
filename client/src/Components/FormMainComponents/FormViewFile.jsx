import React from 'react'

const FormViewFile = ({catData, isAdmin, fileDetails}) => {
    if (!fileDetails) return null;

    return (
        <>
        {isAdmin && catData === 'viewfile' && (
         <>
            <h3>General Info:</h3>
            <p>Overall BitRate: {fileDetails.generalData.OverallBitRate}</p>

            <h3>Video Info:</h3>
            <p>ColorSpace: {fileDetails.videoData.ColorSpace}</p>
            <p>ChromaSubsampling: {fileDetails.videoData.ChromaSubsampling}</p>
            <p>BitDepth: {fileDetails.videoData.BitDepth}</p>
            <p>ScanType: {fileDetails.videoData.ScanType}</p>

            <h3>Audio Info:</h3>
            <p>BitMode: {fileDetails.audioData.BitMode}</p>
            <p>BitRate: {fileDetails.audioData.BitRate}</p>
            <p>Compression Mode: {fileDetails.audioData.CompressionMode}</p>
        </>
        )}
    </>
  )
}

export default FormViewFile
import React from 'react';

const FormAddDataBody = ({ catData, type, handleTypeChange, tag, handleTagChange, photoUrl, handlePhotoUrlChange, runTime, handleRunTimeChange, content, handleContentChange}) => {
    return (        
        <>
            {catData === 'addData' && (
                <>
                    <label>
                        File Type:
                        <select name="type" value={type} onChange={handleTypeChange}>
                            <option value="Video">Video</option>
                            <option value="PNG">PNG</option>
                            <option value="JPG">JPG</option>
                        </select>
                    </label>
                    <br />
                    <label>
                        Tag:
                        <input name="tag" value={tag} onChange={handleTagChange} />
                    </label>
                    <br />
                    <label>
                        Photo URL:
                        <input type="text" name="photoUrl" value={photoUrl} onChange={handlePhotoUrlChange} required />
                    </label>
                    <br />
                    <label>
                        Run Time:
                        <input type="text" name="runTime" value={runTime} onChange={handleRunTimeChange} required />
                    </label>
                    <br />
                    <label>
                        Type:
                        <input type="text" name="content" value={content} onChange={handleContentChange} required />
                    </label>
                    <br />
                </>
            )}
        </>
    );
};

export default FormAddDataBody;
    

   
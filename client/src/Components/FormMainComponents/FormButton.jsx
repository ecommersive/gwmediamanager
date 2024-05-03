const FormButton = ({ catData, fileName, photoUrl, type, runTime, content, videoUrl, handleSubmit }) => {
    const shouldRenderButton = catData === 'addData' || catData === 'DeleteData' || catData === 'ExtendExpiry';
  
    const isButtonDisabled =
      catData === 'addData'
        ? !fileName || !photoUrl || !type || !runTime || !content || !videoUrl
        : catData === 'DeleteData' || catData === 'ExtendExpiry'
        ? !fileName
        : null;
  
    return (
      <>
        {shouldRenderButton && (
          <button type="submit" disabled={isButtonDisabled} onClick={handleSubmit}>
            {catData === 'addData' ? 'Add Data' : catData === 'ExtendExpiry' ? 'Extend Expiry Date' : catData === 'DeleteData' ? 'Delete Data' : ''}
          </button>
        )}
      </>
    );
  };
export default FormButton
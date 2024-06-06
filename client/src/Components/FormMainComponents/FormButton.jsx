const FormButton = ({ catData, fileName, photoUrl, type, runTime, content, handleSubmit }) => {
    const shouldRenderButton = (catData === 'addData')|| catData === 'DeleteData' || catData === 'ExtendExpiry';
  
    const isButtonDisabled = (catData === 'addData') ? !fileName || !photoUrl || !type || !runTime || !content : catData === 'DeleteData' || catData === 'ExtendExpiry' ? !fileName : null;
  
    return (
      <>
        {shouldRenderButton && (
          <button type="submit" disabled={isButtonDisabled} onClick={handleSubmit}>
            {(catData === 'addData') ? 'Add Data' : catData === 'ExtendExpiry' ? 'Extend Expiry Date' : catData === 'DeleteData' ? 'Delete Data' : ''}
          </button>
        )}
      </>
    );
  };
export default FormButton
const FormExpiry = ({ catData, expiry, handleExpiryChange }) => {
    const shouldRenderExpiry = catData === 'addData' || catData === 'ExtendExpiry';
  
    return (
      <>
        {shouldRenderExpiry && (
          <>
            <label>
              {catData === 'addData' ? 'Expiry Date:' : catData === 'ExtendExpiry' ? 'New Expiry Date:' : ''}
              <input type="date" name="expiryDate" value={expiry} onChange={handleExpiryChange} />
            </label>
            <br />
            <br />
          </>
        )}
      </>
    );
  };

export default FormExpiry;
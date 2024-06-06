const FormExpiry = ({ catData, expiry, handleExpiryChange }) => {

  
    return (
      <>
        {catData === 'ExtendExpiry' && (
          <>
            <label>
              Extend Expiry: 
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
import React from 'react';

const Users = ({ catData, adminUserState, setAdminUserState }) => {
  const dummyOptions = [
    { id: 1, name: 'User 1' },
    { id: 2, name: 'User 2' },
    { id: 3, name: 'User 3' },
  ];

  return (
    <div>
      {catData === 'userData' && (
        <>
          {adminUserState === '' && (
            <>
              <button className='action-button' onClick={() => setAdminUserState('createuser')}>Create user</button>
              <button className='action-button' onClick={() => setAdminUserState('edituser')}>Edit user</button>
            </>
          )}
          {adminUserState === 'edituser' && (
            <div style={{ display: 'flex' }}>
              <select name="user" id="user">
                {dummyOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
              <br />
              <button className='action-button' onClick={() => { console.log('user is viewed'); setAdminUserState('viewuser') }}>View</button>
              <button className='action-button' onClick={() => console.log('user is deleted')}>Delete</button>
            </div>
          )}

          {/* {(adminUserState === 'viewuser' || adminUserState === 'createuser') && (
            
          )} */}

          {(adminUserState === 'viewuser' || adminUserState === 'edituser' || adminUserState === 'createuser') && (
            <button className='action-button' onClick={() => adminUserState === 'viewuser' ? setAdminUserState('edituser') : setAdminUserState('')}>Go Back</button>
          )}
        </>
      )}
    </div>
  );
};

export default Users;

import React from 'react';

const Users = ({ catData, adminUserState, setAdminUserState, filteredUsers, handleUserSelect,selectedUser }) => {
  
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
              <select name="user" id="user" onChange={handleUserSelect}>
                <option value="" disabled selected>Select a user</option>
                {filteredUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
              <br />
              <button className='action-button' onClick={() => { console.log('user is viewed'); setAdminUserState('viewuser') }}>View</button>
              <button className='action-button' onClick={() => console.log('user is deleted')}>Delete</button>
            </div>
          )}

          {(adminUserState === 'viewuser' || adminUserState === 'createuser') && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1>{adminUserState === 'viewuser' ? 'Alter User':'Create User'}</h1>
              <label style={{ display: 'inline-block', marginBottom: '10px' }}>
                Username:
                <input type="text" placeholder="Username" style={{ marginLeft: '10px' }} />
              </label>
              <label style={{ display: 'inline-block', marginBottom: '10px' }}>
                Password:
                <input type="password" placeholder="Password" style={{ marginLeft: '10px' }} />
              </label>
              <label style={{ display: 'inline-block', marginBottom: '10px' }}>
                Company:
                <input type="text" placeholder="Company" style={{ marginLeft: '10px' }} />
              </label>
              <label style={{ display: 'inline-block', marginBottom: '10px' }}>
                Admin:
                <select style={{ marginLeft: '10px' }}>
                  <option value="" disabled selected>Select Yes or No</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </label>
            </div>
          )}

          {(adminUserState === 'viewuser' || adminUserState === 'edituser' || adminUserState === 'createuser') && (
            <>
              <br />
              <button className='action-button' onClick={() => adminUserState === 'viewuser' ? setAdminUserState('edituser') : setAdminUserState('')}>Go Back</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Users;

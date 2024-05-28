import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/homepage.css'

const HomePage = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
  
    const handleSignIn = async (event) => {
      event.preventDefault(); // Prevent form submission
      let baseUrl = process.env.REACT_APP_API_URL
      try {
        const response = await fetch(`${baseUrl}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);  
          localStorage.setItem('isAdmin', data.isAdmin);
          navigate('/home');
        } else {
          const errorText = await response.text(); 
          setErrorMessage(errorText);
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrorMessage('Failed to login');
      }
    };
    
    return (
        <div className="tile">
          <div className="tile-header">
            {/* <h2 style={{ color: 'white', opacity: .75, fontSize: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>SIGN IN</h2> */}
          </div>
          <div className="tile-body">
            <form id="form" onSubmit={handleSignIn}>
              <label className="form-input">
                <i className="material-icons">person</i>
                <input type="text" autoFocus={true} required value={username} onChange={e => setUsername(e.target.value)} />
                <span className="label">Username</span>
                <span className="underline"></span>
              </label>
              
              <label className="form-input">
                <i className="material-icons">lock</i>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                <span className="label">Password</span>
                <div className="underline"></div>
              </label>
              
              <div className="submit-container clearfix" style={{ marginTop: '2rem' }}>          
                <button id="submit" className="btn btn-irenic float-right" type="submit">
                  <span>SIGN IN</span>
                </button>
                <div style={{ color: 'red' }}>{errorMessage}</div>
              </div>
            </form>
          </div>
        </div>
    );
}

export default HomePage
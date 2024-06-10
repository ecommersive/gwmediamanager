import React from 'react';

const RequestDetails = ({ catData, state, setState, handleAddRequest, newRequestDescription, setNewRequestDescription, error, requests, handleToggleStatus, handleSaveSection, isAdmin, username }) => {
    const section = (
        <>
            {state === 'makerequest' && <button className='action-button' onClick={() => { handleAddRequest(); setState('') }} disabled={!newRequestDescription}>Submit Request</button>}
            {state === 'viewrequest' && <button className='action-button' onClick={() => { handleSaveSection();  setState('')}}>Save Section</button>}            
            <button className='action-button' onClick={() => { setState('') }}>Exit Section</button>
        </>
    );

    if (catData === 'requests') {
        return (
            <>
                <h1>Requests Section</h1>
                {state === '' && (
                    <>
                        <button className='action-button' onClick={() => { setState('viewrequest') }}>View Requests</button>
                        {!isAdmin && <button className='action-button' onClick={() => { setState('makerequest') }}>Make Requests</button>}
                    </>
                )}
                {state === 'viewrequest' &&
                    <>
                        <ul className="request-list">
                            {requests.map((request, index) => (
                                <li key={index} className="request-item">
                                    <hr />
                                    <p>Request Made by: {request.user}</p>
                                    <p>Date of request: {new Date(request.createdAt).toLocaleDateString()}</p>
                                    <p>Request: {request.description}</p>
                                    {(isAdmin || request.user === username) && (
                                        <p>
                                            Status: {request.status}
                                            <button onClick={() => handleToggleStatus(request)}>
                                                {request.status === 'unfinished' ? 'Complete' : 'Unfinished'}
                                            </button>
                                        </p>
                                    )}                                    <hr />
                                </li>
                            ))}
                        </ul>
                        {section}
                    </>
                }
                {state === 'makerequest' && (
                    <>
                        <textarea style={{ height: '6rem', width: '100%' }} placeholder="Enter your request" value={newRequestDescription} onChange={(e) => setNewRequestDescription(e.target.value)} />
                        {error && <p className="error">{error}</p>}
                        {section}
                    </>
                )}
            </>
        );
    }
}

export default RequestDetails;
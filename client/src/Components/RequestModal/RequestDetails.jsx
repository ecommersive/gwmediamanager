import React from 'react';

const RequestDetails = ({ catData, state, setState }) => {
    const section = (
        <>
            <button className='action-button' onClick={() => { setState('') }}>{state === 'viewrequest' ? 'Save Section' : 'Submit Request'}</button>
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
                <button className='action-button' onClick={() => { setState('makerequest') }}>Make Requests</button>
                </>
            )}
            {state === 'viewrequest' &&
                <>
                <p>Date of Request - by user</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <p>Request</p>
                    <div>
                    <input type="checkbox" id="finished" name="status"/>
                    <label htmlFor="finished">Finished</label>
                    </div>
                </div>
                {section}
                </>
            }
            {state === 'makerequest' && (
                <>
                <textarea style={{ height: '6rem', width: '100%' }} placeholder="Enter your request" />
                {section}
                </>
            )}
            </>
        );
    }
}

export default RequestDetails;
import React from 'react';

const FormTitle = ({ catData, currentData }) => {
  const catToFormTitle = {
    addData: 'Add New Data',
    viewfile: 'Admin Info',
    ExtendExpiry: 'Extend Expiry Date',
    DeleteData: 'Delete Data',
    viewNotes: 'View Notes',
    AddNote: 'Add Note',
    Comments: (currentData === 'Playlist Schedule' || currentData === 'Ads Schedule') ? 'Request':'Comments',
    DeleteNote: 'Delete Note',
    playlistSchedule: 'Create Content Set',
    adsSchedule: 'Create Ads Set',
    deleteScheduleData: 'Delete Schedule Set'
  };
  const formTitle = catToFormTitle[catData] || '';
  return <h2>{formTitle}</h2>;
};

export default FormTitle;
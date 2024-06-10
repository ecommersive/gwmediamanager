import React from 'react';

const FormTitle = ({ catData }) => {
  const catToFormTitle = {
    addData: 'Add New Data',
    viewfile: 'Admin Info',
    ExtendExpiry: 'Extend Expiry Date',
    DeleteData: 'Delete Data',
    viewNotes: 'View Notes',
    AddNote: 'Add Note',
    Comments: 'Comments',
    DeleteNote: 'Delete Note',
    playlistSchedule: 'Create Playlist Set',
    adsSchedule: 'Create Ads Set',
    deleteScheduleData: 'Delete Schedule Set'
  };
  const formTitle = catToFormTitle[catData] || '';
  return <h2>{formTitle}</h2>;
};

export default FormTitle;
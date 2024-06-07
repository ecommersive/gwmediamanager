import React from 'react';

const FormTitle = ({ catData }) => {
  const catToFormTitle = {
    addData: 'Add New Data',
    ExtendExpiry: 'Extend Expiry Date',
    DeleteData: 'Delete Data',
    viewNotes: 'View Notes',
    AddNote: 'Add Note',
    Comments: 'Comments',
    DeleteNote: 'Delete Note',
    playlistSchedule: 'Create Playlist Set',
    adsSchedule: 'Create Ads Set',
    addData: 'Add New Data'
  };
  const formTitle = catToFormTitle[catData] || '';
  return <h2>{formTitle}</h2>;
};

export default FormTitle;
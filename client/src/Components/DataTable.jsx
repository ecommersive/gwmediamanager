// DataTable.js
import React from 'react';

const DataTable = ({ data, onEdit, onDelete, onView }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>File Name</th>
          <th>Tag</th>
          <th>Run Time</th>
          {/* Other headers */}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{item.fileName}</td>
            <td>{item.tag}</td>
            <td>{item.runTime}</td>
            <td><button onClick={() => onView(item)}>View</button></td>
            {/* Other buttons */}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;

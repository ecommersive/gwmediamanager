import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemType = 'ITEM';

const DraggableItem = ({ item, index, moveItem, setItemSetToMove, itemSetToMove, modalState, deleteItemFromSchedule, fetchData, setModalState }) => {
  const ref = React.useRef(null);
  const [, drop] = useDrop({
    accept: ItemType,
    hover(draggedItem) {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { type: ItemType, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <li ref={ref} style={{ opacity: isDragging ? 0.5 : 1, flex: '0 0 calc(25% - 1rem)', textAlign: 'center', border: modalState === 'Move' ? '2px solid' : 'none', borderColor: itemSetToMove.FileName === item.FileName ? 'blue' : 'gray', borderRadius: '5px', padding: modalState === 'Move' ? '10px' : '0', position: 'relative' }}>
      <div style={{ height: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <img src={item.PhotoUrl} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} alt={item.FileName} />
        <p style={{ margin: '5px 0', height: '20px', lineHeight: '20px', fontWeight: itemSetToMove.FileName === item.FileName ? 'bold' : 'normal' }}>
          {index + 1}. <span>{item.FileName}</span>
        </p>
      </div>
      {modalState === '' && (
        <>
          <button className='action-button' onClick={() => { deleteItemFromSchedule(item); fetchData() }}>Delete</button>
          <button className='action-button' onClick={() => { setItemSetToMove(item); setModalState('Move') }}>Move</button>
        </>
      )}
      {index % 4 !== 3 && <div style={{ position: 'absolute', top: 0, right: '-10px', bottom: 0, width: '2px', backgroundColor: modalState === 'Move' ? 'red' : '' }}></div>}
    </li>
  );
};

export default DraggableItem;

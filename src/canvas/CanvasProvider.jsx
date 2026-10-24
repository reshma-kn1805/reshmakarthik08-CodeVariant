import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  rectIntersection,
} from '@dnd-kit/core';
import { DragOverlayCard } from './DataCard.jsx';
import { applyDrop } from './actions.js';

const CanvasContext = createContext(null);

export function useCanvas() {
  const ctx = useContext(CanvasContext);
  if (!ctx) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return ctx;
}

/**
 * Custom Keyboard Coordinate Getter:
 * Cycles specifically through VALID droppable action zones for the lifted card.
 */
function canvasKeyboardCoordinateGetter(event, { currentCoordinates, context }) {
  const { active, droppableContainers } = context;
  if (!active) return undefined;

  const activeType = active.data.current?.type;
  const allContainers = droppableContainers.getRunTimeContainers();

  // Filter only droppables that accept the card type
  const validContainers = allContainers.filter((container) => {
    const accepts = container.data.current?.accepts || [];
    return accepts.includes(activeType);
  });

  if (validContainers.length === 0) return currentCoordinates;

  // Find nearest container
  let currentIndex = validContainers.findIndex((c) => {
    const r = c.rect.current;
    if (!r) return false;
    return (
      Math.abs(currentCoordinates.x - (r.left + r.width / 2)) < 60 &&
      Math.abs(currentCoordinates.y - (r.top + r.height / 2)) < 60
    );
  });

  if (event.code === 'ArrowDown' || event.code === 'ArrowRight') {
    event.preventDefault();
    const nextIdx = (currentIndex + 1) % validContainers.length;
    const target = validContainers[nextIdx].rect.current;
    if (target) {
      return {
        x: target.left + target.width / 2,
        y: target.top + target.height / 2,
      };
    }
  }

  if (event.code === 'ArrowUp' || event.code === 'ArrowLeft') {
    event.preventDefault();
    const prevIdx = (currentIndex - 1 + validContainers.length) % validContainers.length;
    const target = validContainers[prevIdx].rect.current;
    if (target) {
      return {
        x: target.left + target.width / 2,
        y: target.top + target.height / 2,
      };
    }
  }

  return undefined;
}

export function CanvasProvider({ children, onDropSuccess, stateContext = {} }) {
  const [activeCard, setActiveCard] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [bouncingZoneId, setBouncingZoneId] = useState(null);

  // Configure sensors per Canvas Protocol requirements:
  // PointerSensor (immediate drag with 4px activation distance)
  // TouchSensor (150ms delay, 5px tolerance)
  // KeyboardSensor (cycles valid zones)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: canvasKeyboardCoordinateGetter,
    })
  );

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setActiveCard(active.data.current || null);
    setBouncingZoneId(null);
  }, []);

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      setActiveCard(null);

      if (!over) {
        return;
      }

      const card = active.data.current;
      const zoneId = over.id;

      const result = applyDrop(stateContext, card, zoneId);

      if (result.success) {
        if (result.effects?.message) {
          setFeedbackMessage(result.effects.message);
        }
        if (onDropSuccess) {
          onDropSuccess(result);
        }
      } else {
        // Drop rejected or bounced
        setBouncingZoneId(zoneId);
        if (result.effects?.message) {
          setFeedbackMessage(result.effects.message);
        }
        setTimeout(() => setBouncingZoneId(null), 1200);
      }
    },
    [stateContext, onDropSuccess]
  );

  const handleDragCancel = useCallback(() => {
    setActiveCard(null);
  }, []);

  // Screen reader announcements & instructions
  const accessibility = {
    screenReaderInstructions: {
      draggable:
        'To pick up a card, press Space or Enter. While dragging, use arrow keys to navigate between valid action zones. Press Space or Enter again to drop into the selected zone, or press Escape to cancel.',
    },
    announcements: {
      onDragStart({ active }) {
        return `Picked up ${active.data.current?.title || active.id}. Use arrow keys to target valid action zones.`;
      },
      onDragOver({ active, over }) {
        if (over) {
          const accepts = over.data.current?.accepts || [];
          const activeType = active.data.current?.type;
          const isValid = accepts.includes(activeType);
          return `Over action zone ${over.data.current?.zone?.label || over.id}. ${
            isValid ? 'Valid target zone' : 'Invalid target zone'
          }.`;
        }
        return 'Not over any action zone.';
      },
      onDragEnd({ active, over }) {
        if (over) {
          return `Dropped ${active.data.current?.title || active.id} into ${
            over.data.current?.zone?.label || over.id
          }.`;
        }
        return 'Dropped without action.';
      },
      onDragCancel() {
        return 'Dragging cancelled.';
      },
    },
  };

  return (
    <CanvasContext.Provider
      value={{
        activeCard,
        feedbackMessage,
        setFeedbackMessage,
        bouncingZoneId,
      }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        accessibility={accessibility}
      >
        {children}
        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeCard ? <DragOverlayCard card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>
    </CanvasContext.Provider>
  );
}

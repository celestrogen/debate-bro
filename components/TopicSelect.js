import React, { useContext, useState } from 'react'
import TopicElem from './DraggableTopicElem'
import { v4 as uuidv4 } from 'uuid'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { resetServerContext } from "react-beautiful-dnd"
import DraggableTopicElem from './DraggableTopicElem'
import DroppableTopicList from './DroppableTopicList'
import { topicContext } from '../pages'

resetServerContext()



export default function TopicSelect({ }) {
  const [[availableTopics, setAvailableTopics], 
  [defendTopics, setDefendTopics], 
  [attackTopics, setAttackTopics], 
  [isDragging, setIsDragging]] = useContext(topicContext)

  const droppableIdToArrayDict =
  {
    'attackTopics': [attackTopics, setAttackTopics],
    'defendTopics': [defendTopics, setDefendTopics],
    'availableTopics': [availableTopics, setAvailableTopics]
  }

  function handleDragEnd({ source, destination }) {
    setIsDragging(false)

    if (!destination) {
      return;
    }
    console.log(source, destination)

    const [sourceArray, setSourceArray] = droppableIdToArrayDict[source.droppableId]
    const [destArray, setDestArray] = droppableIdToArrayDict[destination.droppableId]
    const elem = sourceArray[source.index]

    setSourceArray(oldArray => {
      const array = [...oldArray]
      array.splice(source.index, 1)
      return array
    })
    setDestArray(oldArray => {
      const array = [...oldArray]
      array.splice(destination.index, 0, elem)
      return array
    }
    )
  }

  return (
    <>
      <DragDropContext onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd}>
        <div className='flex flex-row justify-between gap-10 my-4 text-center'>
          <div className='flex flex-col'>
            <DroppableTopicList isDragging={isDragging} title={'I want to debate in favor of'} droppableId={'defendTopics'} topicsList={defendTopics} />
          </div>
          <div className='flex flex-col '>
            <DroppableTopicList isDragging={isDragging} title={'Available Topics'} droppableId={'availableTopics'} topicsList={availableTopics} />
          </div>

          <div className='flex flex-col'>
            <DroppableTopicList isDragging={isDragging} title={'I want to debate against'} droppableId={'attackTopics'} topicsList={attackTopics} />
          </div>
        </div>
      </DragDropContext>

    </>


  )
}

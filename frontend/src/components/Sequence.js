import React from 'react'
import ModalContainer from '../containers/ModalContainer'
import AddSequenceItemModal from './AddSequenceItemModal'
import SequenceItemsContainer from '../containers/SequenceItemsContainer';
import { Button, ButtonGroup, Label } from 'react-bootstrap';
import { canStart, canAddSequenceItems } from '../models/sequences'
import { INDINumberPropertyContainer, INDISwitchPropertyContainer } from '../containers/INDIPropertyContainer'


const CameraDetailsPage = ({camera}) => {
    if(!camera)
        return null;
    let exposurePropertyComponent = null;
    let exposureAbortPropertyComponent = null;
    let labelStyle = camera.connected ? 'success' : 'warning'
    let connection = camera.connected ? 'connected' : 'not connected';
    if(camera.exposureProperty)
        exposurePropertyComponent = <INDINumberPropertyContainer property={camera.exposureProperty} readOnly={true} />
    if(camera.abortExposureProperty)
        exposureAbortPropertyComponent = <INDISwitchPropertyContainer property={camera.abortExposureProperty} />
    return (
        <div className="container">
            <h4>{camera.name} <h5><Label bsStyle={labelStyle}>{connection}</Label></h5></h4>
            {exposurePropertyComponent}
            {exposureAbortPropertyComponent}
        </div>
    )
}

const FilterWheelDetailsPage = ({filterWheel, filterNumber, filterName}) => {
    if(!filterWheel)
        return null;
    let labelStyle = filterWheel.connected ? 'success' : 'warning'
    let connection = filterWheel.connected ? 'connected' : 'not connected';
    let currentFilter = null
    if(filterWheel.connected)
        currentFilter = <p>Filter: {filterWheel.currentFilter.name} ({filterWheel.currentFilter.number})</p> 
    return (<div className="container">
        <h4>{filterWheel.name} <h5><Label bsStyle={labelStyle}>{connection}</Label></h5></h4>
        {currentFilter}
    </div>)
}

const Sequence = ({sequence, onCreateSequenceItem, navigateBack, startSequence, camera, filterWheel}) => {
    if(sequence === null)
        return null;
    return (
    <div>
        <h2>
            {sequence.name}
            <ButtonGroup className="pull-right">
                <Button onClick={navigateBack} bsSize="small">back</Button>
                <Button onClick={() => startSequence()} bsSize="small" bsStyle="success" disabled={!canStart(sequence)}>start</Button>
                <ModalContainer.Open modal="newSequenceItem" bsStyle="info" bsSize="small" className="pull-right" disabled={!canAddSequenceItems(sequence)}>new</ModalContainer.Open>
            </ButtonGroup>
        </h2>
        <ModalContainer name="newSequenceItem">
            <AddSequenceItemModal modalName="newSequenceItem" onAddSequenceItem={onCreateSequenceItem} />
        </ModalContainer>

        <SequenceItemsContainer sequenceId={sequence.id} />

        <h3>Devices</h3>
        <CameraDetailsPage camera={camera} />
        <FilterWheelDetailsPage filterWheel={filterWheel} />
    </div>
)}


export default Sequence

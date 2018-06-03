import React from 'react';
import CommitPendingValuesButton from './CommitPendingValuesButton'
import INDILight from './INDILight'
import INDIText from './INDIText'

const INDITextProperty = ({property, isWriteable, pendingValues, displayValues, addPendingValues, commitPendingValues }) => (
    <div className="row">
        <div className="col-xs-1"><INDILight state={property.state} /></div> 
        <div className="col-xs-2">{property.label}</div> 
        <div className="col-xs-8">
            {property.values.map( (value, index) => <INDIText key={index} value={value} isWriteable={isWriteable} displayValue={displayValues[value.name]} addPendingValues={addPendingValues} />)}
        </div>
        <div className="col-xs-1"><CommitPendingValuesButton bsStyle="primary" size="xsmall" isWriteable={isWriteable} commitPendingValues={commitPendingValues} /></div>
    </div>
)
 
export default INDITextProperty
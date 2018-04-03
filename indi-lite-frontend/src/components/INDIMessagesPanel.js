import React from 'react';
import { Table } from 'react-bootstrap';

const INDIMessagesPanel = ({messages}) => (
    <Table striped bordered condensed>
        <tbody>
            { [...messages].reverse().map( (m, index) => (
                <tr key={index}>
                    <td>{m.message}</td>
                </tr>
            ))}
        </tbody>
    </Table>
);

export default INDIMessagesPanel;

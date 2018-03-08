
let appendSession = (state, action) => {
    return { ...state, entities: {...state.entities, [action.session.id]: action.session}, ids: state.ids.concat(action.session.id)};
}

let addSequence = (state, action) => {
    let sessionId = action.session;
    let session = state.entities[sessionId];
    session = { ...session, sequences: session.sequences.concat(action.sequence.id) };
    return {
        ...state,
        entities: {
            ...state.entities,
            [sessionId]: {
                ...session,
            }
        }
    }
}


const sessions = (state = { entities: {}, ids: [] }, action) => {
    switch(action.type) {
        case 'SESSION_CREATED':
            return appendSession(state, action);
        case 'SEQUENCE_CREATED':
            return addSequence(state, action);
        case 'RECEIVE_SESSIONS':
            return {...state, ids: action.ids, entities: action.sessions};
        default:
            return state;
    }
}

export default sessions

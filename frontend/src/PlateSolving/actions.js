import { solveFieldAPI, fetchPlatesolvingStatus, abortSolveFieldAPI } from "../middleware/api";
import { addNotification } from '../Notifications/actions';
import { solveFromCameraSelector, getPlateSolvingMainTarget, getPlateSolvingTargets } from './selectors';

export const resetMessages = () => ({ type: 'PLATESOLVING_RESET_MESSAGES' });
export const solvingFailed = payload => ({ type: 'PLATESOLVING_FAILED', payload });
export const setMainTarget = object => ({ type: 'PLATESOLVING_SET_MAIN_TARGET', object });
export const addTargetObject = object => (dispatch, getState) => {
    const targetsEmpty = getPlateSolvingTargets(getState()).length === 0
    dispatch({ type: 'PLATESOLVING_ADD_TARGET', object });
    if(targetsEmpty) {
        dispatch(setMainTarget(object.id));
    }
};

export const receivedPlatesolvingStatus = response => ({ type: 'RESPONSE_PLATESOLVING_STATUS', response});

export const platesolvingGetStatus = () => dispatch => {
    dispatch({ type: 'FETCH_PLATESOLVING_STATUS'});
    fetchPlatesolvingStatus(
        dispatch,
        response => dispatch(receivedPlatesolvingStatus(response)),
        error => dispatch({ type: 'ERROR_FETCHING_PLATESOLVING_STATUS', error}),
    );
};



export const solveField = (options, targetName) => (dispatch, getState) => {
    dispatch({ type: 'FETCH_PLATESOLVING_SOLVE_FIELD', targetName });
    dispatch(resetMessages());
    const onSuccess = response => {
        dispatch({ type: 'RESPONSE_PLATESOLVING_STATUS', response });
    };
    const onError = (error, isJSON) => {
        if(!isJSON) {
            if(error.status === 413) {
                const error_message = 'Request body too large. You probably need to configure your web server (nginx, apache) to accept large files upload.'
                dispatch(addNotification('Platesolving failed', error_message, 'warning', 5000));
                dispatch(solvingFailed(error_message));
                return true;
            } else {
                return false;
            }
        }
        error.json().then( ({error_message}) => {
            dispatch(addNotification('Platesolving failed', error_message, 'warning', 5000));
            dispatch(solvingFailed(error_message));
        });
        return true;
    }
    const state = getState();
    const target = getPlateSolvingMainTarget(state);
    if(target) {
        options = {...options, target: getPlateSolvingTargets(state).find(t => t.id === target)};
    }
    solveFieldAPI(dispatch, onSuccess, onError, options);
}

export const PlateSolving = {
    Options: {
        camera: 'camera',
        telescope: 'telescope',
        fov: 'fov',
        fovSource: 'fovSource',
        syncTelescope: 'syncTelescope',
        slewTelescope: 'slewTelescope',
        telescopeSlewAccuracy: 'telescopeSlewAccuracy',
        downsample: 'downsample',
        searchRadius: 'searchRadius',
        telescopeType: 'telescopeType',
    },
    setOption: (option, value) => ({ type: 'PLATESOLVING_SET_OPTION', option, value }),
    resetMessages,
    message: message => ({ type: 'PLATESOLVING_MESSAGE', message }),

    fieldSolved: payload => ({ type: 'PLATESOLVING_SOLVED', payload }),
    solvingFailed,

    getStatus: platesolvingGetStatus,

    abortSolveField: () => dispatch => {
        dispatch({ type: 'SOLVE_FIELD_ABORTING' });
        const onSuccess = response => {
            dispatch({ type: 'RESPONSE_PLATESOLVING_STATUS', response });
        };
        abortSolveFieldAPI(dispatch, onSuccess);
    },

    solveField,
    addTargetObject,
    setMainTarget,
    removeTarget: object => ({ type: 'PLATESOLVING_REMOVE_TARGET', object }),
};

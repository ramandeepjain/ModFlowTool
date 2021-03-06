import {put, call, take, select} from 'redux-saga/effects';
import {buildRequest, payloadToSetModel} from '../../actions/messageBox';
import {Query, Action} from '../../t03/actions/index';
import {getApiKey} from '../../reducers/user';
import {WebData} from '../../core';

export default function* loadModelFlow() {
    // eslint-disable-next-line no-constant-condition
    while ( true ) {
        // eslint-disable-next-line no-shadow
        const action = yield take( action => action.type === Query.GET_MODFLOW_MODEL );

        yield put( WebData.Modifier.Action.responseAction( action.type, { type: 'loading' } ) );

        const state = yield select();
        const apiKey = getApiKey( state.user );
        const storedModel = (state[action.tool].model);

        try {
            if (storedModel.id !== action.id) {
                yield put(Action.destroyModflowModel());
                const model = yield call(WebData.Helpers.fetchStatusWrapper, buildRequest( 'modflowmodels/' + action.id, 'GET' ), apiKey);
                yield put( Action.setModflowModel( action.tool, payloadToSetModel( model ) ) );
                yield put( WebData.Modifier.Action.responseAction( action.type, { type: 'success', data: null } ) );
            }

            if (storedModel.boundaries.length === 0) {
                const boundaries = yield call(WebData.Helpers.fetchStatusWrapper, buildRequest('modflowmodels/' + action.id + '/boundaries', 'GET'), apiKey);
                yield put(Action.setBoundaries(action.tool, boundaries));
                yield put(WebData.Modifier.Action.responseAction(action.type, {type: 'success', data: null}));
            }
        } catch ( err ) {
            let msg = 'Unknown Error';

            if ( typeof err === 'string' ) {
                msg = err;
            } else {
                const error = err.error || { message: undefined };
                msg = error.message || msg;
            }

            yield put( WebData.Modifier.Action.responseAction( action.type, { type: 'error', msg: msg } ) );
        }
    }
}

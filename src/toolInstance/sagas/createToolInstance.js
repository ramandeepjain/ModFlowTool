import { put, take } from 'redux-saga/effects';
import { sendCommand } from '../../actions/messageBox';
import { Modifier as ToolInstance } from '../../toolInstance';
import { WebData } from '../../core';
import { push } from 'react-router-redux';

export default function* createToolInstanceFlow() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        // eslint-disable-next-line no-shadow
        const action = yield take( action => WebData.Helpers.waitForAction( action, ToolInstance.Command.CREATE_TOOL_INSTANCE ) );

        yield put( ToolInstance.Action.setToolInstance( action.tool, action.payload ) );
        yield put( sendCommand( action.type, { ...action.payload, id: action.id } ) );

        // eslint-disable-next-line no-constant-condition
        while (true) {
            // eslint-disable-next-line no-shadow
            const response = yield take( action => WebData.Helpers.waitForResponse( action, ToolInstance.Command.CREATE_TOOL_INSTANCE ) );

            if (response.webData.type === 'error') {
                break;
            }

            if (response.webData.type === 'success') {
                yield put( ToolInstance.Event.toolInstanceCreated( action.tool, action.id, action.payload ) );
                yield put(
                    push(
                        ToolInstance.Routing.editToolInstanceUrl( action.routes, action.params )( action.id )
                    )
                );
                break;
            }
        }
    }
}

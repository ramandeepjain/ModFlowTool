import { sendQuery } from '../../actions/messageBox';

/**
 * Queries send a get/load request to server and triggers an action to set data in store.
 * Usually it uses a saga for the flow.
 */

export const GET_TOOL_INSTANCE = 'GET_TOOL_INSTANCE';

export const getToolInstance = (tool, id) => {
    return sendQuery(`tools/${tool}/${id}`, GET_TOOL_INSTANCE, tool);
};

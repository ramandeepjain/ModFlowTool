import ModflowModel from '../model/ModflowModel';
import TotalTime from '../model/TotalTime';
import ResultType from '../model/ResultType';

function getInitialState() {
    return {
        layerValues: null,
        selectedLayerNumber: null,
        selectedResultType: null,
        totalTimes: null,
        selectedTotalTime: null,
        models: []
    };
}

const T07Reducer = (state = getInitialState(), action) => {
    switch (action.type) {
        case 'SET_TOOL_T07_MODEL_LIST':
            state = {...state};
            break;

        case 'SET_MODEL_DETAILS':
            state = {...state};

            const modelDetails = action.payload;
            state.models.push(ModflowModel.fromModflowDetails(modelDetails));
            break;

        case 'SET_MODEL_BOUNDARIES':
            state = {...state};
            state.models.map( m => {
                if (m.modelId === action.payload.modelId){
                    m.boundaries = action.payload.boundaries;
                    return m;
                }
            });

            break;

        case 'SET_MODEL_LAYERVALUES':
            state = {...state};
            state.layerValues = action.payload;

            if (state.selectedLayerNumber === null){
                state.selectedLayerNumber = state.layerValues.getLowestHeadLayer();
                state.selectedResultType = new ResultType('head');
            }

            break;

        case 'SET_TOTAL_TIMES':
            state = {...state};
            state.totalTimes = action.payload;

            if (state.selectedTotalTime === null){
                state.selectedTotalTime = new TotalTime(state.totalTimes.totalTimes()[state.totalTimes.totalTimes().length -1]);
            }

            break;

        case 'SET_SELECTED_LAYER':
            state = {...state};
            state.selectedLayerNumber = action.payload;
            break;

        case 'SET_SELECTED_RESULT_TYPE':
            state = {...state};
            state.selectedResultType = action.payload;
            break;

        case 'SET_SELECTED_TOTAL_TIME':
            state = {...state};
            state.selectedTotalTime = action.payload;
            break;

        case 'SET_MODEL_RESULT':
            state = {...state};
            state.models.map( m => {
               if (m.modelId === action.payload.modelId()){
                   m.result = action.payload;
                   return m;
               }
            });

            break;

        case 'TOGGLE_MODEL_SELECTION':
            state = {...state};
            state.models.map( m => {
                if (m.modelId === action.payload){
                    m.toggleSelection();
                }
            });
            break;
    }

    return state;
};

export default T07Reducer;

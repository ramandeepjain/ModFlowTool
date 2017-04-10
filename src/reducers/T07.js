import ModflowModelDifference from '../model/ModflowModelDifference';
import ModflowModels from '../model/ModflowModelsCollection';
import Coordinate from '../model/Coordinate';
import TimeSeriesPoint from '../model/TimeSeriesPoint';
import TotalTime from '../model/TotalTime';
import ResultType from '../model/ResultType';
import LayerNumber from '../model/LayerNumber';

function getInitialState() {
    return {
        resize: false,
        reload: false,
        layerValues: null,
        selectedLayerNumber: null,
        selectedResultType: null,
        totalTimes: null,
        selectedTotalTimeIndex: null,
        models: new ModflowModels(),
        t07bDifference: null,
        t07bSelectedModelIds: null,
        T07BResult: null,
        timeSeriesPoints: [], // for T07C
        mapPosition: {
            bounds: [ {
                lat: -90,
                lng: -180
            }, {
                lat: 90,
                lng: 180
            } ]
        },
        activeCoordinate: null
    };
}

const T07Reducer = ( state = getInitialState(), action ) => {
    switch ( action.type ) {
        case 'T07_ADD_MODEL':
            state = { ...state };
            state.models.push( action.payload );
            state.resize = true;
            break;

        case 'T07_RELOAD_DONE':
            state = { ...state};
            state.reload = false;
            break;

        case 'T07_RESIZE_DONE':
            state = { ...state};
            state.resize = false;
            break;

        case 'T07_SET_MODEL_BOUNDARIES':
            state = { ...state };
            state.models.map( m => {
                if ( m.modelId === action.payload.modelId ) {
                    m.boundaries = action.payload.boundaries;
                    return m;
                }
                return null;
            } );

            break;

        case 'T07_SET_MODEL_LAYERVALUES':
            state = { ...state };
            state.layerValues = action.payload;

            if ( state.selectedLayerNumber === null ) {
                if ( state.layerValues.getLowestHeadLayer() instanceof LayerNumber ) {
                    state.selectedLayerNumber = state.layerValues.getLowestHeadLayer();
                    state.selectedResultType = new ResultType( 'head' );
                    break;
                }
            }

            break;

        case 'T07_SET_TOTAL_TIMES':
            state = { ...state };
            state.totalTimes = action.payload;
            state.reload = true;

            if ( state.selectedTotalTime === null ) {
                state.selectedTotalTime = new TotalTime( state.totalTimes.totalTimes[ state.totalTimes.totalTimes.length - 1 ] );
            }

            if ( state.selectedTotalTimeIndex === null ) {
                state.selectedTotalTimeIndex = state.totalTimes.length-1;
            }

            break;

        case 'T07_SET_SELECTED_LAYER':
            state = { ...state };
            state.selectedLayerNumber = action.payload;
            break;

        case 'T07_SET_SELECTED_RESULT_TYPE':
            state = { ...state };
            state.selectedResultType = action.payload;
            break;

        case 'T07_SET_SELECTED_TOTAL_TIME_INDEX':
            state = { ...state };
            state.selectedTotalTimeIndex = action.payload;
            break;

        case 'T07A_SET_MODEL_RESULT':
            state = { ...state };
            state.models.map( m => {
                if ( m.modelId === action.payload.modelId() ) {
                    m.result = action.payload;
                    return m;
                }
            } );

            break;

        case 'T07_TOGGLE_MODEL_SELECTION':
            state = { ...state };
            state.models.map( m => {
                if ( m.modelId === action.payload ) {
                    m.toggleSelection();
                }
            } );
            break;

        case 'T07_SET_BOUNDS':
            state = {
                ...state,
                mapPosition: action.payload
            };
            break;

        case 'T07_SET_MAP_VIEW':
            state = {
                ...state,
                mapPosition: action.payload
            };
            break;

        case 'T07_SET_ACTIVE_COORDINATE':
            if ( !( action.payload instanceof Coordinate ) ) {
                throw new Error( 'Expected first parameter to be a Coordinate, but got ' + ( typeof action.payload ) );
            }

            state = {
                ...state,
                activeCoordinate: action.payload
            };
            break;

        case 'T07B_SETUP':
            state = {...state};
            if (state.t07bDifference === null) {
                const models = state.models;
                if (models.count() > 1) {
                    const model1 = models.models[0];
                    const model2 = models.models[1];

                    state.t07bDifference = new ModflowModelDifference(
                        model1.modelId,
                        model2.modelId,
                        model1.area,
                        model1.grid
                    );

                    state.t07bSelectedModelIds = state.t07bDifference.modelIds();
                }
            }
            break;

        case 'T07B_SET_SELECTED_MODEL_IDS':
            state = { ...state };
            state.t07bSelectedModelIds = action.payload;
            break;

        case 'T07B_SET_RESULT':
            state = { ...state};
            state.t07bDifference.updateResult(action.payload);

            break;

        case 'T07_ADD_TIME_SERIES_POINT':
            if ( !( action.payload instanceof TimeSeriesPoint ) ) {
                throw new Error( 'Expected first parameter to be a TimeSeriesPoint, but got ' + ( typeof action.payload ) );
            }

            state = { ...state };
            state.timeSeriesPoints.push( action.payload );
            break;

        case 'T07_SET_TIME_SERIES_POINT_SELECTION':
            state = { ...state };
            state.timeSeriesPoints[ action.payload.index ].selected = action.payload.selected;
            break;

        case 'T07_SET_TIME_SERIES_POINT_RESULT':
            state = { ...state };
            const { coordinate, timeSeriesResult } = action.payload;
            const timeSeriesPoint = state.timeSeriesPoints.find( p => { return ( p.coordinate.sameAs( coordinate ) ); } );
            if ( timeSeriesPoint ) {
                timeSeriesPoint.addResult(timeSeriesResult);
            }

    }

    return state;
};

export default T07Reducer;
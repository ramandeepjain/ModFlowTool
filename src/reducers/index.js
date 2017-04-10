import { combineReducers } from 'redux';
import { routerReducer as routing } from 'react-router-redux';

import appState from './applicationStateReducer';
// import model from './modelReducer';
import dashboard from './dashboard';
// import models from './modelsReducer';
import T02 from './T02';
import T06 from './T06';
import T07 from './T07';
import T09A from './T09A';
import T09B from './T09B';
import T09C from './T09C';
import T09D from './T09D';
import T09E from './T09E';
import T13A from './T13A';
import T13B from './T13B';
import T13C from './T13C';
import T13E from './T13E';
import T14A from './T14A';
import T14B from './T14B';
import T14C from './T14C';
import T14D from './T14D';
import T16A from './T16A';
import T18 from './T18';
// import scenarioAnalysis from './scenarioAnalysisReducer';
import user from './user';

const rootReducer = combineReducers( {
    routing,
    user,
    appState,
    dashboard,
    // models,
    // model,
    // scenarioAnalysis,
    T02,
    T06,
    T07,
    T09A,
    T09B,
    T09C,
    T09D,
    T09E,
    T13A,
    T13B,
    T13C,
    T13E,
    T14A,
    T14B,
    T14C,
    T14D,
    T16A,
    T18
} );

export default rootReducer;
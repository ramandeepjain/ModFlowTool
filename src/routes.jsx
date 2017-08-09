import React from 'react';
import { Route, IndexRoute, browserHistory } from 'react-router';
import AppForAuthenticatedUser from './containers/AppForAuthenticatedUser';
import tools from './containers/tools';
import {Container as T03} from './t03/index';
import Dashboard from './containers/Dashboard';
import Login from './containers/Login';
import LandingPage from './containers/LandingPage';
import Impressum from './containers/Impressum';
import {Modifier} from "./t03/index";
import {WebData} from "./core";

export const editBoundary = (tool, id, property, type, boundaryId) => {
    const url = '/tools/' + tool + '/' + id + '/' + property + '/' + type + '/' + boundaryId;

    browserHistory.push(url);
};

export const newBoundary = (tool, id, property, type) => {
    const url = '/tools/' + tool + '/' + id + '/' + property + '/' + type;

    browserHistory.push(url);
};

const routes = (store) => (
    <Route path="/">
        <IndexRoute component={LandingPage}/>
        <Route path="impressum" component={Impressum}/>
        <Route path="tools" component={AppForAuthenticatedUser}>
            <IndexRoute component={Dashboard}/>
            <Route path="T02(/:id)" component={tools.T02}/>
            <Route path="T03(/:id)(/:property)(/:type)(/:pid)" component={T03.Main} tool={'T03'}
                onEnter={ (nextState) => {
                   if (nextState.params.id) {
                       store.dispatch(Modifier.Query.getModflowModel('T03', nextState.params.id));
                       if (nextState.params.pid) {
                           store.dispatch(Modifier.Query.getBoundary('T03', nextState.params.id, nextState.params.pid));
                       }
                       return;
                   }

                   store.dispatch(WebData.Modifier.Action.reset());
                   store.dispatch(Modifier.Action.destroyModflowModel('T03'));
                }}
            />
            <Route path="T06(/:id)" component={tools.T06}/>
            <Route path="T07A/:id" component={tools.T07A}/>
            <Route path="T07B/:id" component={tools.T07B}/>
            <Route path="T07C/:id" component={tools.T07C}/>
            <Route path="T07D/:id" component={tools.T07D}/>
            <Route path="T07E(/:id)" component={tools.T07E}/>
            <Route path="T08/:id" component={tools.T08}/>
            <Route path="T09(/:id)" component={tools.T09}/>
            <Route path="T09A(/:id)" component={tools.T09A}/>
            <Route path="T09B(/:id)" component={tools.T09B}/>
            <Route path="T09C(/:id)" component={tools.T09C}/>
            <Route path="T09D(/:id)" component={tools.T09D}/>
            <Route path="T09E(/:id)" component={tools.T09E}/>
            <Route path="T13(/:id)" component={tools.T13}/>
            <Route path="T13A(/:id)" component={tools.T13A}/>
            <Route path="T13B(/:id)" component={tools.T13B}/>
            <Route path="T13C(/:id)" component={tools.T13C}/>
            <Route path="T13D(/:id)" component={tools.T13D}/>
            <Route path="T13E(/:id)" component={tools.T13E}/>
            <Route path="T14(/:id)" component={tools.T14}/>
            <Route path="T14A(/:id)" component={tools.T14A}/>
            <Route path="T14B(/:id)" component={tools.T14B}/>
            <Route path="T14C(/:id)" component={tools.T14C}/>
            <Route path="T14D(/:id)" component={tools.T14D}/>
            <Route path="T16(/:id)" component={tools.T16}/>
            <Route path="T17(/:id)" component={tools.T17}/>
            <Route path="T18(/:id)" component={tools.T18}/>
        </Route>
        <Route path="login" component={Login}/>
    </Route>
);

export default routes;

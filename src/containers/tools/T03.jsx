import * as actions from '../../actions/T03';

import React, { Component } from 'react';
import { getArea, getFirstAreaCoordinate, getLastAreaCoordinate } from '../../reducers/T03/model';
import { getState, getMapPosition, getMousePositionOnMap, getDraggedAreaCoordinate, getActiveAreaCoordinate } from '../../reducers/T03/ui';

import ModelEditorMap from '../../components/primitive/ModelEditorMap';
import Navbar from '../Navbar';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

class T03 extends Component {

    state = {
        navigation: [ ]
    }

    render( ) {
        const { navigation } = this.state;

        return (
            <div className="toolT03">
                <Navbar links={navigation}/>
                <ModelEditorMap {...this.props}/>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        state: getState( state.T03.ui ),
        area: getArea( state.T03.model ),
        firstAreaCoordinate: getFirstAreaCoordinate( state.T03.model ),
        lastAreaCoordinate: getLastAreaCoordinate( state.T03.model ),
        mapPosition: getMapPosition( state.T03.ui ),
        mousePositionOnMap: getMousePositionOnMap( state.T03.ui ),
        draggedAreaCoordinate: getDraggedAreaCoordinate( state.T03.ui ),
        activeAreaCoordinate: getActiveAreaCoordinate( state.T03.ui )
    };
};

// TODO get id from router param (this is why we'll need withRouter)
// eslint-disable-next-line no-class-assign
T03 = withRouter( connect( mapStateToProps, actions )( T03 ));

export default T03;
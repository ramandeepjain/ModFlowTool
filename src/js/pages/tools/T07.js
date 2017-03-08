import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

import CrossSectionMap from '../../components/primitive/CrossSectionMap';
import Drawer from '../../components/primitive/Drawer';
import Header from '../../components/tools/Header';
import Icon from '../../components/primitive/Icon';
import Navbar from '../Navbar';
import ScenarioSelect from '../../components/tools/ScenarioSelect';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';

import '../../../less/4TileTool.less';
import '../../../less/toolT07.less';

import {
    fetchModelDetails,
    updateResults,
    setSelectedLayer,
    setSelectedResultType,
    setSelectedTotalTime,
    toggleModelSelection,
    setMapView,
    setActiveGridCell
} from '../../actions/T07';

import LayerNumber from '../../model/LayerNumber';
import ResultType from '../../model/ResultType';
import TotalTime from '../../model/TotalTime';
import ModflowModelResult from '../../model/ModflowModelResult';

@connect(( store ) => {
    return { tool: store.T07 };
})
export default class T07 extends Component {

    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        params: PropTypes.object,
        tool: PropTypes.object.isRequired
    };

    state = {
        navigation: [
            {
                name: 'Cross section',
                path: '',
                icon: <Icon name="layer_horizontal_hatched"/>
            }, {
                name: 'Scenarios difference',
                path: '',
                icon: <Icon name="layer_horizontal_hatched"/>
            }, {
                name: 'Time series',
                path: '',
                icon: <Icon name="layer_horizontal_hatched"/>
            }, {
                name: 'Overall budget',
                path: '',
                icon: <Icon name="layer_horizontal_hatched"/>
            }
        ]
    };

    componentWillMount( ) {
        this.props.dispatch(fetchModelDetails( this.props.params.id ));
    }

    setCrossSection = ( cell ) => {
        this.props.dispatch( setActiveGridCell(cell) );
    };

    toggleSelection = id => {
        return ( e ) => {
            this.props.dispatch(toggleModelSelection( id ));
            this.updateModelResults( this.props.tool.selectedResultType, this.props.tool.selectedLayerNumber, this.props.tool.selectedTotalTime );

            // manually emit a resize event so the leaflet maps recalculate their container size
            const event = document.createEvent( 'HTMLEvents' );
            event.initEvent( 'resize', true, false );
            e.target.dispatchEvent( event );
        };
    };

    changeLayerValue = ( layerNumber, resultType ) => {
        this.props.dispatch(setSelectedLayer( layerNumber ));
        this.props.dispatch(setSelectedResultType( resultType ));
        this.updateModelResults( resultType, layerNumber, this.props.tool.selectedTotalTime );
    };

    changeTotalTime = totalTime => {
        this.props.dispatch(setSelectedTotalTime( totalTime ));
        this.updateModelResults( this.props.tool.selectedResultType, this.props.tool.selectedLayerNumber, totalTime );
    };

    updateModelResults( resultType, layerNumber, totalTime ) {
        if ( layerNumber instanceof LayerNumber === false ) {
            console.error( 'Cannot update ModelResults, due layerNumber is not from Type LayerNumber.' );
            return;
        }

        if ( resultType instanceof ResultType === false ) {
            console.error( 'Cannot update ModelResults, due resultType is not from Type ResultType.' );
            return;
        }

        if ( totalTime instanceof TotalTime === false ) {
            console.error( 'Cannot update ModelResults, due totalTime is not from Type TotalTime.' );
            return;
        }

        this.props.tool.models.forEach(m => {
            if ( m.isSelected( ) == false ) {
                return;
            }

            if ( m.result instanceof ModflowModelResult ) {
                if (m.result.resultType( ).sameAs( resultType ) && m.result.layerNumber( ).sameAs( layerNumber ) && m.result.totalTime( ).sameAs( totalTime )) {
                    return;
                }
            }

            this.props.dispatch(updateResults( m.modelId, resultType, layerNumber, totalTime ));
        });
    }

    updateMapView = ( latLng, zoom ) => {
        this.props.dispatch(setMapView( latLng, zoom ));
    };

    renderMaps( models ) {
        const { mapPosition, activeGridCell } = this.props.tool;
        return models.filter(model => {
            return model.selected;
        }).map(( model ) => {
            return (
                <section key={model.modelId} className="tile col col-min-2 stretch">
                    <CrossSectionMap model={model} min={models[0].minValue( )} max={models[0].maxValue( )} mapPosition={mapPosition} updateMapView={this.updateMapView} setClickedCell={this.setCrossSection} activeCell={activeGridCell}/>
                </section>
            );
        });
    }

    render( ) {
        const { navigation } = this.state;

        let { models } = this.props.tool;

        models = models.map(m => {
            m.thumbnail = 'scenarios_thumb.png';
            return m;
        });

        return (
            <div className="toolT07 app-width">
                <Navbar links={navigation}/>
                <Drawer visible>
                    <ScenarioSelect scenarios={models} toggleSelection={this.toggleSelection}/>
                </Drawer>
                <Header title={'T07. Scenario Analysis'}/>
                <div className="grid-container">
                    {this.renderMaps( models )}
                </div>

                <div className="grid-container">
                    <section className="tile col stretch">
                        <ResponsiveContainer width={'100%'} aspect={3}>
                            <LineChart data={[
                                {
                                    x: 0,
                                    z: 0
                                }, {
                                    x: 1,
                                    z: 1
                                }, {
                                    x: 2,
                                    z: 4
                                }
                            ]} margin={{
                                top: 20,
                                right: 20,
                                left: 20,
                                bottom: 20
                            }}>
                                <XAxis label="x" type="number" dataKey="x"/>
                                <YAxis label="z" type="number" domain={[ 'auto', 'auto' ]}/>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <Line isAnimationActive={false} dataKey={'z'} stroke="#1EB1ED" strokeWidth="2"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </section>
                </div>
            </div>
        );
    }
}

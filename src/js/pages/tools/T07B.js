import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Chart from 'react-c3js';

import CrossSectionMap from '../../components/primitive/CrossSectionMap';
import Header from '../../components/tools/Header';
import Icon from '../../components/primitive/Icon';
import RangeSlider from '../../components/primitive/RangeSlider';
import Navbar from '../Navbar';

import '../../../less/4TileTool.less';
import '../../../less/toolT07.less';

import {
    fetchModelDetails,
    updateResultsT07B,
    setSelectedLayer,
    setSelectedResultType,
    setSelectedTotalTimeIndex,
    setMapView,
    setBounds,
    setActiveGridCell
} from '../../actions/T07';

import LayerNumber from '../../model/LayerNumber';
import ResultType from '../../model/ResultType';
import TotalTime from '../../model/TotalTime';
import ModflowModelResult from '../../model/ModflowModelResult';

@connect(( store ) => {
    return { tool: store.T07 };
})
export default class T07B extends Component {

    static propTypes = {
        dispatch: PropTypes.func.isRequired,
        params: PropTypes.object,
        tool: PropTypes.object.isRequired
    };

    constructor( props ) {
        super( props );

        this.state = {
            navigation: [
                {
                    name: 'Cross section',
                    path: 'tools/T07A/' + props.params.id,
                    icon: <Icon name="layer_horizontal_hatched"/>
                }, {
                    name: 'Scenarios difference',
                    path: 'tools/T07B/' + props.params.id,
                    icon: <Icon name="layer_horizontal_hatched"/>
                }, {
                    name: 'Time series',
                    path: 'tools/T07C/' + props.params.id,
                    icon: <Icon name="layer_horizontal_hatched"/>
                }, {
                    name: 'Overall budget',
                    path: 'tools/T07D/' + props.params.id,
                    icon: <Icon name="layer_horizontal_hatched"/>
                }
            ]
        };
    }

    componentWillMount( ) {
        this.props.dispatch(fetchModelDetails( this.props.params.id ));
    }

    changeLayerValue = ( layerNumber, resultType ) => {
        this.props.dispatch(setSelectedLayer( layerNumber ));
        this.props.dispatch(setSelectedResultType( resultType ));
        this.updateModelResults( resultType, layerNumber, this.props.tool.selectedTotalTimeIndex );
    };

    updateModelResults( resultType, layerNumber, totalTimeIndex ) {
        if ( layerNumber instanceof LayerNumber === false ) {
            console.error( 'Cannot update ModelResults, due layerNumber is not from Type LayerNumber.' );
            return;
        }

        if ( resultType instanceof ResultType === false ) {
            console.error( 'Cannot update ModelResults, due resultType is not from Type ResultType.' );
            return;
        }

        const totalTimes = this.props.tool.totalTimes.totalTimes;

        const totalTime = ( totalTimeIndex === null )
            ? new TotalTime(totalTimes[totalTimes.length - 1])
            : new TotalTime(totalTimes[totalTimeIndex]);

        this.props.tool.models.forEach(m => {
            if ( m.isSelected( ) === false ) {
                return;
            }

            if ( m.result instanceof ModflowModelResult ) {
                if (m.result.resultType( ).sameAs( resultType ) && m.result.layerNumber( ).sameAs( layerNumber ) && m.result.totalTime( ).sameAs( totalTime )) {
                    return;
                }
            }

            this.props.dispatch(updateResultsT07B( m.modelId, resultType, layerNumber, totalTime ));
        });
    }

    selectLayer = ( e ) => {
        const valueSplitted = e.target.value.split( '_' );
        this.changeLayerValue(new LayerNumber(valueSplitted[0]), new ResultType(valueSplitted[1]));
    };

    renderSelectOptions( options, optionIndex ) {
        return options.map(( o, index ) => {
            return (
                <option key={index} value={optionIndex + '_' + o}>{'Layer ' + optionIndex + ' ' + o}</option>
            );
        });
    }

    renderSelectOptgroups( layerValues ) {
        if ( layerValues !== null ) {
            return layerValues.map(( l, index ) => {
                return (
                    <optgroup key={index} label={'Layer ' + index}>
                        {this.renderSelectOptions( l, index )}
                    </optgroup>
                );
            });
        }
        return null;
    }

    renderLayerSelect( ) {
        return (
            <select className="select block" onChange={this.selectLayer} value={this.props.tool.selectedLayerNumber + '_' + this.props.tool.selectedResultType}>
                {this.renderSelectOptgroups( this.props.tool.layerValues )}
            </select>
        );
    }

    updateMapView = ( latLng, zoom ) => {
        this.props.dispatch(setMapView( latLng, zoom ));
    };

    updateBounds = ( bounds ) => {
        this.props.dispatch(setBounds( bounds ));
    };

    setCrossSection = ( cell ) => {
        this.props.dispatch(setActiveGridCell( cell ));
    };

    renderMaps( model ) {
        const { mapPosition, activeGridCell } = this.props.tool;
        return (
            <section className="tile col stretch">
                <CrossSectionMap model={model} min={model[0].minValue( )} max={model[0].maxValue( )} mapPosition={mapPosition} updateMapView={this.updateMapView} updateBounds={this.updateBounds} setClickedCell={this.setCrossSection} activeCell={activeGridCell}/>
            </section>
        );
    }

    renderChart( ) {
        const models = this.props.tool.models;

        if ( models.countModelsWithResults( ) === 0 ) {
            return null;
        }

        const rowNumber = this.props.tool.activeGridCell.y;
        if ( rowNumber === null ) {
            return null;
        }

        const colNumber = this.props.tool.activeGridCell.x;
        if ( colNumber === null ) {
            return null;
        }

        const columns = [ ];
        models.models( ).forEach(m => {
            if (m.isSelected( ) && m.hasResult( )) {
                columns.push(m.chartDataByRowNumber( rowNumber ));
            }
        });

        const chartData = {
            columns: columns
        };

        let grid = {};
        let axis = {};

        const baseModel = models.baseModel( );
        if (baseModel.hasResult( )) {
            chartData.x = 'x';
            columns.unshift(baseModel.columnXAxis( ));
            grid = {
                x: {
                    show: true,
                    lines: [
                        {
                            value: baseModel.chartLeftBorderByRowNumber( rowNumber ),
                            text: 'Eastern model border',
                            position: 'middle'
                        }, {
                            value: baseModel.chartRightBorderByRowNumber( rowNumber ),
                            text: 'Western model border',
                            position: 'middle'
                        }, {
                            value: baseModel.coordinateByGridCell( colNumber, rowNumber ).x,
                            text: 'Selected column',
                            position: 'middle'
                        }
                    ]
                }
            };

            axis = {
                x: {
                    label: baseModel.labelXAxis( )
                },
                y: {
                    label: baseModel.labelYAxis( )
                }
            };
        }

        return (
            <div className="grid-container">
                <section className="tile col stretch">
                    <Chart data={chartData} grid={grid} axis={axis} transition={{
                        duration: 0
                    }} element="testchart"/>
                </section>
            </div>
        );
    }

    changeTotalTimeIndex = index => {
        this.props.dispatch(setSelectedTotalTimeIndex( index ));
        this.updateModelResults( this.props.tool.selectedResultType, this.props.tool.selectedLayerNumber, this.props.tool.selectedTotalTimeIndex );
    };

    renderSlider( ) {
        if ( !this.props.tool.totalTimes ) {
            return null;
        }

        const totalTimes = this.props.tool.totalTimes.totalTimes;
        let sliderValue = this.props.tool.selectedTotalTimeIndex;
        if ( sliderValue === null ) {
            sliderValue = totalTimes.length - 1;
        }
        return ( <RangeSlider data={totalTimes} startDate={this.props.tool.totalTimes.start( )} step={1} value={sliderValue} onChange={this.changeTotalTimeIndex}/> );
    }

    render( ) {
        const { navigation } = this.state;
        // let models = this.props.tool.models.models( );
        // models = models.map(m => {
        //     m.thumbnail = 'scenarios_thumb.png';
        //     return m;
        // });

        return (
            <div className="toolT07 app-width">
                <Navbar links={navigation}/>
                <Header title={'T07. Scenario Analysis'}/>
                <div className="grid-container">
                    <div className="tile col col-abs-1 center-horizontal">
                        {this.renderLayerSelect( )}
                    </div>
                    <div className="tile col col-abs-4 center-horizontal">
                        <select className="select block col stretch">
                            <option>1</option>
                            <option>2</option>
                        </select>
                        <Icon className="col" name="minus" />
                        <select className="select block col stretch">
                            <option>1</option>
                            <option>2</option>
                        </select>
                    </div>
                </div>
                <div className="grid-container">
                    {/* this.renderMap( model )*/}
                </div>
                <div className="grid-container">
                    <div className="tile col stretch">
                        {this.renderSlider( )}
                    </div>
                </div>
                {this.renderChart( )}
            </div>
        );
    }
}
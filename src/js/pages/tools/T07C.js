import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Chart from 'react-c3js';

import Drawer from '../../components/primitive/Drawer';
import CrossSectionMap from '../../components/primitive/CrossSectionMap';
import Header from '../../components/tools/Header';
import Icon from '../../components/primitive/Icon';
import Navbar from '../Navbar';
import ScenarioSelect from '../../components/tools/ScenarioSelect';

import '../../../less/4TileTool.less';
import '../../../less/toolT07.less';

import {
    fetchModelDetails,
    setSelectedLayer,
    setSelectedResultType,
    setSelectedTotalTimeIndex,
    toggleModelSelection,
    setMapView,
    setBounds,
    addTimeSeriesPoint,
    setTimeSeriesPointSelection,
    fetchTimeSeries
} from '../../actions/T07';

import LayerNumber from '../../model/LayerNumber';
import ResultType from '../../model/ResultType';
import TimeSeriesPoint from '../../model/TimeSeriesPoint';

@connect(( store ) => {
    return { tool: store.T07 };
})
export default class T07C extends Component {

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

    fetchTimeSeriesForPoint( coordinate, modelId, resultType, layerNumber, gridCell, startDate) {
        this.props.dispatch(fetchTimeSeries(coordinate, modelId, resultType, layerNumber, gridCell.x, gridCell.y, startDate ));
    }

    fetchTimeSeriesForPoints(models, resultType, layerNumber, timeSeriesPoints, startDate) {
        timeSeriesPoints.filter( p => {return p.selected;}).forEach(p => {
            models.filter(m => {return m.selected;}).forEach(m => {
                const gridCell = m.grid.coordinateToGridCell(p.coordinate);
                this.fetchTimeSeriesForPoint( p.coordinate, m.modelId, resultType, layerNumber, gridCell, startDate);
            });
        });
    }

    toggleScenarioSelection = id => {
        return () => {
            this.props.dispatch(toggleModelSelection( id ));

            // update results
            const {models, selectedResultType, selectedLayerNumber, timeSeriesPoints, totalTimes} = this.props.tool;
            this.fetchTimeSeriesForPoints(models, selectedResultType, selectedLayerNumber, timeSeriesPoints, new Date(totalTimes.start));
        };
    };

    changeLayerValue = ( layerNumber, resultType ) => {
        this.props.dispatch(setSelectedLayer( layerNumber ));
        this.props.dispatch(setSelectedResultType( resultType ));

        // update results
        const {models, timeSeriesPoints, totalTimes} = this.props.tool;
        this.fetchTimeSeriesForPoints(models, resultType, layerNumber, timeSeriesPoints, new Date(totalTimes.start));
    };

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

    renderSelect( ) {
        return (
            <select className="layer-select select block" onChange={this.selectLayer} value={this.props.tool.selectedLayerNumber + '_' + this.props.tool.selectedResultType}>
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

    addPoint = ( coordinate ) => {
        const { models } = this.props.tool;
        const grid = models.baseModel.grid;
        const gridCell = grid.coordinateToGridCell(coordinate);

        if(!grid.isGridCellInGrid(gridCell)) {
            return;
        }
        const { timeSeriesPoints } = this.props.tool;
        // add Point to store
        const point = new TimeSeriesPoint('Point ' + timeSeriesPoints.length);
        point.coordinate = coordinate;
        this.props.dispatch(addTimeSeriesPoint( point ));

        // fetch data for this point
        const { selectedResultType, selectedLayerNumber, totalTimes } = this.props.tool;
        models.filter(m => {return m.selected;}).forEach(m => {
            this.fetchTimeSeriesForPoint( coordinate, m.modelId, selectedResultType, selectedLayerNumber, gridCell, new Date(totalTimes.start));
        });
    }

    renderMap( ) {
        const { models, mapPosition, timeSeriesPoints } = this.props.tool;

        if ( models.length <= 0 ) {
            return null;
        }

        const baseModel = models.baseModel;

        const activeCoordinates = timeSeriesPoints.map(p =>{
            const gridCell = baseModel.grid.coordinateToGridCell(p.coordinate);
            const boundingBox = baseModel.grid.gridCellToBoundingBox(gridCell);
            return boundingBox;
        });

        const model = models.baseModel;
        return (
            <CrossSectionMap mapData={model.mapData(null, activeCoordinates, models.globalMinValue(), models.globalMaxValue())} mapPosition={mapPosition} updateMapView={this.updateMapView} updateBounds={this.updateBounds} clickCoordinate={this.addPoint}/>
        );
    }

    setTimeSeriesPointSelection = index => {
        return e => {
            this.props.dispatch(setTimeSeriesPointSelection(index, e.target.checked));
        };
    }

    renderTable() {
        const { timeSeriesPoints } = this.props.tool;
        return(<table className="table">
            <thead>
                <tr>
                    <th>Active</th>
                    <th>Point</th>
                    <th>Latitude</th>
                    <th>Longitude</th>
                </tr>
            </thead>
            <tbody>
                {timeSeriesPoints.map((p, index) => {
                    return(<tr key={index}>
                        <td><input onChange={this.setTimeSeriesPointSelection(index)} checked={p.selected} type="checkbox"/></td>
                        <td>{p.name}</td>
                        <td>{p.coordinate.lat}</td>
                        <td>{p.coordinate.lng}</td>
                    </tr>);
                })}
            </tbody>
        </table>);
    }

    renderChart( ) {
        const {models, totalTimes, timeSeriesPoints, selectedResultType, selectedLayerNumber} = this.props.tool;

        if(!models || !totalTimes) {
            return null;
        }

        const grid = {};
        const axis = {};
        const chartData = {
            x: 'x',
            columns: []
        };

        chartData.columns.push(['x'].concat(totalTimes.totalTimes));

        timeSeriesPoints.filter( p => {return p.selected;}).forEach(p => {
            models.filter(m => {return m.selected;}).forEach(m => {
                const result = p.timeSeriesResults.find(r => {return (m.modelId === r.modelId && selectedResultType.sameAs(r.resultType) &&  selectedLayerNumber.sameAs(r.layerNumber));});
                if (result && result.timeSeries) {
                    const resultColumn = [p.name + ' ' + m.name];
                    chartData.columns.push(resultColumn.concat(result.timeSeries.values));
                }
            });
        });

        // axis = {
        //     x: {
        //         label: baseModel.labelXAxis()
        //     },
        //     y: {
        //         label: baseModel.labelYAxis()
        //     }
        // };

        return (
            <div className="grid-container">
                <section className="tile col stretch">
                    <Chart data={chartData} grid={grid} axis={axis} transition={{duration: 0}} element="testchart" />
                </section>
            </div>
        );
    }

    changeTotalTimeIndex = index => {
        this.props.dispatch(setSelectedTotalTimeIndex( index ));
        this.updateModelResults( this.props.tool.selectedResultType, this.props.tool.selectedLayerNumber, this.props.tool.selectedTotalTimeIndex );
    };

    render( ) {
        const { navigation } = this.state;
        const models = this.props.tool.models.map(m => {
            m.thumbnail = 'scenarios_thumb.png';
            return m;
        });

        return (
            <div className="toolT07 app-width">
                <Navbar links={navigation}/>
                <Drawer visible>
                    <ScenarioSelect scenarios={models} toggleSelection={this.toggleScenarioSelection}/>
                </Drawer>
                <Header title={'T07. Scenario Analysis'}/>
                <div className="grid-container">
                    <div className="tile col col-abs-1 center-horizontal">
                        {this.renderSelect( )}
                    </div>
                </div>
                <div className="grid-container">
                    <section className="tile col col-abs-3">
                        {this.renderMap( )}
                    </section>
                    <section className="tile col col-abs-2">
                        {this.renderTable()}
                    </section>
                </div>
                {this.renderChart( )}
            </div>
        );
    }
}

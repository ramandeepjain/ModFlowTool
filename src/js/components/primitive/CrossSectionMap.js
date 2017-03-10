import React, { PropTypes, Component } from 'react';

import { Map, TileLayer, Rectangle, GeoJSON, ImageOverlay, CircleMarker, LayersControl, LayerGroup } from 'react-leaflet';

import Icon from './Icon';
import ColorLegend from './ColorLegend';

import '../../../less/leaflet.less';
import '../../../less/crossSectionMap.less';

export default class CrossSectionMap extends Component {

    static propTypes = {
        model: PropTypes.object.isRequired,
        updateMapView: PropTypes.func.isRequired,
        updateBounds: PropTypes.func.isRequired,
        mapPosition: PropTypes.object.isRequired,
        setClickedCell: PropTypes.func.isRequired,
        min: PropTypes.number,
        max: PropTypes.number,
        activeCell: PropTypes.object
    };

    state = {
        styles: {
            crossSectionSelection: {color: '#000', weight: 0.5, opacity: 0.5, fillColor: '#000', fillOpacity: 0.5},
            inactive: {color: '#000', weight: 0, fillColor: '#000', fillOpacity: 0.7},
            active: {color: '#ff7800', weight: 0, fillColor: '#000', fillOpacity: 0},
            boundingBox: {color: '#000', weight: 0.5, fillColor: 'blue', fillOpacity: 0.1},
            area: {color: '#000', weight: 0.5, fillColor: 'blue', fillOpacity: 0.1},
            hasNoWell: {color: '#000', weight: 0, fillOpacity: 0},
            hasWell: {color: 'blue', weight: 1, fillColor: 'darkblue', fillOpacity: 1},
            wells: {
                cw: {radius: 3, color: 'black', weight: 1, fillColor: 'darkgreen', fillOpacity: 0.7},
                iw: {radius: 3, color: 'black', weight: 1, fillColor: 'darkgreen', fillOpacity: 0.7},
                sniw: {radius: 5, color: 'red', weight: 2, fillColor: 'darkgreen', fillOpacity: 0.7},
                puw: {radius: 3, color: 'black', weight: 1, fillColor: 'darkblue', fillOpacity: 0.7},
                snpw: {radius: 5, color: 'red', weight: 2, fillColor: 'darkblue', fillOpacity: 0.7},
                prw: {radius: 3, color: 'black', weight: 1, fillColor: 'darkblue', fillOpacity: 0.7},
                smw: {radius: 5, color: 'black', weight: 1, fillColor: 'red', fillOpacity: 1},
                snw: {radius: 5, color: 'black', weight: 1, fillColor: 'yellow', fillOpacity: 1},
                snifw: {radius: 5, color: '#63b3ea', weight: 2, fillColor: '#bbdff6', fillOpacity: 0.7}
            },
            river: {color: '#000', weight: 0.5, fillColor: 'blue', fillOpacity: 0}
        },
    };

    handleMove = e => {
        const zoom = e.target.getZoom();
        const center = e.target.getCenter();

        this.props.updateMapView({lat: center.lat, lng: center.lng}, zoom);
    };

    resetView = () => {
        const {model} = this.props;
        this.props.updateBounds([{
            lat: model.boundingBox.y_min,
            lng: model.boundingBox.x_min
        }, {
            lat: model.boundingBox.y_max,
            lng: model.boundingBox.x_max
        }]);
    };

    handleClick = e => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        const { model } = this.props;
        const boundingBox = model.boundingBox;
        const grid = model.gridSize;

        const dlat = ( boundingBox.y_max - boundingBox.y_min) / grid.n_y; // row width of bounding box grid
        const dlng = ( boundingBox.x_max - boundingBox.x_min) / grid.n_x; // column width of bounding box grid

        // console.log( 'Clicked Cell in grid of bounding box:' );
        const x = Math.floor( ( lng - boundingBox.x_min) / dlng );
        // console.log('x:', x); // x coordinate of bounding box grid from 0 to grid[1]-1
        const y = grid.n_y - 1 - Math.floor( ( lat - boundingBox.y_min) / dlat );
        // console.log('y:', y); // y coordinate of bounding box grid from 0 to grid[0]-1

        // Make sure point is inside bounding box
        if ( y >= 0 && y < grid.n_y && x >= 0 && x < grid.n_x) {
            this.props.setClickedCell({x, y});
        }
    };

    renderHeatMap() {
        if (this.props.model.result) {
            const boundingBox = [
                [this.props.model.boundingBox.y_min, this.props.model.boundingBox.x_min],
                [this.props.model.boundingBox.y_max, this.props.model.boundingBox.x_max]
            ];

            return (
                <LayersControl.Overlay name="Heads" checked>
                    <ImageOverlay url={this.props.model.result.imgUrl(this.props.min, this.props.max)} bounds={boundingBox} opacity={0.5}/>
                </LayersControl.Overlay>
            );
        }
        return null;
    }

    renderLegend() {
        const {model} = this.props;
        if (!model.hasResult()) {
            return null;
        }

        return (
            <ColorLegend legend={this.props.model.result.legend(this.props.min, this.props.max)} />
        );
    }

    renderBoundaries() {
        if (this.props.model.boundaryCount() == 0) {
            return null;
        }

        const boundaries = this.props.model.boundaries;
        const wells = boundaries.map( b => {
            if (b.type == 'well') {
                const name = b.name;
                const geometry = JSON.parse(b.geometry);
                const metadata = JSON.parse(b.metadata);

                const style = this.state.styles.wells[metadata.well_type];
                return (
                   <CircleMarker
                       key={b.boundary_id}
                       center={[geometry.coordinates[1], geometry.coordinates[0]]}
                       radius={style.radius}
                       color={style.color}
                       weight={style.weight}
                       fillColor={style.fillColor}
                       fillOpacity={style.fillOpacity}
                   />
                );
            }
        });

        return (
            <LayersControl.Overlay name="Wells" checked>
                <LayerGroup>
                    {wells}
                </LayerGroup>
            </LayersControl.Overlay>
        );
    }

    renderBoundingBox() {
        const model = this.props.model;
        const boundingBox = [
            [model.boundingBox.y_min, model.boundingBox.x_min],
            [model.boundingBox.y_max, model.boundingBox.x_max]
        ];

        const style = this.state.styles.boundingBox;

        return (
            <LayersControl.Overlay name="BoundingBox" checked>
                <Rectangle
                    bounds={boundingBox}
                    color={style.color}
                    weight={style.weight}
                    fillColor={style.fillColor}
                    fillOpacity={style.fillOpacity}
                />
            </LayersControl.Overlay>
        );
    }

    renderArea() {
        return (
            <LayersControl.Overlay name="Area" checked>
                <GeoJSON data={this.props.model.area} style={this.state.styles.area} />
            </LayersControl.Overlay>
        );
    }

    renderCrossSectionSelection(lat = true, lng = false) {
        const activeCell = this.props.activeCell;
        const model = this.props.model;
        const style = this.state.styles.crossSectionSelection;

        let crossSectionLatRectangle = null;
        if (activeCell && activeCell.y !== null) {
            const dlat = ( model.boundingBox.y_max - model.boundingBox.y_min) / model.gridSize.n_y; // row width of bounding box grid
            const crossSectionLat = (model.gridSize.n_y - activeCell.y - 1) * dlat + model.boundingBox.y_min;
            crossSectionLatRectangle = (<Rectangle
                bounds={[[crossSectionLat, model.boundingBox.x_min], [crossSectionLat + dlat, model.boundingBox.x_max]]}
                color={style.color}
                weight={style.weight}
                opacity={style.opacity}
                fillColor={style.fillColor}
                fillOpacity={style.fillOpacity}
            />);
        }

        let crossSectionLngRectangle = null;
        if (activeCell && activeCell.x !== null) {
            const dlng = ( model.boundingBox.x_max - model.boundingBox.x_min) / model.gridSize.n_x; // column width of bounding box grid
            const crossSectionLng = activeCell.x * dlng + model.boundingBox.x_min;
            crossSectionLngRectangle = (<Rectangle
                 bounds={[[model.boundingBox.y_min, crossSectionLng], [model.boundingBox.y_max, crossSectionLng + dlng]]}
                 color={style.color}
                 weight={style.weight}
                 opacity={style.opacity}
                 fillColor={style.fillColor}
                 fillOpacity={style.fillOpacity}
             />);
        }

        if (lat && lng) {return (<div>{crossSectionLatRectangle}{crossSectionLngRectangle}</div>);}
        if (lat) {return (<div>{crossSectionLatRectangle}</div>);}
        if (lng) {return (<div>{crossSectionLngRectangle}</div>);}
        return null;
    }

    render() {
        const { mapPosition } = this.props;

        return (
            <Map className="crossSectionMap" {...mapPosition} onClick={this.handleClick} zoomControl={false} onMoveEnd={this.handleMove}>
                <TileLayer url="http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png" attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'/>
                <LayersControl position="topleft">
                    {this.renderArea()}
                    {this.renderBoundingBox()}
                    {this.renderHeatMap()}
                    {this.renderBoundaries()}
                </LayersControl>

                {this.renderCrossSectionSelection()}
                <button title="reset view" className="button icon-inside resetView" onClick={this.resetView}><Icon name="marker" /></button>
                {this.renderLegend()}
            </Map>
        );
    }
}

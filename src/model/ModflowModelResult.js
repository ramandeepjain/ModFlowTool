import Legend from './ColorLegend';

/**
 * ModflowCalculationResult
 */
export default class ModflowCalculationResult {

    _calculationId;
    _layerNumber;
    _resultType;
    _totalTime;
    _data;
    _imgUrl;
    _min;
    _max;
    _legend;

    constructor( calculationId, layerNumber, resultType, totalTime, data, imgUrl ) {
        this._calculationId = calculationId;
        this._layerNumber = layerNumber;
        this._resultType = resultType;
        this._totalTime = totalTime;
        this._data = data;
        this._imgUrl = imgUrl;
        this._min = this.calculatePercentile( data, 3 );
        this._max = this.calculatePercentile( data, 95 );
        this._legend = new Legend( this._min, this._max );
    }

    get calculationId() {
        return this._calculationId;
    }

    layerNumber() {
        return this._layerNumber;
    }

    resultType() {
        return this._resultType;
    }

    totalTime() {
        return this._totalTime;
    }

    data() {
        return this._data;
    }

    imgUrl( min = null, max = null ) {
        if ( min === null || max === null ) {
            return this._imgUrl;
        }

        return this._imgUrl + '?min=' + min + '&max=' + max;
    }

    min() {
        return this._min;
    }

    max() {
        return this._max;
    }

    legend( min = null, max = null ) {
        return this._legend.legend( min, max );
    }

    calculatePercentile( data, percent ) {
        const values = [];
        data.forEach( row => {
            row.forEach( column => {
                if ( column !== null ) {
                    values.push( column );
                }
            } );
        } );

        values.sort( ( a, b ) => a - b );

        const key = Math.round( values.length / 100 * percent );
        return values[ key ];
    }

    rowData( row ) {
        if ( this._data.length >= row + 1 ) {
            return this._data[ row ];
        }

        return null;
    }
}

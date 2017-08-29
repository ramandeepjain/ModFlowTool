import * as React from 'react';
import { pure } from 'recompose';

import ConfiguredRadium from 'ConfiguredRadium';
import Icon from '../../components/primitive/Icon';
import styleGlobals from 'styleGlobals';
import { SoilModelLayerDataTable } from '../components';
import { WebData } from '../../core';

const styles = {
    wrapper: {
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column'
    },

    header: {
        display: 'flex',
        flex: 1,
        marginBottom: 10,
        minHeight: 30
    },

    body: {
        minHeight: 0,
        flex: 1,
        overflow: 'auto'
    },

    type: {
        flex: 1,
        border: '1px solid ' + styleGlobals.colors.graySemilight,
        borderRadius: styleGlobals.dimensions.borderRadius,
        marginRight: 14,
        paddingTop: 6,
        paddingBottom: 6,
        paddingLeft: 10,
        paddingRight: 10
    },

    headerButton: {
        button: {
            marginRight: 14
        },

        icon: {
            marginRight: 6
        }
    }
};
const SoilModelLayerOverview = ({ tool, layers, property, id, createLayer, removeLayer, addLayerStatus }) => {

    const processing = WebData.Component.Processing(
        <button style={styles.headerButton.button} className="link" onClick={createLayer}>
            <Icon style={styles.headerButton.icon} name="add"/>Add new layer
        </button>
    );

    return (
        <div style={[ styles.wrapper ]}>
            <div style={[ styles.header ]}>
                {processing(addLayerStatus)}
            </div>
            <div style={[ styles.body ]}>
                <SoilModelLayerDataTable rows={layers} id={id} remove={removeLayer} tool={tool}
                                         property={property}/>
            </div>
        </div>
    );
};

export default ConfiguredRadium(pure(SoilModelLayerOverview));

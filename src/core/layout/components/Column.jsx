import React, { PropTypes } from 'react';
import ConfiguredRadium from 'ConfiguredRadium';
import styleGlobals from 'styleGlobals';

const styles = {
    wrapper: {
        flex: 1
    },

    heading: {
        borderBottom: '1px solid ' + styleGlobals.colors.graySemilight,
        fontWeight: 300,
        fontSize: 16,
        textAlign: 'left',
        paddingBottom: 10
    }
};

const Column = ConfiguredRadium(({ heading, children, style }) =>
    <div style={[styles.wrapper, style]}>
        <h3 style={[styles.heading]}>
            {heading}
        </h3>
        {children}
    </div>
);

Column.propTypes = {
    heading: PropTypes.string,
    children: PropTypes.node,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array])
};

export default Column;

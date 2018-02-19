import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import uuid from 'uuid';

import '../../less/4TileTool.less';
import styleGlobals from 'styleGlobals';
import image from '../../images/tools/T12.png';

import {Background, Chart, Parameters, Settings, MFI} from '../components';
import {WebData, LayoutComponents} from '../../core';

import Icon from '../../components/primitive/Icon';
import Navbar from '../../containers/Navbar';
import Accordion from '../../components/primitive/Accordion';
import AccordionItem from '../../components/primitive/AccordionItem';
import Input from '../../components/primitive/Input';
import Select from '../../components/primitive/Select';
import Button from '../../components/primitive/Button';
import {Modifier as ToolInstance} from '../../toolInstance';

import {each} from 'lodash';
import {getInitialState} from '../reducers/main';
import applyParameterUpdate from '../../core/simpleTools/parameterUpdate';
import {isReadOnly} from '../../core/helpers';

const styles = {
    heading: {
        borderBottom: '1px solid ' + styleGlobals.colors.graySemilight,
        fontWeight: 300,
        fontSize: 16,
        textAlign: 'left',
        paddingBottom: 10
    }
};

const buildPayload = (state) => {
    return {
        parameters: state.parameters.map(v => {
            return {
                id: v.id,
                max: v.max,
                min: v.min,
                value: v.value,
            };
        }),
        settings: state.settings,
        tool: state.tool
    };
};

const navigation = [{
    name: 'Documentation',
    path: 'https://wiki.inowas.hydro.tu-dresden.de/t12-Clogging-estimation-by-MFI-Index/',
    icon: <Icon name="file"/>
}];

class T12 extends React.Component {

    constructor() {
        super();
        this.state = getInitialState(this.constructor.name);
    }

    componentWillMount() {
        if (this.props.params.id) {
            this.props.getToolInstance(this.props.params.id);
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState(function(prevState) {
            return {
                ...prevState,
                ...newProps.toolInstance,
            };
        });
    }

    save = () => {
        const {id} = this.props.params;
        const {routes, params} = this.props;
        const {name, description} = this.state;

        if (id) {
            this.props.updateToolInstance(id, name, description, this.state.public, buildPayload(this.state));
            return;
        }

        this.props.createToolInstance(uuid.v4(), name, description, this.state.public, buildPayload(this.state), routes, params);
    };

    handleInputChange = name => {
        return value => {
            this.setState(prevState => {
                return {
                    ...prevState,
                    [name]: value
                };
            });
        };
    };

    handleSelectChange = name => {
        return data => {
            this.handleInputChange(name)(data ? data.value : undefined);
        };
    };

    handleReset = () => {
        this.setState(getInitialState());
    };

    handleChange = (e) => {
        console.log(e.target.name);
        if (e.target.name.startsWith('settings')) {
            const parameter = e.target.name.split('_')[1];
            this.updateSettings(parameter, Number(e.target.value));
        }

        if (e.target.name.startsWith('parameter')) {
            const param = e.target.name.split('_');
            const parameter = {};
            parameter.id = param[1];
            parameter[param[2]] = e.target.value;
            this.updateParameter(parameter);
        }

        if (e.target.name.startsWith('mfi')) {
            const param = e.target.name.split('_');
            const parameter = {};
            parameter.id = param[1];
            parameter[param[2]] = Number(e.target.value);
            this.updateMFI(parameter);
        }
        if (e.target.name.startsWith('use')) {
            const param = e.target.name.split('_');
            const parameter = {};
            parameter.id = param[1];
            parameter[param[2]] = Number(e.target.value);
            this.useMFIDataInGraph(parameter);
        }
        if (e.target.name.startsWith('corr')) {
            const parameter = e.target.name.split('_')[1];
            const value = Number(e.target.value);
            this.updateCorrections(parameter, value);
        }
    };

    useMFIDataInGraph(parameter) {
        const mfi = this.state.mfi;

        mfi.map(p => {
            if (Number(p.id) === Number(parameter.id)) {
                if (p.checked === 'false') {
                    p.checked = 'true';
                } else {
                    p.checked = 'false';
                }
                return p;
            }

            return p;
        });

        const param = this.state.mfi.find(p => {
            return Number(p.id) === Number(parameter.id);
        });

        if (param.checked === 'false') {
            param.checked = 'true';
        } else {
            param.checked = 'false';
        }

        this.setState(prevState => {
            return {
                ...prevState,
                mfi
            };
        });
    }

    updateMFI(newParam) {
        const mfi = this.state.mfi;
        const param = mfi.find(p => {
            return Number(p.id) === Number(newParam.id);
        });

        if (!newParam.V && newParam.t) param.t = newParam.t;
        if (!newParam.t && newParam.V) param.V = newParam.V;

        if (mfi[mfi.length - 1].t !== 0 || mfi[mfi.length - 1].V !== 0) {
            const newEntry = {
                id: mfi.length + 1,
                t: 0,
                V: 0,
                stepSize: 0.1,
                checked: 'false',
                decimals: 2
            };
            mfi.push(newEntry);
        }

        this.setState(prevState => {
            return {
                ...prevState,
                mfi
            };
        });
    }

    updateCorrections(name, value) {
        const corrections = this.state.corrections.map(p => {
            if (p.name === name) {
                p.value = value;
                return p;
            }

            return p;
        });

        this.setState(prevState => {
            return {
                ...prevState,
                corrections
            };
        });
    }

    updateParameter(updatedParam) {
        const parameters = this.state.parameters.map(p => {
            if (p.id === updatedParam.id) {
                return applyParameterUpdate(p, updatedParam);
            }

            return p;
        });

        this.setState(prevState => {
            return {
                ...prevState,
                parameters
            };
        });
    }

    render() {
        const {parameters, corrections, mfi, name, description} = this.state;
        const {getToolInstanceStatus, updateToolInstanceStatus, createToolInstanceStatus, toolInstance} = this.props;
        const {id} = this.props.params;
        const readOnly = isReadOnly(toolInstance.permissions);

        const chartParams = {};
        each(parameters, v => {
            chartParams[v.id] = v.value;
        });
        each(corrections, v => {
            chartParams[v.name] = v.value;
        });

        const heading = (
            <div className="grid-container">
                <div className="col stretch parameters-wrapper">
                    <Input
                        type="text"
                        disabled={readOnly}
                        name="name"
                        value={name}
                        onChange={this.handleInputChange('name')}
                        placeholder="Name"
                    />
                </div>
                <div className="col col-rel-0-5">
                    <WebData.Component.Loading status={id ? updateToolInstanceStatus : createToolInstanceStatus}>
                        <Button type={'accent'} onClick={this.save} disabled={readOnly}>Save</Button>
                    </WebData.Component.Loading>
                </div>
            </div>
        );

        return (
            <div className="app-width">
                <Navbar links={navigation}/>
                <h3 style={styles.heading}>T12. Clogging estimation by MFI-Index</h3>
                <WebData.Component.Loading status={getToolInstanceStatus}>
                    <div className="grid-container">
                        <div className="tile col stretch">
                            <Accordion firstActive={null}>
                                <AccordionItem heading={heading}>
                                    <LayoutComponents.InputGroup label="Visibility">
                                        <Select
                                            disabled={readOnly}
                                            clearable={false}
                                            value={this.state.public}
                                            onChange={this.handleSelectChange(
                                                'public'
                                            )}
                                            options={[
                                                {label: 'public', value: true},
                                                {label: 'private', value: false}
                                            ]}
                                        />
                                    </LayoutComponents.InputGroup>
                                    <LayoutComponents.InputGroup label="Description">
                                        <Input
                                            type="textarea"
                                            disabled={readOnly}
                                            name="description"
                                            value={description}
                                            onChange={this.handleInputChange('description')}
                                            placeholder="Description"
                                        />
                                    </LayoutComponents.InputGroup>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    </div>
                    <div className="grid-container">
                        <section className="tile col col-abs-2 stacked">
                            <Background image={image}/>
                        </section>

                        <section className="tile col col-abs-3 stretch">
                            <Chart mfiData={mfi} {...chartParams}/>
                        </section>
                    </div>

                    <div className="grid-container">
                        <section className="tile col col-abs-2 stacked">
                            <Settings mfiData={mfi} {...chartParams} />
                        </section>
                        <section className="tile col col-rel-1">
                            <h2>MFI</h2>
                            <MFI data={mfi} corrections={corrections} handleChange={this.handleChange}
                                 handleReset={this.handleReset}/>
                        </section>
                        <section className="tile col col-hydro">
                            <Parameters
                                parameters={parameters}
                                handleChange={this.handleChange}
                                handleReset={this.handleReset}
                            />
                        </section>
                    </div>
                </WebData.Component.Loading>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        toolInstance: state.T12
    };
};

const actions = {
    createToolInstance: ToolInstance.Command.createToolInstance,
    getToolInstance: ToolInstance.Query.getToolInstance,
    updateToolInstance: ToolInstance.Command.updateToolInstance
};


const mapDispatchToProps = (dispatch, props) => {
    const tool = props.route.tool;
    const wrappedActions = {};
    for (const key in actions) {
        if (actions.hasOwnProperty(key)) {
            // eslint-disable-next-line no-loop-func
            wrappedActions[key] = function() {
                const args = Array.prototype.slice.call(arguments);
                dispatch(actions[key](tool, ...args));
            };
        }
    }

    return wrappedActions;
};

T12.propTypes = {
    createToolInstance: PropTypes.func,
    createToolInstanceStatus: PropTypes.object,
    getToolInstance: PropTypes.func,
    getToolInstanceStatus: PropTypes.object,
    params: PropTypes.object,
    routes: PropTypes.array,
    toolInstance: PropTypes.object,
    updateToolInstance: PropTypes.func,
    updateToolInstanceStatus: PropTypes.object
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(T12));
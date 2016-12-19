import React from "react"
import { connect } from "react-redux";
import ModflowMap from "./ModFlowMap";

import { switchToScenarioAnalysisEdit, switchToScenarioAnalysisSelect, setCurrentTool } from "../actions/ApplicationActions";
import { fetchScenarios, setBaseModel } from "../actions/ScenarioAnalysisActions"

import ScenarioSelect from "../components/map/ScenarioSelect";

@connect((store) => {
    return {
        modelStore: store.model,
        appState: store.appState,
        scenarioAnalysis: store.scenarioAnalysis,
        store: store
    }
})
export default class ScenarioAnalysis extends React.Component {

    hasData() {
        return this.props.scenarioAnalysis.fetched;
    }

    componentWillMount() {
        this.props.dispatch(fetchScenarios(this.props.params.modelId));
        this.props.dispatch(setBaseModel(this.props.params.modelId));
        this.props.dispatch(setCurrentTool('scenarioanalysis'));
    }

    editScenario() {
        this.props.dispatch(switchToScenarioAnalysisEdit());

    }

    selectScenario() {
        this.props.dispatch(switchToScenarioAnalysisSelect());
    }

    render() {
        const scenario = this.props.scenarioAnalysis.scenario;
        const activeScenario = this.props.scenarioAnalysis.activeScenario;
        const appState = this.props.appState;
        const baseModel= this.props.scenarioAnalysis.baseModel;
        const scenarios = this.props.scenarioAnalysis.scenarios;
        const className = appState.scenarioAnalysisSelect ? "off-canvas-active" : null;
        const styles = this.props.modelStore.styles;
        const store = this.props.store;

        if (this.hasData()) {
            return (
                <div className={"page-wrapper " + className}>
                    <ScenarioSelect
                        selectScenario={this.selectScenario.bind(this)}
                        editScenario={this.editScenario.bind(this)}
                        appState={appState}
                        scenarios={scenarios}
                        baseModel={baseModel}
                        activeScenario={activeScenario}
                    />
                    <ModflowMap model={scenario} styles={styles} appState={appState} store={store} />
                </div>
            );
        }

        return null;
    }
}

import React from 'react';
import '../../less/toolParameters.less';
import '../../less/input-range.less';
import '../../less/toolT16.less';
import Popup from '../primitive/Popup';

export default class Sieves extends React.Component {

    state = {
        popupVisible: false
    };
    handleChange = e => {
        if (this.props.handleChange)
            this.props.handleChange(e);
    };

    handleReset = e => {
        if (this.props.handleReset)
            this.props.handleReset(e);
    };
    subtraction(){
        var value = this.props.dSampSieve.value;
        var total = this.props.info.total;
        return (value - total).toFixed(this.props.dSampSieve.decimals);
    };
    renderNumber(param) {
        if (!param.label && param.name)
            param.label = param.name;
        return <tr key={param.id} className="parameter">
            <td className="parameter-label">{param.label}</td>
            <td>
                <input name={'sieve_' + param.id + '_value'} className="parameter-max input input-xs"
                       type="number" min={param.min} max={param.max} step={param.stepSize}
                       value={Number(param.value).toFixed(param.decimals)} onChange={this.handleChange}/>
            </td>
            <td>g</td>
        </tr>
    };
    closePopup = () => {
        this.setState({
            popupVisible: false
        });
    };
    showPopup = () => {
        this.setState({
            popupVisible: true
        });
    };
    //Popup window
    selectSieve() {
        var standard = [];
        if (this.props.DIN.selected === true) {
            var standard = this.props.DIN.sievesize.map(s => {
                return <li key={'sievesize_'+s.name}>
                    <label><input name={'selectSieve '+s.name+' DIN'} className="input" type="checkbox" checked={s.selected}
                                  onChange={this.handleChange}/>{s.name}</label>
                </li>
            })
        }
        if (this.props.ASTM.selected === true) {
            var standard = this.props.ASTM.sievesize.map(s => {
                return <li key={'sievesize_'+s.name}>
                    <label><input name={'selectSieve '+s.name+' ASTM'} className="input" type="checkbox" checked={s.selected}
                                  onChange={this.handleChange}/>{s.name}</label>
                </li>
            })
        }
        if (this.props.Custom.selected === true) {
            var standard = this.props.Custom.sievesize.map(s => {
                return <li key={'sievesize_'+s.name}>
                    <label><input name={'selectSieve '+s.name+' Custom'} className="input" type="checkbox" checked={s.selected}
                                  onChange={this.handleChange}/>{s.name}</label>
                </li>
            });
            standard.push(
                <li key={'customSize'}>
                    <label>Size<input name={'customSieve'} className="input_cus"
                                      type="text" onChange={this.handleChange}/>mm</label>
                    <input name="submitSieve" type="submit" onClick={this.handleChange}/>
                </li>
            )
        }
        return (
            <div className="popup-div">
                <ul className="popup-ul">
                    <li>
                        <label className="label">
                            <input onChange={this.handleChange} className="input" name="standard" value={'standard_' + this.props.DIN.name}
                                   checked={this.props.DIN.selected} type="radio"/>DIN 18123:2010-03</label>
                        <label className="label">
                            <input onChange={this.handleChange} className="input" name="standard" value={'standard_' + this.props.ASTM.name}
                                   checked={this.props.ASTM.selected} type="radio"/>ASTM D6913</label>
                        <label className="label">
                            <input onChange={this.handleChange} className="input" name="standard" value={'standard_' + this.props.Custom.name}
                                   checked={this.props.Custom.selected} type="radio"/>Custom</label>
                    </li>
                </ul>
                <div className="popup-col"><ul className="ul left">{standard}</ul></div>

            </div>
        )
    };
    render() {
        const params = this.props.data.map(param => {
            return this.renderNumber(param);
        });
        const dSampSieve= this.props.dSampSieve;
        return (
            <div className="grid-container">
                <div className="col stretch parameters-wrapper">
                    <div className="popup-div">
                        <button className=" link popups" onClick={this.showPopup}>
                            <span>Select Sieve</span>
                        </button>
                    </div>
                    <table className="parameters-dSamp">
                        <tbody>
                        <tr key={dSampSieve.id} className="parameter">
                            <td className="parameter-label"><strong>{dSampSieve.name}</strong></td>
                            <td>
                                <input name={'sieve_' + dSampSieve.id + '_value'} className="parameter-max input input-xs"
                                       type="number" min={dSampSieve.min} max={dSampSieve.max} step={dSampSieve.stepSize}
                                       value={Number(dSampSieve.value).toFixed(dSampSieve.decimals)} onChange={this.handleChange}/>
                            </td>
                            <td>g</td>
                        </tr>
                        </tbody>
                    </table>
                    <table className="table-t16a-sieve">
                        <tbody>
                        <tr>
                            <th  className="th"><strong>Sieve</strong></th>
                            <th  className="th"><strong>Mass</strong></th>
                            <th  className="th"><strong>Unit</strong></th>
                        </tr>
                        {params}
                  {/*      <tr className="parameter">
                            <td className="parameter-label">{'pan'}</td>
                            <td className="parameter-max input input-xs">
                                {this.subtraction()}
                            </td>
                            <td>g</td>
                        </tr>*/}
                        <tr>
                            <td className="tb" ><strong>Total</strong></td>
                            <td className="tb" >{this.props.info.total}</td>
                            <td>g</td>
                        </tr>
                        </tbody>
                    </table>
                    <Popup visible={this.state.popupVisible} close={this.closePopup}>
                        <h2>Select Sieve</h2>
                        {this.selectSieve()}
                    </Popup>

                </div>
            </div>
        )
    }
}

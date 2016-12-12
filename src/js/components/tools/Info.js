import React from "react";

export default class Info extends React.Component {

    render() {
        if (this.props.data.h > this.props.data.z){
            return (
                <div className="padding-30">
                    <h2>
                        Warning
                        <i className="glyphicon glyphicon-warning-sign pull-right" />
                    </h2>

                    <div className="center-vertical center-horizontal">
                        <p>
                            The calculated upconing level of <strong>{this.props.data.h}m </strong>
                            is higher than the critical elevation of <strong>{this.props.data.z}m</strong>.
                            At the current pumping rate, saltwater might enter the well.
                            We recommend a maximum pumping rate of <strong>{this.props.data.q}m<sup>3</sup>/d</strong>.
                        </p>
                    </div>
                </div>
            )
        }

        return (
            <div className="padding-30">
                <h2>
                    OK
                    <i className="glyphicon glyphicon-ok-circle pull-right" />
                </h2>

                <div className="center-vertical center-horizontal">
                    <p>
                        The calculated upconing level of <strong>{this.props.data.h}m </strong>
                        is lower than the critical elevation of <strong>{this.props.data.z}m </strong>
                        so saltwater shouldn't enter the well. However, we recommend a maximum
                        pumping rate of <strong>2,70m<sup>3</sup>/d</strong>.
                    </p>
                </div>
            </div>
        )


    }
}

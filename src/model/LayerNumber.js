export default class LayerNumber {

    layerNumber;

    constructor(layerNumber){
        this.layerNumber = parseInt(layerNumber);
    };

    toString() {
        return this.layerNumber.toString();
    }

    sameAs(element) {
        return (this.layerNumber.toString() === element.toString());
    }
}

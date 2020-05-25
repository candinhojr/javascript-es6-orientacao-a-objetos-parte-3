export class Mensagem {

    //constructor(texto='') { // parâmetro opcional, porém não aceito no EDGE
    constructor(texto) {

        //this._texto = texto;
        this._texto = texto || ''; // se texto for undefined, vai passar ''
    }

    get texto() {

        return this._texto;
    }
    
    set texto(texto) {

        return this._texto = texto;
    }
}
export class Negociacao {
    constructor(data, quantidade, valor) {
        this._data = new Date(data); //new Date();
        this._quantidade = quantidade; //1;
        this._valor = valor //0.0;

        //Não permite alteração dos dados
        Object.freeze(this);
    }

    get volume() {
        return this._quantidade * this._valor;
    }

    get data() {
        // retorno uma cópia do meu objeto data
        return new Date(this._data.getTime());
    }

    get quantidade() {
        return this._quantidade;
    }

    get valor() {
        return this._valor;
    }

    isEqual(outraNegociacao) {
        return JSON.stringify(this) == JSON.stringify(outraNegociacao);
    }

}
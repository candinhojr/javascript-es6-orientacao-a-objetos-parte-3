class ListaNegociacoes {
    
    constructor() {
        this._negociacoes = [];
    }

    adiciona(negociacao) {
    
        this._negociacoes.push(negociacao);
    }

    esvazia() {

        this._negociacoes = [];
    }

    ordena(criterio) {

        this._negociacoes.sort(criterio);
    }

    inverteOrdem() {
        
        this._negociacoes.reverse();
    }

    get negociacoes() {
    
        //retorno uma cópia da lista de negociações 
        return [].concat(this._negociacoes);
    }

   

    get volumeTotal() {
        return this._negociacoes.reduce((total, n) => total += n.volume, 0.0);
    }
}
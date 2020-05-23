"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NegociacaoController = function () {
    function NegociacaoController() {
        _classCallCheck(this, NegociacaoController);

        var $ = document.querySelector.bind(document);

        this._inputData = $("#data");
        this._inputQuantidade = $("#quantidade");
        this._inputValor = $("#valor");
    }

    _createClass(NegociacaoController, [{
        key: "adiciona",
        value: function adiciona(event) {
            event.preventDefault();

            //TRABALHANDO COM DATAS
            /*
            let data = new Date(this._inputData.value.replace('/-/g', ','));
            let data = new Date(this._inputData.value.split('-'));
            */

            /*
            // usando destructuring
            let [ano, mes, dia] = this._inputData.value.split('-');
            let data = new Date(ano, mes-1, dia);
            */

            /*
            // usando spread operator
            let data = new Date(...
                this._inputData.value
                .split('-')
                .map(function(item, indice) {
                    if(indice == 1) return item-1;
                    return item;
                    // ou de uma forma menos verbosa
                    //return item - indice % 2
                })
            );
            */

            // usando arrow function
            var data = new (Function.prototype.bind.apply(Date, [null].concat(_toConsumableArray(this._inputData.value.split('-').map(function (item, indice) {
                return item - indice % 2;
            })))))();

            var negociacao = new Negociacao(data, this._inputQuantidade.value, this._inputValor.value);

            var numeros = [3, 2, 11, 20, 8, 7];
            var dobro = numeros.map(function (num) {
                return num % 2 ? num * 2 : num;
            });
            console.log(dobro);

            function somaDoisNumeros(numero1, numero2) {
                return numero1 + numero2;
            }

            var doisNumeros = [2, 4];
            console.log('Soma dois numeros' + somaDoisNumeros.apply(undefined, doisNumeros));

            var avaliacoes = [new Prova(new Aluno(1, 'Luana'), 8), new Prova(new Aluno(2, 'Cássio'), 6), new Prova(new Aluno(3, 'Barney'), 9), new Prova(new Aluno(4, 'Bira'), 5)];

            var aprovados = avaliacoes.filter(function (prova) {
                return prova.nota >= 7;
            }).map(function (prova) {
                return prova.aluno.nome;
            });
            console.log(aprovados);
        }
    }]);

    return NegociacaoController;
}();

var Aluno = function Aluno(matricula, nome) {
    _classCallCheck(this, Aluno);

    this.matricula = matricula;
    this.nome = nome;
};

var Prova = function Prova(aluno, nota) {
    _classCallCheck(this, Prova);

    this.aluno = aluno;
    this.nota = nota;
};
//# sourceMappingURL=NegociacaoController copy.js.map
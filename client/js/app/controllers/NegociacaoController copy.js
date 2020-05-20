class NegociacaoController {
    
    constructor() {
        let $ = document.querySelector.bind(document);

        this._inputData = $("#data");
        this._inputQuantidade = $("#quantidade");
        this._inputValor = $("#valor");
    }
    
    adiciona(event) {
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
        let data = new Date(...
            this._inputData.value
            .split('-')
            .map((item, indice) => {
                return item - indice % 2
            })
            // sendo menos verboso ainda
            // .map((item, indice) => item - indice % 2)
        );

        let negociacao = new Negociacao(
            data,
            this._inputQuantidade.value,
            this._inputValor.value
        );

        let numeros = [3,2,11,20,8,7];
        let dobro = numeros.map(num => num % 2 ? num * 2 : num);
        console.log(dobro);

        function somaDoisNumeros(numero1, numero2) {
            return numero1 + numero2;
        }

        let doisNumeros = [2,4];
        console.log('Soma dois numeros' + somaDoisNumeros(...doisNumeros));


        
        let avaliacoes = [
            new Prova(new Aluno(1, 'Luana'), 8),
            new Prova(new Aluno(2, 'Cássio'), 6),
            new Prova(new Aluno(3, 'Barney'), 9),
            new Prova(new Aluno(4, 'Bira'), 5)
        ];
        
        let aprovados = avaliacoes
            .filter(prova => prova.nota >= 7)
            .map(prova => prova.aluno.nome);
        console.log(aprovados);
    }
    
}
class Aluno {

    constructor(matricula, nome) {
        this.matricula = matricula;
        this.nome = nome;
    }
}

class Prova {

    constructor(aluno, nota) {
        this.aluno = aluno;
        this.nota = nota;
    }
}

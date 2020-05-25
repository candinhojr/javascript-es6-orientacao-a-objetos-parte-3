import { View } from './View';
import { DateConverter } from '../helpers/DateConverter';
import { currentInstance } from '../controllers/NegociacaoController';

export class NegociacoesView extends View{

    //quando os parâmetros recebidos são os mesmos que os da classe pai, podemos ocultar o construtor da classe filha
    constructor(elemento) {

        super(elemento);

        elemento.addEventListener('click', (event) => {
            
            if (event.target.nodeName == 'TH')
                currentInstance().ordena(event.target.textContent.toLowerCase());
        });
    }

    template(model) {
        return `
        <table class="table table-hover table-bordered">
            <thead>
                <tr>
                    <th>DATA</th>
                    <th>QUANTIDADE</th>
                    <th>VALOR</th>
                    <th>VOLUME</th>
                </tr>
            </thead>    

            <tbody>
            </tbody>
                ${model.negociacoes.map(negociacao => 
                    `
                        <tr>
                            <td>${DateConverter.dataParaTexto(negociacao.data)}</td>
                            <td>${negociacao.quantidade}</td>
                            <td>${negociacao.valor}</td>
                            <td>${negociacao.volume}</td>
                        </tr>
                    `
                ).join('')}
            <tfoot>
                    <td colspan="3"></td>
                    <td>
                        ${model.volumeTotal}
                    </td>
            </tfoot>
        </table>`;
    }
}
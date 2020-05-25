import { View } from './View';
import { DateConverter } from '../helpers/DateConverter';

export class NegociacoesView extends View{

    //quando os parâmetros recebidos são os mesmos que os da classe pai, podemos ocultar o construtor da classe filha
    constructor(elemento) {
        super(elemento);
    }

    template(model) {
        return `
        <table class="table table-hover table-bordered">
            <thead>
                <tr>
                    <th onclick="negociacaoController.ordena('data')">DATA</th>
                    <th onclick="negociacaoController.ordena('quantidade')">QUANTIDADE</th>
                    <th onclick="negociacaoController.ordena('valor')">VALOR</th>
                    <th onclick="negociacaoController.ordena('volume')">VOLUME</th>
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
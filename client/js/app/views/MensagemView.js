class MensagemView extends View{

    //quando os parâmetros recebidos são os mesmos que os da classe pai, podemos ocultar o construtor da classe filha
 
    template(model) {

        return model.texto ? `<p class="alert alert-info">${model.texto}</p>` : `<p></p>`;
    }
}
class HTTPService {
    /**
     * Encapsula a complexidade de se realizar requisições Ajax devolvendo uma promise para determinadas operações.
     * @method get
     * @param {*} url 
     */

    get(url) {
        return new Promise((resolve, reject) => {

            let xhr = new XMLHttpRequest()
    
            xhr.open('GET', url);
    
            /**
             * 0: requisição ainda não iniciada
             * 1: conexão com o servidor estabelecida
             * 2: requisição recebida
             * 3: processando requisição
             * 4: requisição concluída e a resposta pronta
             */
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    
                    if (xhr.status == 200) {
                        
                        resolve(JSON.parse(xhr.responseText));
                        /*
                            Para entender, xhr.responseText é texto. Assim, eu uso o JSON.parse() para transformar o texto em objetos {no formato JSON}. 
                        */
    
                    } else {
    
                        reject(xhr.responseText);
                    }
                }
            };
    
            xhr.send();
        });
    }

    post(url, dado) {

        return new Promise((resolve, reject) => {

            let xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-type", "application/json");
            xhr.onreadystatechange = () => {

                if (xhr.readyState == 4) {

                    if (xhr.status == 200) {

                        resolve(JSON.parse(xhr.responseText));
                    } else {

                        reject(xhr.responseText);
                    }
                }
            };
            xhr.send(JSON.stringify(dado));
            /*
            Não podemos enviar o objeto negociacao diretamente, precisamos convertê-lo para string, porque no protocolo HTTP os dados são transmitidos no formato texto. 
            Veja que fizemos o contrário de quando recebemos os dados vindos do servidor. Lá, convertemos string em objeto.
            */
        });

    }
}
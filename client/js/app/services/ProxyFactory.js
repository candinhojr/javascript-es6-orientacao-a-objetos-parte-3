class ProxyFactory {

    static create(objeto, props, acao) {
        
        // Proxy recebe 2 parâmetros, a instância que ele quer 'imitar' e o handler que conterá as armadilhas
        return new Proxy(objeto, {
            
            // HANDLER
            // o get vai ser chamado toda a vez que eu acessar alguma propriedade do meu objeto
            // get: function(target, prop, receiver) {}
            get(target, prop, receiver) {
                
                /*
                target: referência ao objeto original encapsulado pelo proxy
                prop: a propriedade que está sendo acessada
                receiver: referência para o próprio proxy
                */
                // Se o método incluído é o adiciona() ou o esvazia(), que tem ou não props e se é uma função, então...
                if(props.includes(prop) && ProxyFactory._ehFuncao(target[prop])) {
                    // Vou substitir a função no proxy por outra
                    return function() {
                        
                        console.log(`interceptando ${prop}`);
                        // Com o Reflect.apply eu faço a função receber os parâmetros (lista de arguments) dela
                        let retorno = Reflect.apply(target[prop], target, arguments);                        
                        // Atualizo a view
                        acao(target);

                        return retorno; 
                    }
                }

                return Reflect.get(target, prop, receiver);
            },

            set(target, prop, value, receiver) {

                let retorno = Reflect.set(target, prop, value, receiver);
                // só executa acao(target) se for uma propriedade monitorada
                if(props.includes(prop)) acao(target);    
                return retorno; 
            }
        });
    };

    static _ehFuncao(func) {
        return typeof(func) == typeof(Function);
    }
}
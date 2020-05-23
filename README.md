# **JavaScript: Salvando dados localmente com IndexedDB**

> Está é a 3ª etapa do treinamento de JavaScript  com es6 e orientação a objetos. 


## Assuntos abordados e os objetivos do treinamento

-  Aprender a armazenar dados offline com IndexedDB,
-   Fetch API,
-   Garantir a compatibilidade do código usando Babel,
-   Usar e entender as vantagens do ECMASCRIPT 2015 (ES2015) modules
-   Torne o código ainda mais elegante com novos padrões de projeto
----
### Considerações sobre o [IndexedDB]([https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Concepts_Behind_IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Basic_Concepts_Behind_IndexedDB)):
- É acessível através do escopo global;
- Precisamos solicitar uma requisição de abertura para um banco antes de qualquer coisa.
- Toda a vez que tentamos acessar um banco temos de lídar com a tríade de eventos:
	- openRequest.onupgradeneeded;
	-   openRequest.onsucess;
	-  openRequest.onerror;
	
	> Sobre a tríade de eventos disparados quando requisitamos uma abertura de conexão com o banco:
			- O evento onupgradeneeded é **sempre** chamado quando o banco é criado pela primeira vez.
			- O evento `onupgradeneeded` pode ou não ser disparado em determinadas situações.
			 >> Quando um banco é criado pela primeira vez, ele guarda um número de versão. O evento `onupgradeneeded` só será disparado se a nova versão do banco, indicada para a função `open`, for superior à versão do banco no `IndexedDB`.  
			
			
- Para realizarmos operações de persistência, como inclusão ou listagem, precisamos de uma _store_. Contudo, essa _store_ precisa vir de uma transação.
	> Partindo do ponto que a variável `connection` possui uma conexão para o banco `aluraframe` e que este banco possui a _store_  `negociacoes`, podemos obter uma store da seguinte forma:
	``` 
    let transaction = connection.transaction(['negociacoes'],'readwrite');
    let store = transaction.objectStore('negociacoes');
    ```
	
	Da  `connection`, obtemos uma transação através do método  `transaction`. Ele recebe como primeiro parâmetro um  **array**  com a  _object store_  que desejamos criar uma transação, e como segundo o tipo de acesso à  _store_. No caso, queremos ter acesso de leitura e escrita.

	Com a transação em mãos, agora sim podemos ter acesso a uma  _store_  transacional, através da chamada do método  `objectStore`, que recebe como parâmetro o nome da  _store_. É através da  _store_  que podemos realizar operações de persistência.

	> Note que chamar simplesmente `store.add` pode ou não adicionar efetivamente um objeto dentro de uma _store_, mas sempre ficaremos na dúvida se a operação foi realizada com sucesso. É por isso que o método `add` retorna uma requisição de abertura e no _callback_ passado para seu evento `onsuccess`, quando ele for chamado, temos certeza de que o objeto foi adicionado. Caso um erro aconteça, o _callback_ passado para `onerror` será chamado. Como no código abaixo
	
	```
	let transaction = connection.transaction(['negociacoes'],'readwrite');

	let store = transaction.objectStore('negociacoes');

	let negociacao = new Negociacao(new Date(), 200, 1);

	let request = store.add(negociacao);

	request.onsuccess = e => {
	  alert('Adicionado com sucesso!');
	};

	request.onerror = e => {
	  alert('Não foi possível adicionar');
	};
	```
	Para listarmos os dados armazenados em uma _store_, percorremos um caminho idêntico ao caminho percorrido para adicionar novas negociações:
	```
	let transaction = connection.transaction(['negociacoes'],'readwrite');
	let store = transaction.objectStore('negociacoes');

	let negociacoesDaStore = []; // vazia, precisa receber todas as negociações gravadas na store "negociacoes"
	```

	Contudo, não queremos chamar  `store.add`, pelo contrário, queremos obter cada negociação cadastrada do banco e não adicionar novas.
	```
	let cursor = store.openCursor();

	    cursor.onsuccess = e => {

	    let atual = e.target.result;

	    if(atual) {

	        let dado = atual.value;

	        negociacoesDaStore.push(new Negociacao(dado._data, dado._quantidade, dado._valor));

	        atual.continue();

	    } else { 

	        console.log(negociacoesDaStore);
	    }
	};
	```
	É através de um cursor que podemos iterar em uma _store_. O `cursor` possui um ponteiro para o primeiro objeto do banco. Veja, é um "ponteiro", não é o dado em si. Através do ponteiro podemos ter acesso ao primeiro, segundo, terceiro objeto e assim por diante. Assim que acessarmos um elemento do ponteiro, precisamos chamar `cursor.continue()` para que o ponteiro avance para o próximo elemento. Quando não houver mais elementos, o retorno de `cursor.continue()` será `null`.

----

### ConnectionFactory

Pensando na manutenção e legibilidade do nosso código, utilizaremos o pattern Factory para organizá-lo, criando assim a classe  `ConnectionFactory`:

```
ConnectionFactory
    .getConnection()
    .then(connection => {
    });

// faz outras coisas e pede novamente a conexão

ConnectionFactory
    .getConnection()
    .then(connection => {
    });
```
Algumas considerações para a classe:
- A) O método  `getConnection()`  será um método estático, ou seja, invocado diretamente na classe.

- B) O retorno de  `getConnection`  será uma promise, pois a abertura de uma conexão é um processo assíncrono.

- C) Não importa quantas vezes seja chamado o método  `getConnection()`, a conexão retornada deve ser a mesma.

- D) Toda conexão possui o método  `close()`, porém não podemos chamá-lo, porque a conexão é a mesma para a aplicação inteira. Só o próprio  `ConnectionFactory`  pode fechar a conexão.

Quando trabalhamos com o IndexedDB, é comum termos uma única conexão que será usada pela aplicação. Ao criarmos a chamada para o  `getConnection`, ele nos dará a conexão e se fizermos a mesma solicitação novamente, o retorno deverá ser o mesmo. A conexão será compartilhada com toda a aplicação e, por isso, o método  `close()`  não poderá ser chamado novamente. Lembrando que só o  `ConnectionFactory`  terá o poder de fechar a conexão.

Levando em consideração estas regras, faremos o design da classe  `ConnectionFactory` com esse primeiro esboço:

```
class ConnectionFactory {

    constructor() {

        throw new Error("ConnectionFactory não pode ser instanciada");
    }

    static getConnection() {

        return new Promise((resolve, reject) => {

        });
    }
}
```

> **Lançamos uma exceção no construtor da classe para impedir que sejam criadas intâncias da mesma**

Fizemos isso porque estipulamos que a única maneira de obter a conexão é chamando um método estático da classe `ConnectionFactory`. Aliás, para que um método seja chamado diretamente da classe e não de uma instância, usamos o modificador `static` antes do nome do método.

A obtenção de uma conexão é um processo assíncrono, sendo assim, nada mais justo do que nosso método `getConnection` retornar uma _promise_ para nos ajudar com a complexidade de códigos assíncronos.

> **Utilizando o padrão Module Pattern na classe ConnectionFactory para que sempre que seja chamado o método  `getConnection()`, a conexão retornada seja a mesma**
	
 Como a ideia é possuirmos apenas uma conexão para toda a aplicação, a solução foi aplicarmos o _Module Pattern_, com o qual transformamos todo o `script` em um módulo - o código está todo confinado. E depois, definimos qual parte queremos exportar para o mundo externo usando o `return`. A `ConnectionFactory` é acessada, mas todo o restante não. Resolvendo assim o problema de utilizarmos uma única conexão.

> **Utilizamos o Monkey Patch para que somente a `ConnectionFactory` possa fechar a conexão**

Utilizamos o Monkey Path para alterarmos o método `close()` de modo que somente a `ConnectionFactory` possa fechar a conexão.

----

### Usando o Pattern DAO para organizar a parte de persistência dos dados

A vantagem de se usar DAO está ligada com a capacidade de isolar todo o código que acessa seu repositório de dados em um único lugar. Assim, toda vez que o desenvolvedor precisar realizar operações de persistência ele verá que existe um único local para isso, seus DAO's.

Falando um pouco mais técnico e nem por isso menos bonito, o DAO faz parte da  _camada de persistência_, funciona como uma fachada para a API do IndexedDB. Repare que para usar o DAO não é preciso saber os detalhes do  `store`  ou  `cursor`.

Vejamos nossa classe `NegociacaoDao`. O método `adiciona` que devolve uma _promise_:


```
class NegociacaoDao {

    constructor(connection) {

        this._connection = connection;
        this._store = 'negociacoes';
    }

	adiciona(negociacao) {

        return new Promise((resolve, reject) => {

            let request = this
                ._connection
                .transaction([this._store],"readwrite")
                .objectStore(this._store)
                .add(negociacao);

            request.onsuccess = e => resolve();
            request.onerror = e => reject(e.target.error.name);
        });
    }

	listaTodos() {
        // ainda não implementado
	}
}
```
Note que só temos certeza que a negociação foi adicionada apenas se o evento `onsuccess` da requisição de inclusão for disparado. Por isso é nele que chamamos o `resolve` da nossa _promise_. Por fim, no evento `onerror` chamamos o `reject`, aquela função de toda _promise_ que recebe como parâmetro a razão da falha de sua execução.

Com a classe `NegociacaoDao` pronta, para combinarmos corretament `ConnectionFactory` e `NegociacaoDao` fazemos o seguinte:

```
ConnectionFactory
    .getConnection()
    .then(conexao => new NegociacaoDao(conexao))
    .then(dao => dao.adiciona(new Negociacao(new Date(), 1, 200.13)))
    .then(() => console.log('adicionado com sucesso'))
    .catch(() => console.log('não foi possível adicionar'));
```

Tudo começa invocando o método  `getConnection`  da nossa  `ConnectionFactory`. Como o método retorna uma  _promise_, quando encadeamos uma chamada à função  `then`  temos acesso à conexão. Veja, não queremos trabalhar com uma conexão diretamente, queremos um  `dao`, é por isso que no mesmo  `then`  em que obtemos a conexão retornamos implicitamente (_arrow function_  sem  _block_) uma instância de  `NegociacaoDao`.

Como houve um retorno, o  `dao`  está disponível na próxima chamada à função  `then`. Nele, chamamos  `dao.adiciona`  passando uma negociação como parâmetro.

Como  `adiciona`  devolve uma  _promise_  e há um retorno implícito da nossa  _arrow function_, encadeando mais uma vez a chamada da função  `then`  podemos executar um código com a certeza de que a negociação foi adicionada com sucesso. Caso algum erro ocorra, o código passado para o  `catch`  será executado.

## Para saber mais: IndexedDB e transações

Se você já trabalhou com algum banco de dados relacional deve ter reparado que em nenhum momento chamamos métodos como  `commit`  ou  `rollback`  para consolidar a transação ou abortá-la. Por mais que isso possa lhe causar certo espanto, o IndexedDB trabalha um pouquinho diferente.

### Transações do IndexedDB são auto commited

É por meio de uma transação que temos acesso a uma store e dela podemos realizar operações como a inclusão de um objeto. Quando essa operação é realizada com sucesso, ou seja, quando o evento  `onsuccess`  é chamado a transação é fechada, ou seja, as transações do IndexedDB são  _auto commited_. É por isso que cada método do nosso  `NegociacaoDao`  solicita uma transação toda vez que é chamado.

### Podemos cancelar uma transação através do método  `abort`

Ótimo, já sabemos quando uma transação é efetivada e que este é um processo automático, no entanto nem sempre queremos efetivá-la, ou seja, queremos abortá-la. Fazendo uma alusão aos bancos de dados relacionais, queremos ser capazes de realizar um  `rollback`.

Para cancelarmos (rollback) uma transação podemos chamar o método  `abort`:

```
ConnectionFactory.
    .getConnection()
    .then(connection => {

            let transaction = connection.transaction(['negociacoes'], 'readwrite');

            let store = transaction.objectStore('negociacoes');

            let negociacao = new Negociacao(new Date(), 1, 200);

            let request = store.add(negociacao);

            // #### VAI CANCELAR A TRANSAÇÃO. O evento onerror será chamado.
            transaction.abort(); 

            request.onsuccess = e => {

                console.log('Negociação incluida com sucesso');
            };

            request.onerror = e => {

                console.log('Não foi possível incluir a negociação');
            };


    })
```

Ao executar o código a seguinte mensagem de erro será exibida no console:

```
DOMException: The transaction was aborted, so the request cannot be fulfilled.
Não foi possível incluir a negociação
```

### Trate o cancelamento de uma transação no evento  `onabort`  de transaction

Contudo, podemos tratar os erros de uma transação abortada no evento  `onabort`  da transação, ao invés de lidarmos com ele em  `onerror`.

```
ConnectionFactory.
    .getConnection()
    .then(connection => {

            let transaction = connection.transaction(['negociacoes'], 'readwrite');

            let store = transaction.objectStore('negociacoes');

            let negociacao = new Negociacao(new Date(), 1, 200);

            let request = store.add(negociacao);

            // #### VAI CANCELAR A TRANSAÇÃO. O evento onabort será chamado.

            transaction.abort(); 
            transaction.onabort = e => {
                console.log(e);
                console.log('Transação abortada');
            };

            request.onsuccess = e => {

                console.log('Negociação incluida com sucesso');
            };

            request.onerror = e => {

                console.log('Não foi possível incluir a negociação');
            };


    })
```

Apesar do que aprendemos aqui não ser útil dentro do cenário da aplicação, informações extras como essa são sempre bem-vindas!

## Para saber mais: bibliotecas que encapsulam o IndexedDB

Criamos nossa própria solução de persistência aplicando padrões de projeto e combinando um pouco de tudo que vimos nos módulos anteriores, Procuramos esconder a complexidade de se lidar com o IndexedDB através das classes  `ConnectionFactory`  e  `NegociacaoDao`. Contudo, repare que isso é um problema que todos aqueles que utilizaram o IndexedDB terão que lidar em algum ponto da aplicação.

Para lidar também com o o IndexedDB outros desenvolvedores tornaram públicas suas bibliotecas. Por exemplo, há o  [Dexie](http://dexie.org/)  e o  [Db.js](http://aaronpowell.github.io/db.js/), este último utiliza promises assim como fizemos.

Como a ideia deste treinamento é que você se torne cangaceiro em JavaScript, não usamos nenhum biblioteca externa e fizemos tudo na mão!

## Simplificando requisições Ajax com a Fetch API

Neste curso, estamos usando o ECMAScript 2015. Não usamos mais o termo "ES 6", porque a cada ano, o JavaScript ganha novos recursos. No ES 2016, foi incluída uma API com o objetivo de simplificar a criação de requisições Ajax: **Fetch API**, uma API de busca do JS. O que veremos aqui, vai além do ECMAScript 2015.

Antes, o método  `get()`  era assim:

```
class HttpService

    get(url) {

        return new Promise((resolve, reject) => {

          let xhr = new XMLHttpRequest();

          xhr.open('GET', url);

          xhr.onreadystatechange = () => {

              if(xhr.readyState == 4) {

                  if(xhr.status == 200) {

                    resolve(JSON.parse(xhr.responseText));
                  } else {

                    reject(xhr.responseText);
                  }
              }
          };

          xhr.send();

          });
    }
```

Nós iremos apagar este trecho e reescreveremos o  `get()`. No escopo global, nós iremos adicionar a variável  `fetch`, no  `HttpService.js`. O resultado dela está no  `then()`, isto significa que o retorno será uma  _Promise_  por padrão. 

Pedimos que ela busque por uma resposta (`res`) e pediremos que a resposta seja convertida para o formato que desejamos. No caso, definiremos que ela seja `json`, mas poderíamos pedir em `texto` também.

Com as alterações, o `.then(res => res.json())` substituiu o `JSON.parse` do `post()`. Nós pediremos para o próprio objeto da resposta, vindo do Back-end, será o responsável pela conversão do formato. Como estamos trabalhando com uma _Promise_, também faremos o retorno.

nós usaremos o  `res.ok`  para fazermos testes com o status e nos indicará se é falso ou verdadeiro. Vamos ver como tratar o erro:

```
class HttpService {

    _handleErrors(res) {
     
		 if(!res.ok) throw new Error(res.statusText);
		    return res;
    }

    get(url) {

        return fetch(url)
            .then(res => this._handleErrors(res))
            .then(res => res.json());
    }
//...
```

Para manter a organização do código, criamos o método privado  `_handleErrors()`. O  `.then`  no  `fetch`  devolverá a própria requisição  `this._handleErrors`  que será acessível no próximo  `.then`  e será convertido para  `json`. Com o  `if`identificamos se tudo funcionou bem com o  `res.ok`, caso contrário, cairemos no  `else`  e exibiremos a mensagem de erro (`statusText`).

Se tivermos problema, retornaremos o `throw`. Mas se tudo correr bem, retornaremos o `res`. A mensagem de erro antes era exibida com o `responseText`, e agora, usamos o `res.statusText`. Quando a exceção for lançada, a Promise não irá para o `.then` do `get()`. Ela seguirá para o `catch`.

Agora vamos simplificar o método  `post()`, localizado dentro do  `HttpService.js`:

```
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
        xhr.send(JSON.stringfy(dado));
    });
}
```

Vamos reescrevê-lo, adicionando o  `fetch`. Como parâmetros usaremos a  `url`  e uma configuração da requisição que será recebida.

No  `headers`, adicionando dentro das chaves, um objeto JavaScript (`Content-type`) e definimos seu valor. Em seguida, no  `body`, converteremos o dado enviado de JSON para String.

No caso de erro, será lançada uma exceção e quem estiver usando o  `post`  do  `Http`  e chamar o método  `catch()`, receberá a mensagem de erro. Desse modo, após a refatoração o método ficará assim:

```
post(url, dado) {

        return fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            method: 'post',
            body: JSON.stringify(dado)
        })
        .then(res => this._handleErrors(res));
}
```

> **E o Fetch API funciona para todos os navegadores?**
O **Fetch API** é tão interessante que alguns desenvolvedores criaram um **_[polyfill]([https://raw.githubusercontent.com/github/fetch/master/fetch.js](https://raw.githubusercontent.com/github/fetch/master/fetch.js))_**, garantindo o bom funcionamento em todos os navegadores. Com este, podemos simular o Fetch API e o funcionamento será bastante semelhante.

### Considerações sobre Fetch API

- A  **Fetch API**  usa o padrão de projeto  _promise_.

	> Podemos encadear chamadas do  `.then`, inclusive tratar erros com  `.catch`.
	
- Existem _polyfis_ disponíveis na internet que garantem a presença da **Fetch API** em navegadores que não a suportam, mas é importante que o navegador suporte no mínimo a API de _promise_.
	 > Programadores front-end têm ficado cada vez mais interessados nessa API, ao ponto de utilizá-la em seus projetos, tudo com auxílio de um _polyfill_.

- Por mais que seja utilizada por muitos desenvolvedores, a **Fetch API** ainda está sujeita a mudanças, pois é experimental ainda (pelo menos até agosto/2016).
	> O fato de ser experimental não afastou os desenvolvedores e muitos deles usam um _polyfill_ para suportar esse recurso em navegadores que não o suportam. Mas é importante estar atento que o browser precisa suportar _promises_.

## Tornando nosso código ainda mais compatível usando Babel

[Babel](https://babeljs.io/) é um transcompilador muito famoso no cenário open source.

- Babel possui recursos nativos que permitem o monitoramento e compilação de scripts de maneira automática, sem a intervenção do desenvolvedor.
	> O binário do Babel possui o modo  `watch`  que monitora mudanças de arquivo e quando configurado corretamente permite compilar nossos script sem que o desenvolvedor assuma essa responsabilidade.

- Babel é um módulo do Node.js e depende dele para funcionar.
	> Babel é um módulo do Node.js. Ele é baixado através do  `npm`, o gerenciador de pacotes da plataforma Node.js.

Após instalá-lo através do npm é necessário configurá-lo.
O arquivo  **`.babelrc`**  deve estar no formato  `JSON`  e uma das exigências desse formato é usarmos aspas  **duplas**  para representar suas chaves, inclusive strings.

```
// .babelrc
{
  "presets": ["es2015"]
}
```

Muitos tutoriais da internet instalam Babel e outros módulos do Node.js globalmente por uma questão de brevidade, mas que não é uma boa prática.

Se você precisa da nova versão do Babel porque seu projeto A depende de um novo recurso, a atualização da instalação global será aplicada em todos os projetos. Ela pode funcionar perfeitamente em A, mas pode quebrar o projeto B que até então funcionava se algum BUG foi introduzido, um BUG que só afeta um recurso utilizado por B.

Sendo assim, instalamos Babel local ao projeto, contudo não é nada elegante a forma com que chamaremos manualmente o binário do babel em nosso terminal. Para contornar esse problema e ainda termos o babel instalado localmente para cada um dos nosso projetos, podemos criar um script em  `package.json`  que chamará o Babel para nós.

O código abaixo possui a chave  `script`  configurada corretamente para chamar  `Babel`  e compilar todos os nossos arquivos dentro da pasta  `aluraframe/client/js/app-es6`  resultando na pasta  `aluraframe/client/js/app`:
```
// package.json
{  
	// código omitido  
	"scripts":  {  
		"test":  "echo \"Error: no test specified\" && exit 1",  
		"build":  "babel js/app-es6 -d js/app --source-maps"  
	},  
	// código omitido  
}
```
### Utilizando o Sourcemap
Observe que no script `"build"` temos no fim do comando o parâmetro `--source-maps`. 

Podemos pedir para que Babel gere um `sourcemap` , ao compilar nossos arquivos. Trata-se de um arquivo que liga o arquivo resultante da compilação com o seu original para efeito de depuração, ou seja, para uso do _debugger_.

São arquivos usados em ambiente de desenvolvimento que visam fazer um "de para" do arquivo transcompilado com o arquivo original, para que erros sejam apontados no arquivo original.

Um outro ponto é que quando os arquivos sourcemaps serão baixados e se interferem no tempo de carregamento do site. Bem, sourcemaps são baixados **apenas** quando você abre a ferramenta de desenvolvimento do seu browse, ou seja, seu console ou `dev tools`. Claro, os arquivo só serão baixados se existirem. Veja que dessa maneira não há prejuízo do carregamento inicial do site.

###
o Babel vem como _watcher_, um observador de arquivos que automaticamente fará o processo de transcompilação quando um arquivo for alterado. Para habilitá-lo, vamos no arquivo  `package.json`  e adicionaremos o  `watch`:

```
// package.json
{
	// código omitido  
  "scripts"": {
      "test": "echo \"Error: no test specified\" && exit 1",
      "build": "babel js/app-es6 -d js/app --source-maps",
      "watch": "babel js/app-es6 -d js/app --source-maps --watch"
    },
	// código omitido  
}
```

No Terminal, vamos executar o  `watch`:

```
npm run watch
```

Ele irá compilar os arquivos e o Terminal ficará monitorando a modificação de todos eles. O processo de compilação correrá bem e ao recarregarmos a página de cadastro, tudo funcionará corretamente.

Para quem nunca havia trabalhado com o transpiler, mostramos que é possível trabalhar facilmente com Babel, também vimos como é o processo de transcompilação. Mesmo se usarmos recursos ainda mais avançados do JavaScript, o Babel conseguirá transcompilar para um código compatível para o ES5. Desta forma, conseguimos trabalhar com o que há de mais moderno, sem nos preocuparmos com compatibilidade.

Porém, se você está trabalhando com um navegador que não suporta Promise, terá que utilizar um polyfill para o mesmo. Neste caso, o Babel não resolverá. Temos ainda alguns truques, mas que ficarão para outro curso.

#### Para saber mais: há limite para os transcompiladores?
Vimos que o processo de transcompilação realizado pelo Babel convertendo nosso código em ES2015 (ES6) para ES5 o torna mais compatível, pois navegadores que não suportarem os recursos do ES2015 conseguirão interpretar nosso código. Contudo, nem tudo é resolvido por um transcompilador.

Por exemplo, se usarmos promises, o código transcompilado continuará a não funcionar caso o navegador não suporte esse recurso, a mesma coisa da Fetch API que vimos. Nesses casos, é comum misturar o processo de transcompilação com o uso de um ou outro polyfill para tapar aquelas lacunas que o transpiler não consegue.

> Written with [StackEdit](https://stackedit.io/).
# **JavaScript: Salvando dados localmente com IndexedDB**

> Está é a 3ª etapa do treinamento de JavaScript  com es6 e orientação a objetos. 

***ATENÇÃO***: 
- O projeto não possui a pasta `./client/node_modules` e você precisará baixar as dependências abrindo o terminal na pasta `./client` para em seguida executar o comando `npm install`. Este comando lerá seu arquivo `package.json` e baixará todas dependências listadas nele.
- Além disso, para executar o projeto, é necessário, após a instalação das dependências do projeto executar o comando `npm start` na pasta `./server` e pronto, o projeto poderá ser acessado via navegador através do endereço [localhost:3000](http://localhost:3000/).
- Se você quiser fazer testes e for incrementando a versão do seu banco, será necessário usar um número igual ou superior à versão do banco criado em seu navegador. Para isso, altere `/client/js/app/services/ConnectionFactory.js` para que a variável `version` utilize a versão correta.

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

## Escopo global e carregamento de scripts = dor de cabeça

Nossa aplicação vem se tornando cada vez mais sofisticada: persistimos dados localmente com IndexedDB, aplicamos padrões de projeto e utilizamos transpiler entre outras coisas. Contudo, desde o primeiro módulo do curso não atacamos dois pontos fracos da linguagem JavaScript: o escopo global e o carregamento de scripts. Primeiro, vamos filosofar sobre o escopo global.

Todas as nossas classes, inclusive a instância de  `NegociacaoController`  estão no escopo global. Agora, vamos simular o seguinte: baixamos uma lib de terceiros para usar em nossa aplicação. Vamos criar o arquivo  `aluraframe/client/js/app/lib/datex.js`  com o seguinte código:

```
// aluraframe/client/js/app/lib/datex.js

class DateHelper {

    dateToString(date) {
        /* faz algo */
    }

    stringToDate(string) {
        /* faz algo */
    }
}
```

Vamos importá-lo em  `aluraframe/client/index.html`  como último script. Quando ele for carregado,por possuir o mesmo nome da nossa classe  `DateHelper`  que esta no escopo global, haverá colisão de nomes e a nova classe substituirá a já existente. Como a classe agora não possui os método  `textoParaData()`  e nem  `dataParaTexto()`  nossa aplicação não funcionará. Faça um teste.

Outro problema, além de colisões no escopo global é a ordem de carregamento de scripts. Você deve lembrar que no primeiro módulo, éramos obrigados a carregar  `View.js`  antes de  `ListaNegociacoesView`  e  `MensagemView`  porque elas herdam de  `View`  e esta classe obrigatoriamente deve vir primeiro. Veja que esse problema acaba jogando nas costas do desenvolvedor a responsabilidade de verificar em que posição um novo script deve ser incluído.

A plataforma Node.js resolveu este problema adotando padrão CommonJS para criação de módulos, ainda há bibliotecas como  `RequireJS`  que usam o padrão AMD (_Assincronous Module Definition_). Contudo, o ES2015 especificou seu próprio sistema de módulos que resolve tanto o problema do escopo global quanto o de carregamento de scripts.

### ES2015 e módulos

Apesar de fazer parte da especificação, ainda não há consenso a respeito de como os scripts devem ser carregados pelo navegador. É por isso que para usarmos o sistema de módulos oficial do JavaScript precisamos utilizar loaders de terceiros, que nada mais são do que scripts especiais que farão o carregamento dos nossos módulos. Neste treinamento, utilizaremos o  `SystemJs`, um carregador de módulos universal que suporta módulos do ES2015.

Além do loader, ajustes em nosso código devem ser feitos para adequá-lo ao loader utilizado. Resumindo: para que possamos utilizar os módulos do ES2015, precisamos utilizar um loader e transcompilar nosso código.

Antes de baixarmos nosso loader, vamos primeiro configuração Babel para que adeque nosso código ao  `Systemjs`.

### Babel e transcompilação de módulos

Hoje, temos apenas configurado o preset  `es2015`  no arquivo  `.babelrc`. Ele garante a compilação do nosso código para ES5. Contudo, este preset não esta preparado para transcompilar módulos para o  `Systemjs`.

No terminal e dentro da pasta  `aluraframe/client`  vamos instalar o plugin  `transform-es2015-modules-systemjs`:

```
npm install babel-plugin-transform-es2015-modules-systemjs@6.9.0 --save-dev
```

Com o módulo baixado, vamos alterar nosso arquivo  `aluraframe/client/.babelrc`  e adicioná-lo como plugin. Nosso arquivo ficará assim:

```
{
  "presets": ["es2015"],
   "plugins": ["transform-es2015-modules-systemjs"]
}
```

A ideia de um plugin é a seguinte, depois de um preset ser aplicado, plugins são aplicados em seguida realizamos demais transformações.

### Refatorando nosso código com import e export

Agora, precisamos alterar todos os scripts que criamos até o momento para fazerem uso da sintaxe de módulo do ES2015. Precisamos escolher um para começar. Vamos começar por  `aluraframe/client/js/app-es6/views/MensagemView.js`.

A classe  `MensagemView`  depende da classe  `View`, tanto isso é verdade que usamos a sintaxe  `extends`  para herdá-la. Do jeito que esta, não funcionará com o sistema de módulos do ES2015, pois cada script é um módulo que confina o código declarado nele, evitando assim que caia no escopo global.

Precisamos explicitar que queremos usar a classe  `View`  por meio da instrução  `import`.

```
import {View} from './View';

class MensagemView extends View {

   // código omitido
}
```

Veja que usamos  `import`  seguido de  `{View}`. Colocamos o nome da classe que desejamos importar de um módulo entre chaves. Em seguida, usamos a instrução  `from`  apontando para o local do módulo. Encare cada script nosso agora como um módulo, ou seja,  `View.js`  é um módulo. Contudo, do jeito que esta, não funcionará. Porque tudo que estiver entre  `{}`  deve ser exportado pelo módulo. Se abrirmos  `View.js`  em nenhum momento deixamos claro que a classe  `View`  pode ser importada. Corrigimos isso facilmente adicionando a instrução  `export`  antes da definição da classe:

```
export class View {

   // código omitido
}
```

Veja que o módulo  `View.js`  agora exporta uma classe: a  `View`. Mas atenção, sabemos que  `MensagemView`  será usada por  `NegociacaoController`, sendo assim, precisamos também usar  `export`  para exportar a classe:

```
import {View} from './View';

export class MensagemView extends View {

   // código omitido
}
```

Agora, vamos fazer a mesma coisa com  `NegociacoesView`. Primeiro, vamos verificar suas dependências. Ela depende de  `View`  e também de  `DateHelper`. Então, primeiro, vamos alterar  `DateHelper.js`  para que exporte a classe  `DateHelper`:

```
export class DateHelper {

  // código omitido
}
```

Agora sim, podemos alterar  `NegociacoesView.js`:

```
import {DateHelper} from '../helpers/DateHelper';
import {View} from './View';

// exportamos, porque é usada em NegociacaoController.js

export class NegociacoesView extends View {

    // código omitido
} 
```

Bom, os módulos da pasta  `aluraframe/client/js/app/views`  já foram todos alterados. Agora, vamos para a pasta  `aluraframe/client/js/app/services`.

Vamos começar pelo módulo  `HttpService.js`. Ele não depende de classes de outros módulos, sendo assim, não precisamos usar a instrução  `import`. Mas o módulo precisa exportar a classe  `HttpService`  porque ela é usada por  `NegociacaoService`.

```
export class HttpService {
    /* código omitido */    
}
```

Agora, vamos analisar o módulo  `NegociacaoService.js`. Ele depende de  `HttpService`, de  `Negociacao`, pois instancia negociação, de  `ConnectionFactory`  e  `NegociacaoDao`. Primeiro, vamos fazer com que o módulo  `Negociacao.js`  exporte a classe  `Negociacao`.

```
export class Negociacao {
}    
```

Agora, vamos atacar o módulo  `ConnectionFactory`. Você deve lembrar que implementamos o module pattern para esconder algumas variáveis do programador e exportar apenas a classe. Como estamos usando o sistema de módulos do ES6 podemos simplificar bastante nosso código. Hoje ela está assim:

```
var ConnectionFactory = (function() {

    let stores = ['negociacoes'];
    let version = 9;
    let dbName = 'aluraframe';
    let connection = null;
    let close = null;

    return  class ConnectionFactory {


        // código omitido
    }
})();
```

Como módulos do ES6 já escondem do mundo externos variáveis e classes, podemos simplesmente remover a  `IIFE`  que utilizamos e exportar apenas a classe como já fizemos com outras classes:

```
let stores = ['negociacoes'];
let version = 9;
let dbName = 'aluraframe';
let connection = null;
let close = null;

export  class ConnectionFactory {

    // código omitido
}
```

Agora, precisamos fazer com que o módulo  `NegociacaoDao.js`  importe  `Negociacao`  e exporte a classe  `NegociacaoDao`:

```
import {Negociacao} from '../models/Negociacao';

export class NegociacaoDao {

    // código omitido 
}
```

Então, agora podemos alterar  `NegociacaoService`:

```
import {HttpService} from './HttpService';
import {Negociacao} from '../models/Negociacao';
import {ConnectionFactory} from './ConnectionFactory';
import {NegociacaoDao} from '../dao/NegociacaoDao';

export class NegociacaoService {
// código omitido
}
```

Vamos alterar  `ProxyFactory`. Ela não depende de outra classe, só deve exportar:

```
export class ProxyFactory {
    // código omitido
}    
```

```
export class Mensagem {
    // código omitido
}
```

```
export class ListaNegociacoes {
    // código omitido
}
```

Dentro de  `aluraframe/client/js/app/helpers`  faltou modificar o módulo  `Bind`. Ele depende de  `ProxyFactory`:

```
import {ProxyFactory} from '../services/ProxyFactory';

export class Bind {
    // código omitido
}
```

Por fim, falta o módulo`aluraframe/client/js/app/controllers/NegociacaoController.js`. Esta sim, dependerá de vários módulos:

```
import {Mensagem} from '../models/Mensagem';
import {Negociacao} from '../models/Negociacao';
import {ListaNegociacoes} from '../models/ListaNegociacoes';
import {NegociacoesView} from '../views/NegociacoesView';
import {MensagemView} from '../views/MensagemView';
import {NegociacaoService} from '../services/NegociacaoService';
import {DateHelper} from '../helpers/DateHelper';
import {Bind} from '../helpers/Bind';

export class NegociacaoController {

    // código omitido
}
```

Bom, agora, precisamos remover a instância de  `negociacaoController`  de  `index.html`, pois ela não ficará mais no escopo global.

Veja que com isso, não podemos mais associar o evento clique do botão  `adiciona`  com o  `apaga`  ou com a controller, porque não há outra  `negociacaoController`no escopo global. A página  `index.html`  ficará assim:

```
<!DOCTYPE html>
<html>
<head>
   <!-- código omitido -->   
</head>
<body class="container">

    <!-- código omitido -->

    <form class="form"">

        <!-- código omitido -->

        <button class="btn btn-primary" type="submit">Incluir</button>
    </form>

    <div class="text-center">
        <button class="btn btn-primary text-center" type="button">
            Apagar
        </button>
    </div> 
    <br>
    <br>

    <div id="negociacoesView"></div> 
</body>
</html>
```

Mas como associaremos a submissão do formulário à chamada do método  `adiciona()`  de  `NegociacaoController`?

O primeiro passo é indicarmos qual será o primeiro módulo a ser carregado pela aplicação. Criaremos o módulo  `aluframe/client/js/app-es6/boot.js`. Ele importará  `NegociacaoController`:

```
import {NegociacaoController} from './controllers/NegociacaoController';
let negociacaoController = new NegociacaoController();
```

A instância de  `NegociacaoController`  não estará no escopo global, sendo assim, precisaremos adicionar manualmente para o formulário e o botão que apaga as negociações a chamada dos métodos da nossa instância:

```
import {NegociacaoController} from './controllers/NegociacaoController';

var negociacaoController = new NegociacaoController();

document.querySelector('.form').onsubmit = negociacaoController.adiciona;
document.querySelector('button[type=button]').onclick = negociacaoController.apaga;
```

Veja que para o evento  `onsubmit`  do formulário associamos o método  `adiciona()`, contudo nosso código não funcionará. O  `this`  dos métodos deixaram de ser a instância  `negociacaoController`  e passarão a ser o elemento do DOM ao qual foram associados. Para resolvermos isso, podemos usar a conhecida função  `bind()`:

```
import {NegociacaoController} from './controllers/NegociacaoController';

var negociacaoController = new NegociacaoController();

document.querySelector('.form').onsubmit = negociacaoController.adiciona.bind(negociacaoController);
document.querySelector('button[type=button]').onclick = negociacaoController.apaga.bind(negociacaoController);
```

Perfeito. Agora que temos todos os módulos configurados, precisamos configurar nosso loader. Seu papel será carregar  `boot.js`. Como  `boot.js`  depende  `NegociacaoController.js`, o loader entende que deve baixar esse script e quando ver que este módulo depende de outros sairá baixando e resolverá todas as dependências. A vantagem disso é que não precisaremos importar mais scripts em nossa página! Apenas precisaremos importar o loader e indicar para ele que  `boot.js`  será o primeiro a ser carregado.

Vamos baixar nosso loader, o Systemjs usando o Terminal e dentro da pasta  `aluraframe/client`:

```
npm install systemjs@0.19.31 --save 
```

Com o script baixado, vamos importá-lo como único script em  `index.html`:

```
    <!-- código anterior omitido -->
    <script src="node_modules/systemjs/dist/system.js"></script>
</body>
</html>
```

Agora, vamos indicar para o loader que  `boot.js`  será o primeiro módulo a ser carregado:

```
    <!-- código anterior omitido -->
    <script src="node_modules/systemjs/dist/system.js"></script>
    <script>
        System.defaultJSExtensions = true; // permite omitir a extensão .js dos imports
        System.import('js/app/boot').catch(function(err){ 
            console.error(err);
        });
    </script>
</body>
</html>
```

Indicamos em  `System.import`  que  `boot.js`  será o primeiro módulo a ser carregado. Observe que não precisamos mais nos preocupar com a ordem de carregamentos de scripts, o loader vai resolver tudo para nós.

Vamos parar o babel e rodá-lo novamente para que compile nossos módulos. Em seguida, carregaremos nosso projeto que deve continuar funcionando. Se você tentar imprimir no console o nome de uma de nossas classes, inclusive a instância de  `negociacaoController`, o resultado será  `undefined`. Lembre-se que agora não trabalhamos mais com variáveis globais e não há mais o risco de colisão. Além disso, não precisamos mais nos preocupar com a ordem de carregamentos dos scripts.


- Quando trabalhamos com módulos, nossos scripts já isolam por padrão todo seu código, sendo necessário indicarmos através da instrução `export` o que pode ser importado do módulo.
-  É necessário compilar nosso código para que seja compatível com o loader que escolhermos. Isso acarreta em mais uma transformação a ser realizada pelo transpiler escolhido.
	> Veja que o sistema de módulos do ES2015 não define como o loader deve ser implementado pelos browsers do mercado, sendo necessário escolher algum do mercado. O mais famoso é o Systemsjs, capaz de lidar não apenas com os módulos do ES6, mas também com os do Node.js que seguem o padrão CommonJS.

### Importando  um módulo

Temos os módulos  `a.js`  e  `b.js`:

```
// módulo a.js

class A1 {

}

class A2 {

}
```

```
// módulo b.js

class B1 {

}
```

Pressupondo que os dois módulos estão no mesmo diretório, a alteração mínima em nossos módulos para que B1 consiga importar A2 é a seguinte:
```
// módulo a.js

class A1 {

}

export class A2 {

}
```
```
// módulo b.js

import {A2} from './a.js';

class B1 {

}
```
Temos que estar atentos à dinâmica de `import` e `exports`.

### Delegação de eventos

Temos como exemplo uma página para cadastrar produtos. Basta o usuário entrar com o nome do produto e clicar no botão para que um novo item apareça na página. Outro ponto importante: itens clicados exibem seu nome. Eis o código:

```
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Teste delegação</title>
</head>
<body>

    <input class="entrada" placeholder="Informe o nome do produto" autofocus>
    <button class="botao">Incluir</button>

    <ul class="lista">
        <li class="item">Açúcar</li>
        <li class="item">Papel higiênico</li>
    </ul>

    <script>
 
	(function() {


	    let lista = document.querySelector('.lista');

	    lista.addEventListener('click', function(event) {
	        if(event.target.nodeName == 'LI')
	            alert(event.target.textContent);
	    });

	    let entrada = document.querySelector('.entrada');


	    document.querySelector('.botao').addEventListener('click', function() {

	        let nome = entrada.value.trim();

	        if(nome) {

	            let novaLi = document.createElement('li');
	            novaLi.textContent = nome;
	            novaLi.classList.add('item');
	            lista.appendChild(novaLi);
	            entrada.value = '';
	            entrada.focus();
	        }

	    });

	})();
    </script>

</body>
</html>
```

Quando clicamos em uma  `li, nosso alvo (target)`, o evento click sobe na hierarquia de elementos. Para cada elemento na hierarquia será perguntado se ele também responde ao evento  `click`. No caso, a  `UL`  responde ao evento clique, mas no lugar de usar  `this`, que seria a própria UL, usamos  `event.target`  que é o elemento do DOM que disparou o evento inicialmente. Só que usamos a condição if para testar se o elemento é uma 'LI', porque não queremos responder para qualquer filho dentro de  `UL`, apesar de uma UL normalmente ter apenas  `li`  como elemento filho.

Veja que a delegação de eventos é interessante quando temos elementos adicionados dinamicamente, pois delegamos em nosso exemplo para a UL que sempre existirá em nossa página. Sendo assim, LI's novas ou já existentes dispararão o evento  `click`. Esse evento subirá na hierarquia de elementos chegando até a UL. Ela esta preparada para responder a este elemento, mas queremos levar em consideração o alvo do elemento (target) e não a URL, por isso usamos  `event.target`. Para termos certeza que queremos responder a LI's, fazermos um teste usando a propriedade  `event.target.nodeName`.

Você pode até remover a condição IF que o código funcionará, mas só funcionará porque dentro da UL temos apenas LI's. Se você remover o IF e adicionar um elemento dentro da UL que não seja li, o evento click será executado para ele. Faça um teste:

```

    <input class="entrada" placeholder="Informe o nome do produto" autofocus>
    <button class="botao">Incluir</button>

    <ul class="lista">
        <span>Não posso disparar o evento, porque não sou uma LI</span>
        <li class="item">Açúcar</li>
        <li class="item">Papel higiênico</li>
    </ul>
```

Veja que ao clicar no span sem a condição  `IF`  a UL também responderá a ele e não queremos isso, queremos apenas responder por delegação aos elementos que sejam LI's.

> ***Assim o projeto termina ^^. Valeu e até mais!***
> Att Candinho Jr.



> Written with [StackEdit](https://stackedit.io/).
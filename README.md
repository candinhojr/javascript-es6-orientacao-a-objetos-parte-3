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

Levando em consideração estas regras, faremos o design da classe  `ConnectionFactory`.

> **Utilizando o padrão Module Pattern na classe ConnectionFactory para que sempre que seja chamado o método  `getConnection()`, a conexão retornada seja a mesma**
	
 Como a ideia é possuirmos apenas uma conexão para toda a aplicação, a solução foi aplicarmos o _Module Pattern_, com o qual transformamos todo o `script` em um módulo - o código está todo confinado. E depois, definimos qual parte queremos exportar para o mundo externo usando o `return`. A `ConnectionFactory` é acessada, mas todo o restante não. Resolvendo assim o problema de utilizarmos uma única conexão.

> **Utilizamos o Monkey Patch para que somente a `ConnectionFactory` possa fechar a conexão**

Utilizamos o Monkey Path para alterarmos o método `close()` de modo que somente a `ConnectionFactory` possa fechar a conexão.

> Written with [StackEdit](https://stackedit.io/).
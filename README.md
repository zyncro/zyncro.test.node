#Ejercicio de NodeJS para Zyncro
######ver 20150820

###Atención: el objetivo de este ejercicio no es evaluar la rapidez del candidato: preferimos limpieza a velocidad.

##Enunciado
Queremos implementar un plataforma similar a *Twitter* en [**tiempo real**](http://socket.io/) y muy básica con la siguiente tabla de usuarios pre-existente:

| Username | Display name |
| -------- | ------------ |
| user1 |Primer usuario |
| user2 |Segundo usuario |
| user3 |Tercer usuario |
| user4 |Cuarto usuario |
| user5 |Quinto usuario |
| user6 |Sexto usuario |
| user7 |Séptimo usuario |


###Queremos que la timeline del usuario logado devuelva:
* Información del usuario que nos permita visualizar los *tweets* y gestionar usuarios (seguirlos, dejar de seguirlos…)
* El texto del post
* Cuando se creó el post

###Asumiremos que...
* el usuario es quien dice ser
* user1 tiene 2 seguidores (user2 y user3)
* user2 tiene 1 seguidor (user5)
* user3 tiene 4 seguidores (user4, user5, user6, user7)
* user4 no tiene seguidores
* a user5 le siguen el resto de usuarios
* todos los usuarios tienen mensajes previos (por ejemplo 2 cada uno) excepto el user6 que no * * tiene ningún mensaje
* user6 no tiene seguidores
* user7 tiene N seguidores (N>2) pero hace mucho tiempo que no postea nada

###Las acciones que un usuario puede realizar en nuestro *Twitter* son:
* dar de alta un nuevo usuario
* recuperar la timeline del usuario
* seguir a un usuario
* dejar de seguir a un usuario
* postear mensajes
* recibir updates en nuestra timeline en cuanto se creen nuevos post de usuarios a los que sigo
* recibir mensajes antiguos de un usuario al que acabo de seguir (por el mismo canal que el de recibir updates)
* recuperar el perfil de un usuario junto con sus seguidores y seguidos
* listar los usuarios de nuestro twitter

##¡Importante!
* Si el cliente hace una petición sin indicar qué usuario es (excepto en el caso del sign up), devolverá el siguiente error:
```{code: 403, description: 'You must specify a username in your query'}```

* Con este enunciado se distribuye la clase **Client (src/client.js)**: un cliente para conectarse al server.

	De sus "métodos" puedes extraer las llamadas a servidor (con sus parámetros) y sus respuestas. **Puedes modificar esta clase con total libertad**. Eso sí, explica el por qué de tus cambios al final de este mismo fichero README (sección Notas del desarrollador).
* También se distribuye un ejemplo **(example.js)** donde puedes ver la clase Client en movimiento.


##Ejercicio

###El ejercicio consiste en:
* hacer un fork de este repositorio y...
	* crear una API que, en [**tiempo real**](http://socket.io/), permita a los diferentes usuarios conectados, ejecutar las  acciones anteriormente definidas
	* modificar/completar el fichero de ejemplo para ver cómo se comporta un flujo de usuarios
	* modificar/completar la clase Client así como el fichero example.js (los usaremos para probar tu ejercicio).

opcional:

* salvar y recuperar la información de los usuarios, tweets, etc... en/de una base de datos MongoDB
* *en el caso de que hayas creado una base de datos MongoDB*: entregar un dump de la base de datos que has utilizado (en el directorio dump)
* definir test unitarios de tu server con [MochaJS](https://mochajs.org/)

####Gracias por dedicar tu tiempo a hacer este ejercicio. Buena suerte

##Notas del desarrollador
Pon aquí tus notas, explicaciones, comentarios, etc...

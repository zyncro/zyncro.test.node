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

	Entrego todo lo solicitado tras un gran esfuerzo dado que al mismo tiempo he tenido que cumplir con mis obligaciones laborales regulares, pero al mismo tiempo, feliz de haber podido realizar esta experiencia y de haber aprendido mucho. Confío en mi trabajo y también en que mi producto, dado mi gran interés y mi dedicación, mejorará muchísimo en poco tiempo con el entrenamiento cotidiano. Espero alcanzar las espectativas!


Notas de desarrollo:
====================

1) Estructura - He decidido utilizar las siguientes clases:

	Client			-	Representa una conexión de cliente, se instancia unicamente cuando el cliente está 							'autorizado' (es decir, cuando la conexión recibe 'username' via query string).

	ClientManager	-	Es un manejador de conexiones, gestionará los objetos 'Client'.

	'User'/'Tweet'	-	Modelos de Mongoose (por medio de sus metodos se encapsula el acceso a la DB).

2) Push notifications - Realizo las notificaciones PUSH por medio de rooms.

3) Declaración de clases - En la declaración de 'Client' y 'ClientManager' utilize un nombre en las funciones, esto lo he hecho así ya que de este modo es mas facil hacer un seguimiento de errores en el stack.

4) Mongoose y DAO - Ya que utilizo MongoDB y Mongoose utilizo las funcionalidades provistas por éste último para
realizar el acceso a los datos por medio de metodos agregados en el modelo como "statics" y como "methods", en este último caso, para ejecutar desde las instancias unicamente.

5) Errores - Visto que se solicitaba entregar errores con codigo / descripción he seguido este patron para todos los errores que arroja mi servidor utilizando los codigos HTTP que creí mas acertados. Al mismo tiempo, con el objeto de hacer mejor debug de la API, en consola se registran todos los errores y las acciones disparadas a través de eventos los recibidos.

6) Bluebird Prmises - Ya que en la clase dada como ejemplo se utiizaban este tipo de promesas intenté utilizar, siempre que me fue posible, este metodo. Se aprecia mas bien en el acceso desde los eventos a los metodos del modelo de Mongoose, que siempre devolveran una Promise.

7) Validaciones (datos) - Solo he implementado validacion para 'username' y 'displayName' por medio del validador de Mongoose, por cuestion de tiempos y para que al menos se vea que sé que existe esa posibilidad. Generalmente realizo controles via regex en todos los campos obligatorios y contemplo la posibilidad de inyección de codigo.

8) Otras validaciones - Intente dejar lo mas "filtrada" posible la interacción con el usuario, por ejemplo, siempre que se solicitan acciones sobre otros usuarios (como follow o pedir el profile) se realiza ante nada la busqueda del usuario solicitado en la DB, y de no existir, se arroja un error con codigo 404.

9) Control - También puse especial cuidado en cuestiones como no dejar nunca sockets conectados cuando un cliente se desconecta (sea intencionalmente o por un error producido), que no se pueda accionar sobre usuarios inexistentes, que el manejo de Rooms sea siempre en tiempo real, es decir, que se refresquen los follows esten o no los usuarios conectados, que no se dupliquen los follows, etc.

9) MongoDB - En mi equipo trabaje son autentificación por eso no utilicé un archivo de configuración y realizo la conexión directamente hacia localhost

10) Tests MochaJS - Para no demorarme (y tras haber consultado prioridades) estoy entregando el trabajo son la realización de los tests via MochaJS. Si fuera necesario les ruego me comuniquen y hare lo posible por entregarlos también.


----- Atentamente, Eduardo Garcia Rajo.
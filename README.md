#Ejercicio de NodeJS
######ver 20150817

##Enunciado
Queremos implementar un plataforma similar a *Twitter* en **tiempo real** y muy básica con la siguiente tabla de usuarios pre-existente:

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
* recibir mensajes antiguos de un usuario al que acabo de seguir
* recuperar el perfil de un usuario junto con sus seguidores y seguidos

##Ejercicio

###El ejercicio consiste en: 
* crear una API que, **tiempo real**, permita a los diferentes usuarios conectados, ejecutar las * acciones anteriormente definidas
* salvar y recuperar la información en/de una base de datos MongoDB
* definir con MochaJS test unitarios para esas llamadas
* usar un repositorio en GitHub, Bitbucket, etc... para trabajar en el ejercicio

###Nota
Con este enunciado se distribuye un pequeño fichero cliente con el que podrás probar el sistema. De ahí podrás extraer las llamadas y parámetros requeridos.

**Gracias por dedicar tu tiempo a hacer este ejercicio. Buena suerte**.

Instructions:

1. La aplicacion corre en puerto: 3900
2. Considerense los siguientes prefijos para los routes names:
    ROUTE_PREFIX="/api"
    ROUTE_PREFIX_USER="/user"
    ROUTE_PREFIX_FOLLOW="/follow"
    ROUTE_PREFIX_PUBLICATION="/publication"
3. Especificar una secret key dentro de una env variable llamada: SECRET_KEY
4. Para registrar un nuevo usuario los campos obligatorios
a mandar son: name, email, password, nick.
5. Se debe mandar token JWT por headers del request bajo
el nombre 'authorization'.


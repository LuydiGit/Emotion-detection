# Emotion-detection
Projeto para detecção de emoções em tempo real.

Nesse projeto é usado a api que está nesse site: https://justadudewhohacks.github.io/face-api.js/docs/index.html

Não existem requerimentos de pré instalção.
Os dados que são gravados ainda serão feitos em mysql.

Estou na parte de implementação de gravação das emoções em texto para que o usuário possa ver depois em seu perfil.

Para implementação de gravação de emoções em textos fiz algumas alterações:
1- instalei o node no computador
2- instalei no projeto apenas com npm init
3- instalei o nodemon
4- criei o server em MySql com o xampp
5- fiz o banco com duas tabelas, user e emotion
    5.1 user: id, name, email, password
    5.2 emotion: timestamp, emocao, user_id
6- inicio o server no terminal com nodemon server.js
7- usei a extensão Live server e inicio o projeto na página SignIn.html
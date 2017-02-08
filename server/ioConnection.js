const io = require('socket.io');
let connection;
let IoConnection = function (){
    //this.connection;
    this.init = function(server){
         //this.connection = io(server);
         connection = server;
    }
    this.get = function(){
        return connection;
    }
}

module.exports = new IoConnection();
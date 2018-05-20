// Conexion con base de datos
var mysql = require('mysql');
var connection = mysql.createConnection({ 
   host: 'localhost',
   user: 'root',
   password: '',
   database: 'firesandfloods',
});

function startConnection(){
    connection.connect(function(error){
   if(error){
      throw error;
   }else{
      console.log('Conexion correcta con con base de datos');
   }
});
}

var userOn = function userOn(id, callback){
	 connection.query('SELECT COUNT(*) as usersCount FROM users WHERE idTelegram=?', [id],function(err, rows, fields){
	   if (err){
		   throw err;
	   }else{
		   callback(null,rows);
	   }
	 });
}
//Consultas bd
var insertarUsuarioBD = function insertarUsuarioBD(id, callback){

			connection.query('INSERT INTO users(id, idTelegram) VALUES(?,?)', [null, id], function(err, rows, fields){
				   if(err){
					  throw err;
				   }else{
					  console.log('ID introducido correctamente.');
					  callback(null,rows);
				   }
			});
}

var getIdTelegram = function getIdTelegram(id, callback){
	connection.query('SELECT idTelegram FROM users WHERE id=?', [id],function(err, rows, fields){
	   if (err){
		   throw err;
	   }else{
		   callback(null, rows[0]);
	   }
	});
}

var getIdsBD = function getIdsBD(callback){
	connection.query('SELECT idTelegram FROM users', [],function(err, rows, fields){
	   if (err){
		   throw err;
	   }else{
		   callback(null, rows);
	   }
	});
}


//exports.consultaVueloByOrigenDestino=consultaVueloByOrigenDestino;
exports.connection=connection;
exports.startConnection=startConnection;
exports.insertarUsuarioBD=insertarUsuarioBD;
exports.getIdTelegram=getIdTelegram;
exports.userOn=userOn;
exports.getIdsBD=getIdsBD;
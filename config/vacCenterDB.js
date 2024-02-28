const mysql = require("mysql");

var connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Nawakorn23480",
  database: "vacCenter",
});

module.exports = connection;

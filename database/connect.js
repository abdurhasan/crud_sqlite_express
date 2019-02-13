
const sqlite = require('sqlite3').verbose();
const url = __dirname + '/myApp.db';
const print = console.log;
const db = new sqlite.Database(url, sqlite.OPEN_READWRITE, (err) => {
    if (err) print(err)
    print('DATABASE CONNECTED..')
})


function Database() {
    
    this.getAllData = function (query,detail,cb) {
        
        db.all(query, detail, (err, rows) => {
            cb(err, rows)
        })
    }


    this.insertData = function (value, cb) {
        let insert = `INSERT INTO Data(String,Integer,Float,Date,Boolean) VALUES(?,?,?,?,?)`

        db.run(insert, [value.string, value.integer, value.float, value.date, value.boolean], (err, rows) => {
            cb(err, rows)
        })
    }

    this.updateData = function (value, cb) {
        let insert = 'UPDATE Data SET String = ? , Integer = ? , Float = ? ,Date = ?, Boolean = ? WHERE ID = ?'
        print(value)
        db.run(insert, [value.string, value.integer, value.float, value.date, value.boolean, value.id], (err) => {
            cb(err)
        });

    }

    this.deleteData = function (id, cb) {
        let query = 'DELETE FROM Data WHERE ID = ?'
        db.run(query, id, (err) => {
            cb(err)
        })
    }

}



module.exports = Database
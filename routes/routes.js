const express = require('express');
const router = express.Router();
const print = console.log;
const Database = require('../database/connect')
const database = new Database()


//==================================
//             ROUTING
//==================================

router.get('/', function (req, res) {
  let offset = (req.query.page - 1) * 5 || 0 
  let sql = {
    command: `SELECT * FROM Data LIMIT 5 OFFSET ${offset}`,
    detail: []
  }

  if (isVerifyObj(req.query)) {
    sql = filterData(req.query)
    
    database.getAllData(`SELECT COUNT(*) as page ${sql.command}`, sql.detail, function (err, rows) {      
      let halaman = Math.ceil(rows[0].page / 5)
      database.getAllData(`SELECT * ${sql.command} LIMIT 5 OFFSET ${offset}`, sql.detail, function (err, rows) {
        if (err) res.json({ message: err })                
        if(req.query.hasOwnProperty('page')){
            delete req.query.page
        }        
        let pagination = toQueryString(req.query)     
        for (let i = 0; i < rows.length; i++) {
          if(rows[i].Boolean==1)rows[i].Boolean=true
          else rows[i].Boolean=false
        }
        
        res.render('home', { data: rows, halaman: halaman,paginationString:pagination ,query:req.query})
      })      
    })        
  } 
  
  else {
    database.getAllData('SELECT count() as page FROM Data', [], function (err, rows) {
      if (err) res.json({ message: err })
      let halaman = Math.ceil(rows[0].page / 5)
      
      database.getAllData(sql.command, sql.detail, function (err, rows) {
        if (err) res.json({ message: err })
        
        print(req.query)
        for (let i = 0; i < rows.length; i++) {
          if(rows[i].Boolean==1)rows[i].Boolean=true
          else rows[i].Boolean=false
        }
        res.render('home', { data: rows, halaman: halaman,paginationString:'',query:req.query})
      })
    })

  }

});



router.get('/api', function (req, res) {
      
  res.json({
    obj:req.query,
    queryString:toQueryString(req.query)
    
  })
})

router.get('/create', (req, res) => {
  res.render('create')
})
router.get('/api/delete/:id', (req, res) => {
  database.deleteData(req.params.id, (err) => {
    if (err) res.json({ message: err })
    res.redirect('/')
  })
})

router.post('/api/create', (req, res) => {

  database.insertData(parsingData(req.body), function (err, data) {
    if (err) res.json({
      message: err
    })
    res.redirect('/')
  })
})




router.get('/update/:id', function (req, res) {

  let query = `SELECT * FROM Data WHERE ID = ${req.params.id}`
  database.getAllData(query, function (err, data) {
    if (err) res.json({
      message: err
    })
    res.render('update', { data: data[0] })

  })

});


router.post('/api/update/:id', function (req, res) {

  let result = parsingData(req.body)
  result.id = Number(req.params.id)

  database.updateData(result, function (err, data) {
    if (err) console.error(err.message)
    res.redirect('/')
  })

});





//==================================
//             ACTIONS
//==================================


toQueryString = function(obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}

function filterData(query) {
  let command = `FROM Data WHERE ID = ? OR String = ? OR Integer = ? OR Float = ? OR Boolean = ? OR (Date >= ? AND Date <= ?)`
  let detail = []

  query.hasOwnProperty('checkId') ? detail.push(query.id) : detail.push(null)
  query.hasOwnProperty('checkString') ? detail.push(`LIKE %${query.string}%`) : detail.push(null)
  query.hasOwnProperty('checkInt') ? detail.push(query.integer) : detail.push(null)
  query.hasOwnProperty('checkFloat') ? detail.push(query.float) : detail.push(null)

  query.hasOwnProperty('checkBol') ? detail.push(JSON.parse(query.boolean)) : detail.push(null)


  if (query.hasOwnProperty('checkDate')) {
    if (query.start_date != 0 && query.end_date != 0) {
      detail.push(query.start_date, query.end_date)
    } else if (query.start_date != 0) {
      detail.push(query.start_date)
    }
  } else if (query.start_date != 0) {
    detail.push(query.end_date)
  }

  return { command, detail }
}

function isVerifyObj(obj) {
  let bujang = ''
  for (key in obj) {
    bujang += key
  }
  if (Object.keys(obj) == 0) return false
  if (!bujang.includes('check')) return false
  if (obj.id == '' && obj.string == '' && obj.integer == '' && obj.float == '' && obj.boolean == '' && obj.start_date == '' && obj.end_date == '') return false

  return true

}

function parsingData(query) {
  let item = {
    string: query.string,
    integer: parseInt(query.integer),
    float: parseFloat(query.float),
    date: query.date,
    boolean: JSON.parse(query.boolean)
  }

  return item
}



//==================================




module.exports = router;








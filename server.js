// init project
const m = require('./handleDatabase/schema.js')
//information from forms
var bodyParser = require('body-parser');
var cors = require('cors');
//app
const express = require("express");
const app = express();
app.use(cors());


//read information from forms
app.use(bodyParser.urlencoded({extended: 'false'}));
app.use(bodyParser.json());

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
});






//create Person
var createPerson = m.createPerson;
var create_person_api = "/api/exercise/new-user"
app.post(create_person_api, function(req, res, next) {
  var username = req.body.username //get form submit data username
  //check to see if user is already in database
  FindPersonLogs(username, function(err, data) {
    if(err) { return (next(err)); } 
    if(data) {
      //person is in database - do not add username - keep username's unique
      res.json({username: "already taken"})
      return next(err);
    } else {
      //person is not in database - add to database
      createPerson(username, function(err, data) {
        if(err) { return (next(err)); }
        if(!data) {
          console.log("Missing done() argument!")
          return next({message: 'Missing callback argument'});
        }
        res.json(data); 
      })
    }
  })
})

//lookup al the users in the database
var getAllData = m.getAllData;
var person_api = "/api/exercise/users"
app.post(person_api, function(req, res, next) {
  getAllData(function(err, data) {
    var users = data.map(function(person_log) {
      console.log(person_log.name != null)
      if (person_log.name != null) {
        return person_log.name
      }
    }).slice(1, data.length) //there is a null at the beginning
    res.json([...new Set(users)]);
  })
})

//update the user exercise array
var addExercise = m.addExercise;
var findPersonById = m.findPersonById;
var exercise_update_api = '/api/exercise/add'
app.post(exercise_update_api , function(req, res, next) {
  var form_data = req.body; //get form submit data
  //query id to see if it is actually in database
  findPersonById(form_data.userId, function(err, data) {
    if(err) { 
      res.json({id: "invalid"}); 
    } 
    if(data) {
      //person in database - continue
      var exercise_data = {
        userId: form_data.userId,
        description: form_data.description,
        duration: form_data.duration,
        date: form_data.date
      }
      //update specified user exercise
      addExercise(exercise_data, function(err, data) {
        if(err) { return (next(err)); }
        if(!data) {
          console.log("Missing done() argument!")
          return next({message: 'Missing callback argument'});
        }
       res.json(data);
      })
    } else {
      //person not in database
      console.log("Missing done() argument!")
      return next({message: 'Missing callback argument'});
    }
  })
})

//query to find person's exercise log by their username
var FindPersonLogs = m.FindPersonLogs;
var person_log_lookup_api ="/api/exercise/log"
app.post(person_log_lookup_api, function(req, res, next) {
  var username = req.body.username //get form submit data username //INSERT HERE THE USER ID WHEN READING THE FORM
  FindPersonLogs(username, function(err, data) {
    if(err) { return (next(err)); } 
    if(!data) {
      //person not in database
      console.log("Missing done() argument!")
      res.json({username: "invalid"})
      return next({message: 'Missing callback argument'});
    }
    var user_exercise_data = data.exercise;
    //sort data by date - most recent on top
    user_exercise_data.sort(function(a, b){
      return (a.date < b.date) ? 1 
           : (a.date > b.date) ? -1
           :   0;
    })
    //filter exercise date by the dates specified
    var startDate = req.body.dateStart || 0;
    var endDate = req.body.dateEnd || 0;
    user_exercise_data = user_exercise_data.filter(function(log) {
      if ( startDate && endDate ) {
        //both dates given
        return log.date >= startDate && log.date <= endDate
      } else if (startDate && !endDate) {
        //start date given only
        return log.date >= startDate
      } else if (!startDate && endDate) {
        //end date given only
        return log.date <= endDate
      } else {
        //no dates specified - return all dates
        return log
      }
    })
    //get only subset of data if specified by the user
    var limit = req.body.limit || user_exercise_data.length;
    console.log(limit)
    if (limit < user_exercise_data.length) {
      user_exercise_data = user_exercise_data.slice(0, limit);
    } 
    //log json to page
    res.json(user_exercise_data);
  }) 
})



//5df5957c06ff8b7185ce0d98






// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

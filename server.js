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
var person_log_lookup_api ="/api/exercise/user-log"
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
    res.json(user_exercise_data);
  }) 
})



//5df5957c06ff8b7185ce0d98






// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
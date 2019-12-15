//requirements
var mongoose = require("mongoose");
//connect to databse
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
const Schema = mongoose.Schema;
//create the schema for each person
const personSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  exercise: {
    type: Array,
    default: []
  }
})
//create model - Model Name, Schema
var Person = mongoose.model("Person", personSchema);

//create person
var createPerson = function(person_name, done) {
  //add new data using the "Person" instance create and fill with data
  var person = new Person({
    name: person_name
  })
  //send the data back to the model
  person.save(function(err, data) {
    if (err) { return done(err) }
    return done(null, data)
  })
};

//update person exercise array
var addExercise = function(exercise_data, done) {
  // search DB for the corresponding userID and update the exercise array
  Person.findByIdAndUpdate(exercise_data.userId, { $addToSet: {exercise: exercise_data} }, {new: true}, function(err, data) {
    console.log(err)
    if(err) return done(err)
    return done(err, data)
  }) 
};

//find user information
var FindPersonLogs = function(username, done) {
  Person.findOne({name: username}, function(err, data) {
    if (err) { return done(err) }
    return done(null, data)
  })
}

//find user by id
var findPersonById = function(userId, done) {
  Person.findById(userId, function(err, data) {
    if (err) { return done(err) } 
    return done(null, data)
  })
}


//export
exports.createPerson = createPerson;
exports.addExercise = addExercise;
exports.FindPersonLogs = FindPersonLogs;
exports.findPersonById = findPersonById;
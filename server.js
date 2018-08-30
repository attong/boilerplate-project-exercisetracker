const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
//mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

mongoose.connect('mongodb://localhost:27017/exercisetracker');

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Define schema
var Schema = mongoose.Schema;
var exerciseSchema = new Schema({
  user: {type: String, unique: true},
  excercises: {type: Array}//initialize as empty array, update as we add more
});
var users = mongoose.model("user", exerciseSchema);


app.post('/api/exercise/new-user', (req,res)=>{
	if (!req.body) return res.sendStatus(400);
	// verify that parsing works
	users.findOne({user: req.body.username}, (err,data)=>{
		if (err){
			throw err;
		} else if (data == null){
			var newUser = new users({user: req.body.username, excercises:[]});
			newUser.save();
			res.json({success: req.body.username + " added to database"});
		} else{
			res.json({err: req.body.username + " is already in the system"});
		}
	});
})

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

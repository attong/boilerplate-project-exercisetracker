const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')
const moment = require('moment')
moment().format();
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
	if (!req.body || req.body.username == '') return res.sendStatus(400);
	// verify that parsing works
	users.findOne({user: req.body.username}, (err,data)=>{
		if (err){
			throw err;
		} else if (data == null){
			var newUser = new users({user: req.body.username, excercises:[]});
			newUser.save();
			return res.json({success: req.body.username + " added to database"});
		} else{
			return res.json({err: req.body.username + " is already in the system"});
		}
	});
})

app.post('/api/exercise/add', (req,res)=>{
	if (!req.body){ return res.sendStatus(400)};
	users.findOne({user: req.body.userId}, (err,data)=>{
		if (err){
			throw err;
		} else if (data == null){
			return res.json({error: "user: "+ req.body.userId + " is not in the database"});
		} else{
			//verify date is in correct format
			if (!(moment(req.body.date, "YYYY-MM-DD", true).isValid())){
				return res.json({error: req.body.date +" is not in the correct date format"});
			} else if (isNaN(req.body.duration)){
				return res.json({"error": "duration must be a number"})
			} else{
				var entry = {"description": req.body.description, "duration": req.body.duration, "date": req.body.date};
				var temp = data.excercises;
				temp.push(entry);
				data.excercises = temp;
				data.save();
				return res.json({"success": entry successful});
			}
		}
	});
	//{"userId":"anthony","description":"run","duration":"5","date":"2018-01-01"}
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

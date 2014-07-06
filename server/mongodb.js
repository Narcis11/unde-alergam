var mongoose = require('mongoose');
var assert = require("assert");

var dbURI = 'mongodb://localhost/undealergam?keepAlive=1';


/* Create the database connection */
mongoose.connect(dbURI);

var db = mongoose.connection;


/*** CONNECTION EVENTS ***/
/* When successfully connected */
mongoose.connection.on('connected', function() {
	console.log('Mongoose connection open to ' + dbURI);
});

/* If the connection throws an error */
mongoose.connection.on('error', function(err) {
	console.log('Mongoose connection error: ' + err);
});

/* When the connection is disconnected */
mongoose.connection.on('disconnected', function() {
	console.log('Mongoose connection disconnected');
});

/* If the Node process ends, close the Mongoose connection */
process.on('SIGINT', function() {
	mongoose.connection.close(function() {
		console.log('Mongoose connection disconnected through app termination');
		process.exit(0);
	});
});

/* Defining schemas */

var Schema = mongoose.Schema;


var routeSchema = new Schema({
	id: Schema.Types.ObjectId,
	userId: Schema.Types.ObjectId,
	distance: Number,
	name: {
		type: String,
		trim: true
	},
	info: {
		when: {
			type: String,
			trim: true
		},
		where: {
			type: String,
			trim: true
		},
		traffic: {
			type: Number,
			min: 1,
			max: 5
		},
		dogs: {
			type: Number,
			min: 1,
			max: 5
		},
		lighting: {
			type: Number,
			min: 1,
			max: 5
		},
		safety: {
			type: String,
			trim: true
		},
		observations: {
			type: String,
			trim: true
		}
	},
	coordinates: [Number]
});


var userSchema = new Schema({
	id: Schema.Types.ObjectId,
	name: {
		type: String,
		trim: true,
		unique: true
	},
	password: {
		type: String,
		trim: true
	},
	date: {
		type: Date,
		default: Date.now
	},
	city: {
		type: String,
		trim: true
	},
	country: {
		type: String,
		trim: true
	},
});

/*Create methods for the schemas - example find*/
routeSchema.statics.findAll = function(callback) {
	this.find().exec(callback);
}

routeSchema.statics.findByID = function(id, callback) {
	this.find({
		_id: id
	}, callback);
}
/*Create models = objects we can work with*/
var routeModel = mongoose.model('Route', routeSchema);
var userModel = mongoose.model('User', userSchema);

/* Functions used in other parts of the program */
module.exports = {

	createUser: function(userName, passwd, city, country) {
		console.log("Creating user : " + userName);
		var properties = {
			name: userName,
			password: passwd,
			city: city,
			country: country,
		};
		var user = new userModel(properties);
		user.save(saveObjectCallback);

	},

	insertTraseu: function(userName, pathName, distance, whenField, whereField, trafficField, dogsField, lightsField, securityField, obsField, coordinates) {
		console.log("Creating Route : " + pathName);
		var properties = {
			name: pathName,
			distance: distance,
			info: {
				when: whenField,
				where: whereField,
				traffic: trafficField,
				dogs: dogsField,
				lighting: lightsField,
				safety: securityField,
				observations: obsField,

			},
			coordinates: coordinates
		};
		userModel.find({
			name: userName
		}, '_id', function(err, users) {
			if (err) return console.error(err);
			assert.equal(1, users.length, "More than one user with the same username");
			properties.userId = users[0]._id;
			var route = new routeModel(properties);
			route.save(saveObjectCallback);
		});
	},

	getTrasee: function(socket) {
		routeModel.findAll(function(err, routes) {
			if (err) return console.error(err);
			console.log("routes : " + routes.length);
		});
	},

	getInfoTraseu: function(id, socket) {
		routeModel.findByID(id, function(err, routes) {
			if (err) return console.error(err);
			assert.equal(1, routes.length, "More than one route with the same id");
			console.log("found by id : " + routes[0]);
		});
	},

	verifyPassword: function(username, password, socket) {
		userModel.find({
			name: username
		}, 'password', function(err, users) {
			if (err) return console.error(err);
			assert.equal(1, users.length, "More than one user with the same username");
			if (users[0].password == password)
				console.log("User " + username + " successfully logged in.");
			else
				console.log("Failed login for user "+ username);
		});
	},

}

/* Functions used internally */
function saveObjectCallback(err, object) {
	console.log("Saved callback : ");
	if (err) return console.error(err);
	console.log("Saved : " + object);
}
var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose  = require("passport-local-mongoose"),
    User = require("./models/user")


mongoose.connect("mongodb://localhost:27017/auth_demo");
var app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));


app.use(require("express-session")({
	secret: "Thats all you had to say",
	resave: false,
	saveUninitialized: false
}))

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//============ROUTES============


app.get("/", function(req, res){
	res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res){
	res.render("secret");
});

//==========AUTH ROUTES==========

//show sign up form
app.get("/register", function(res, res){
	res.render("register")

})
//handling user sign up
app.post("/register", function(req, res){
	User.register(new User({username: req.body.username}), req.body.password,
		function(err, user){

			if(err){
				console.log(err);
				return res.render("register");
			}
			else{
				passport.authenticate("local")(req, res, function(){
					res.redirect("/secret");
				})
			}
		})
})

//=======LOGIN ROUTES=======

app.get("/login", function(req, res){
	res.render("login");
})
//middleware
app.post("/login", passport.authenticate("local", {
	successRedirect: "/secret",
	failureRedirect: "/login"
}), function(req, res){

});
//logout
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

app.listen(3000, function(){
	console.log("server started");
})
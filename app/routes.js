module.exports = function(app, passport) {
    
    //make user be able to delete his/her own posts.
    //work on likes and make users be able to unlike something.
    //add tags so users can search by tags.
    //make a report button so if 10 different people report something it gets removed.
    //change the way it loads the masonry objects and add animations.
    
    
    var multer = require("multer"),
    mongodb = require("mongodb"),
    mongoUrl = "mongodb://localhost:27017/mongo",
    fs = require("fs"),
    path = require("path"),
    upload = multer({ storage: multer.diskStorage({

    destination: function (req, file, cb) {
      cb(null, './images');
    },

    filename: function (req, file, cb) {
      var ext = require('path').extname(file.originalname);
      ext = ext.length>1 ? ext : "." + require('mime').extension(file.mimetype);
      require('crypto').pseudoRandomBytes(16, function (err, raw) {
        cb(null, (err ? undefined : raw.toString('hex') ) + ext);
      });
    }
})});
    var User = require('./models/user');
    Object.size=function(obj){var size=0,key;for(key in obj){if(obj.hasOwnProperty(key))size++;}return size;};
// normal routes ===============================================================
        mongodb.connect(mongoUrl, function(err, db) {
            if(err) throw err;
    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        var address = "secondaryIndex.html";
        if(req.isAuthenticated()) address = "index.html";
        fs.readFile((path.join(__dirname + '/../views/' + address)), function(err, result) {
            if (err) throw err;
            res.write(result);
            db.collection("mongo").find({}).count({}, function (error, count) {
                if(error) throw error;
                if(count != 0) {
                    db.collection("mongo").find({}, function(err, data) {
                   if(err) throw err;
                       var a = 0;
                       var rawHtml = "";
                       data.forEach(function(doc) {
                            rawHtml += '<div class="grid-item"><div class="thumbnail text-center"><img src="'+doc.imgLink+'"/><div class="caption"><h3>'+ doc.title +'</h3><p>'+ doc.description +'</p><p><a href="#" class="btn btn-primary" role="button">Like</a></p><p>Created By: <a href="/user/'+doc.user+'">'+doc.username+'</a></p></div></div></div>';
                            //console.log(doc.imgLink);
                            a++;
                            if(a == count) res.end("<script>$(document).ready(function() {var $mason=$('#masonry');$mason.hide();$mason.append('"+rawHtml+"');var $grid = $('.grid').masonry({itemSelector: '.grid-item',percentPosition: true,columnWidth: 50});$grid.imagesLoaded().progress( function() {$grid.masonry();$mason.show();});});</script>");
                        });
                    });
                } else res.end();
            });
        });
    });
    
    app.get('/post', isLoggedIn, function(req, res) {
       res.render('post.ejs'); 
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
    app.get('/images/:imageID', function(req, res) {
        var id = req.params.imageID;
        res.sendFile(path.join(__dirname + '/../images/' + id));
    });
    app.get('/user/images/:imageID', function(req, res) {
        var id = req.params.imageID;
        res.sendFile(path.join(__dirname + '/../images/' + id));
    });


    app.get('/user/:userID', function(req, res) {
       var ObjectID=require('mongodb').ObjectID;
       var id = req.params.userID.toString();
       console.log(id);
       var address = "secondaryIndex.html";
        if(req.isAuthenticated()) address = "index.html";
        fs.readFile((path.join(__dirname + '/../views/' + address)), function(err, result) {
            var rawHtml = "";
            if (err) throw err;
            res.write(result);
            /*
            User.find({_id: ObjectID(id)}, function(err, data) {
                if(err) throw err;
                if(data != null) res.write('<script>$(document).ready(function() {$(body).prepend("<div class="container"><div class="well text-center"><h3>'+ data._id + '$apos;s Pins</h3></div></div>");});</script>');
            });*/
            db.collection("mongo").find({user: ObjectID(id)}).count({}, function (error, count) {
                if(error) throw error;
                if(count != 0) {
                    db.collection("mongo").find({user: ObjectID(id)}, function(err, data) {
                   if(err) throw err;
                       var a = 0;
                       data.forEach(function(doc) {
                            rawHtml += '<div class="grid-item"><div class="thumbnail text-center"><img src="'+doc.imgLink+'"/><div class="caption"><h3>'+ doc.title +'</h3><p>'+ doc.description +'</p><p><a href="#" class="btn btn-primary" role="button">Like</a></p><p>Created By: <a href="/user/'+doc.user+'">'+doc.username+'</a></p></div></div></div>';
                            a++;
                            if(a == count) res.end("<script>$(document).ready(function() {var $mason=$('#masonry');$mason.hide();$mason.append('"+rawHtml+"');var $grid = $('.grid').masonry({itemSelector: '.grid-item',percentPosition: true,columnWidth: 50});$grid.imagesLoaded().progress( function() {$grid.masonry();$mason.show();});});</script>");
                        });
                    });
                } else res.end();
            });
        });
    });

// posts =======================================================================
    app.post('/post', upload.single('exact'), function(req, res) {
        //res.json(req.file.path);
        var name = "";
        
        if(req.user.facebook.name != undefined) { name=req.user.facebook.name;
        } else if(req.user.twitter.username != undefined) { name=req.user.twitter.username;
        } else if(req.user.google.name != undefined) { name=req.user.google.name;
        } else { name = req.user.local.username;}
        console.log(name);
        
        function add(imgLink) {
            db.collection('mongo').insertOne({username: name, user: req.user._id, title:req.body.title, description:req.body.description, imgLink: imgLink});
        }
        
        if(req.body.link) {
            add(req.body.link);
        } else {
            var filepath = "";
            for(var a = 0; a < req.file.path.length; a++) {
                filepath += req.file.path[a];
            }
            var fileType = req.file.mimetype.split("/");
            fileType = fileType[fileType.length - 1];
            console.log(fileType);
            var goodFileTypes = ["jpeg", "png", "gif", ];
            if(goodFileTypes.indexOf(fileType) != -1) {
                console.log("The path for that new file is " +  filepath);
                //db.collection('mongo').insertOne({username: name, user: req.user._id, title:req.body.title, description:req.body.description, imgLink: filepath});
                add(filepath);
            }
        }
        res.redirect('/');
        //res.json(req.file.filename);
    });








// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================
    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });
        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage')});
        });
        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
    // facebook -------------------------------
        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/',
                failureRedirect : '/'
            }));
    // twitter --------------------------------
        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));
        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/',
                failureRedirect : '/'
            }));
    // google ---------------------------------
        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/',
                failureRedirect : '/'
            }));
// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================
    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
    // facebook -------------------------------
        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));
        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/',
                failureRedirect : '/'
            }));
    // twitter --------------------------------
        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/',
                failureRedirect : '/'
            }));
    // google ---------------------------------
        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));
        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/',
                failureRedirect : '/'
            }));
// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future
    // local ------------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/');
        });
    });
    // facebook --------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/');
        });
    });
    // twitter ---------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/');
        });
    });
    // google ----------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/'); 
        }); 
    });
        });
}; 
 
// route middleware to ensure user is logged in 
function isLoggedIn(req, res, next) { 
    if (req.isAuthenticated()) 
        return next(); 
 
    res.redirect('/'); 
} 

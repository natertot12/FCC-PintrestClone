module.exports = function(app, passport) {
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
    Object.size=function(obj){var size=0,key;for(key in obj){if(obj.hasOwnProperty(key))size++;}return size;};
// normal routes ===============================================================
        mongodb.connect(mongoUrl, function(err, db) {
            if(err) throw err;
    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        var address = "";
        if(req.isAuthenticated()) address = "index.html";
        else address = "secondaryIndex.html";
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
                            //res.write('<div class="grid-item"><div class="thumbnail text-center"><img src="' + doc.imgLink + '"><div class="caption"><h3>'+ doc.title +'</h3><p>'+ doc.description +'</p><p><a href="#" class="btn btn-primary" role="button">Button</a></p></div></div></div>');
                            //res.write('<div class="grid-item"><div class="thumbnail text-center"><img src="' + doc.imgLink + '"><div class="caption"><h3>'+ doc.title +'</h3><p>'+ doc.description +'</p><p><a href="#" class="btn btn-primary" role="button">Button</a></p></div></div></div>');
                            rawHtml += '<div class="grid-item"><div class="thumbnail text-center"><img src="images/1730d176a3a5dbbd00ca451a05a67f42.png"/><div class="caption"><h3>'+ doc.title +'</h3><p>'+ doc.description +'</p><p><a href="#" class="btn btn-primary" role="button">Button</a></p></div></div></div>';
                            console.log(doc.imgLink);
                            a++;
                            if(a == count) res.end("<script>$(document).ready(function() {$('#masonry').append('"+rawHtml+"');var $grid = $('.grid').masonry({itemSelector: '.grid-item',percentPosition: true,columnWidth: 50});$grid.imagesLoaded().progress( function() {$grid.masonry();});});</script>");
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
        var id = req.params.id;
        res.sendFile('../images/' + id);
    });


// posts =======================================================================
    app.post('/post', upload.single('exact'), function(req, res) {
        //res.json(req.file.path);
        var filepath = "";
        for(var a = 0; a < req.file.path.length; a++) {
            filepath += req.file.path[a];
        }
        var fileType = req.file.mimetype.split("/");
        fileType = fileType[fileType.length - 1];
        console.log(fileType);
        var goodFileTypes = ["jpeg", "png", "gif", ];
        if(goodFileTypes.indexOf(fileType) != -1) {
            console.log("The path for that new file is " + '../' + filepath);
            db.collection('mongo').insertOne({user: req.user._id, title:req.body.title, description:req.body.description, imgLink: '../' + filepath});
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
    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/');
        });
    });
    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/');
        });
    });
    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/');
        });
    });
    // google ---------------------------------
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

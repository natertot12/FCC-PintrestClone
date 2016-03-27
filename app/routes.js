module.exports = function(app, passport) {
    var multer = require("multer"),
    mongodb = require("mongodb"),
    mongoUrl = "mongodb://localhost:27017/mongo",
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
    //var sizeOf = require('image-size');
    var User = require('./models/user');
    var ObjectID=require('mongodb').ObjectID;
    var currentQuery = {};
    
//normal routes ================================================================
mongodb.connect(mongoUrl, function(err, db) {
    if(err) throw err;
    
    function loadMasonry(req, res, title, description, query) {
        currentQuery = query;
        var docs = [];
        var data = db.collection("mongo").find(query).limit(10).sort({$natural:-1});
        db.collection('mongo').find(query).limit(10).count(function(err, num) {
            if(err) throw err;
            var a = 0;
            if(num != 0) {
                data.forEach(function(doc) {
                    docs.push(doc);
                    a++;
                    if(a == num) res.render('index.ejs', {data: docs, title: title, description: description, user: req.user});
                });
            } else res.render('index.ejs', {data: docs, title: title, description: description, user: req.user});
        });
    }
    
    app.get('/', function(req, res) {
        loadMasonry(req, res, "Welcome to Pin !T", "Created By Nathan O'Neel", {});
    });
    
    app.get('/appendItems/:num', function(req, res) {
        var skipAmount = Number(req.params.num);
        var docs = [];
        var data = db.collection("mongo").find(currentQuery).skip(skipAmount).limit(10).sort({$natural:-1});
        db.collection('mongo').find(currentQuery).skip(skipAmount).limit(10).count(function(err, num) {
            if(err) throw err;
            var a = 0;
            if(num != 0) {
                data.forEach(function(doc) {
                    docs.push(doc);
                    a++;
                    if(a == num) res.render('template.ejs', {data: docs, user: req.user});
                });
            } else res.render('template.ejs', {data: docs, user: req.user});
        });
    });
    
    app.get('/post', isLoggedIn, function(req, res) {
       res.render('post.ejs');
    });
    
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
    
    app.get('/tags/images/:imageID', function(req, res) {
        var id = req.params.imageID;
        res.sendFile(path.join(__dirname + '/../images/' + id));
    });
    
    app.get('/user/:userID', function(req, res) {
       var id = req.params.userID.toString();
       if(req.isAuthenticated() && id == req.user._id.toString()) {
            res.redirect('/profile');
       } else {
        var title = "";
        User.findOne({_id: ObjectID(id)}, function(err, data) {
            if(err) throw err;
            if(data != null) {
                if(data.facebook.name) title += data.facebook.name;
                else if(data.twitter.username) title += data.twitter.displayName;
                else if(data.google.name) title += data.google.name;
                else if(data.local.username) title += "User " + data.local.username;
            }
            loadMasonry(req, res, title, data.description, {user: ObjectID(id)});
        });
       }
    });
    
    app.get('/profile', isLoggedIn, function(req, res) {
        currentQuery = {$or: [{user: ObjectID(req.user._id.toString())}, {repostedBy: { $in: [req.user._id.toString()]}}]};
        var docs = [];
        var data = db.collection("mongo").find({$or: [{user: ObjectID(req.user._id.toString())}, {repostedBy: { $in: [req.user._id.toString()]}}]}).limit(10).sort({$natural:-1});
        db.collection('mongo').find({$or: [{user: ObjectID(req.user._id.toString())}, {repostedBy: { $in: [req.user._id.toString()]}}]}).limit(10).count(function(err, num) {
            if(err) throw err;
            var a = 0;
            if(num != 0) {
                data.forEach(function(doc) {
                    docs.push(doc);
                    a++;
                    if(a == num) res.render('profile.ejs', {data: docs, user: req.user});
                });
            } else res.render('profile.ejs', {data: docs, user: req.user});
        });
    });
    
    app.get('/update', function(req, res) {
       res.render('update'); 
    });
    
    app.get('/tags/:tag', function(req, res) {
        var id = '#'+ req.params.tag;
        loadMasonry(req, res, id, undefined, {tags: {$in: [id]}});
    });

// posts =======================================================================
    app.post('/post', upload.single('exact'), function(req, res) {
        var name = "";
        var tags = [];
        var tagField = req.body.tags.split(' ');
        tagField.forEach(function(el, index) {
            if(el.charAt(0) == "#") tags.push(el.toLowerCase());
        });
        
        if(req.user.facebook.name != undefined) { name=req.user.facebook.name;
        } else if(req.user.twitter.username != undefined) { name=req.user.twitter.username;
        } else if(req.user.google.name != undefined) { name=req.user.google.name;
        } else { name = req.user.local.username;}
        function add(imgLink) {
            db.collection('mongo').insertOne({username: name, user: req.user._id, title:req.body.title, description:req.body.description, tags: tags, repostedBy: [], reportedBy: [], likes: [], imgLink: imgLink});
        }
        if(req.file) {
            var filepath = "";
            for(var a = 0; a < req.file.path.length; a++) {
                filepath += req.file.path[a];
            }
            var fileType = req.file.mimetype.split("/");
            fileType = fileType[fileType.length - 1];
            var goodFileTypes = ["jpeg", "png", "gif", ];
            if(goodFileTypes.indexOf(fileType) != -1) {
                /*                                                              double check file height/width
                console.log(sizeOf(filepath).width + ' ' + sizeOf(filepath).height);
                if(sizeOf(filepath).width < 300 || sizeOf(filepath).height < 300) {
                    console.log("File too small");
                } else if(sizeOf(filepath).width > 1000 || sizeOf(filepath).height > 1000) {
                    console.log("File too Big");
                } else {
                    add(filepath);
                }*/
                add(filepath);
            }
        } else {
            if(req.body.link === '') add('images/no_image.svg');
            else add(req.body.link);
        }
        res.redirect('/');
    });
    
    app.post('/search', function(req, res) {
       var id = req.body.search;
       var regex = new RegExp(".*" + id + ".*", "gi");
       loadMasonry(req, res, "Search Results For " + id, "", {$or: [{tags: {$in: [id]}}, {title: regex}, {description: regex}, {username: regex}   ]});
    });

    app.post('/delete/:id', isLoggedIn, function(req, res) {
        var id = req.params.id.toString();
        db.collection('mongo').remove({_id: ObjectID(id), user: req.user._id});
        res.redirect('/profile');
    });

    app.post('/like/:id', isLoggedIn, function(req, res) {
        var id = req.params.id;
        db.collection('mongo').update({_id: ObjectID(id), likes: {$nin: [req.user._id.toString()]}}, { $push: {likes: req.user._id.toString() }  });
        res.redirect('back');
    });

    app.post('/unlike/:id', isLoggedIn, function(req, res) {
        var id = req.params.id;
        db.collection('mongo').update({_id: ObjectID(id), likes: { $in: [req.user._id.toString()]}}, { $pull: {likes: req.user._id.toString() }  });
        res.redirect('back');
    });
    
    app.post('/republish/:id', isLoggedIn, function(req, res) {
        var id = req.params.id;
        db.collection('mongo').update({_id: ObjectID(id), repostedBy: {$nin: [req.user._id.toString()]}}, { $push: {repostedBy: req.user._id.toString() }  });
        res.redirect('back');
    });

    app.post('/unrepublish/:id', isLoggedIn, function(req, res) {
        var id = req.params.id;
        db.collection('mongo').update({_id: ObjectID(id), repostedBy: { $in: [req.user._id.toString()]}}, { $pull: {repostedBy: req.user._id.toString() }  });
        res.redirect('back');
    });
    
    app.post('/report/:id', isLoggedIn, function(req, res) {
       var id = req.params.id;
       db.collection('mongo').update({_id: ObjectID(id), reportedBy: {$nin: [req.user._id.toString()]}}, { $push: {reportedBy: req.user._id.toString() }  });
       db.collection('mongo').findOne({_id: ObjectID(id)}, function(err, data) {
           if(err) throw err;
           if(data.reportedBy.length >= 10) {
               db.collection('mongo').remove({_id: ObjectID(id)});
           }
       });
       res.redirect('back');
    });
    
    app.post('/update', isLoggedIn, function(req, res) {
        var user = req.user;
        user.local.username = req.body.username;
        user.description    = req.body.description;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/profile');
        });
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
            successRedirect : '/profile', // redirect to the secure profile section
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
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
    // facebook -------------------------------
        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));
    // twitter --------------------------------
        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));
        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));
    // google ---------------------------------
        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/profile',
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
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
    // facebook -------------------------------
        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));
        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));
    // twitter --------------------------------
        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));
    // google ---------------------------------
        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));
        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
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
        user.local.username = undefined;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/profile');
        });
    });
    // facebook --------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/profile');
        });
    });
    // twitter ---------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/profile');
        });
    });
    // google ----------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            if(err) throw err;
            res.redirect('/profile'); 
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

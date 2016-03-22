module.exports = function(app, passport) {
    
    //add a way to change username like book
    
    //fix /user/ /profile/ trying to get things like /user/css/main.css to just /css/main.css
    //add a way to republish things                                             add showing your republishes like you posted it.
    //add a way to follow people and look at your subscriptions
        //add a way to view your subscribers and subscriptions
    //add titles to all pages fix it in you mainPage()
    //change the way it loads the masonry objects and add animations.
        //get rid of margin on the sides of current to make it full screen masonry
    //configure twitter facebook google plus.
        //add link local fb google twitter to profile page
        //add fb google twitter to secondaryIndex navbar
    
    
    
    //future css
    
    //add more color.
    
    
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
            
    
    /*function mainPage(res, req, loggedIn, profile, profileID, tag, tagID, user, userID, skipAmount) {
        var address = "secondaryIndex.html";
        var query = {};
        var ObjectID=require('mongodb').ObjectID;
        
        if(loggedIn) address = "index.html";
        
        if(profile) query = {user: ObjectID(profileID)};
        else if(tag) query = {tags: {$in: [tagID]}};
        else if(user) query = {user: ObjectID(userID)};
        
        fs.readFile((path.join(__dirname + '/../views/' + address)), function(err, result) {
            if (err) throw err;
            res.write(result);
            *
            var count = 0;
            db.collection("mongo").find(query).limit(10).count(function(err, c) {
                if(err) throw err;
                count = c;
            });*
            
            db.collection("mongo").find(query).count({}, function (error, count) {
            //var collection = db.collection("mongo").find(query).limit(10);
                if(error) throw error;
            //collection.forEach(function(data) {
                //console.log(data);
                if(count != 0) {
                    db.collection("mongo").find(query, function(err, data) {
                   if(err) throw err;
                       var a = 0;
                       var rawHtml = "";
                       data.forEach(function(doc) {
                            var tags = "";
                            var like = "";
                            var repost = "";
                            var report = "";
                            if(loggedIn) {
                                if(doc.repostedBy.indexOf(req.user._id.toString()) == -1) repost = '<div class="repost"><form action="/republish/'+ doc._id +'" method="post" class="repost"><button type="Submit" class="btn btn-success" id="repostButton"><span class="glyphicon glyphicon-refresh"></span> Repost</button></form><p>'+ doc.repostedBy.length +' Reposts</p></div>';
                                else repost = '<div class="repost"><form action="/unrepublish/'+ doc._id +'" method="post" class="repost"><button type="Submit" class="btn btn-warning" id="repostButton"><span class="glyphicon glyphicon-refresh"></span> UnRepost</button></form><p>'+ doc.repostedBy.length +' Reposts</p></div>';
                                //if(doc.likes.indexOf(req.user._id.toString())  == -1) like = '<div><div class="row"><div class="like"><form action="/like/'+ doc._id +'" method="post" class="like"><button type="Submit" class="btn btn-primary" id="like"><span class="glyphicon glyphicon-thumbs-up"></span> Like</button></form><p>'+ doc.likes.length +' Likes</p></div><div class="repost"><form action="/republish/'+ doc._id +'" method="post" class="repost"><button type="Submit" class="btn btn-success" id="repostButton"><span class="glyphicon glyphicon-refresh"></span> Repost</button></form><p>'+ doc.repostedBy.length +' Reposts</p></div></div></div>';
                                //else like = '<div><div class="row"><div class="like"><form action="/unlike/'+ doc._id +'" method="post" class="like"><button type="Submit" class="btn btn-warning" id="like"><span class="glyphicon glyphicon-thumbs-down"></span> UnLike</button></form><p>'+ doc.likes.length +' Likes</p></div><div class="repost"><form action="/republish/'+ doc._id +'" method="post" class="repost"><button type="Submit" class="btn btn-success" id="repostButton"><span class="glyphicon glyphicon-refresh"></span> Repost</button></form><p>'+ doc.repostedBy.length +' Reposts</p></div></div></div>';
                                if(doc.likes.indexOf(req.user._id.toString())  == -1) like = '<div><div class="row"><div class="like"><form action="/like/'+ doc._id +'" method="post" class="like"><button type="Submit" class="btn btn-primary" id="like"><span class="glyphicon glyphicon-thumbs-up"></span> Like</button></form><p>'+ doc.likes.length +' Likes</p></div>'+ repost +'</div></div>';
                                else like = '<div><div class="row"><div class="like"><form action="/unlike/'+ doc._id +'" method="post" class="like"><button type="Submit" class="btn btn-warning" id="like"><span class="glyphicon glyphicon-thumbs-down"></span> UnLike</button></form><p>'+ doc.likes.length +' Likes</p></div>'+ repost +'</div></div>';
                                report = '<form action="/report/'+ doc._id +'" method="post" id="report"><button class="btn btn-sm btn-danger" type="Submit" id="reportButton"><span class="glyphicon glyphicon-bell" id="reportBell"></span> REPORT</button></form>';
                            }
                            doc.tags.forEach(function(el, index) {
                                tags += '<a id="tag" href="/tags/' + el.substr(1) + '">' + el + '</a> ';
                            });
                            if(!profile) rawHtml += '<div class="grid-item"><div class="thumbnail text-center"><img src="'+doc.imgLink+'"/><div class="caption"><h3>'+ doc.title +'</h3><p>'+ doc.description +'</p>'+like+'<div><p>Tags: '+ tags +'</p><p>Posted by <a href="/user/'+doc.user+'">'+ doc.username +'</a></p>'+ report +'</div></div></div></div>';
                            else rawHtml += '<div class="grid-item"><div class="thumbnail text-center"><img src="'+doc.imgLink+'" onerror="imgError(this);"/><div class="caption"><h3>'+ doc.title +'</h3><p>'+ doc.description +'</p><form action="/delete/'+doc._id+'" method="post"><input type="Submit" class="btn btn-danger" id="delete" value="Delete Pin"></form><br>'+like+'<p>'+doc.likes.length+' Likes</p><p>Created By: You</p>'+ tags +'</div></div></div>';
                            a++;
                            if(a == count) res.end("<script>$(document).ready(function() {var $mason=$('#masonry');$mason.hide();$mason.append('"+rawHtml+"');var $grid = $('.grid').masonry({itemSelector: '.grid-item',percentPosition: true,columnWidth: 50});$grid.imagesLoaded().progress( function() {$grid.masonry();$mason.show();});});</script>");
                        });
                    });
                } else res.end();
            });
        });
        
    }*/
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    function loadMasonry(req, res, type, id) {
        var query = {};
        var ObjectID=require('mongodb').ObjectID;
        var title = "Welcome to Pin !T";
        
        if(type == 'tag') {
            query = {tags: {$in: [id]}};
            title = "Tag " + id;
        } else if(type == 'user') {
            query = {user: ObjectID(id)};
            title = "User ";
            
            User.findOne({_id: ObjectID(id)}, function(err, data) {
                if(err) throw err;
                if(data != null) {
                    if(data.local.username) {
                        title += data.local.username;
                    } else if(data.facebook.name) {
                        title += data.facebook.name;
                    } else if(data.twitter.username) {
                        title += data.twitter.username;
                    } else if(data.google.name) {
                        title += data.google.name;
                    }
                }
            });
        }
        
        
        var docs = [];
        //db.collection("mongo").find(query, function(err, data) {
        var data = db.collection("mongo").find(query).limit(10);
        db.collection('mongo').find(query).limit(10).count(function(err, num) {
            if(err) throw err;
            var a = 0; 
            data.forEach(function(doc) {
                docs.push(doc);
                a++;
                if(a == num) {
                    //console.log(docs);
                    if(req.isAuthenticated()) {
                        res.render('index.ejs', {data: docs, title: title, user: req.user});
                    } else {
                        res.render('index2.ejs', {data: docs, title: title});
                    }
                }
            });
        });
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    app.get('/', function(req, res) {
        /*
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
                            var tags = "";
                            var like = "";
                            if(req.isAuthenticated()) {
                                if(doc.likes.indexOf(req.user._id.toString())  == -1) like = '<form action="/like/'+ doc._id +'" method="post"><button type="Submit" class="btn btn-primary"><span class="glyphicon glyphicon-thumbs-up"></span> Like</button></form>';
                                else like = '<form action="/unlike/'+ doc._id +'" method="post"><button type="Submit" class="btn btn-warning"><span class="glyphicon glyphicon-thumbs-down"></span> UnLike</button></form>';
                            }
                            
                            doc.tags.forEach(function(el, index) {
                                tags += '<a id="tag" href="/tags/' + el.substr(1) + '">' + el + '</a> ';
                            });
                            rawHtml += '<div class="grid-item"><div class="thumbnail text-center"><img src="'+doc.imgLink+'"/><div class="caption"><h3>'+ doc.title +'</h3><p>'+ doc.description +'</p>'+like+'<p>'+doc.likes.length+' Likes</p><p>Created By: <a href="/user/'+doc.user+'">'+doc.username+'</a></p>'+ tags +'</div></div></div>';
                            //console.log(doc.imgLink);
                            a++;
                            if(a == count) res.end("<script>$(document).ready(function() {var $mason=$('#masonry');$mason.hide();$mason.append('"+rawHtml+"');var $grid = $('.grid').masonry({itemSelector: '.grid-item',percentPosition: true,columnWidth: 50});$grid.imagesLoaded().progress( function() {$grid.masonry();$mason.show();});});</script>");
                        });
                    });
                } else res.end();
            });
        });
        */
        //mainPage(res, req, req.isAuthenticated(), false, "", false, "", false, "");
        //res.redirect('/0');
        loadMasonry(req, res, "", "");
    });
    /*
    app.get('/:num', function(req, res) {
       var num = req.params.num || 0;
       mainPage(res, req, req.isAuthenticated(), false, "", false, "", false, "");
    });*/
    
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
       var id = req.params.userID.toString();
       if(req.isAuthenticated() && id == req.user._id.toString()) {
            res.redirect('/profile');
       } else loadMasonry(req, res, 'user', id);           //(res, req, req.isAuthenticated(), false, "", false, "", true, id);
       /*
       console.log(id);
       var address = "secondaryIndex.html";
        if(req.isAuthenticated()) address = "index.html";
        fs.readFile((path.join(__dirname + '/../views/' + address)), function(err, result) {
            var rawHtml = "";
            if (err) throw err;
            res.write(result);
            db.collection("mongo").find({user: ObjectID(id)}).count({}, function (error, count) {
                if(error) throw error;
                if(count != 0) {
                    db.collection("mongo").find({user: ObjectID(id)}, function(err, data) {
                   if(err) throw err;
                       var a = 0;
                       data.forEach(function(doc) {
                            var tags = "";
                            doc.tags.forEach(function(el, index) {
                                tags += '<a id="tag" href="/tags/' + el.substr(1) + '">' + el + '</a> ';
                            });
                            rawHtml += '<div class="grid-item"><div class="thumbnail text-center"><img src="'+doc.imgLink+'"/><div class="caption"><h3>'+ doc.title +'</h3><p>'+ doc.description +'</p><p><a href="#" class="btn btn-primary" role="button">Like</a></p><p>Created By: <a href="/user/'+doc.user+'">'+doc.username+'</a></p>'+ tags +'</div></div></div>';
                            a++;
                            if(a == count) res.end("<script>$(document).ready(function() {var $mason=$('#masonry');$mason.hide();$mason.append('"+rawHtml+"');var $grid = $('.grid').masonry({itemSelector: '.grid-item',percentPosition: true,columnWidth: 50});$grid.imagesLoaded().progress( function() {$grid.masonry();$mason.show();});});</script>");
                        });
                    });
                } else res.end();
            });
        });
        */
    });
    
    app.get('/profile', isLoggedIn, function(req, res) {
        var id = req.user._id.toString();
        /*
        fs.readFile((path.join(__dirname + '/../views/' + 'index.html')), function(err, result) {
            var rawHtml = "";
            if (err) throw err;
            res.write(result);
            db.collection("mongo").find({user: ObjectID(id)}).count({}, function (error, count) {
                if(error) throw error;
                if(count != 0) {
                    db.collection("mongo").find({user: ObjectID(id)}, function(err, data) {
                   if(err) throw err;
                       var a = 0;
                       data.forEach(function(doc) {
                            rawHtml += '<div class="grid-item"><div class="thumbnail text-center"><img src="'+doc.imgLink+'"/><div class="caption"><h3>'+ doc.title +'</h3><p>'+ doc.description +'</p><form action="/delete/'+doc._id+'" method="post"><input type="Submit" class="btn btn-danger" id="delete" value="Delete Pin"></form><p>Created By: <a href="/profile">You</a></p></div></div></div>';
                            a++;
                            if(a == count) res.end("<script>$(document).ready(function() {var $mason=$('#masonry');$mason.hide();$mason.append('"+rawHtml+"');var $grid = $('.grid').masonry({itemSelector: '.grid-item',percentPosition: true,columnWidth: 50});$grid.imagesLoaded().progress( function() {$grid.masonry();$mason.show();});});</script>");
                        });
                    });
                } else res.end();
            });
        });
        */
        //mainPage(res, req, req.isAuthenticated(), true, id, false, "", false, "");
        
        //res.render('profile.ejs', {user: req.user});
        
        
        
        
        var ObjectID=require('mongodb').ObjectID;
        var docs = [];
        var data = db.collection("mongo").find({user: ObjectID(req.user._id.toString())}).limit(10);
        db.collection('mongo').find({user: ObjectID(req.user._id.toString())}).limit(10).count(function(err, num) {
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
    
    app.get('/tags/:tag', function(req, res) {
        var id = '#'+req.params.tag;
        /*
       console.log(id);
       var address = "secondaryIndex.html";
        if(req.isAuthenticated()) address = "index.html";
        fs.readFile((path.join(__dirname + '/../views/' + address)), function(err, result) {
            var rawHtml = "";
            if (err) throw err;
            res.write(result);
            db.collection("mongo").find({tags: {$in: [id]}}).count({}, function (error, count) {
                if(error) throw error;
                if(count != 0) {
                    db.collection("mongo").find({tags: {$in: [id]}}, function(err, data) {
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
        */
        //mainPage(res, req, req.isAuthenticated(), false, "", true, id, false, "");
        loadMasonry(req, res, 'tag', id);
    });

// posts =======================================================================
    app.post('/post', upload.single('exact'), function(req, res) {
        //res.json(req.file.path);
        var name = "";
        var tags = [];
        var tagField = req.body.tags.split(' ');
        tagField.forEach(function(el, index) {
            if(el.charAt(0) == "#") tags.push(el);
        });
        
        if(req.user.facebook.name != undefined) { name=req.user.facebook.name;
        } else if(req.user.twitter.username != undefined) { name=req.user.twitter.username;
        } else if(req.user.google.name != undefined) { name=req.user.google.name;
        } else { name = req.user.local.username;}
        console.log(name);
        
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
            console.log(fileType);
            var goodFileTypes = ["jpeg", "png", "gif", ];
            if(goodFileTypes.indexOf(fileType) != -1) {
                console.log("The path for that new file is " +  filepath);
                //db.collection('mongo').insertOne({username: name, user: req.user._id, title:req.body.title, description:req.body.description, imgLink: filepath});
                add(filepath);
            }
        } else {
            if(req.body.link === '') add('images/no_image.svg');
            else add(req.body.link);
        }
        res.redirect('/');
    });


    app.post('/delete/:id', isLoggedIn, function(req, res) {
        var ObjectID=require('mongodb').ObjectID;
        var id = req.params.id.toString();
        db.collection('mongo').remove({_id: ObjectID(id), user: req.user._id});
        res.redirect('/profile');
    });

    app.post('/like/:id', isLoggedIn, function(req, res) {
        var id = req.params.id;
        var ObjectID=require('mongodb').ObjectID;
        db.collection('mongo').update({_id: ObjectID(id), likes: {$nin: [req.user._id.toString()]}}, { $push: {likes: req.user._id.toString() }  });
        res.redirect('back');
    });

    app.post('/unlike/:id', isLoggedIn, function(req, res) {
        var id = req.params.id;
        var ObjectID=require('mongodb').ObjectID;
        db.collection('mongo').update({_id: ObjectID(id), likes: { $in: [req.user._id.toString()]}}, { $pull: {likes: req.user._id.toString() }  });
        res.redirect('back');
    });
    
    app.post('/republish/:id', isLoggedIn, function(req, res) {
        var id = req.params.id;
        var ObjectID=require('mongodb').ObjectID;
        //User.findOneAndUpdate({_id: ObjectID(req.user._id), reposts: {$nin: [req.user._id.toString()]}}, {$push: {reposts: id.toString()}});
        db.collection('mongo').update({_id: ObjectID(id), repostedBy: {$nin: [req.user._id.toString()]}}, { $push: {repostedBy: req.user._id.toString() }  });
        res.redirect('back');
    });

    app.post('/unrepublish/:id', isLoggedIn, function(req, res) {
        var id = req.params.id;
        var ObjectID=require('mongodb').ObjectID;
        //User.findOneAndUpdate({_id: ObjectID(req.user._id), reposts: { $in: [req.user._id.toString()]}}, {$push: {reposts: id.toString()}});
        db.collection('mongo').update({_id: ObjectID(id), repostedBy: { $in: [req.user._id.toString()]}}, { $pull: {repostedBy: req.user._id.toString() }  });
        res.redirect('back');
    });
    
    app.post('/report/:id', isLoggedIn, function(req, res) {
       var id = req.params.id;
       var ObjectID=require('mongodb').ObjectID;
       db.collection('mongo').update({_id: ObjectID(id), reportedBy: {$nin: [req.user._id.toString()]}}, { $push: {reportedBy: req.user._id.toString() }  });
       db.collection('mongo').findOne({_id: ObjectID(id)}, function(err, data) {
           if(err) throw err;
           if(data.reportedBy.length >= 10) {
               db.collection('mongo').remove({_id: ObjectID(id)});
           }
       });
       res.redirect('back');
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

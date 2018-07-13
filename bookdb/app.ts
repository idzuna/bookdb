import debug = require('debug');
import express = require('express');
import bodyParser = require('body-parser');
import path = require('path');
import passport = require('passport');
import twitter = require('passport-twitter');
import session = require('express-session');
import sqlite3 = require('sqlite3');
import cookieParser = require('cookie-parser');

import config from './config';
import secrets from './secrets';
import api from './routes/api';
import * as bookdb from './bookdb';
import * as userdb from './userdb';
import * as promised from './promised';


var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(cookieParser());


if (config.multiUserMode) {

    let users = new userdb.UserDB(path.join(__dirname, 'users.sqlite'));
    users.initializeTables();

    passport.use(new twitter.Strategy(<any>secrets.twitter, function (token, tokenSecret, profile, done) {
        let user = new userdb.User();
        user.id = profile.provider + profile.id;
        user.display_name = profile.displayName;
        done(null, user);
    }));

    passport.serializeUser<userdb.User, string>(function (user, done) {
        users.set(user);
        done(null, user['id']);
    });

    passport.deserializeUser<userdb.User, string>(async function (id, done) {
        try {
            let user = await users.get(id);
            if (user) {
                done(null, user);
            } else {
                done('unknown user');
            }
        } catch (e) {
            done(e, null);
        }
    });

    app.use(session({
        secret: secrets.session.secret,
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/login',
        failureRedirect: '/login'
    }));

    app.get('/login', function (req, res) {
        res.cookie('bookdbsession', '' + Math.random());
        res.redirect('/');
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.cookie('bookdbsession', '' + Math.random());
        res.redirect('/');
    });
}


app.get('/', function (req, res) {
    res.status(200).render('index', {
        'config': config,
        'user': req.user
    });
});

app.get('/edit', function (req, res) {
    if (config.multiUserMode && !req.user) {
        res.redirect('/');
        return;
    }
    res.cookie('bookdbsession', '' + Math.random());
    res.status(200).render('edit', {
        'config': config,
        'user': req.user
    });
});

app.get('/manage', function (req, res) {
    if (config.multiUserMode && !req.user) {
        res.redirect('/');
        return;
    }
    res.cookie('bookdbsession', '' + Math.random());
    res.status(200).render('manage', {
        'config': config,
        'user': req.user
    });
});


app.use('/api', api);



// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err: any, req, res, next) => {
        res.status(err['status'] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err: any, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});

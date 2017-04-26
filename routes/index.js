var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    // Searches collection for unique items.
    req.db.collection('flowers').distinct('color', function(err, colorDocs){
        if (err) {
            return next(err)
        }
        // Checks if item's color matches the filter option.
        if (req.query.color_filter) {
            req.db.collection('flowers').find({"color":req.query.color_filter}).toArray(function (err, docs) {
                if (err) {
                    return next(err);
                }
                return res.render('all_flowers', {'flowers': docs, 'colors': colorDocs, 'color_filter': req.query.color_filter});
            });
        } else {
            req.db.collection('flowers').find().toArray(function (err, docs) {
                if (err) {
                    return next(err);
                }
                return res.render('all_flowers', {'flowers': docs, 'colors': colorDocs});
            });
        }
    });
});

// Route for individual flower's page.
router.get('/details/:flower', function(req, res, next){
    req.db.collection('flowers').findOne({'name' : req.params.flower}, function(err, doc) {
        if (err) {
            return next(err);  // 500 error
        }
        if (!doc) {
            return next();  // Creates a 404 error
        }
        return res.render('flower_details', { 'flower' : doc });
    });
});

// Action for adding new flower to database.
router.post('/addFlower', function(req, res, next) {
    // Searches database for the entered flower name while ignoring the character case.
    req.db.collection('flowers').findOne({'name' : { $regex : new RegExp(req.body.name, "i")}}, function (err, doc) {
        if (doc) {
            return res.send("A flower of that variety already exists.")
        }
        // Adds flower to database.
        req.db.collection('flowers').insertOne(req.body, function (err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/');
        })
    });
});

// Action to change color value in database.
router.put('/updateColor', function(req, res, next) {
    var filter = { 'name' : req.body.name };
    var update = { $set : { 'color' : req.body.color }};
    req.db.collection('flowers').findOneAndUpdate(filter, update, function(err) {
        if (err) {
            return next(err);
        }
        return res.send({'color' : req.body.color})
    })
});

// Action to delete flower from database.
router.post('/deleteFlower', function(req, res, next) {
    req.db.collection('flowers').deleteOne(req.body, function(err) {
        if (err) {
            return next(err);
        }
        // Sends back to home page.
        return res.redirect('/');
    })
});

module.exports = router;


// help with case insensitive search:
//     http://stackoverflow.com/questions/7101703/how-do-i-make-case-insensitive-queries-on-mongodb
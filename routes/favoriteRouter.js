const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favRouter = express.Router();
favRouter.use(bodyParser.json());

favRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.find({user: req.user.id})
      .populate('user')
      .populate('dishes')
      .then( (favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
      },     (err) => next(err))
      .catch( (err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    // check if you have the favorites for that user 
    Favorites.findOne({user: req.user.id})
      .populate('user')
      .then( (favorites) => {
         if (favorites != null) {
           //update existing one

           // loop for dishes ID and add them to array
           for(var i = (req.body.length -1); i >= 0; i--) {
             // add only if dish not as fav already
             // in case in post method we have duplicates
             if (favorites.dishes.indexOf(req.body[i].id) == -1) {
               favorites.dishes.push(req.body[i].id);
             }
           }
           favorites.save()
             .then( (favorites) => {
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json(favorites);
             },     (err) => next(err))
           .catch( (err) => next(err));
         } else {
           //add new favorites if empty

           fav = new Favorites({user: req.user._id});
           // loop for dishes ID and add them to array
           for(var i = (req.body.length -1); i >= 0; i--) {
             // add only if dish not as fav already
             // in case in post method we have duplicates
             if (fav.dishes.indexOf(req.body[i].id) == -1) {
               fav.dishes.push(req.body[i].id);
             }
           }
           fav.save()
             .then( (favorites) => {
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json(favorites);
             },     (err) => next(err))
             .catch( (err) => next(err));
         }

      },     (err) => next(err))
      .catch( (err) => next(err));
  })
  .put((req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOneAndRemove({user: req.user.id})
      .then( (favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
      },     (err) => next(err))
      .catch( (err) => next(err));
  });


favRouter.route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
      if (!favorites) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.json({"exists": false, "favorites": favorites });
      }
      else {
        if (favorites.dishes.indexOf(req.params.dishId) < 0) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.json({"exists": false, "favorites": favorites });   
        }
        else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.json({"exists": true, "favorites": favorites });
        }
      }
    }, (err) => next(err))
    .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    
    // check if you have the favorites for that user 
    Favorites.findOne({user: req.user.id})
      .populate('user')
      .then( (favorites) => {

         if (favorites != null) {
           //update existing one

           if (favorites.dishes.indexOf(req.params.dishId) === -1) {
             // dish not in favs
             favorites.dishes.push(req.params.dishId);
             favorites.save()
               .then( (favorites) => {
                 res.statusCode = 200;
                 res.setHeader('Content-Type', 'application/json');
                 res.json(favorites);
               },     (err) => next(err))
             .catch( (err) => next(err));
           } else {
             // dish in favs already
             err = new Error('Dish already added as a favorite.');
             err.status = 404;
             return next(err);
           }
         } else {
           //add new favorites if empty

           fav = new Favorites({user: req.user._id});
           fav.dishes.push(req.params.dishId);
           fav.save()
             .then( (favorites) => {
               res.statusCode = 200;
               res.setHeader('Content-Type', 'application/json');
               res.json(favorites);
             },     (err) => next(err))
             .catch( (err) => next(err));
         }

      },     (err) => next(err))
      .catch( (err) => next(err));
  })
  .put((req,res,next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user.id})
      .then( (favorite) => {

        //check if the dish is in favorites
        var index = favorite.dishes.indexOf(req.params.dishId) 
        if (index >= 0) {
          favorite.dishes.splice(index, 1);
          favorite.save()
          .then((favorite) => {
            Favorites.findById(favorite._id)
            .populate('user')
            .populate('dishes')
            .then((favorite) => {
              console.log('Favorite Dish Deleted', favorite);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            })
          })
          .catch((err) => {
            return next(err);
          }) 

        } else {
           err = new Error('Dish not marked as favorite');
           err.status = 404;
           return next(err);
        }

      }, (err) => next(err))
      .catch( (err) => next(err));
  });


module.exports = favRouter;

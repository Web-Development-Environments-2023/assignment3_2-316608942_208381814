var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.username) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.username === req.session.username)) {
        req.username = req.session.username;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

/**
* This path returns the last watched recipes by the current user that logged-in.
*/
router.get("/lastWatches", async (req, res, next) => {
 try {
   const username = req.session.username;
   const recipes_id = await user_utils.getLastWatches(username);
   let recipes_id_array = [];
   recipes_id.map((element) => recipes_id_array.push(element.recipeId)); //extracting the recipe ids into array
   const results = await recipe_utils.extractRecipesPreview(username,recipes_id_array);
   res.status(200).send(results);
 } catch (error) {
   next(error);
 }
});

router.get('/myRecipes', async(req,res,next) => {
  try{
    const username = req.session.username;
    const recipes = await user_utils.getMyRecipes(username);
    const results = await recipe_utils.getRecipesPreview(username,recipes);
    res.send(results);
  } catch(error){
    next(error);
  }
});




module.exports = router;

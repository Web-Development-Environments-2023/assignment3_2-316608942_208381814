var express = require("express");
var router = express.Router();
const DButils = require("../routes/utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");
const { Console } = require("console");

/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const username = await user_utils.extractUserId(req);
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(username,recipe_id);
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
    const username = await user_utils.extractUserId(req);
    const recipes_id = await user_utils.getFavoriteRecipes(username);
    let recipes_id_array = [];
    await recipes_id.map((element) => recipes_id_array.push(element.recipeId)); //extracting the recipe into array
    const results = await recipe_utils.getRecipesPreview(username,recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

/**
* This path returns the last watched recipes by the current user that logged-in.
*/
router.get('/getlastWatches', async (req, res, next) => {
 try {
  const username = await user_utils.extractUserId(req);
   const recipes_id = await user_utils.getLastWatches(username);
   const results = await recipe_utils.getRecipesPreview(username,recipes_id);
   res.status(200).send(results);
 } catch (error) {
   next(error);
 }
});

router.get('/myRecipes', async(req,res,next) => {
  try{
    const username = await user_utils.extractUserId(req);
    const recipes = await user_utils.getMyRecipes(username);
    const results = await recipe_utils.getRecipesPreview(username,recipes);
    res.send(results);
  } catch(error){
    next(error);
  }
});

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get("/family", async (req, res, next) => {
  try {
    const username = await user_utils.extractUserId(req);
    const recipes = await user_utils.getFamilyRecipes(username);
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});



module.exports = router;

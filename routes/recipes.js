var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");

router.get("/", (req, res) => res.send("im here"));

/**
 * Get 3 random recipes
 */
router.get("/random", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes = await recipes_utils.getRandomRecipes(user_id);
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/getRecipeFullDetails/:recipeId", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe = await recipes_utils.getRecipeFullDetails(req.params.recipeId,user_id);
    await user_utils.insertWatched(user_id,req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns a recipe by user search
 */
router.get("/searchRecipe", async(req,res,next)=>{
  try{
    const user_id= req.session.user_id;
    const recipes = await recipes_utils.searchrecipe(user_id,req.query);
    res.send(recipes);
  }
  catch(error){
    next(error);
  }
});

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.post('/createRecipe', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe = req.body;
    await recipes_utils.insertRecipe(user_id,recipe);
    res.status(200).send("The recipe was successfully added to the site!");
  } catch(error){
    next(error); 
  }
});

/**
 * This path returns a preview details of a recipe by its id
 */

router.get("/:recipeId", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    await user_utils.insertWatched(user_id, req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


module.exports = router;

var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const user_utils = require("./utils/user_utils");
const { Console } = require("console");

router.get("/", (req, res) => res.send("im here"));

/**
 * Get 3 random recipes
 */
router.get("/random", async (req, res, next) => {
  try {
    // console.log(req.headers.cookie);
    const username = await user_utils.extractUserId(req);
    // console.log(user_id);
    //const username = req.session.username;
    //console.log(req);
    //const user_id = req.headers["x-localstorage-data"];
    const recipes = await recipes_utils.getRandomRecipes(username);
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
    // const username = req.session.username;
    const username = await user_utils.extractUserId(req);
    const recipe = await recipes_utils.getRecipeFullDetails(username,req.params.recipeId);
    await user_utils.insertWatched(req.params.recipeId);
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
    // const username= req.session.username;
    const username = await user_utils.extractUserId(req);
    const recipes = await recipes_utils.searchrecipe(username,req.query);
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
    // const username = req.session.username;
    const username = await user_utils.extractUserId(req);
    const recipe = req.body;
    await recipes_utils.insertRecipe(username,recipe);
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
    // const username = req.session.username;
    const username = await user_utils.extractUserId(req);
    const recipe = await recipes_utils.getRecipeFullDetails(username,req.params.recipeId);
    await user_utils.insertWatched(username, req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


module.exports = router;

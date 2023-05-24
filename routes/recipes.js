var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a preview details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * Get 3 random recipes
 */
router.get("/getRandomRecipes", async (req, res, next) => {
  try {
    const username = req.session.username;
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
    const recipe = await recipes_utils.getRecipeFullDetails(req.params.recipeId);
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
    const username= req.session.username;
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
router.get('/createRecipe', async (req,res,next) => {
  try{
    const username = req.session.username;
    const recipe_id = req.session.recipe_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});


module.exports = router;

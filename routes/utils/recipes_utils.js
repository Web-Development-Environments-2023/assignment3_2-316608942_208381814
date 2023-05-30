const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const user_utils = require("./user_utils");
const DButils = require("../utils/DButils");


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformationAPI(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

async function getRecipeDetails(recipe_id,user_id) {
    let isWatched = user_id? await user_utils.isWatched(user_id, recipe_id): false;
    let isFavorite = user_id? await user_utils.isFavorite(user_id, recipe_id): false;

    let personalRecipeFound = user_id? await checkPersonalRecipe(user_id, recipe_id): false; // checks if the user has the specific recipe id
    if (personalRecipeFound) {
      let recipe = await getRecipeInformationDB(recipe_id); // create the recipe
      recipe.isWatched = isWatched;
      recipe.isFavorite = isFavorite;
      return recipe;
    }
    let recipe_info = await getRecipeInformationAPI(recipe_id);
  
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;
    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        isWatched: isWatched,
        isFavorite:isFavorite,
        
    };
}

async function getRandomRecipesAPI() {
    return await axios.get(`${api_domain}/random`, {
      params: {
        number: 3,
        apiKey: process.env.spooncular_apiKey,
      },
    });
  }
  
  async function getRandomRecipes(user_id) {
    let recipes_info = await getRandomRecipesAPI();
    let recipes = [];
    for (let i = 0; i < recipes_info.data.recipes.length; i++) {
      recipes.push(getRecipeDetails(recipes_info[i],user_id));
    }
    return recipes;
  }
///לחזור איך מוסיפים הוראות הכנה
  async function searchRecipeAPI(query) {
    query["apiKey"] = process.env.spooncular_apiKey;
    query["query"] ? null : (query["query"] = null);
    query["number"] ? null : (query["number"] = 5);
    query["cuisine"] ? null : (query["cuisine"] = null);
    query["diet"] ? null : (query["diet"] = null);
    query["intolerance"] ? null : (query["intolerance"] = null);
    // query["instructionsRequired"] = true;
    // query["addRecipeInformation"] = true;
    return await axios.get(`${api_domain}/complexSearch`, {
      params: query,
    });
  }

  async function checkPersonalRecipe(user_id, recipeId) {
    let recipe = await DButils.execQuery(
      `SELECT recipeId FROM personalrecipe WHERE user_id='${user_id}' AND recipeId='${recipeId}'`
    );
    await DButils.execQuery( `COMMIT`);
    let res = recipe[0] ? true : false;
    return res;
  }

  async function getRecipeInformationDB(recipe_id) {
    let recipe = await DButils.execQuery(
      `SELECT * FROM recipes WHERE recipeId='${recipe_id}'`
    );
    await DButils.execQuery( `COMMIT`);
    recipe = recipe[0];
    recipe.isVegan = recipe.isVegan == 1;
    recipe.isVegetarian = recipe.isVegetarian == 1;
    recipe.isGlutenFree = recipe.isGlutenFree == 1;
    return recipe;
  }
    
  //details include servings, instructions, ingredients
  async function getRecipeFullDetails(recipe_id,user_id) {
    let isWatched = user_id? await user_utils.isWatched(user_id, recipe_id): false;
    let isFavorite = user_id? await user_utils.isFavorite(user_id, recipe_id): false;
    let recipe_info = await getRecipeInformationAPI(recipe_id);
    

    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree,extendedIngredients, analyzedInstructions,servings } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        isWatched: isWatched,
        isFavorite:isFavorite,
        extendedIngredients:extendedIngredients,
        analyzedInstructions:analyzedInstructions,
        servings:servings,
        
    };
  }

  async function getRecipesPreview(user_id, recipes) {
    let recipesToReturn = [];
    for (let i = 0; i < recipes.length; i++) {
      await recipesToReturn.push(getRecipeDetails(recipes[i]["id"],user_id));
    }
    return recipesToReturn;
  }


  async function searchrecipe(user_id,query){
    let recipes_info = await searchRecipeAPI(query);
    return await getRecipesPreview(user_id, recipes_info.data.results);
  }


  async function insertRecipe(user_id, recipe) {
    let {
      title,
      readyInMinutes,
      image,
      popularity,
      isVegan,
      isVegetarian,
      isGlutenFree,
      ingredients,
      servings,
      instructions,
    } = recipe;
  
    try {
      await DButils.execQuery(
        `insert ignore into recipes (picture,title,readyInMinutes,popularity,isVegan,isVegetarian,isGlutenFree,ingredients,servings,instructions) values ('${image}','${title}','${readyInMinutes}','${popularity}',
        '${isVegan ? 1 : 0}','${isVegetarian ? 1 : 0}','${isGlutenFree ? 1 : 0}','${ingredients}','${servings}','${instructions}')`
      );
      await DButils.execQuery( `COMMIT`);

      const result = await DButils.execQuery(`SELECT recipeId FROM recipes ORDER BY recipeId DESC LIMIT 1`);
      await DButils.execQuery( `COMMIT`);
      const lastRecipeId = result.length > 0 ? result[0].recipeId : null;
      
      await DButils.execQuery(
        `insert ignore into personalrecipe (user_id,recipeId) values ('${user_id}','${lastRecipeId}')`
      );
      await DButils.execQuery( `COMMIT`);
  
    } catch (err) {
      return err;
    }
  }

  




exports.getRecipeDetails = getRecipeDetails;
exports.searchrecipe = searchrecipe;
exports.getRecipesPreview = getRecipesPreview;
exports.getRandomRecipes = getRandomRecipes;
exports.getRecipeFullDetails = getRecipeFullDetails;
exports.insertRecipe = insertRecipe;


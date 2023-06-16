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

async function getRecipeDetails(recipe_id,username) {

    let isWatched = username? await user_utils.isWatched(username, recipe_id): false;
    let isFavorite = username? await user_utils.isFavorite(username, recipe_id): false;

    let personalRecipeFound = username? await checkPersonalRecipe(username, recipe_id): false; // checks if the user has the specific recipe id
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
        number: 1,
        apiKey: process.env.spooncular_apiKey
      }
    });
  }
  
  async function getRandomRecipes(username) {
    let recipes_info = await getRandomRecipesAPI();
    let recipes = [];
    for (let i = 0; i < recipes_info.data.recipes.length; i++) {
       await recipes.push(await getRecipeDetails(recipes_info.data.recipes[i].id,username));
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

  async function checkPersonalRecipe(username, recipeId) {
    let recipe = await DButils.execQuery(
      `SELECT recipeId FROM personalrecipe WHERE username='${username}' AND recipeId='${recipeId}'`
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
  async function getRecipeFullDetails(username,recipe_id) {
    let isWatched = username? await user_utils.isWatched(username, recipe_id): false;
    let isFavorite = username? await user_utils.isFavorite(username, recipe_id): false;
    let recipe_info = await getRecipeInformationAPI(recipe_id);
    

    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree,extendedIngredients, instructions,servings } = recipe_info.data;

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
        instructions:instructions,
        servings:servings,
        
    };
  }

  async function getRecipesPreview(username, recipes) {
    let recipesToReturn = [];
    for (let i = 0; i < recipes.length; i++) {
      // console.log(recipes[i]);
      await recipesToReturn.push(await getRecipeDetails(recipes[i],username));
      // if (recipes[i]["id"]){await recipesToReturn.push(getRecipeDetails(recipes[i]["id"],username));}
      // else{await recipesToReturn.push(getRecipeDetails(recipes[i]["recipeId"],username));}
    }
    return recipesToReturn;
  }


  async function searchrecipe(username,query){
    let recipes_info = await searchRecipeAPI(query);
    const recipes = await recipes_info.data.results.map(element =>  element.id);
    return await getRecipesPreview(username,recipes);
  }


  async function insertRecipe(username, recipe) {
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
        `insert ignore into personalrecipe (username,recipeId) values ('${username}','${lastRecipeId}')`
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


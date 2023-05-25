const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";
const user_utils = require("./user_utils");
const DButils = require("./DButils");


/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformationAPI(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            // includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}



async function getRecipeDetails(recipe_id,username) {
    let isWatched = username? await user_utils.isWatched(username, recipe_id): false;
    let isFavorite = username? await user_utils.isFavorite(username, recipe_id): false;
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

async function getRecipeFullDetails(recipe_id,user_id) {
    let isWatched = user_id? await user_utils.isWatched(user_id, recipe_id): false;
    let isFavorite = user_id? await user_utils.isFavorite(user_id, recipe_id): false;
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
      let {
        id,
        title,
        readyInMinutes,
        image,
        aggregateLikes,
        vegan,
        vegetarian,
        glutenFree,
      } = recipes_info.data.recipes[i];
      let isWatched = user_id ? await user_utils.isWatched(user_id, id) : false;
      let isFavorite = user_id? await user_utils.isFavorite(user_id, id): false;
      recipes.push({
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        isVegan: vegan,
        isVegetarian: vegetarian,
        isGlutenFree: glutenFree,
        isWatched: isWatched,
        isFavorite: isFavorite,
      });
    }
    return recipes;
  }
///לחזור איך מוסיפים הוראות הכנה
  async function searchRecipeAPI(query) {
    query["apiKey"] = process.env.spooncular_apiKey;
    query["number"] ? null : (query["number"] = 5);
    query["instructionsRequired"] = true;
    query["addRecipeInformation"] = true;
    console.log(query);
    return await axios.get(`${api_domain}/complexSearch`, {
      params: query,
    });
  }

  async function getRecipesPreview(user_id, recipes) {
    let recipesToReturn = [];
    for (let i = 0; i < recipes.length; i++) {
      let recipe = recipes[i];
      let isWatched = user_id? await user_utils.isWatched(user_id, recipe.id): false;
      let isFavorite = user_id? await user_utils.isFavorite(user_id, recipe.id): false;
      recipesToReturn.push({
        id: recipe.id,
        title: recipe.title,
        readyInMinutes: recipe.readyInMinutes,
        image: recipe.image,
        popularity: recipe.aggregateLikes,
        isVegan: recipe.vegan,
        isVegetarian: recipe.vegetarian,
        isGlutenFree: recipe.glutenFree,
        isWatched: isWatched,
        isFavorite: isFavorite,
      });
    }
    return recipesToReturn;
  }

  async function searchrecipe(user_id,query){
    let recipes_info = await SearchRecipesAPI(query);
    return await getRecipesPreview(user_id, recipes_info.data.results);
  }





exports.getRecipeDetails = getRecipeDetails;
exports.searchrecipe = searchrecipe;
exports.getRecipesPreview = getRecipesPreview;
exports.getRandomRecipes = getRandomRecipes;




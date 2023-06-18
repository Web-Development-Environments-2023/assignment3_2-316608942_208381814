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
    let familyRecipeFound = username? await checkFamilyRecipe(username, recipe_id): false; // checks if the user has the specific recipe id
    if (familyRecipeFound) {
      let recipe = await getRecipeInformationDB(recipe_id); // create the recipe
      recipe.isWatched = isWatched;
      recipe.isFavorite = isFavorite;
      return recipe;
    }
    let personalRecipeFound = username? await checkPersonalRecipe(username, recipe_id): false; // checks if the user has the specific recipe id
    if (personalRecipeFound) {
      let recipe = await getRecipepersonInformationDB(recipe_id); // create the recipe
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
      `SELECT id FROM recipes WHERE username='${username}' AND id='${recipeId}'`
    );
    await DButils.execQuery( `COMMIT`);
    let res = recipe[0] ? true : false;
    return res;
  }

  async function checkFamilyRecipe(username, recipeId) {
    let recipe = await DButils.execQuery(
      `SELECT id FROM family WHERE username='${username}' AND id='${recipeId}'`
    );
    await DButils.execQuery( `COMMIT`);
    let res = recipe[0] ? true : false;
    return res;
  }

  async function getRecipeInformationDB(recipe_id) {
    let recipe = await DButils.execQuery(
      `SELECT * FROM family WHERE id='${recipe_id}'`
    );
    await DButils.execQuery( `COMMIT`);
    recipe = recipe[0];
    recipe.isVegan = recipe.isVegan == 1;
    recipe.isVegetarian = recipe.isVegetarian == 1;
    recipe.isGlutenFree = recipe.isGlutenFree == 1;
    return recipe;
  }

  async function getRecipepersonInformationDB(recipe_id) {
    let recipe = await DButils.execQuery(
      `SELECT * FROM recipes WHERE id='${recipe_id}'`
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
    let familyRecipeFound = username? await checkFamilyRecipe(username, recipe_id): false; // checks if the user has the specific recipe id
    if (familyRecipeFound) {
      let recipe = await getRecipeInformationDB(recipe_id); // create the recipe
      recipe.isWatched = isWatched;
      recipe.isFavorite = isFavorite;
      return recipe;
    }
    let personalRecipeFound = username? await checkPersonalRecipe(username, recipe_id): false; // checks if the user has the specific recipe id
    if (personalRecipeFound) {
      let recipe = await getRecipepersonInformationDB(recipe_id); // create the recipe
      recipe.isWatched = isWatched;
      recipe.isFavorite = isFavorite;
      return recipe;
    }

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
      vegan,
      vegetarian,
      glutenFree,
      ingredients,
      servings,
      instructions,
    } = recipe;

    try {

      const result = await DButils.execQuery(`SELECT id FROM recipes ORDER BY id DESC LIMIT 1`);
      await DButils.execQuery( `COMMIT`);
      const lastRecipeId = result.length > 0 ? result[0].id : 4;
      newRecipe=Number(lastRecipeId)+1;
      await DButils.execQuery(
        `insert into recipes (id,image,title,readyInMinutes,popularity,vegan,vegetarian,glutenFree,ingredients,servings,instructions,username) values ('${newRecipe}','${image}','${title}','${readyInMinutes}','${popularity}',
        '${vegan ? 1 : 0}','${vegetarian ? 1 : 0}','${glutenFree ? 1 : 0}','${ingredients}','${servings}','${instructions}','${username}')`
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


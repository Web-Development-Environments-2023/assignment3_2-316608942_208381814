var express = require("express");
var router = express.Router();
const DButils = require("../utils/DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into recipefavorite (user_id,recipeId) values ('${user_id}',${recipe_id})`);
    await DButils.execQuery( `COMMIT`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipeId from recipefavorite where user_id='${user_id}'`);
    await DButils.execQuery( `COMMIT`);
    return recipes_id;
}

async function isWatched(user_id, recipeId) {
    let res = await DButils.execQuery(
      `select recipeId from watchs where user_id='${user_id}' AND recipeId='${recipeId}'`
    );
    await DButils.execQuery( `COMMIT`);
    if (res.length == 0) {
      return false;
    }
    return true;
  }
 
async function insertWatched(user_id, recipe_id) {
    await DButils.execQuery( `INSERT INTO watchs (user_id,recipeId) VALUES ('${user_id}','${recipe_id}')`);
    await DButils.execQuery( `COMMIT`);

}
async function isFavorite(user_id, recipeId) {
    let res = await DButils.execQuery(
      `select recipeId from recipefavorite where user_id='${user_id}' AND recipeId='${recipeId}'`
    );
    await DButils.execQuery( `COMMIT`);
    if (res.length == 0) {
      return false;
    }
    return true;
  }

async function getLastWatches(user_id) {
    const lastWatches = await DButils.execQuery(
      `select recipeId from watchs where user_id='${user_id}' ORDER BY time DESC LIMIT 3`
    );
    await DButils.execQuery( `COMMIT`);
    return lastWatches;
  }

//get all the recipe_ids created by the user. 
async function getMyRecipes(user_id){
  const recipe_ids = await DButils.execQuery(
    `select recipeId from personalrecipe where user_id='${user_id}'`
  );
  await DButils.execQuery( `COMMIT`);
  return recipe_ids;
}
  
async function getFamilyRecipes(user_id) {
  const recipes = await DButils.execQuery(
    `select * from family where user_id='${user_id}'`
  );
  await DButils.execQuery( `COMMIT`);
  return recipes;
}

async function getLastSearch(user_id){
  const last_search = await DButils.execQuery(
    `SELECT search FROM lastsearch WHERE user_id = '${user_id}'`
    );
  await DButils.execQuery( `COMMIT`);
  return search;
}


exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.isWatched = isWatched;
exports.insertWatched = insertWatched;
exports.isFavorite = isFavorite;
exports.getMyRecipes = getMyRecipes;
exports.getLastWatches = getLastWatches;
exports.getFamilyRecipes = getFamilyRecipes;
exports.getLastSearch=getLastSearch;


var express = require("express");
var router = express.Router();
const DButils = require("../utils/DButils");
const { Session } = require("inspector");

/*
  insert a given recipe into the favorites table with the specific user
*/ 
async function markAsFavorite(username, recipe_id){
    await DButils.execQuery(`insert into recipefavorite (username,recipeId) values ('${username}',${recipe_id})`);
    await DButils.execQuery( `COMMIT`);
}

/*
  get favorite recipes of a specific user from the favorites table 
*/ 
async function getFavoriteRecipes(username){
    const recipes_id = await DButils.execQuery(`select recipeId from recipefavorite where username='${username}'`);
    await DButils.execQuery( `COMMIT`);
    return recipes_id;
}

/*
  checks if a recipe was watched by a specific user 
*/ 
async function isWatched(username, recipeId) {
    let res = await DButils.execQuery(
      `select recipeId from watchs where username='${username}' AND recipeId='${recipeId}'`
    );
    await DButils.execQuery( `COMMIT`);
    if (res.length == 0) {
      return false;
    }
    return true;
  }
 
/*
  insert to watched table a given recipe id for specific user 
*/   
async function insertWatched(username, recipe_id) {
    await DButils.execQuery( `INSERT INTO watchs (username,recipeId) VALUES ('${username}','${recipe_id}')`);
    await DButils.execQuery( `COMMIT`);

}

/*
  checks if a recipe is favorite of a specific user 
*/ 
async function isFavorite(username, recipeId) {
    let res = await DButils.execQuery(
      `select recipeId from recipefavorite where username='${username}' AND recipeId='${recipeId}'`
    );
    await DButils.execQuery( `COMMIT`);
    if (res.length == 0) {
      return false;
    }
    return true;
  }

/*
  get the 3 last watched recipes of a specific user 
*/   
async function getLastWatches(username) {
    const lastWatches = await DButils.execQuery(`
    SELECT recipeId, username
    FROM (
      SELECT DISTINCT recipeId, username
      FROM watchs
      WHERE username = '${username}'
    ) AS subquery
    ORDER BY recipeId DESC
    LIMIT 3
  `);
    await DButils.execQuery(`COMMIT`);
    return lastWatches.map(watch => watch.recipeId);
  }

/*
  get all the recipe_ids created by the user. 
*/   
async function getMyRecipes(username){
  const recipe_ids = await DButils.execQuery(
    `select id from recipes where username='${username}'`
  );
  await DButils.execQuery( `COMMIT`);
  return recipe_ids.map(watch => watch.id);
}
  
/*
  get all the recipe_ids of the users family. 
*/  
async function getFamilyRecipes(username) {
  const recipes = await DButils.execQuery(
    `select * from family where username='${username}'`
  );
  await DButils.execQuery( `COMMIT`);
  return recipes;
}

/*
  get user id from the cookie in the request header. 
*/  
async function extractUserId(req){
  try{
    const cookieHeader = req.headers.cookie;
    const pairs = cookieHeader.split(";");
    username=null;
    pairs.forEach((pair) => {
      const [key, value] = pair.split("=");
      if (key.trim() === value.trim()) {
        username=key;    
        return username;
      }})
    return username;
  }catch(error){
    username=null;
    return username;
  }
}



exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.isWatched = isWatched;
exports.insertWatched = insertWatched;
exports.isFavorite = isFavorite;
exports.getMyRecipes = getMyRecipes;
exports.getLastWatches = getLastWatches;
exports.getFamilyRecipes = getFamilyRecipes;
exports.extractUserId=extractUserId;


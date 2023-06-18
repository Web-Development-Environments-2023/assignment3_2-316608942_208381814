var express = require("express");
var router = express.Router();
const DButils = require("../utils/DButils");
const { Session } = require("inspector");

async function markAsFavorite(username, recipe_id){
    await DButils.execQuery(`insert into recipefavorite (username,recipeId) values ('${username}',${recipe_id})`);
    await DButils.execQuery( `COMMIT`);
}

async function getFavoriteRecipes(username){
    const recipes_id = await DButils.execQuery(`select recipeId from recipefavorite where username='${username}'`);
    await DButils.execQuery( `COMMIT`);
    return recipes_id;
}

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
 
async function insertWatched(username, recipe_id) {
    await DButils.execQuery( `INSERT INTO watchs (username,recipeId) VALUES ('${username}','${recipe_id}')`);
    await DButils.execQuery( `COMMIT`);

}
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
    // return lastWatches.map(watch => watch.recipeId);
  }

//get all the recipe_ids created by the user. 
async function getMyRecipes(username){
  const recipe_ids = await DButils.execQuery(
    `select id from recipes where username='${username}'`
  );
  await DButils.execQuery( `COMMIT`);
  return recipe_ids.map(watch => watch.id);
}
  
async function getFamilyRecipes(username) {
  const recipes = await DButils.execQuery(
    `select * from family where username='${username}'`
  );
  await DButils.execQuery( `COMMIT`);
  return recipes;
}

async function extractUserId(req){
  // console.log(req);
  try{
    const cookieHeader = req.headers.cookie;
    const indexOfEquals = cookieHeader.indexOf('=');
    const username = cookieHeader.substring(0, indexOfEquals);
    return username;
  }catch(error){
    username=null;
    return username;
  }
  // console.log(username);
  // const user_id = (
  //   await DButils.execQuery(
  //     `SELECT user_id FROM users WHERE username = '${username}'`
  //   ))[0]["user_id"];
  // console.log(user_id);
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


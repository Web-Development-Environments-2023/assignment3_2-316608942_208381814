const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into recipefavorite (user_id,recipeId) values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipeId from recipefavorite where user_id='${user_id}'`);
    return recipes_id;
}

async function isWatched(user_id, recipeId) {
    let res = await DButils.execQuery(
      `select recipeId from recipewatched where user_id='${user_id}' AND recipeId='${recipeId}'`
    );
    if (res.length == 0) {
      return false;
    }
    return true;
  }
 
async function insertWatched(user_id, recipe_id) {
    await DButils.execQuery(
        `insert into recipewatched values ('${user_id}','${recipe_id}',NOW()) ON DUPLICATE KEY UPDATE time=NOW()`
);

}
async function isFavorite(user_id, recipeId) {
    let res = await DButils.execQuery(
      `select recipeId from recipefavorite where user_id='${user_id}' AND recipeId='${recipeId}'`
    );
    if (res.length == 0) {
      return false;
    }
    return true;
  }



async function getLastWatches(username) {
    const lastWatches = await DButils.execQuery(
      `select recipeId from recipewatched where username='${username}' ORDER BY time DESC LIMIT 3`
    );
    return lastWatches;
  }

async function getMyRecipes(username){
  const recipes = await DButils.execQuery(
    `select recipeId from userRecipes where username='${username}'`
  );
  return recipes;
}
  


exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.isWatched = isWatched;
exports.insertWatched = insertWatched;
exports.isFavorite = isFavorite;
exports.getMyRecipes = getMyRecipes;


const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function isWatched(username, recipeId) {
    let res = await DButils.execQuery(
      `select recipeId from recipewatched where username='${username}' AND recipeId='${recipeId}'`
    );
    if (res.length == 0) {
      return false;
    }
    return true;
  }
 
async function insertWatched(username, recipe_id) {
    await DButils.execQuery(
        `insert into recipewatched values ('${username}','${recipe_id}',NOW()) ON DUPLICATE KEY UPDATE time=NOW()`
);

}
async function isFavorite(username, recipeId) {
    let res = await DButils.execQuery(
      `select recipeId from recipefavorite where username='${username}' AND recipeId='${recipeId}'`
    );
    if (res.length == 0) {
      return false;
    }
    return true;
  }

async function insertFavorite(username, recipe_id) {
    await DButils.execQuery(
        `insert into recipefavorite values ('${username}',${recipe_id})`
);
}

async function getLastWatches(username) {
    const lastWatches = await DButils.execQuery(
      `select recipeId from recipewatched where username='${username}' ORDER BY time DESC LIMIT 3`
    );
    return lastWatches;
  }
  


exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.isWatched = isWatched;
exports.insertWatched = insertWatched;
exports.isFavorite = isFavorite;
exports.insertFavorite = insertFavorite;


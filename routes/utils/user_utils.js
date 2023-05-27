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
      `select recipeId from watch where user_id='${user_id}' AND recipeId='${recipeId}'`
    );
    if (res.length == 0) {
      return false;
    }
    return true;
  }
 
async function insertWatched(user_id, recipe_id) {
    // const currentDateTime = new Date();
  //  let timestamp=Date.now();
  //  let currentDate = new Date().toJSON().slice(0, 19);
  //  currentDate=currentDate.replace('T'," ");
  //  let currentDate = new Date()
  //   console.log(currentDate);
  //   let dateString = currentDate
  // , reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/
  // , [, year, month, day, hours, minutes, seconds] = reggie.exec(dateString)
  // , dateObject = new Date(year, month-1, day, hours, minutes, seconds);
  //   // var date = moment(currentDate, "YYYY-MM-DD").utcOffset('+05:30').format('YYYY-MM-DD HH:mm:ss');

    // var newDate = new Date(moment(date).add({ hours:5, minutes: 30 }).format('YYYY-MM-DD hh:mm:ss'));
    
    // console.log(newDate)
    // const [dateValues, timeValues] = currentDate.split('T');
    // const [year,month, day] = dateValues.split('-');
    // const [hours, minutes, seconds] = timeValues.split(':');
    // const moment=moment(currentDate)

    // const date = new Date(+year, +month - 1, +day, +hours, +minutes, +seconds);

    // var today = new Date();
    // INSERT INTO example (last_update) 
    // values(STR_TO_DATE("10-17-2021 15:40:10", "%m-%d-%Y %H:%i:%s"));
    // var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    // const formattedDateTime = currentDateTime.toISOString().slice(0, 19).replace('T', ' ');
    let res=await DButils.execQuery( `insert into watch values ('${user_id}','${recipe_id}',NOW()) ON DUPLICATE KEY UPDATE time=NOW()`);
    console.log(res);
    return res;
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



async function getLastWatches(user_id) {
    const lastWatches = await DButils.execQuery(
      `select recipeId from watch where user_id='${user_id}' ORDER BY time DESC LIMIT 3`
    );
    return lastWatches;
  }

//get all the recipe_ids created by the user. 
async function getMyRecipes(user_id){
  const recipe_ids = await DButils.execQuery(
    `select recipeId from personalrecipe where user_id='${user_id}'`
  );
  return recipe_ids;
}
  


exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.isWatched = isWatched;
exports.insertWatched = insertWatched;
exports.isFavorite = isFavorite;
exports.getMyRecipes = getMyRecipes;
exports.getLastWatches = getLastWatches;




//Check for existing email and return user info
const lookupUserByEmail = function(email, database) {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return false;
};

//Generate a randomstring of x length
const generateRandomString = function(stringLength) {
  let result = '';
  const alphaNumChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < stringLength; i++) {
    const randomNum = Math.floor(Math.random() * alphaNumChar.length);
    result += alphaNumChar[randomNum];
  }
  return result;
};

// Returns the urls that belong to userID
const urlsForUserID = function(userID, database) {
  let result = {};
  for (let shortUrlKey in database) {
    if (userID === database[shortUrlKey].userID) {
      result[shortUrlKey] = {
        longURL: database[shortUrlKey].longURL        
      }
    }
  }
  return result;
};

//Checks if given url belongs to user
const doesUrlBelongToUser = function(url, userID, database) {
  const usersUrls = urlsForUserID(userID, database);
  const userUrlsKeysArr = Object.keys(usersUrls);
  return userUrlsKeysArr.includes(url)
};



module.exports = {
  lookupUserByEmail,
  generateRandomString,
  urlsForUserID,
  doesUrlBelongToUser
}
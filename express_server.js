//##HELPER FUNCTIONS##
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
//Check for existing email and return user info
const lookupUserByEmail = function(email, database) {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return false;
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

//Setting up the express server
const express = require('express');
const app = express();
const PORT = 8080;

// morgan middleware allows to log the request in the terminal
// const morgan = require('morgan');
// app.use(morgan('short'));

//Setting the view engine to ejs.
app.set('view engine', 'ejs');

//Replaces body-parser. Middleware to parse client form requests/data
app.use(express.urlencoded({extended: true}));

//Setting up cookie-parser middleware to use cookies
const cookie = require('cookie-parser');
app.use(cookie());

//URL database
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "Fg458f34",
  },
  "Asm5xK": {
    longURL: "http://www.google.com",
    userID: "Fg458f34",
  },
  "h65fe0": {
    longURL: "http://www.reddit.com",
    userID: "nk457fqp"
  }
};

//User database
const usersDatabase= { 
  "Fg458f34": {
    id: "Fg458f34", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "f56g23kl": {
    id: "f56g23kl", 
    email: "user2@example.com", 
    password: "test2"
  },
  "nk457fqp": {
    id: "nk457fqp",
    email: "test@example.com",
    password: "test"
  } 
}


//##ENDPOINTS/ROUTES BELOW##

//Redirect to /urls page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//Renders all URL lists in the database
app.get("/urls", (req, res) => {
  const clientCookie = req.cookies;
  const clientUserId = clientCookie.user_id;
  const usersUrls = urlsForUserID(clientUserId, urlDatabase);
  let user = "";
  if (clientUserId) {
    user = usersDatabase[clientUserId];
  }
  const templateVars = {
    urls: usersUrls,
    user
  };
  res.render("urls_index", templateVars);
});

//Renders the create new page
app.get("/urls/new", (req, res) => {
  const clientCookie = req.cookies;
  const clientUserId = clientCookie.user_id
  let user = "";
  if (clientUserId) {
    user = usersDatabase[clientUserId];
    const templateVars = {
      user
    };
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

//A POST request to save a new short and long URL into the URL database
app.post("/urls", (req, res) => {
  const clientCookie = req.cookies;
  const clientUserId = clientCookie.user_id;
  if(clientUserId) {
    const randomString = generateRandomString(6);
    urlDatabase[randomString] = {
      longURL: `http://${req.body.longURL}`,
      userID: clientUserId
    };
    return res.redirect(`/urls/${randomString}`);
  }
  res.status(401).send("User login required to access services");
});

//Renders the urls_show page and lists the requested short and long URL
app.get("/urls/:shortURL", (req, res) => {
  const clientCookie = req.cookies;
  const clientUserId = clientCookie.user_id;
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  const usersUrls = urlsForUserID(clientUserId, urlDatabase);
  const userUrlsKeysArr = Object.keys(usersUrls);
  if (!userUrlsKeysArr.includes(shortURL)) {
    shortURL = "";
    longURL = "";
  }
  let user = "";
  if (clientUserId) {
    user = usersDatabase[clientUserId];
  } 
  const templateVars = { 
    shortURL, 
    longURL,
    user
  }
  res.render("urls_show", templateVars);
});

//POST request to update an existing longURL in the URL database
app.post("/urls/:shortURL", (req, res) => {
  const clientCookie = req.cookies;
  const clientUserId = clientCookie.user_id;
  const shortURL = req.params.shortURL;
  const newLongURL = `http://${req.body.newLongURL}`;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect(`/urls/${shortURL}`);
});

//Redirects to the long URL website when the short URL link is clicked
app.get("/u/:shortURL", (req, res) =>{
  const shortURL = req.params.shortURL
  const shortUrlArray = Object.keys(urlDatabase);
  if (shortUrlArray.includes(shortURL)) return res.redirect(`${urlDatabase[shortURL].longURL}`);
  res.status(406).send("Cannot find referenced URL");
});

//POST request to delete URL stored in the URL database
app.post(`/urls/:shortURL/delete`, (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect("/urls/");
});

//Renders the user registration page
app.get("/register", (req, res) => {
  const clientCookie = req.cookies;
  const clientUserId = clientCookie.user_id
  let user = "";
  if (clientUserId) {
    user = usersDatabase[clientUserId];
  }
  const templateVars = {
    user
  };
  res.render("urls_register", templateVars)
});

//POST request for new user registration
app.post("/register", (req, res) => {
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;
  if (!newUserEmail || !newUserPassword) {
    return res.status(400).send("Please enter valid credentials");
  }
  const userInDatabase = lookupUserByEmail(newUserEmail, usersDatabase);
  if (userInDatabase) {
    return res.status(400).send("Email is registered already. Please use new email")
  }
  const randomString = generateRandomString(8);
  usersDatabase[randomString] = {
    id: randomString,
    email: newUserEmail,
    password: newUserPassword
  };
  res.cookie("user_id", randomString);
  res.redirect("/urls");
});

//Renders the user login page
app.get("/login", (req, res) => {
  const clientCookie = req.cookies;
  const clientUserId = clientCookie.user_id
  let user = "";
  if (clientUserId) {
    user = usersDatabase[clientUserId];
  }
  const templateVars = {
    user
  };
  res.render("urls_login", templateVars);
});

//POST request for user login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = lookupUserByEmail(email, usersDatabase);
  if (!user) return res.status(403).send("Invalid email or password");
  if (password !== user.password) return res.status(403).send("Invalid email or password");
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

//POST request for user logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});




//##TESTS AND TEST ENPOINTS##
app.get("/test", (req, res) => {
  // console.log(JSON.stringify(usersDatabase, 0, 2));
  console.log(JSON.stringify(urlDatabase, 0, 2));
  console.log(urlsForUserID("nk457fqp", urlDatabase));
  res.status(400).send("Error");
});

app.get("/urlDatabase.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/usersDatabase.json", (req, res) => {
  res.json(usersDatabase);
});


//Server listening to PORT
app.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});
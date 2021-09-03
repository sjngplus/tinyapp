//Importing helper functions
const {
  lookupUserByEmail,
  generateRandomString,
  urlsForUserID,
  doesUrlBelongToUser
} = require('./helper_functions');

//Setting up the express server
const express = require('express');
const app = express();
const PORT = 8080;

//Importing bcryptjs for password encryption
const bcrypt = require('bcryptjs');
const SALT = 10;

//Setting the view engine to ejs.
app.set('view engine', 'ejs');

//Replaces body-parser. To parse client form requests/data
app.use(express.urlencoded({extended: true}));

//Setting up cookie-session middleware to use encrypted cookies. Replaces cookie-parser.
const cookie = require('cookie-session');
app.use(cookie({
  name: "session",
  keys: ["keyz1", "keyzz2"]
}));

//Importing databases
const {urlDatabase, usersDatabase} = require('./databases');




//##ENDPOINTS/ROUTES BELOW##

//Redirect to /urls page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//Renders all URL lists in the database
app.get("/urls", (req, res) => {
  const clientUserId = req.session.user_id;
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
  const clientUserId = req.session.user_id;
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
  const clientUserId = req.session.user_id;
  if (clientUserId) {
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
  const clientUserId = req.session.user_id;
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  if (!doesUrlBelongToUser(shortURL, clientUserId, urlDatabase)) {
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
  };
  res.render("urls_show", templateVars);
});

//POST request to update an existing longURL in the URL database
app.post("/urls/:shortURL", (req, res) => {
  const clientUserId = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (clientUserId && doesUrlBelongToUser(shortURL, clientUserId, urlDatabase)) {
    const newLongURL = `http://${req.body.newLongURL}`;
    urlDatabase[shortURL].longURL = newLongURL;
    return res.redirect(`/urls/${shortURL}`);
  }
  res.status(401).send("User login required to access services");
});

//Redirects to the long URL website when the short URL link is clicked
app.get("/u/:shortURL", (req, res) =>{
  const shortURL = req.params.shortURL;
  const shortUrlArray = Object.keys(urlDatabase);
  if (shortUrlArray.includes(shortURL)) return res.redirect(`${urlDatabase[shortURL].longURL}`);
  res.status(406).send("Cannot find referenced URL");
});

//POST request to delete URL stored in the URL database
app.post(`/urls/:shortURL/delete`, (req, res) => {
  const clientUserId = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (clientUserId && doesUrlBelongToUser(shortURL, clientUserId, urlDatabase)) {
    delete urlDatabase[shortURL];
    return res.redirect("/urls/");
  }
  res.status(401).send("User login required to access services");
});

//Renders the user registration page
app.get("/register", (req, res) => {
  const clientUserId = req.session.user_id;
  let user = "";
  if (clientUserId) {
    user = usersDatabase[clientUserId];
  }
  const templateVars = {
    user
  };
  res.render("urls_register", templateVars);
});

//POST request for new user registration
app.post("/register", (req, res) => {
  const newUserEmail = req.body.email;
  const plainTextPassword = req.body.password;
  if (!newUserEmail || !plainTextPassword) {
    return res.status(400).send("Please enter valid credentials");
  }
  const hashedPassword = bcrypt.hashSync(plainTextPassword, SALT);
  const userInDatabase = lookupUserByEmail(newUserEmail, usersDatabase);
  if (userInDatabase) {
    return res.status(400).send("Email is registered already. Please use new email");
  }
  const randomString = generateRandomString(8);
  usersDatabase[randomString] = {
    id: randomString,
    email: newUserEmail,
    password: hashedPassword
  };
  req.session.user_id = randomString;
  res.redirect("/urls");
});

//Renders the user login page
app.get("/login", (req, res) => {
  const clientUserId = req.session.user_id;
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
  if (!bcrypt.compareSync(password, user.password)) return res.status(403).send("Invalid email or password");
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//POST request for user logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Server listening to PORT
app.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});




//vvvvv##REMOVE BEFORE FINAL PROJECT SUBMISSION!!##vvvvv
//##TESTS AND TEST ENPOINTS##
app.get("/test", (req, res) => {
  console.log("User Database:", JSON.stringify(usersDatabase, 0, 2));
  console.log("URL Database:", JSON.stringify(urlDatabase, 0, 2));
  res.status(400).send("Testpage");
});

app.get("/urlDatabase.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/usersDatabase.json", (req, res) => {
  res.json(usersDatabase);
});

// morgan middleware allows to log the request in the terminal
// const morgan = require('morgan');
// app.use(morgan('short'));
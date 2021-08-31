/*
const morgan = require('morgan');
// morgan middleware allows to log the request in the terminal
app.use(morgan('short'));
*/

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


//Setting up the express server
const express = require('express');
const app = express();
const PORT = 8080;

//Setting the view engine to ejs.
app.set('view engine', 'ejs');

// const bodyParser = require('body-parser'); ##Depracated. No need to use##
// app.use(bodyParser.urlencoded({extended: true})); ##Depracated. No need to use##
app.use(express.urlencoded({extended: true}));

//URL database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "Asm5xK": "http://www.google.com"
};


//##ENDPOINTS/ROUTES BELOW##

//Redirect to /urls page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//Renders all URL lists in the database
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

//Renders the create new page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//A POST request to save a new short and long URL into the URL database
app.post("/urls", (req, res) => {
  const randomString = generateRandomString(6);
  res.redirect(`/urls/${randomString}`)
  urlDatabase[randomString] = `http://${req.body.longURL}`;
  console.log(urlDatabase);
});

//Renders the urls_show page and lists the requested short and long URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL}
  res.render("urls_show", templateVars);
});

//POST request to update an existing longURL in the URL database
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = `http://${req.body.newLongURL}`;
  urlDatabase[shortURL] = newLongURL;
  res.redirect(`/urls/${shortURL}`);
  console.log(urlDatabase);
});

//Redirects to the long URL website when the short URL link is clicked
app.get("/u/:shortURL", (req, res) =>{
  const shortURL = req.params.shortURL
  res.redirect(`${urlDatabase[shortURL]}`)
});

//POST request to delete URL stored in the URL database
app.post(`/urls/:shortURL/delete`, (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect("/urls/");
  console.log(urlDatabase);
});

//Sends the URL database in JSON to the client
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Test
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});








//Server listeneing to PORT
app.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});
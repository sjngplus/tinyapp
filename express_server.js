const generateRandomString = function(stringLength) {
  let result = '';
  const alphaNumChar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < stringLength; i++) {
    const randomNum = Math.floor(Math.random() * alphaNumChar.length);
    result += alphaNumChar[randomNum];
  }
  return result;
};

const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Root page of the app
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Shows all URL lists in the database
app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

//Shows the page where a new TinyURL can be generated
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//A POST request to generate a short URL for the user submitted long URL. Saves the new long url and short URL into the databse
app.post("/urls", (req, res) => {
  const randomString = generateRandomString(6);
  res.redirect(`/urls/${randomString}`)
  urlDatabase[randomString] = `http://${req.body.longURL}`;
  console.log(urlDatabase);
});

//Shows a the single URL that was listed in the GET URL request.
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL}
  res.render("urls_show", templateVars);
});

//Redirects to the long URL when short URL is clicked
app.get("/u/:shortURL", (req, res) =>{
  const shortURL = req.params.shortURL
  res.redirect(`${urlDatabase[shortURL]}`)
});

//Shows the URL database in JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Test
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log("Server is listening on port", PORT);
});
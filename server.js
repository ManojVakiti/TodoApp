const express = require("express")
const path = require("path");
const {open} = require("sqlite")
const sqlite3 = require("sqlite3")
const bcrypt = require("bcrypt");
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//users userid primary key autoincrement, username, password
//todos todoid primary key autoincremnt, description, iscompleted, username

const app = express()
app.use(express.json())

passport.use(new LocalStrategy (async (username, password, done) =>{
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    const object = await db.get(query)
    if(object === undefined){
        return done(null, false, {message: "User doesn't Exist"})
    }else{
        const value = await bcrypt.compare(password, object.password)
        if(value){
            return done(null, object)
        }else{
            return done(null, false, {message: "Invalid Password"})
        }
    }
}))

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const query = `SELECT * FROM users WHERE id = ${id}`
    const arr = await db.get(query)
    done(null, arr)
  });

let db = null
let filePath = path.join(__dirname, "index.db")
const intializeDb = async () =>{
    try{
        db = await open({
            filename: filePath,
            driver: sqlite3.Database
        })
        app.listen(3000, () =>{
            console.log("Listening Port 3000")
        })
    }catch(e){

    }
}

intializeDb();

app.set("view-engine", "ejs")
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended:false}))
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
  }));
  
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (request, response) =>{
    response.render("index.ejs")
})

app.get("/login", (request, response)=>{
    if(request.isAuthenticated()){
        response.redirect("/home")
    }else{
        response.render("login.ejs")
    }
    
    
})

app.get("/register", (request, response) =>{
    if(request.isAuthenticated()){
        response.redirect("/home")
    }
    else{
        response.render("register.ejs")
    }
    
})

app.post("/register", async (request, response) =>{
    const username = request.body.username
    const password = request.body.password
    const query = `SELECT * FROM users WHERE username = '${username}'`
    const arr = await db.get(query)
    const hashedPassword = await bcrypt.hash(password, 10)
    if(arr !== undefined){
       request.flash("exists", "Username exists")
        response.redirect("/register") 
    }else{
        const query = `INSERT INTO users (username, password) VALUES('${username}', '${hashedPassword}')`;
        await db.run(query)
        response.redirect("/login") 
    }
})

app.post("/login",  passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
}))

app.get("/home", async (request, response) =>{
    if(request.isAuthenticated()){
        request.flash("username", `${request.user.username}`)
        response.render("home.ejs")
    }else{
        response.redirect("/")
    }
    
})

app.get("/data", async(request, response) =>{
    if(request.isAuthenticated()){
        const query = `SELECT * FROM todos WHERE username = '${request.user.username}'`
        const arr = await db.all(query)
        if(arr !== undefined){
            response.json(arr)
        }
        
    }
})

app.post("/sendData", async (request, response) =>{
    if(request.isAuthenticated()){
        const {description} = request.body
        const {isCompleted} = request.body
        const username = request.user.username
        const query = `INSERT INTO todos (description, username, iscompleted) VALUES('${description}', '${username}', '${isCompleted}')`
        await db.run(query)
        const lastQuery = `SELECT * FROM todos ORDER BY todoid DESC LIMIT 1`
        const num = await db.get(lastQuery)
        let res = {
            todoId: num.todoid,
            description: num.description,
            iscompleted:num.iscompleted
        }
        response.json(res)
    }else{
        response.redirect("/login")
    }
})

app.post("/delete", async (request, response)=>{
    if(request.isAuthenticated()){
        const todoId = request.body.todolistId
        const query = `DELETE FROM todos WHERE todoid = ${todoId}`;
        await db.run(query)
    }else{
        response.redirect("/login")
    }
})

app.put("/editData", async (request, response) =>{
    if(request.isAuthenticated()){
        const {description, todoid} = request.body
        const query = `UPDATE todos SET description = '${description}' WHERE todoid = ${todoid}`
        await db.run(query)
    }else{
        response.redirect("/login")
    }
})

app.put("/changeStatus", async(request, response) =>{
    if(request.isAuthenticated()){
        const {todoid, iscompleted} = request.body
        const query = `UPDATE todos SET iscompleted = '${iscompleted}' WHERE todoid = ${todoid}`
        await db.run(query)
    }else{
        response.redirect("/loign")
    }
})

app.get("/allDetails", async (request, response) =>{
    if(request.isAuthenticated()){
        const username = request.user.username
        const query = `SELECT * FROM todos WHERE username = '${username}'`;
        const arr = await db.all(query)
        response.json(arr)
    }else{
        response.redirect("/login")
    }
})

app.get("/completedDetails", async (request, response) =>{
    if(request.isAuthenticated()){
        const username = request.user.username;
        const query = `SELECT * FROM todos WHERE username = '${username}' AND iscompleted = 'true'`
        const arr = await db.all(query)
        response.json(arr)
    }
})
app.get("/pendingDetails", async(request, response)=>{
    if(request.isAuthenticated()){
        const username = request.user.username;
        const query = `SELECT * FROM todos WHERE username = '${username}' AND iscompleted = 'false'`
        const arr = await db.all(query)
        if(arr.length === 0){
            request.flash("filterMessages", "No Pending Tasks")
        }
        response.json(arr)
    }else{
        response.redirect("/login")
    }
})

app.get("/logout", (res, req) =>{
    res.logout((err)=>{
        if(err){

        }else{
            req.redirect("/login")
        }
    })
})

app.get("/deleteTodos", async (req, res) =>{
    if(req.isAuthenticated()){
        const query = `DELETE FROM todos WHERE username = '${req.user.username}'`;
        await db.run(query)
    }
})

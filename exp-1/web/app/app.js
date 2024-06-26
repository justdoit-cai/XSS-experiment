const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const puppeteer = require('puppeteer-core');
const crypto = require('crypto');
const fs = require('fs');

let app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const Schema = mongoose.Schema;
mongoose.connect("mongodb://myMongo:27017/demo");

const flag = fs.readFileSync('/flag')
console.log('[+] flag loaded')

const browser = puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    pipe: true,
    args: ['--no-sandbox']
})
console.log('[+] browser launched')

let commentSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});

let Comment = mongoose.model('Comment', commentSchema);

function createToken(length) {
    return crypto.randomBytes(length).toString('hex')
}
async function visit() {
    console.log(`[+] visiting`)
    try {
        const page = await browser.newPage()
        try {
            await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' })
            await page.setCookie({
                name: 'flag',
                value: encodeURIComponent(flag)
            })
            await setTimeout(5000)
        } catch (err) {
            console.log(err)
        }
        await page.close()
    } catch (err) {
        console.log(err)
    }
}

app.get('/', (req, res) => {
    Comment.find().then((ret) => {
        res.render("index", {comments: ret})
    })
})
app.post('/comment', (req, res) => {
    console.log(req.body)
    const content = req.body.content
    let comment = new Comment({
        _id: createToken(16),
        content: content
    })
    comment.save().then(() => {
        Comment.find().then((ret) => {
            console.log(ret)
            res.render("index", {comments: ret})
        })
    })
})
app.delete('/comment/:id', (req, res) => {
    const id = req.params['id'];
    console.log(id)
    Comment.deleteOne({
        _id: id
    }).then(() => {
        Comment.find().then((ret) => {
            console.log(ret)
            res.render("index", {comments: ret})
        })
    })

})
app.get('/visit', (req, res) => {
    visit()
    res.send("success")
})

module.exports = app;

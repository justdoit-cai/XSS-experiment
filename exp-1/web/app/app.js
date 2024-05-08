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

//    mongoose.model 方法就是用来将一个架构发布为 model
//    第一个参数：传入一个大写名词单数字符串用来表示你的数据库名称
//                 mongoose 会自动将大写名词的字符串生成 小写复数 的集合名称
//                 例如这里的 User 最终会变为 users 集合名称
//    第二个参数：架构 Schema
//
//    返回值：模型构造函数
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
    res.render("index")
})
app.get('/api/comment', (req, res) => {
    Comment.find().then((err, ret) => {
        if (err) {
            res.send(err)
        } else {
            res.send(ret)
        }
    })
})
app.post('/api/comment', (req, res) => {
    console.log(req.body)
    const content = req.body.content
    let comment = new Comment({
        _id: createToken(16),
        content: content
    })
    comment.save().then((ret) => {
        res.send(ret)
    }).catch((err) => {
        res.send(err)
    })
})
app.delete('/api/comment/:id', (req, res) => {
    const id = req.params['id'];
    Comment.deleteOne({
        _id: id
    }).then((ret) => {
        res.send(ret)
    }).catch((err) => {
        res.send(err)
    })
})
app.get('/api/visit', (req, res) => {
    visit()
})

module.exports = app;

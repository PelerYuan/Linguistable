const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { translate } = require('bing-translate-api');
const fs = require('fs');
// const { console } = require('inspector');

const app = express();
const PORT = process.env.PORT || 3000;

// 允许跨域
app.use(cors());
app.use(bodyParser.json());

// 静态文件目录设置（托管 `public` 文件夹）
app.use(express.static(path.join(__dirname, 'public')));

// 读取语言对照表
const languages = JSON.parse(fs.readFileSync('languages.json', 'utf-8'));

app.post('/translate', async (req, res) => {
    try {
        const { text, fromLang, toLang } = req.body;
        console.log(`Translate ${text} from '${fromLang}' to '${toLang}'`);
        if (!text) return res.status(400).json({ error: "No text provided" });
        // const fromLangCode = Object.keys(languages).find(key => languages[key] === fromLang);
        // const toLangCode = Object.keys(languages).find(key => languages[key] === toLang);
        const result = await translate(text, fromLang, toLang);
        res.json({ translatedText: result.translation });
    } catch (error) {
        console.error("Translation error:", error);
        res.status(500).json({ error: "Translation failed" });
    }
});


// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
});
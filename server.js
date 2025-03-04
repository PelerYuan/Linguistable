const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { translate } = require('bing-translate-api');

const app = express();
const PORT = process.env.PORT || 3000;

// 允许跨域
app.use(cors());
app.use(bodyParser.json());

// 静态文件目录设置（托管 `public` 文件夹）
app.use(express.static(path.join(__dirname, 'public')));

const queue = []; // 任务队列
let isProcessing = false; // 处理标志

// 每秒执行一个翻译任务
setInterval(async () => {
    if (queue.length > 0 && !isProcessing) {
        isProcessing = true;
        const task = queue.shift(); // 取出队列中的任务
        await processTranslation(task);
        isProcessing = false;
    }
}, 1000);

// 处理翻译请求
app.post('/translate', (req, res) => {
    const { text, fromLang, toLang } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    queue.push({ text, fromLang, toLang, res, retryCount: 0 }); // 加入队列，初始化 retryCount=0
});

// 处理单个翻译任务
async function processTranslation(task) {
    const { text, fromLang, toLang, res, retryCount } = task;

    try {
        const result = await translate(text, fromLang, toLang);
        res.json({ translatedText: result.translation });
    } catch (error) {
        console.error(`Translation failed (Attempt ${retryCount + 1}):`, error);

        if (retryCount < 3) { // 最多重试 3 次
            task.retryCount += 1;
            console.log(`Retrying in 3 seconds: ${text}, Retry #${task.retryCount}`);

            // 延迟 3 秒后重新加入队列
            setTimeout(() => {
                queue.push(task);
                console.log(`Requeued after 3 seconds: ${text}, Retry #${task.retryCount}`);
            }, 3000);
        } else {
            res.status(500).json({ error: "Translation failed after multiple attempts" });
        }
    }
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
});
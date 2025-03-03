// server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件目录设置
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`server running on: http://localhost:${PORT}`);
});

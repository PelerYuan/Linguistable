const { translate } = require('bing-translate-api');

translate('你好', 'zh-Hans', 'en').then(res => {
  console.log(res);
}).catch(err => {
  console.error(err);
});

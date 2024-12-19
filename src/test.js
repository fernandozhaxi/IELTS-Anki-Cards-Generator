const fs = require('fs');

// 读取文件内容
fs.readFile('./words.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件时发生错误:', err);
    return;
  }

  // 按行分割文本
  const words = data.split('\n').map(word => word.trim());

  // 使用 Set 去除重复的单词，并保留顺序
  const uniqueWords = [...new Set(words)];

  // 将去重后的单词写入新的文件
  fs.writeFile('unique_words.txt', uniqueWords.join('\n'), (err) => {
    if (err) {
      console.error('写入文件时发生错误:', err);
      return;
    }
    console.log('去重后的单词已保存到 unique_words.txt');
  });
});

const fs = require('fs');
const path = require('path');

// 读取文件内容
const filePath = path.join(__dirname, 'words.txt');
const content = fs.readFileSync(filePath, 'utf-8');

// 定义一个函数，判断是否是中文
const isChinese = (str) => /[\u4e00-\u9fa5]/.test(str);

// 定义一个函数，去除中文字符
const removeChinese = (str) => str.replace(/[\u4e00-\u9fa5]/g, '');

// 解析内容
const parseContent = (content) => {
  const result = {};
  let currentGroup = null;

  content.split('\n').forEach(line => {
    line = line.trim();

    // 判断是否是分组标识
    const groupMatch = line.match(/^---(.*?)---$/);
    if (groupMatch) {
      currentGroup = groupMatch[1]; // 获取分组名
      result[currentGroup] = [];
    } else if (currentGroup && line) {
      // 如果是单词，去除中文并归类到当前分组下
      const cleanedLine = removeChinese(line);
      if (cleanedLine) {
        result[currentGroup].push(cleanedLine);
      }
    }
  });

  return result;
};

// 解析文件内容
const parsedResult = parseContent(content);

// 输出结果
console.log(parsedResult);

// 如果你想将结果保存到新的文件
fs.writeFileSync(path.join(__dirname, 'parsed_words.json'), JSON.stringify(parsedResult, null, 2), 'utf-8');

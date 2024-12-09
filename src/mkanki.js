const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const anki = require("mkanki");
const writeToLog = require("./utils/logger");

const directoryPath = __dirname;
const HTML_DIR = directoryPath + "/output/html/";
const CSS_DIR = directoryPath + "/output/css/";
const DEFAULT_DECK_NAME = "IELTS-CamDict-Words";
const DEFAULT_NOTE_TYPE_NAME = "BasicCamCard";
const DEFAULT_CSS_FILENAME = "common.css";
const DEFAULT_APKG_NAME = DEFAULT_DECK_NAME + ".apkg";
const wordsPath = path.join(__dirname, "./output/dist");

const cssData = fs.readFileSync(CSS_DIR + DEFAULT_CSS_FILENAME, "utf8");

const model = new anki.Model({
  name: DEFAULT_NOTE_TYPE_NAME,
  id: Date.now().toString(),
  flds: [{ name: "Word" }, { name: "Front" }, { name: "Back" }],
  req: [[0, "all", [0]]],
  tmpls: [
    {
      name: "Card 1",
      qfmt: "{{Front}}",
      afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}",
    },
  ],
  css: cssData,
});

const package = new anki.Package();

async function processHtmlFilesNew(cataPath, deck) {
  try {
    const files = fs.readdirSync(cataPath);
    console.log('读取文件', files);
    let cnt = 0;
    function addNote(file, deck) {
      const currentWord = file.match(/^(.+)\.html$/)[1];
      const filePath = path.join(cataPath, file);
      const data = fs.readFileSync(filePath)
      console.log('addNote', data);
      const $ = cheerio.load(data);
      let front = "";
      $(".pos-header.dpos-h")
        .toArray()
        .forEach((ele) => {
          front += $(ele).html() + "<hr color='grey'>";
        });
      const back = $("body").html();
      if (!front || !back) {
        throw new Error(
          "EMPTY RESULT OF EXTRACTING FRONT OR BACK NOTES"
        );
      }
      const tags = $(".def-info.ddef-info")
        .toArray()
        .map((ele) =>
          $(ele).find("span[class*='epp-xref dxref']").html()
        )
        .filter((ele) => ele !== null);
      let tagResult = [];
      if (tags.length != 0) {
        const tagsDictinct = [...new Set(tags)].sort();
        tagResult = tagsDictinct;
      }
      deck.addNote(model.note([currentWord, front, back], tagResult));
      console.log(
        `[INFO] ${++cnt}/${files.length - 1
        } CURRENT WORD: ${currentWord}`
      );
    };
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      addNote(file, deck)
    }
  } catch (err) {
    writeToLog(`[ERR] UNKNONW ERROR ${err.message}`);
  }
}

async function convert() {
  const catas = fs.readdirSync(wordsPath)
  for (let i = 0; i < catas.length; i++) {
    const cata = catas[i];
    const cataPath = wordsPath + '/' + cata
    const title = '分类记单词::' + cata

    const deck = new anki.Deck(Date.now(), title);
    await processHtmlFilesNew(cataPath, deck);

    package.addDeck(deck);
  }
  package.writeToFile(DEFAULT_APKG_NAME);
}

convert();

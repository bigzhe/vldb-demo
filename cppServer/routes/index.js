var express = require('express');
var router = express.Router();

const fs = require('fs');

// TODO: Global Variable
const CPP_FILES_PATH = '../backend/include/application/'

const Prism = require('prismjs');
const loadLanguages = require("prismjs/components/");
console.log(loadLanguages);
loadLanguages(["cpp"]);

var NEW_LINE_EXP = /\n(?!$)/g;
var lineNumbersWrapper;

Prism.hooks.add('after-tokenize', function (env) {
  var match = env.code.match(NEW_LINE_EXP);
  var linesNum = match ? match.length + 1 : 1;
  var lines = new Array(linesNum + 1).join('<span></span>');

  lineNumbersWrapper = `<span aria-hidden="true" class="line-numbers-rows">${lines}</span>`;
});

/* GET cpp files list. */
router.get('/cpps', function (req, res, next) {
  fs.readdir(CPP_FILES_PATH, (err, files) => {
    return res.status(200).json(files)
  });

});

// GET cpp file content
router.get('/file/:filename', function (req, res, next) {
  const filename = req.params.filename

  const code = fs.readFileSync(CPP_FILES_PATH + filename, {
    encoding: 'utf-8'
  })

  let html = Prism.highlight(code, Prism.languages.cpp, 'cpp');
  html += lineNumbersWrapper
  // html += highlightWrapper

  


  return res.json({
    code,
    html,
  });
});


module.exports = router;
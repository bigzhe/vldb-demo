var express = require('express');
var router = express.Router();

const fs = require('fs');

// TODO: Global Variable
const CPP_FILES_PATH = '../backend/include/application/'

const Prism = require('prismjs');
const loadLanguages = require("prismjs/components/");
console.log(loadLanguages);
loadLanguages(["cpp"]);

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
  const html = Prism.highlight(code, Prism.languages.cpp, 'cpp');


  return res.json({
    code,
    html,
  });
});


module.exports = router;
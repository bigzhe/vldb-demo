var express = require('express');
var router = express.Router();

const fs = require('fs');

// TODO: Global Variable
const CPP_FILES_PATH = '../backend/include/application/'

/* GET cpp files list. */
router.get('/cpps', function (req, res, next) {
  fs.readdir(CPP_FILES_PATH, (err, files) => {
    return res.status(200).json(files)
  });

});

// GET cpp file content
router.get('/file/:filename', function (req, res, next) {
  const filename = req.params.filename
  return res.json({
    content: fs.readFileSync(CPP_FILES_PATH + filename, {
      encoding: 'utf-8'
    })
  });
});


module.exports = router;
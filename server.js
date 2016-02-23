var express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
var defaultPath = require('./fixtures/path.json');

const Redis = require('redis');
const redis = Redis.createClient();

var app = express();

app.use(cors());
app.use(bodyParser.json())

app.get('/:folderId', (req, res) => readFolder(req.params.folderId).then(function(docs) {
  res.json({
    path: [
      { title: "Arthur Flachs", rights: ["READ_PERMISSION"]  },
      { title: "Course Documents", rights: ["READ_PERMISSION"] },
      { title: "Economy", rights: ["READ_PERMISSION", "WRITE_PERMISSION"] }
    ],
    documents: docs
  });
}));

app.post('/', (req, res) => addDocument(req.body).then(addToFolder(1)).then(getDocument).then(d => res.json(d)));

app.delete('/:folder/:id', function(req, res) {
  deleteDocument(req.params.id)
    .then(() => deleteFromFolder(req.params.id, req.params.folder))
    .then(() => res.sendStatus(204));
});

function deleteFromFolder(docId, folderId) {
  return new Promise(resolve => redis.lrem(`folder:${folderId}`, [-1, docId], resolve));
}

function deleteDocument(docId) {
  return new Promise(function(resolve) {
    redis.del(`document:${docId}`, resolve);
  });
}

function addDocument(doc) {
  return getNextDocumentKey().then(function(nextDoc) {
    return new Promise(resolve => redis.hmset(`document:${nextDoc}`, [
      'rights',
      7,
      'title',
      doc.title,
      'type',
      doc.type,
      'updatedDate',
      doc.updatedDate,
      'source',
      doc.source,
      'token',
      doc.token
    ], () => resolve(nextDoc)));
  });
}

function readFolder(folder) {
  return new Promise(resolve => redis.lrange(`folder:${folder}`, 0, 20, function(err, docs) {
    Promise.all(docs.map(getDocument)).then(function(res) {
      resolve(res);
    });
  }));
}

const addToFolder = folderId => function(docId) {
  return new Promise(resolve => redis.lpush(`folder:${folderId}`, docId, () => resolve(docId)));
};

function getDocument(id) {
  return new Promise(function(resolve) {
    redis.hgetall(`document:${id}`, (err, res) => resolve(Object.assign(res, { id: id })));
  });
}

function getNextDocumentKey() {
  return new Promise((resolve, reject) => {
    redis.incr('documentNext', function(err, k) {
      resolve(k);
    })
  })
}

module.exports = app;

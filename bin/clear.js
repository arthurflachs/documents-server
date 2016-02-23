const redis = require('redis').createClient();

redis.del('folder:1', function(err, del) {
  deletedLog('folder:1');
})
redis.get('documentNext', function(err, total) {
  for (next = total; next > 0; next--) {
    redis.del(`document:${next}`, function(err, del) {
      deletedLog(`document:${next}`);
    });
  }

  redis.del(`documentNext`, function(err, del) {
    deletedLog('documentNext')
  })
});

function deletedLog(key) {
  console.log(`Deleted key:\t\t${key}`);
}

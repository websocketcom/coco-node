var cluster = require('cluster');
function eachWorker(cluster,callback) {
    for (var id in cluster.workers) {
        callback(cluster.workers[id]);
    }
}
if(cluster.isMaster) {
    var numWorkers = require('os').cpus().length;
    console.log('Master cluster setting up ' + numWorkers + ' workers...');
    for(var i = 0; i < 2; i++) {
        cluster.fork({MM: (new  Date()).getTime()});
    }
    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });
    cluster.on('exit', function(worker, code, signal) {
        console.log(worker.process.chainId);
    });
}

if (cluster.isWorker){
    worker.process.chainId = process.pid
    setTimeout(()=>{
        throw new Error(5555)
    },5000)
}



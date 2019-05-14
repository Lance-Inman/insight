let decoder = new TextDecoder("utf-8");
var fr = new FileReader();
function readFile(files){
    if(files.length > 0){
        let current_index = 0;
        fr.onload = function () {
            var data = fr.result;
            var array = new Int8Array(data);
            parseFile(decoder.decode(array));
            current_index++;
            if(current_index < files.length){
                fr.readAsArrayBuffer(files[current_index]);
            }
        };
        fr.readAsArrayBuffer(files[current_index]);
    }
}
function parseFile(data){
    data = data.split(/\n/);
    for(var x = 0;x<data.length;x++){
        let values = data[x].split("\t");
        let date = values[0];
        let gps_status = values[1];
        let event_code = values[2];
        let message = values[3];
    }
    console.log(data);
}
self.addEventListener("message", function(e) {
    console.log("Message Received");
    readFile(e.data);
}, false);
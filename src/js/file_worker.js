let decoder = new TextDecoder("utf-8");
var fr = new FileReader();
function readFile(files){
    if(files.length > 0){
        let current_index = 0;
        fr.onload = function () {
            console.log(current_index);
            var data = fr.result;
            var array = new Int8Array(data);
            current_index++;
            if(current_index < files.length){
                fr.readAsArrayBuffer(files[current_index]);
            }
        };
        fr.readAsArrayBuffer(files[current_index]);
    }
}
self.addEventListener("message", function(e) {
    console.log("Message Received");
    readFile(e.data);
}, false);
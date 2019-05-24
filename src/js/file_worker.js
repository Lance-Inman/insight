let decoder = new TextDecoder("utf-8");
var fr = new FileReader();
function readFile(files){
    if(files.length > 0){
        let current_index = 0;
        fr.onload = function () {
            var data = fr.result;
            var array = new Int8Array(data);
            current_index++;
            if(current_index < files.length){
                postMessage({
                    status: "data",
                    data: decoder.decode(array),
                    progress: current_index 
                });
                fr.readAsArrayBuffer(files[current_index]);
            }else{
                postMessage({status:"last"});
            }
        };
        fr.onerror = function(){
            postMessage({status:"error"});
        }
        fr.onabort = function(){
            postMessage({status:"abort"});
        }
        fr.readAsArrayBuffer(files[current_index]);
    }
}
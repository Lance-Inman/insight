var etd_list = [];
var reader = new FileReader();
var pageResultCount = 1000;
//If true, sorting does not take place
var doNotSort = false;
var results = document.createElement("div");
function readFiles(files) {
    //initialize the etd list
    etd_list = [];
    //If files are present
    if (files.length > 0) {
        document.getElementById("status").innerHTML = "Loading files...";
        //Sort files by date
        files = [].slice.call(files).sort(chronCompare);
        document.getElementById("status").innerHTML = "Parsing files...";
        //Initialize a webworker to read files
        let fileWorker = new Worker("js/file_worker.js");
        fileWorker.postMessage(files);
        //when message is received from file reader
        fileWorker.onmessage = function(message){
            //If it is a data update
            if (message.data.status == "data"){
                var multiplier = 100/files.length;
                var currentPercent = multiplier * (message.data.progress+1);
                console.log("parsed file " + (message.data.progress+1) + "/" + files.length);
                //Progress bar handler - maybe swap to an animation style but this works fine
                document.getElementById("grid-input-panel").setAttribute("style","background: linear-gradient(to right, " +
                " #4CAF50 0%,#4CAF50 "+currentPercent+"%,#424242 "+(currentPercent-1)+"%,#424242 100%);");
                parseETDFile(message.data.data,etd_list);
            //If its the last update
            }else if(message.data.status == "last"){
                for (var i = 0; i < etd_list.length; i++) {
                    addTable(etd_list[i]);
                }
                var resultPanel = document.getElementById("results-panel");
                var reparseButton = document.getElementById("reparse");
                reparseButton.style.display = "inherit";
                document.getElementById("status").innerHTML = "Done";
                document.getElementById("grid-input-panel").style.backgroundColor = "#4CAF50";
                toggleDropdown("options-dropdown-content");
                resultPanel.appendChild(results);
                reparseButton.addEventListener("click",function(){readFiles(files);});
            //If it is an error update
            }else if(message.data.status == "error"){
                console.log("reading operation encountered an error");
                document.getElementById("status").innerHTML = "Error reading file";
                document.getElementById("grid-input-panel").style.backgroundColor = "#F44336";
            //If it is an abort update
            }else if(message.data.status == "abort"){
                console.log("Reading operation aborted.");
                document.getElementById("status").innerHTML = "Aborted reading file";
                document.getElementById("grid-input-panel").style.backgroundColor = "#F44336";
            }
        }
    }else{
        document.getElementById("status").innerHTML = "No files selected";
        document.getElementById("grid-input-panel").setAttribute("style","background-color: #424242;");
    }
}
//Heap sort function - this seemed like the best way to sort the data if needed
function totalHeapSort(input){
    var array_length;
    var array = input;
    function heap_root(input, i) {
        var left = 2 * i + 1;
        var right = 2 * i + 2;
        var max = i;
        if (left < array_length && input[left][0] > input[max][0]) {
            max = left;
        }
        if (right < array_length && input[right][0] > input[max][0])     {
            max = right;
        }
        if (max != i) {
            swap(input, i, max);
            heap_root(input, max);
        }
    }
    function swap(input, index_A, index_B) {
        var temp = input[index_A];
        input[index_A] = input[index_B];
        input[index_B] = temp;
    }
    function heapSort(input) {
        array_length = input.length;
        for (var i = Math.floor(array_length / 2); i >= 0; i -= 1)      {
            heap_root(input, i);
        }
        for (i = input.length - 1; i > 0; i--) {
            swap(input, 0, i);
            array_length--;
            heap_root(input, 0);
        }
        return input;
    }
    heapSort(array);
    return array;
}
let hexMap = {
    "0x1":"Real Time Clock Not Set",
    "0x2":"Micro SD Card Not Installed",
    "0x3":"Brake Solenoid Not Connected",
    "0x4":"Pressure Transducer Not Connected",
    "0x5":"HVM Failure",
    "0x6":"GPS Not Connected That Should Be",
    "0x7":"LIS302 Accelerometer Not Present Led Code",
    "0x8":"Real Time Clock Not Functioning",
    "0x9":"HDSP2502 Display Failure",
    "0xA":"LM74CIM Temp Sensor Not Present",
    "0xB":"Voltage 3.3 Out Of Tolerance",
    "0xC":"Voltage 5.0 Out Of Tolerance",
    "0xD":"Voltage 12.0 Out Of Tolerance",
    "0xE":"Brake Solenoid Failed During Blow",
    "0xF":"Turbine Not Spinning",
    "0x10":"Turbine RPM Varying Too Much",
    "0x11":"Turbine RPM Out Of Spec VS Pressure",
    "0x12":"Turbine Voltage Out Of Spec VS RPM",
    "0x13":"CMX469 Modem Not Present",
    "0x14":"Charger Failure",
    "0x15":"Radio Not Connected",
    "0x16":"CPLD Not Present or Not Programmed",
    "0x17":"Micro SD Card Corrupted",
    "0x1D":"12.0 Voltage out of Tolerance",
    "0x100":"0x100 Pressure Data",
    "0x101":"Power On From Sleep Event",
    "0x102":"Power On From Reset Event",
    "0x103":"Power Down From Battery Low Event",
    "0x104":"Power Down From Layed On Side Event",
    "0x105":"E Brake Blow From Two Perfect Packets Event",
    "0x106":"E Brake Blow From One Perfect And One Corrected Packet Event",
    "0x107":"E Brake Blow From One Perfect Packet Event",
    "0x108":"E Brake Blow From Two Corrected Packets Event",
    "0x109":"E Brake Blow From One Corrected Packet Event",
    "0x10A":"Temperature Info Event",
    "0x10B":"External Charger Plugged In Event",
    "0x10C":"Kickstart Circuit Activated Event",
    "0x10D":"ETD Entered Bench Mode Event",
    "0x10E":"ETD Plugged into RS232 Event",
    "0x10F":"Turbine Beyond 10000 RPM Event",
    "0x110":"Good Received Packet Event",
    "0x111":"In Motion Event",
    "0x8111":"Motion Went Away Event",
    "0x112":"Marker Turning On Event",
    "0x113":"Arm Request Event",
    "0x114":"Battery Voltage Info Event",
    "0x115":"Turbine Voltage Info Event",
    "0x116":"Follow Up Data Event",
    "0x117":"Power Down From Button Hold Event",
    "0x118":"Charge Completion Event",
    "0x119":"Power On From Watchdog Reset Event",
    "0x11A":"Pressure Info Event",
    "0x11B":"RPM Info Event",
    "0x11C":"Power Down From No Air Event",
    "0x11D":"Power Down From Charger Unplugged Event",
    "0x11E":"Coordinate Info Event",
    "0x11F":"GPS Doesn't See Satellite",
    "0x120":"Radio Receive Event",
    "0x121":"Radio Power level Set Too High",
    "0x122":"Power Down From RTC GPS Update Event",
    "0x123":"Power Down From Unit Disable",
    "0x124":"Turbine Hours Cleared Event",
    "0x125":"Battery Hours Cleared Event",
    "0x126":"Location Update Sent In Event",
    "0x127":"RTC Updated From GPS Time Event",
    "0x128":"Radio Power Enabled Event",
    "0x129":"GPS Power Enabled Event",
    "0x12A":"Energy Conservation Mode Event",
    "0x12B":"Location Update Failed Event",
    "0x12C":"Accelerometer Info Event",
    "0x12D":"Radio Power Disabled Event",
    "0x12E":"Over PSI Event",
    "0x12F":"Emergency Dump Battery Load test Results Event",
    "0x130":"Charger Shutdown From Over Temperature PCB Event",
    "0x131":"Energy Conservation Enable Reason",
    "0x132":"Energy Conservation Disable Reason",
    "0x133":"GPS Cell Info Event",
    "0x134":"Turbine Shutoff Event",
    "0x135":"Arm Button Pressed Event",
    "0x136":"Battery Voltage Dropped Too Far After Charge Disable",
    "0x137":"Battery Voltage Started Too High",
    "0x138":"3.3 Rail Voltage Info Event",
    "0x139":"5.0 Rail Voltage Info Event",
    "0x13A":"GPS Detected Event",
    "0x13B":"Abuse Detected Freefall Event",
    "0x13C":"Abuse Detected High Impact Event",
}
//If you pass in a string of the hex code it will return what the hex code means in plain english
function hexToText(hex){
    if(hexMap[hex] != undefined){
        return hexMap[hex]
    }else{
        return null
    }
}
function addTable(etd) {
    // Create a dropdown panel for the etd
    var etdDropdown = document.createElement("div");
    etdDropdown.setAttribute("class", "etd-dropdown");
    var etdButton = document.createElement("button");
    etdButton.appendChild(document.createTextNode("ID: " + etd.id + ", V: " + etd.firmware + ", SN: " + etd.sn));
    etdButton.setAttribute("onclick", ("toggleDropdown(\""+(etd.id+"."+etd.firmware.replace('.', '')+"."+etd.sn)+"\")"));
    etdButton.setAttribute("class", "etd-dropdown-trigger");
    var etdDropdownContent = document.createElement("div");
    etdDropdownContent.setAttribute("id", (""+etd.id+"."+etd.firmware.replace('.', '')+"."+etd.sn));
    etdDropdownContent.setAttribute("class", "etd-dropdown-content");
    etdDropdown.appendChild(etdButton);
    //Graphing assigning variables
    var tempData = [];
    var batteryData = [];
    var turbVData = [];
    var pressureData = [];
    var rpmData = [];
    var fiveVoltRailData = [];
    var threeVoltRailData = [];
    var graphSet = [];
    var pluggedInData = [];
    var highImpactData = [];
    var freeFallData = [];
    var accelerometerData = [];
    //Time regex's
    var yearRegex = /[0-9]{4}/;
    var monthRegex = /[a-zA-Z]+/;
    var dayRegex = /^[0-9]{1,2}/;
    var timeRegex = /[0-9]{2}:[0-9]{2}:[0-9]{2}/;
    //Data regex's
    var batteryRegex = /(?:Info, )([0-9.]+(?=V))/;
    var batteryRegex2 = /(?:Battery V, )([0-9.]+(?=V))/;
    var temperatureRegex = /[-]*[0-9.]+(?=F)/;
    var turbVRegex = /(?:Turbine V, )([0-9.]+(?=V))/;
    var pressureRegex = /[0-9.]+(?=PSI)/;
    var rpmRegex = /[0-9.]+(?=RPM)/;
    var threeVoltRegex = /(?:3.3 Rail V, )([0-9.]+(?=V))/;
    var fiveVoltRegex = /(?:5.0 Rail V, )([0-9.]+(?=V))/;
    var zeroX100 = /(?:Pressure = )([0-9]+)/;
    var pluggedIn = /Charger Plugged In/;
    var highImpact = /ABUSE DETECTED - HIGH IMPACT/;
    var freeFall = /ABUSE DETECTED - FREEFALL/;
    var accelerometerNewDown = /[0-9.]+(?=G Down)/;
    var accelerometerNewUp = /[0-9.]+(?=G Up)/;
    var accelerometerNewFront = /[0-9.]+(?=G Front)/;
    var accelerometerNewBack = /[0-9.]+(?=G Back)/;
    var accelerometerNewLeft = /[0-9.]+(?=G Left)/;
    var accelerometerNewRight = /[0-9.]+(?=G Right)/;
    var accelerometerOldAll = /[0-9.-]+(?= [XYZ])/g;

    // For each hex code tracked by the etd
    var isEmpty = true;
    for(var code_num = 0; code_num < etd.tracked_codes.length; code_num++) {
        var outOfOrder = false;
        var tracked_code = etd.tracked_codes[code_num];
        var graphable = isGraphable(tracked_code.code);
        var typegraph = "";
        var showDataButton = document.createElement("button");
        if(tracked_code.logs.length === 0) continue;
        isEmpty = false;
        // Create a dropdown panel for the hex code
        var hexDropdown = document.createElement("div");
        hexDropdown.setAttribute("class", "hex-dropdown");
        var hexButton = document.createElement("button");
        if(hexToText(tracked_code.code) === null){
            hexButton.appendChild(document.createTextNode(tracked_code.code+": "+tracked_code.logs.length));
        }else{
            hexButton.appendChild(document.createTextNode(hexToText(tracked_code.code)+": "+tracked_code.logs.length));
        }
        hexButton.setAttribute("onclick", ("toggleDropdown(\""+(etd.id+"."+etd.firmware.replace('.', '')+"."+etd.sn+"."+code_num)+"-graph" +"\")"));
        hexButton.setAttribute("class", "hex-dropdown-trigger");
        var hexDropdownContent = document.createElement("div");
        hexDropdownContent.setAttribute("id", (""+(etd.id+"."+etd.firmware.replace('.', '')+"."+etd.sn+"."+code_num+"-graph")));
        hexDropdownContent.setAttribute("class", "hex-dropdown-content");
        hexDropdown.appendChild(hexButton);
        // If the hex code is graphable we will make a different structure compared to if its not graphable - if you
        // view the result, this basically just makes non graphables show up in a table and graphables to show a graph
        // with the option of showing the data, this is generally quicker to do it this way for graphables too
        if(graphable){
            //Create the toggle for the data below the graph
            showDataButton.setAttribute("class", "data-dropdown-trigger");
            showDataButton.setAttribute("onclick", ("toggleDropdown(\""+(etd.id+"."+etd.firmware.replace('.', '')+"."+etd.sn+"."+code_num)+"-data"+"\")"));
            showDataButton.innerHTML = "Toggle Data";
            var dataDropDownContent = document.createElement("div");
            dataDropDownContent.setAttribute("id", (""+(etd.id+"."+etd.firmware.replace('.', '')+"."+etd.sn+"."+code_num+"-data")));
            dataDropDownContent.setAttribute("class", "hex-dropdown-content");
        }
        // Create a table and table header
        var table = document.createElement("table");
        var header = document.createElement("tr");
        var td1 = document.createElement("th");
        var td2 = document.createElement("th");
        var td3 = document.createElement("th");
        var td4 = document.createElement("th");
        td1.appendChild(document.createTextNode("Time"));
        td2.appendChild(document.createTextNode("State"));
        td3.appendChild(document.createTextNode("Code"));
        td4.appendChild(document.createTextNode("Event"));
        header.appendChild(td1);
        header.appendChild(td2);
        header.appendChild(td3);
        header.appendChild(td4);
        table.appendChild(header);
        //This is lances addition - this doesnt make sense to me haha - keefer
        var lastDate = new Date();
        lastDate.setYear(100);
        //Holing the current page number for pagination
        var currentClassNumber = 0;
        var nextPageButton = $(document.createElement("button"));
        var prevPageButton = $(document.createElement("button"));
        var pageNumberHTMLDescription = $(document.createElement("p"));
        var maxPageNumberHTMLDescription = $(document.createElement("span"));
        var pageControlHolder = $(document.createElement("div"));
        pageControlHolder.addClass("pageControlHolder");
        nextPageButton.attr("code",tracked_code.code);
        prevPageButton.attr("code",tracked_code.code);
        pageNumberHTMLDescription.attr("style","display:inline-block");
        maxPageNumberHTMLDescription.attr("style","display:inline-block");
        pageNumberHTMLDescription.text("Page 1");
        nextPageButton.attr("currentPage","1");
        prevPageButton.attr("currentPage","1");
        prevPageButton.text("Previous Page");
        nextPageButton.text("Next Page");
        nextPageButton.addClass("nextPageButton");
        pageNumberHTMLDescription.append(maxPageNumberHTMLDescription);
        
        // For each log of the tracked code
        if(graphable){
            $(dataDropDownContent).append(pageControlHolder);
            $(pageControlHolder).append(prevPageButton);
            $(pageControlHolder).append(pageNumberHTMLDescription);
            $(pageControlHolder).append(nextPageButton);
        }else{
            $(hexDropdownContent).append(pageControlHolder);
            $(pageControlHolder).append(prevPageButton);
            $(pageControlHolder).append(pageNumberHTMLDescription);
            $(pageControlHolder).append(nextPageButton);
        }
        for(var log_num = 0; log_num < tracked_code.logs.length; log_num++) {
            // Create a table row
            var row = document.createElement("tr");
            //Zero works, so first index is 1
            if(log_num%pageResultCount === 0){
                currentClassNumber++;
            }
            //We want to show the first row
            if(currentClassNumber !== 1){
                row.setAttribute("style","display:none");
            }
            //Setting the class up for display swapping
            row.setAttribute("class",tracked_code.code + "-" + currentClassNumber);
            var values = tracked_code.logs[log_num].split('\t');
            td1 = document.createElement("td");
            td2 = document.createElement("td");
            td3 = document.createElement("td");
            td4 = document.createElement("td");
            td1.appendChild(document.createTextNode(values[0]));
            td2.appendChild(document.createTextNode(values[1]));
            td3.appendChild(document.createTextNode(values[2]));
            td4.appendChild(document.createTextNode(values[3]));
            if(graphable) {
                //-----------------------Graphing------------------------------//
                /*we start with the regex commands which need to be unique to each
                  set of data so that we don't have overlapping matching, hence the
                  Info, and Battery V, for batteryRegex and batteryRegex2 (the
                  reason for the two regexes is because our log files changed)
                */
                //Date Formatting
                document.getElementById("status").innerHTML = "Making graphs...";
                var yearRegexMatch = yearRegex.exec(values[0]);
                var monthRegexmatch = monthRegex.exec(values[0]);
                var dayRegexmatch = dayRegex.exec(values[0]);
                var timeRegexmatch = timeRegex.exec(values[0]);
                var month = changeMonthtoNumber(monthRegexmatch[0]);
                var date;
                try {
                    if (monthRegexmatch.length !== 0 && dayRegexmatch.length !== 0 && timeRegexmatch.length !== 0 && yearRegexMatch.length !== 0) {
                        date = new Date(yearRegexMatch[0] + "/" + month + "/" + dayRegexmatch[0] + " " + timeRegexmatch);
                        if(lastDate !== null){
                            //Added an offeset of 6 hours for the time to be off, this prevents very small errors from showing the message
                            if(lastDate.getTime() > (date.getTime() + 2.16e+7)){
                                outOfOrder = true;
                                console.log("Log content out of order");
                            }
                        }
                    } else {
                        console.log(values);
                    }
                } catch (err) {
                    console.log("Error In Log File, Data reads as:");
                    console.log(values);
                    continue;
                }
                lastDate = date;
                //We systematically regex check the values to see if it corresponds to a type
                function pushMatches(regex, date, string, graphName, dataset) {
                    var match = regex.exec(string);
                    if (match !== null) {
                        typegraph = graphName;
                        if (graphName === "temperature" || graphName === "pressure" || graphName === "rpm") {
                            dataset.push(([date, parseFloat(match[0])]));
                        } else {
                            dataset.push(([date, parseFloat(match[1])]));
                        }
                    }
                }
                //special handling for a code that has multiple value types
                if(tracked_code.code === "0x12C"){
                    var resultArray = [];
                    //Pushing the date here because it will need to be pushed before any of the function calls
                    resultArray.push(date);
                    function getNewAccelerometerData(){
                        var newDownMatch = accelerometerNewDown.exec(values[3]);
                        var newUpMatch = accelerometerNewUp.exec(values[3]);
                        var newFrontMatch = accelerometerNewFront.exec(values[3]);
                        var newBackMatch = accelerometerNewBack.exec(values[3]);
                        var newLeftMatch = accelerometerNewLeft.exec(values[3]);
                        var newRightMatch = accelerometerNewRight.exec(values[3]);
                        if(newDownMatch !== null){
                            resultArray.push(parseFloat(newDownMatch) * -1);
                        }else if(newUpMatch !== null){
                            resultArray.push(parseFloat(newUpMatch));
                        }
                        if(newFrontMatch !== null){
                            resultArray.push(parseFloat(newFrontMatch));
                        }else if(newBackMatch !== null){
                            resultArray.push(parseFloat(newBackMatch) * -1);
                        }
                        if(newLeftMatch !== null){
                            resultArray.push(parseFloat(newLeftMatch) * -1);
                            //returning true here because we can, and it will set the graphtype without
                            //extra checking of array size
                            return true;
                        }else if(newRightMatch !== null){
                            resultArray.push(parseFloat(newRightMatch));
                            //returning true here because we can, and it will set the graphtype without
                            //extra checking of array size
                            return true;
                        }
                    }
                    function getOldAccelerometerData(){
                        var allMatch = values[3].match(accelerometerOldAll);
                        var flag = false;
                        for(var x = 0;x<allMatch.length;x++){
                            //conversion factor of /50 since 50=1G with old sensors
                            resultArray.push((parseFloat(allMatch[x])/128)*2.3);
                            flag = true;
                        }
                        return flag;
                    }
                    if(typegraph === ""){
                        if(getNewAccelerometerData()){
                            typegraph = "newAccelerometer";
                        }
                        else if(getOldAccelerometerData()){
                            typegraph = "oldAccelerometer";
                        }
                    }else if(typegraph === "newAccelerometer"){
                        getNewAccelerometerData();
                    }else if(typegraph === "oldAccelerometer"){

                        getOldAccelerometerData();
                    }
                    accelerometerData.push(resultArray);
                }
                else if (typegraph === ""){
                    var match = pluggedIn.exec(values[3]);
                    if (match !== null) {
                        pluggedInData.push([date,1]);
                        typegraph = "pluggedIn";
                    }
                    var abuseMatch = highImpact.exec(values[3]);
                    if (abuseMatch !== null) {
                        highImpactData.push([date,1]);
                        typegraph = "highImpact";
                    }
                    var freeFallMatch = freeFall.exec(values[3]);
                    if(freeFallMatch !== null){
                        freeFallData.push([date,1]);
                        typegraph = "freeFall";
                    }
                    pushMatches(batteryRegex, date, values[3], "battery1", batteryData);
                    pushMatches(batteryRegex2, date, values[3], "battery2", batteryData);
                    pushMatches(temperatureRegex, date, values[3], "temperature", tempData);
                    pushMatches(turbVRegex, date, values[3], "turbineVoltage", turbVData);
                    pushMatches(pressureRegex, date, values[3], "pressure", pressureData);
                    pushMatches(rpmRegex, date, values[3], "rpm", rpmData);
                    pushMatches(threeVoltRegex, date, values[3], "threeVoltRail", threeVoltRailData);
                    pushMatches(fiveVoltRegex, date, values[3], "fiveVoltRail", fiveVoltRailData);
                    pushMatches(zeroX100, date, values[3], "pressure2", pressureData);
                } else if (typegraph === "battery1") {
                    pushMatches(batteryRegex, date, values[3], "battery1", batteryData);
                } else if (typegraph === "battery2") {
                    pushMatches(batteryRegex2, date, values[3], "battery2", batteryData);
                } else if (typegraph === "temperature") {
                    pushMatches(temperatureRegex, date, values[3], "temperature", tempData);
                } else if (typegraph === "turbineVoltage") {
                    pushMatches(turbVRegex, date, values[3], "turbineVoltage", turbVData);
                } else if (typegraph === "pressure") {
                    pushMatches(pressureRegex, date, values[3], "pressure", pressureData);
                    pushMatches(zeroX100, date, values[3], "pressure", pressureData);
                } else if (typegraph === "rpm") {
                    pushMatches(rpmRegex, date, values[3], "rpm", rpmData);
                } else if (typegraph === "threeVoltRail") {
                    pushMatches(threeVoltRegex, date, values[3], "threeVoltRail", threeVoltRailData);
                } else if (typegraph === "fiveVoltRail") {
                    pushMatches(fiveVoltRegex, date, values[3], "fiveVoltRail", fiveVoltRailData);
                } else if (typegraph === "pressure2") {
                    pushMatches(zeroX100, date, values[3], "pressure2", pressureData);
                }else if (typegraph === "pluggedIn") {
                    pluggedInData.push([date,1]);
                }else if (typegraph === "highImpact"){
                    highImpactData.push([date,1]);
                }else if (typegraph === "freeFall"){
                    freeFallData.push([date,1]);
                }
            }
            row.appendChild(td1);
            row.appendChild(td2);
            row.appendChild(td3);
            row.appendChild(td4);
            table.appendChild(row);
        }
        if(currentClassNumber === 1){
            if(graphable){
                nextPageButton.remove();
                prevPageButton.remove();
                pageNumberHTMLDescription.remove();
                maxPageNumberHTMLDescription.remove();
            }else{
                nextPageButton.remove();
                prevPageButton.remove();
                pageNumberHTMLDescription.remove();
                maxPageNumberHTMLDescription.remove();
            }
        }

        //Previous page button handler, it is down here because we need to know the max page number
        prevPageButton.on("click",function(){
            var current = $(this);
            var currentPage = current.next().next().attr("currentPage")
            var currentCode = current.attr('code');
            var currentPageHTML = $("." + currentCode + "-" + currentPage);
            var prevPageHTML = $("." + currentCode + "-" + (-1 + +currentPage))
            if(prevPageHTML.length === 0){
                current.next().next().attr('currentPage',currentClassNumber);
                prevPageHTML = $("." + currentCode + "-" + currentClassNumber);
                currentPageHTML.attr("style","display:none");
                prevPageHTML.attr("style","display:table row");
                var oldChildren = current.next().children();
                current.next().text("Page " + currentClassNumber);
                current.next().append(oldChildren);
            }else{
                currentPageHTML.attr("style","display:none");
                prevPageHTML.attr("style","display:table row");
                current.next().next().attr('currentPage',-1 + +current.next().next().attr("currentPage"));
                var oldChildren = current.next().children();
                current.next().text("Page " + (-1 + +currentPage));
                current.next().append(oldChildren);
            }
            console.log("." + currentCode + "-" + currentPage);
        });
        //Next page button handler, it is down here because previous has to be down here
        nextPageButton.on("click",function(){
            var current = $(this);
            var currentPage = current.attr("currentPage")
            var currentCode = current.attr('code');
            var currentPageHTML = $("." + currentCode + "-" + currentPage);
            var nextPageHTML = $("." + currentCode + "-" + (1 + +currentPage))
            if(nextPageHTML.length === 0){
                current.attr('currentPage',"1");
                nextPageHTML = $("." + currentCode + "-" + 1);
                currentPageHTML.attr("style","display:none");
                nextPageHTML.attr("style","display:table row");
                var oldChildren = current.prev().children();
                current.prev().text("Page " +1);
                current.prev().append(oldChildren);
            }else{
                currentPageHTML.attr("style","display:none");
                nextPageHTML.attr("style","display:table row");
                current.attr('currentPage',1 + +current.attr("currentPage"));
                var oldChildren = current.prev().children();
                current.prev().text("Page " + (1 + +currentPage));
                current.prev().append(oldChildren);
            }
            console.log("." + currentCode + "-" + currentPage);
        });
        /*For each of the if and else if statements we make sure that the graph type (or regex that matched)
          is of the correct type to make the graph, we then make a div and set up its attributes
          Finally we add an event listener to redraw the graph when you click on the graphs table button
        */
        if(graphable){
            if(tempData.length !== 0) {
                if (typegraph === "temperature") {
                    if(outOfOrder){
                        if(!doNotSort){
                            console.log("Sorting");
                            tempData = totalHeapSort(tempData);
                        }
                    }
                    graphSet.push(makegraph(tempData,"Temperature over Time","red","Degrees Fahrenheit",.7,hexDropdownContent,hexButton));
                    showDataButton.setAttribute("style","background-color:red;")
                }
            }
            if(turbVData.length !== 0) {
                if (typegraph === "turbineVoltage") {
                    if(outOfOrder){
                        if(!doNotSort){
                            console.log("Sorting");
                            turbVData = totalHeapSort(turbVData);
                        }
                    }
                    graphSet.push(makegraph(turbVData,"Turbine voltage over time","blue","Voltage",.7,hexDropdownContent,hexButton));
                    showDataButton.setAttribute("style","background-color:blue;")
                }
            }
            if(batteryData.length !== 0) {
                if (typegraph === "battery1" || typegraph === "battery2") {
                    if(outOfOrder){
                        if(!doNotSort) {
                            console.log("Sorting");
                            batteryData = totalHeapSort(batteryData);
                        }
                    }
                    graphSet.push(makegraph(batteryData,"Battery Voltage over Time","green","Battery Voltage",.7,hexDropdownContent,hexButton));
                    showDataButton.setAttribute("style","background-color:green;")
                }
            }
            if(pressureData.length !== 0) {
                if (typegraph === "pressure") {
                    if(outOfOrder){
                        if(!doNotSort) {
                            console.log("Sorting");
                            pressureData = totalHeapSort(pressureData);
                        }
                    }
                    graphSet.push(makegraph(pressureData,"Pressure over Time","purple","PSI",.7,hexDropdownContent,hexButton));
                    showDataButton.setAttribute("style","background-color:purple;")
                }
            }
            if(pressureData.length !== 0) {
                if (typegraph === "pressure2") {
                    if(outOfOrder){
                        if(!doNotSort) {
                            console.log("Sorting");
                            pressureData = totalHeapSort(pressureData);
                        }
                    }
                    graphSet.push(makegraph(pressureData,"Pressure over Time","purple","PSI",.7,hexDropdownContent,hexButton));
                    showDataButton.setAttribute("style","background-color:purple;")
                }
            }
            if(rpmData.length !== 0){
                if(typegraph === "rpm"){
                    if(outOfOrder){
                        if(!doNotSort) {
                            console.log("Sorting");
                            rpmData = totalHeapSort(rpmData);
                        }
                    }
                    graphSet.push(makegraph(rpmData,"Rotations per minute","orange","RPM",.7,hexDropdownContent,hexButton));
                    showDataButton.setAttribute("style","background-color:orange;")
                }
            }
            if(threeVoltRailData[0]!==null){
                if(typegraph === "fiveVoltRail"){
                    if(outOfOrder){
                        if(!doNotSort) {
                            console.log("Sorting");
                            threeVoltRailData = totalHeapSort(threeVoltRailData);
                        }
                    }
                    graphSet.push(makegraph(fiveVoltRailData,"5 Volt Rail Voltage","grey","Voltage",.7,hexDropdownContent,hexButton));
                    showDataButton.setAttribute("style","background-color:grey;")
                }
            }
            if(fiveVoltRailData[0]!==null){
                if(typegraph === "threeVoltRail"){
                    if(outOfOrder){
                        if(!doNotSort) {
                            console.log("Sorting");
                            fiveVoltRailData = totalHeapSort(fiveVoltRailData);
                        }
                    }
                    graphSet.push(makegraph(threeVoltRailData,"3.3 Volt Rail Voltage","grey","Voltage",.7,hexDropdownContent,hexButton));
                    showDataButton.setAttribute("style","background-color:grey;")
                }
            }
            if(pluggedInData.length !== 0){
                if(typegraph === "pluggedIn"){
                    if(outOfOrder){
                        if(!doNotSort) {
                            console.log("Sorting");
                            pluggedInData = totalHeapSort(pluggedInData);
                        }
                    }
                    graphSet.push(makegraph(pluggedInData,"Plugged in Instances","green","Instances",0,hexDropdownContent,hexButton));
                    showDataButton.setAttribute("style","background-color:green;")
                }
            }
            if(highImpactData[0]!== null){
                if(typegraph === "highImpact"){
                    if(outOfOrder){
                        if(!doNotSort) {
                            console.log("Sorting");
                            highImpactData = totalHeapSort(highImpactData);
                        }
                    }
                    graphSet.push(makegraph(highImpactData,"High Impact Instances","red","Instances",0,hexDropdownContent,hexButton));
                    showDataButton.setAttribute("style","background-color:red;")
                }
            }
            if(freeFallData[0]!== null){
                if(typegraph === "freeFall"){
                    if(outOfOrder){
                        if(!doNotSort) {
                            console.log("Sorting");
                            freeFallData = totalHeapSort(freeFallData);
                        }
                    }
                    graphSet.push(makegraph(freeFallData,"Free Fall Instances","red","Instances",0,hexDropdownContent,hexButton));
                    showDataButton.setAttribute("style","background-color:red;")
                }
            }
            if(accelerometerData.length !== 0){
                console.log("Accelerometer check passed")
                console.log(accelerometerData);
                if(outOfOrder){
                    if(!doNotSort) {
                        console.log("Sorting");
                        freeFallData = totalHeapSort(freeFallData);
                    }
                }
                var newgraph = document.createElement("div");
                newgraph.setAttribute("id", "graphdiv-" + name);
                newgraph.style.width = "100%";
                newgraph.style.color = "black";
                newgraph.style.backgroundColor = "white";
                hexDropdownContent.appendChild(newgraph);
                var nGraph = new Dygraph(
                newgraph,
                accelerometerData, {
                    legend: 'always',
                    title: name,
                    showRoller: true,
                    labels: ["x","Up-Down","Front-Back","Left-Right"],
                    strokeWidth: .7,
                    colors: ["gold","red","blue"],
                    drawPoints: true
                }
                );
                hexButton.addEventListener("click", function () {
                    nGraph.resize();
                });
                graphSet.push(nGraph);
            }
            hexDropdownContent.appendChild(showDataButton);
            dataDropDownContent.appendChild(table);
        }else{
            hexDropdownContent.appendChild(table)
        }
        maxPageNumberHTMLDescription.html("&nbsp;of " + currentClassNumber);
        hexDropdown.appendChild(hexDropdownContent);
        etdDropdownContent.appendChild(hexDropdown);
        $(hexDropdownContent).append(dataDropDownContent);
        //reassigning data back to nothing, as the graph was already made
        accelerometerData = [];
        pluggedInData = [];
        tempData = [];
        batteryData = [];
        turbVData = [];
        pressureData = [];
        rpmData = [];
        fiveVoltRailData = [];
        threeVoltRailData = [];
        highImpactData = [];
    }
    if(isEmpty) {
        console.log("empty");
        var empty = document.createElement("p");
        empty.appendChild(document.createTextNode("No parsed codes found"));
        etdDropdownContent.appendChild(empty);
    }
    if(graphSet.length > 1){
        var sync = Dygraph.synchronize(graphSet, {
            zoom: true,
            selection: true,
            range: false
        });
    }
    etdDropdown.appendChild(etdDropdownContent);
    results.appendChild(etdDropdown);
}
function makegraph(data,name,color,yaxisLabel,strokeWidth,parent,dropdown) {
    var newgraph = document.createElement("div");
    newgraph.setAttribute("id", "graphdiv-" + name);
    newgraph.style.width = "100%";
    newgraph.style.color = "black";
    newgraph.style.backgroundColor = "white";
    parent.appendChild(newgraph);
    var nGraph = new Dygraph(
        newgraph,
        data, {
            legend: 'always',
            title: name,
            showRoller: true,
            ylabel: yaxisLabel,
            xlabel: "Time",
            strokeWidth: strokeWidth,
            color: color,
            drawPoints: true
        }
    );
    dropdown.addEventListener("click", function () {
        nGraph.resize();
    });
    return nGraph;
}
let graphableMap = {
    "0x10B":true,
    "0x114":true,
    "0x115":true,
    "0x11A":true,
    "0x11B":true,
    "0x10A":true,
    "0x12C":true,
    "0x138":true,
    "0x139":true,
    "0x100":true,
    "0x13B":true,
    "0x13C":true,
}
//returns true if code is a graphable type - Such as battery voltage, board temp etc.
function isGraphable(hex){
    if(graphableMap[hex] != undefined){
        return graphableMap[hex]
    }else{
        return false
    }
}
//Changes month passed properly (Such as January with a capital J) to a value coresponding to that month like 01
function changeMonthtoNumber(month){
    var value = null;
    if(month === "January"){
        value = "01";
    }
    else if(month === "February"){
        value = "02";
    }
    else if(month === "March"){
        value = "03";
    }
    else if(month === "April"){
        value = "04";
    }
    else if(month === "May"){
        value = "05";
    }
    else if(month === "June"){
        value = "06";
    }
    else if(month === "July"){
        value = "07";
    }
    else if(month === "August"){
        value = "08";
    }
    else if(month === "September"){
        value = "09";
    }
    else if(month === "October"){
        value = "10";
    }
    else if(month === "November"){
        value = "11";
    }
    else if(month === "December"){
        value = "12";
    }
    return value;
}
function toggleDropdown(elementId) {
    document.getElementById(elementId).classList.toggle("show");
}
function createTrackedCode(code) {
    var obj = {};
    obj.code = code;
    obj.logs = [];
    return obj;
}
function createNewEtd(id, firmware, cpld, sn, customer, turbine_time, battery_time) {
    var obj = {
        id: id,
        firmware: firmware,
        cpld: cpld,
        sn: sn,
        customer: customer,
        turbine_time: turbine_time,
        battery_time: battery_time
    };
    obj.tracked_codes = [];
    obj.addCode = function(code) {
        this.tracked_codes.push(createTrackedCode(code));
    };
    obj.parse = function(line) {
        var values = line.split('\t');
        var code = values[2];

        for(var i = 0; i < this.tracked_codes.length; i++) {
            if(this.tracked_codes[i].code === code) {
                this.tracked_codes[i].logs.push(line);
            }
        }
    };
    obj.test = function() {
        console.log('tracked_codes.length: ');
        console.log(this.tracked_codes.length);
        console.log('logs.length');
        console.log(this.tracked_codes[0].logs.length);
    };
    obj.print = function() {
        console.log("ID: " + this.id);
        console.log("Firmware: " + this.firmware);
        console.log("Serial Number: " + this.sn);
        for(var code_num = 0; code_num < this.tracked_codes.length; code_num++) {
            //console.log("\t" + this.tracked_codes[code_num].code);
            for(var log_count = 0; log_count < this.tracked_codes[code_num].logs.length; log_count++) {
                //console.log("\t\t" + this.tracked_codes[code_num].logs[log_count]);
            }
        }
    };
    return obj;
}
let etd_header_regex = [
    {
        key: 'type',
        description: "eot",
        lines_after_header: 1,
        regex: /^EOT/,
    },
    {
        key: 'id',
        description: "Unit ID",
        lines_after_header: 1,
        regex: /[0-9]{1,5}/,
        match: 0
    },
    {
        key: 'firmware',
        description: "Firmware",
        lines_after_header: 2,
        regex: /[0-9]+.[0-9]+/,
        match: 0
    },
    {
        key: 'cpld',
        description: "CPLD",
        lines_after_header: 3,
        regex: /[0-9]+.[0-9]+/,
        match: 0
    },
    {
        key: 'sn',
        description: "Serial Number",
        lines_after_header: 4,
        regex: /(?:Processor Board Serial Number: |\G)(\-*[A-Za-z0-9 ]+)/,
        match: 1,
    },
    {
        key: 'customer',
        description: "Customer",
        lines_after_header: 5,
        regex: /(?:Customer ID: |\G)([A-Z]+)/,
        match: 0
    },
    {
        key: 'turbine_time',
        description: "Turbine Hours",
        lines_after_header: 6,
        regex: /(?:Turbine Time: |\G)([0-9]+.[0-9]+)/,
        match: 0
    },
    {
        key: 'battery_time',
        description: "Battery Hours",
        lines_after_header: 7,
        regex: /(?:Battery Time: |\G)([0-9]+.[0-9]+)/,
        match: 0
    },
]
let repeater_header_regex = [
    {
        key: 'type',
        description: "repeater",
        lines_after_header: 1,
        regex: /DPS 4040E Repeater/,
        match: 0
    },
    {
        key: 'firmware',
        description: "Firmware Version",
        lines_after_header: 1,
        regex: /V[0-9]+\.+[0-9]+/,
        match: 0
    },
    {
        key: 'crc',
        description: "CRC",
        lines_after_header: 1,
        regex: /CRC ([0-9]{1}x[A-F0-9]+)/,
        match: 1
    },
    {
        key: 'flash_bank',
        description: "Flash Bank",
        lines_after_header: 2,
        regex: /Flash Bank ([0-9]+)/,
        match: 1
    },
    {
        key: 'flash_bank_name',
        description: "Flash Bank Name",
        lines_after_header: 2,
        regex: /\- (.+)/,
        match: 1
    },
    {
        key: 'sn',
        description: "Serial Number",
        lines_after_header: 3,
        regex: /Processor Board Serial Number: ([0-9]+)/,
        match: 1
    },
    {
        key: 'unit',
        description: "Unit ID",
        lines_after_header: 4,
        regex: /UNIT ID: ([0-9]+)/,
        match: 1
    },
    {
        key: 'customer',
        description: "Customer",
        lines_after_header: 5,
        regex: /Customer ID: ([a-zA-Z]+)/,
        match: 1
    },
    {
        key: 'heater_control_status',
        description: "Heater Control Status",
        lines_after_header: 6,
        regex: /IS (.+)/,
        match: 1
    },
    {
        key: 'heater_control_temp',
        description: "Heater Control Temperature",
        lines_after_header: 7,
        regex: /[0-9]+\.[0-9]+F/,
        match: 0
    },
    {
        key: 'heater_control_hysteresis',
        description: "Heater Control Hysteresis",
        lines_after_header: 8,
        regex: /[0-9]+\.[0-9]+F/,
        match: 0
    },
]
function parseETDFile(data, etd_list) {
    if(!etd_list) {
        etd_list = [];
    }
    var lines = data.split("\n");
    var line;
    var this_etd;
    for (var line_num = 0; line_num < lines.length-1; line_num++) {
        try {
            line = lines[line_num];
            // If a log header is found
            if (line.charAt(0) === "-" && (line_num + 7 < lines.length)) {
                // Parse the header
                let parsedObject = {}
                let selected_regex = []
                let type = "";
                if(lines[line_num + 1].match(repeater_header_regex[0].regex) != null){
                    selected_regex = repeater_header_regex;
                    type="repeater";
                }else if(lines[line_num + 1].match(etd_header_regex[0].regex) != null){
                    selected_regex = etd_header_regex;
                    type="etd";
                }
                if(selected_regex.length == 0){
                    throw new Error("Unit not recognized");
                }
                for(var x = 1;x<selected_regex.length;x++){
                    let key = selected_regex[x].key;
                    let regex = selected_regex[x].regex;
                    let description = selected_regex[x].description;
                    let match_index = selected_regex[x].match;
                    let lines_after_header = selected_regex[x].lines_after_header;
                    let match = lines[line_num+lines_after_header].match(regex);
                    if(match != null && match[match_index] != undefined){
                        parsedObject[key] = match[match_index];
                        parsedObject[key + "_description"] = description;
                        console.log("Parsing key " + key + " resulted in match of: " + match[match_index]);
                    }else{
                        console.log(match);
                        console.warn("Parsing key " + key + " resulted in no match")
                    }
                }
                line_num += (selected_regex[selected_regex.length-1].lines_after_header + 4);
                console.log(lines[line_num]);
                // var id = lines[++line_num];
                // var firmware = lines[++line_num];
                // var cpld = lines[++line_num];
                // var sn = lines[++line_num];
                // var customer = lines[++line_num];
                // var turbine_time = lines[++line_num];
                // var battery_time = lines[++line_num];
                // //console.log(id + ", " + firmware + ", " + cpld + ", " + sn + ", " + customer + ", " + turbine_time + ", " + battery_time + ", ");

                // Create a new etd Object
                if(type=="etd"){
                    var new_etd = createNewEtd(parsedObject.id, parsedObject.firmware, parsedObject.cpld, parsedObject.sn, parsedObject.customer, parsedObject.turbine_time, parsedObject.battery_time);
                    // If the etd initialized successfully
                    console.log(new_etd);
                    if (new_etd) {
                        // Scan existing ETDs for a match with the new ETD
                        var match_found = false;
                        for (var etd_num = 0; etd_num < etd_list.length; etd_num++) {
                            var existing_etd = etd_list[etd_num];
                            // If a match is found, set the existing ETD at this_etd
                            if (new_etd.id === existing_etd.id
                                && new_etd.firmware === existing_etd.firmware
                                && new_etd.sn === existing_etd.sn) {
                                match_found = true;
                                this_etd = existing_etd;
                                existing_etd.turbine_time = new_etd.turbine_time;
                                existing_etd.battery_time = new_etd.battery_time;
                                break;
                            }
                        }
                        // If an existing ETD could not be found, set the new ETD as this_etd
                        if (match_found === false) {
                            etd_list.push(new_etd);
                            this_etd = new_etd;
                            loadOptions(this_etd);
                        }
                    }
                }
            } else if (this_etd) {
                this_etd.parse(line);
            }
        } catch (err) {
            console.log("Can not read '" + lines[line_num] + "'.");
        }
    }
    return etd_list;
}
function loadOptions(etd) {
    if(document.getElementById("custom-hex-input").value) {
        var codes = document.getElementById("custom-hex-input").value;
        codes = codes.replace("\"",'');
        codes = codes.replace(" ",'');
        codes = codes.split(',');
        for(var i = 0; i < codes.length; i++) {
            etd.addCode(codes[i]);
        }
    }
    if(document.querySelector('input[value="0x10A"]').checked) {
        etd.addCode("0x10A");
    }
    if(document.querySelector('input[value="0x10B"]').checked) {
        etd.addCode("0x10B");
    }
    if(document.querySelector('input[value="0x114"]').checked) {
        etd.addCode("0x114");
    }
    if(document.querySelector('input[value="0x115"]').checked) {
        etd.addCode("0x115");
    }
    if(document.querySelector('input[value="0x11A"]').checked) {
        if(document.querySelector('input[value="0x11A-extra"]').checked) {
            etd.addCode("0x100");
        }else{
            etd.addCode("0x11A");
        }
    }
    if(document.querySelector('input[value="0x11B"]').checked) {
        etd.addCode("0x11B");
    }
    if(document.querySelector('input[value="0x12C"]').checked) {
        etd.addCode("0x12C");
    }
    if(document.querySelector('input[value="0x138"]').checked) {
        etd.addCode("0x138");
    }
    if(document.querySelector('input[value="0x139"]').checked) {
        etd.addCode("0x139");
    }
    if(document.querySelector('input[value="critical"]').checked) {
        etd.addCode("0x1");
        etd.addCode("0x3");
        etd.addCode("0x4");
        etd.addCode("0x5");
        etd.addCode("0x6");
        etd.addCode("0x7");
        etd.addCode("0x8");
        etd.addCode("0x9");
        etd.addCode("0xA");
        etd.addCode("0xB");
        etd.addCode("0xC");
        etd.addCode("0xD");
        etd.addCode("0xE");
        etd.addCode("0xF");
        etd.addCode("0x10");
        etd.addCode("0x11");
        etd.addCode("0x12");
        etd.addCode("0x13");
        etd.addCode("0x14");
        etd.addCode("0x15");
        etd.addCode("0x16");
        etd.addCode("0x17");
        etd.addCode("0x1D");
        etd.addCode("0x12E");
        etd.addCode("0x13B");
        etd.addCode("0x13C");
    }
}
//--------------------Creating extra element on 0x11A------------------------//
var insertedelement = document.createElement("div");
var inputed = document.createElement("input");
var inputedLabel = document.createElement("label");
//adding attributes to elements
insertedelement.setAttribute("id","0x11A-extra-checkbox-div");
insertedelement.setAttribute("style","margin-left:20px;margin-bottom:5px;");
inputed.setAttribute("type","checkbox");
inputed.setAttribute("name","hex-code");
inputed.setAttribute("id","0x11A-extra");
inputed.setAttribute("value","0x11A-extra");
inputedLabel.setAttribute("for","0x11A-extra");
inputedLabel.innerHTML = "Use EOT Transmit Data? Warning: Much more points, slower load times";
//appending children
if(document.getElementById("0x11A").checked){
    insertAfter(insertedelement,document.getElementById("0x11A-checkbox-div"));
}
insertedelement.appendChild(inputed);
insertedelement.appendChild(inputedLabel);
//adding action listeners
document.getElementById("0x11A").addEventListener("click", function (){
    if(document.getElementById("0x11A-extra-checkbox-div") === null){
        if(document.getElementById("0x11A").checked){
            insertAfter(insertedelement,document.getElementById("0x11A-checkbox-div"));
        }
    }
    else{
        var element = document.getElementById("0x11A-extra-checkbox-div");
        element.parentNode.removeChild(element);
    }
});
//----------------------------------End--------------------------------------//
//function to insert am element after the reference
function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function chronCompare(a, b) {
    a = a.name;
    b = b.name;
    var aYear = a.match(/(?:[0-9]+[A-Z]+|\G)([0-9]+)/);
    var bYear = b.match(/(?:[0-9]+[A-Z]+|\G)([0-9]+)/);
    if (aYear && bYear) {
        aYear = parseInt(aYear[1]);
        bYear = parseInt(bYear[1]);
        if (aYear < bYear) {
            return -1;
        }
        if (bYear < aYear) {
            return 1;
        }
    }
    var aMonth = a.match(/(?:[0-9]+|\G)([A-Z]+)/);
    var bMonth = b.match(/(?:[0-9]+|\G)([A-Z]+)/);
    if (aMonth && bMonth) {
        aMonth = aMonth[1];
        bMonth = bMonth[1];
        if (aMonth !== bMonth) {
            var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            aMonth = months.indexOf(aMonth);
            bMonth = months.indexOf(bMonth);
            if (aMonth < 0 || bMonth < 0) {
                return 0;
            }
            if (aMonth < bMonth) {
                return -1;
            }
            if (bMonth < aMonth) {
                return 1;
            }
        }
    }
    var aDay = parseInt(a.match(/[0-9]+/));
    var bDay = parseInt(b.match(/[0-9]+/));
    if (aDay < bDay) {
        return -1;
    }
    if (bDay < aDay) {
        return 1;
    }
    return 0;
}

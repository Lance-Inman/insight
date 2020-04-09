var device_list = [];
var reader = undefined;
var pageResultCount = 1000;
//If true, sorting does not take place
var doNotSort = false;
function readFiles(files) {
    reader = new FileReader();
    device_list = [];
    var index = 0;
    reader.onerror =
        function () {
            console.log("reading operation encountered an error");
            document.getElementById("status").innerHTML = "Error reading file";
            document.getElementById("grid-input-panel").style.backgroundColor = "#F44336";
        };
    reader.onabort =
        function () {
            console.log("Reading operation aborted.");
            document.getElementById("status").innerHTML = "Aborted reading file";
            document.getElementById("grid-input-panel").style.backgroundColor = "#F44336";
        };
    reader.onloadstart =
        function () {
        };
    reader.onload =
        function () {
            console.log("parsed file " + (index+1) + "/" + files.length);
            //Progress bar handler - maybe swap to an animation style but this works fine
            var multiplier = 100/files.length;
            var currentPercent = multiplier * (index+1);
            document.getElementById("grid-input-panel").setAttribute("style","background: linear-gradient(to right, " +
                " #4CAF50 0%,#4CAF50 "+currentPercent+"%,#424242 "+(currentPercent-1)+"%,#424242 100%);");
            device_list = parseDeviceFile(reader, device_list);
            if (index + 1 < files.length) {
                reader.readAsText(files[++index]);
            } else {
                document.getElementById("results-panel").innerHTML = "";
                console.log("parsed " + device_list.length + " unique devices");
                for (var i = 0; i < device_list.length; i++) {
                    addTable(device_list[i]);
                }
                document.getElementById("status").innerHTML = "Done";
                document.getElementById("grid-input-panel").style.backgroundColor = "#4CAF50";
                toggleDropdown("options-dropdown-content");
                var reparseButton = document.getElementById("reparse");
                reparseButton.style.display = "inherit";
                reparseButton.addEventListener("click",function(){readFiles(files);});
            }
        };
    reader.onloadend =
        function () {
        };
    if (files.length > 0) {
        document.getElementById("status").innerHTML = "Loading files...";
        files = [].slice.call(files).sort(chronCompare);
        document.getElementById("status").innerHTML = "Parsing files...";
        reader.readAsText(files[0]);
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
// hex to text mapping
let hexToText = {
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
//returns true if code is a graphable type - Such as battery voltage, board temp etc.
let isGraphable = {
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
let graph_settings_map = {
    "temperature": {
        name: "Temperature over time",
        color: "red",
        y_axis: "Degrees Fehrenheit",
        line_width: .7,
        button_color: "red",
    },
    "turbineVoltage": {
        name: "Turbine voltage over time",
        color: "blue",
        y_axis: "Voltage",
        line_width: .7,
        button_color: "blue",
    },
    "battery1": {
        name: "Battery Voltage over Time",
        color: "green",
        y_axis: "Battery Voltage",
        line_width: .7,
        button_color: "green",
    },
    "pressure": {
        name: "Pressure over Time",
        color: "purple",
        y_axis: "PSI",
        line_width: .7,
        button_color: "purple",
    },
    "rpm":{
        name: "Rotations per minute",
        color: "orange",
        y_axis: "RPM",
        line_width: .7,
        button_color: "orange",
    },
    "threeVoltRail": {
        name: "5 Volt Rail Voltage",
        color: "gray",
        y_axis: "Voltage",
        line_width: .7,
        button_color: "gray",
    },
    "fiveVoltRail": {
        name: "3.3 Volt Rail Voltage",
        color: "gray",
        y_axis: "Voltage",
        line_width: .7,
        button_color: "gray",
    },
    "pluggedIn": {
        name: "Plugged in Instances",
        color: "green",
        y_axis: "Instances",
        line_width: 0,
        button_color: "green",
    },
    "highImpact": {
        name: "High Impact Instances",
        color: "red",
        y_axis: "Instances",
        line_width: 0,
        button_color: "red",
    },
    "freeFall": {
        name: "Free Fall Instances",
        color: "red",
        y_axis: "Instances",
        line_width: 0,
        button_color: "red",
    },
}
//aliases
graph_settings_map.pressure2 = graph_settings_map.pressure;
graph_settings_map.battery2 = graph_settings_map.battery1
//Month to number mapping 
let monthToNumber = {
    "January": "01",
    "February":"02",
    "March":"03",
    "April":"04",
    "May":"05",
    "June":"06",
    "July":"07",
    "August":"08",
    "September":"09",
    "October":"10",
    "November":"11",
    "December":"12",
}
function addTable(device) {
    // Create a dropdown panel for the device
    var deviceDropdown = document.createElement("div");
    deviceDropdown.setAttribute("class", "device-dropdown");
    var deviceButton = document.createElement("button");
    deviceButton.appendChild(document.createTextNode("ID: " + device.unit_number + ", V: " + device.firmware + ", SN: " + device.serial_number));
    deviceButton.onclick = function(){
        toggleDropdown(device.unit_number+"."+device.firmware.replace('.', '')+"."+device.serial_number);  
    }
    deviceButton.setAttribute("class", "device-dropdown-trigger");
    var deviceDropdownContent = document.createElement("div");
    deviceDropdownContent.setAttribute("id", (""+device.unit_number+"."+device.firmware.replace('.', '')+"."+device.serial_number));
    deviceDropdownContent.setAttribute("class", "device-dropdown-content");
    deviceDropdown.appendChild(deviceButton);
    let graphSet = []
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
    // For each hex code tracked by the device
    var isEmpty = true;
    let keys = Object.keys(device.tracked_codes);
    for(var code_num = 0; code_num < keys.length; code_num++) {
        var outOfOrder = false;
        // the code we are currently on
        let parsed_data = []
        let hex_code = keys[code_num];
        // the logs of the current tracked code
        let logs = device.tracked_codes[hex_code].logs;
        var graphable = isGraphable[hex_code] == true ? true : false;
        var typegraph = "";
        var showDataButton = document.createElement("button");
        if(logs.length === 0) continue;
        isEmpty = false;
        // Create a dropdown panel for the hex code
        var hexDropdown = document.createElement("div");
        hexDropdown.setAttribute("class", "hex-dropdown");
        var hexButton = document.createElement("button");
        if(hexToText[hex_code] == undefined){
            hexButton.appendChild(document.createTextNode(hex_code + ": " + logs.length));
        }else{
            hexButton.appendChild(document.createTextNode(hexToText[hex_code] + ": " + logs.length));
        }
        hexButton.setAttribute("onclick", ("toggleDropdown(\""+(device.id+"."+device.firmware.replace('.', '')+"."+device.sn+"."+code_num)+"-graph" +"\")"));
        hexButton.setAttribute("class", "hex-dropdown-trigger");
        var hexDropdownContent = document.createElement("div");
        hexDropdownContent.setAttribute("id", (""+(device.id+"."+device.firmware.replace('.', '')+"."+device.sn+"."+code_num+"-graph")));
        hexDropdownContent.setAttribute("class", "hex-dropdown-content");
        hexDropdown.appendChild(hexButton);
        // If the hex code is graphable we will make a different structure compared to if its not graphable - if you
        // view the result, this basically just makes non graphables show up in a table and graphables to show a graph
        // with the option of showing the data, this is generally quicker to do it this way for graphables too
        if(graphable){
            //Create the toggle for the data below the graph
            showDataButton.setAttribute("class", "data-dropdown-trigger");
            showDataButton.setAttribute("onclick", ("toggleDropdown(\""+(device.id+"."+device.firmware.replace('.', '')+"."+device.sn+"."+code_num)+"-data"+"\")"));
            showDataButton.innerHTML = "Toggle Data";
            var dataDropDownContent = document.createElement("div");
            dataDropDownContent.setAttribute("id", ("" + (device.id + "." + device.firmware.replace('.', '') + "." + device.sn + "." + code_num + "-data")));
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
        // This is lances addition - this doesnt make sense to me haha - keefer
        var lastDate = new Date();
        lastDate.setYear(100);
        // Holding the current page number for pagination
        var currentClassNumber = 0;
        var nextPageButton = $(document.createElement("button"));
        var prevPageButton = $(document.createElement("button"));
        var pageNumberHTMLDescription = $(document.createElement("p"));
        var maxPageNumberHTMLDescription = $(document.createElement("span"));
        var pageControlHolder = $(document.createElement("div"));
        pageControlHolder.addClass("pageControlHolder");
        nextPageButton.attr("code",hex_code);
        prevPageButton.attr("code",hex_code);
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
        for(var log_num = 0; log_num < logs.length; log_num++) {
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
            row.setAttribute("class",hex_code + "-" + currentClassNumber);
            var values = logs[log_num].split('\t');
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
                var month = monthToNumber[monthRegexmatch[0]];
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
                function pushMatches(regex, date, string, graphName) {
                    var match = regex.exec(string);
                    if (match !== null) {
                        typegraph = graphName;
                        if (graphName === "temperature" || graphName === "pressure" || graphName === "rpm") {
                            parsed_data.push(([date, parseFloat(match[0])]));
                        } else {
                            parsed_data.push(([date, parseFloat(match[1])]));
                        }
                    }
                }
                //special handling for a code that has multiple value types
                if(hex_code === "0x12C"){
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
                    parsed_data.push(resultArray);
                }
                else if (typegraph === ""){
                    var match = pluggedIn.exec(values[3]);
                    if (match !== null) {
                        parsed_data.push([date,1]);
                        typegraph = "pluggedIn";
                    }
                    var abuseMatch = highImpact.exec(values[3]);
                    if (abuseMatch !== null) {
                        parsed_data.push([date,1]);
                        typegraph = "highImpact";
                    }
                    var freeFallMatch = freeFall.exec(values[3]);
                    if(freeFallMatch !== null){
                        parsed_data.push([date,1]);
                        typegraph = "freeFall";
                    }
                    pushMatches(batteryRegex, date, values[3], "battery1");
                    pushMatches(batteryRegex2, date, values[3], "battery2");
                    pushMatches(temperatureRegex, date, values[3], "temperature");
                    pushMatches(turbVRegex, date, values[3], "turbineVoltage");
                    pushMatches(pressureRegex, date, values[3], "pressure");
                    pushMatches(rpmRegex, date, values[3], "rpm");
                    pushMatches(threeVoltRegex, date, values[3], "threeVoltRail");
                    pushMatches(fiveVoltRegex, date, values[3], "fiveVoltRail");
                    pushMatches(zeroX100, date, values[3], "pressure2");
                } else if (typegraph === "battery1") {
                    pushMatches(batteryRegex, date, values[3], "battery1");
                } else if (typegraph === "battery2") {
                    pushMatches(batteryRegex2, date, values[3], "battery2");
                } else if (typegraph === "temperature") {
                    pushMatches(temperatureRegex, date, values[3], "temperature");
                } else if (typegraph === "turbineVoltage") {
                    pushMatches(turbVRegex, date, values[3], "turbineVoltage");
                } else if (typegraph === "pressure") {
                    pushMatches(pressureRegex, date, values[3], "pressure");
                    pushMatches(zeroX100, date, values[3], "pressure");
                } else if (typegraph === "rpm") {
                    pushMatches(rpmRegex, date, values[3], "rpm");
                } else if (typegraph === "threeVoltRail") {
                    pushMatches(threeVoltRegex, date, values[3], "threeVoltRail");
                } else if (typegraph === "fiveVoltRail") {
                    pushMatches(fiveVoltRegex, date, values[3], "fiveVoltRail");
                } else if (typegraph === "pressure2") {
                    pushMatches(zeroX100, date, values[3], "pressure2");
                }else if (typegraph === "pluggedIn") {
                    parsed_data.push([date,1]);
                }else if (typegraph === "highImpact"){
                    parsed_data.push([date,1]);
                }else if (typegraph === "freeFall"){
                    parsed_data.push([date,1]);
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
            // special cases
            // TODO: Make graph_settings_map handle custom cases with functions
            if(typegraph == "newAccelerometer" || typegraph == "oldAccelerometer"){
                console.log("Accelerometer check passed")
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
                parsed_data, {
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
            else if(parsed_data.length != 0){
                if(outOfOrder){
                    if(!doNotSort){
                        console.log("Sorting");
                        parsed_data = totalHeapSort(parsed_data);
                    }
                }
                let settings = graph_settings_map[typegraph];
                console.log(typegraph)
                graphSet.push(makegraph(parsed_data,settings.name, settings.color, settings.y_axis, settings.line_width, hexDropdownContent, hexButton));
                showDataButton.setAttribute("style","background-color:" + settings.button_color + ";")
            }
            hexDropdownContent.appendChild(showDataButton);
            dataDropDownContent.appendChild(table);
        }else{
            hexDropdownContent.appendChild(table)
        }
        maxPageNumberHTMLDescription.html("&nbsp;of " + currentClassNumber);
        hexDropdown.appendChild(hexDropdownContent);
        deviceDropdownContent.appendChild(hexDropdown);
        $(hexDropdownContent).append(dataDropDownContent);
    }
    if(isEmpty) {
        console.log("empty");
        var empty = document.createElement("p");
        empty.appendChild(document.createTextNode("No parsed codes found"));
        deviceDropdownContent.appendChild(empty);
    }
    if(graphSet.length > 1){
        var sync = Dygraph.synchronize(graphSet, {
            zoom: true,
            selection: true,
            range: false
        });
    }
    deviceDropdown.appendChild(deviceDropdownContent);
    var element = document.getElementById("results-panel");
    element.appendChild(deviceDropdown);
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
function toggleDropdown(elementId) {
    document.getElementById(elementId).classList.toggle("show");
}
function createTrackedCode(code) {
    var obj = {};
    obj.code = code;
    obj.logs = [];
    return obj;
}
function createNewDevice(obj){//id, firmware, cpld, sn, customer, turbine_time, battery_time) {
    obj.tracked_codes = {};
    obj.addCode = function(code) {
        this.tracked_codes[code] = {
            logs: [],
        }
    };
    obj.parse = function(line) {
        var values = line.split('\t');
        var code = values[2];
        // cut down for loop, now using a hash to add elements to logs
        if(this.tracked_codes[code] != undefined) {
            this.tracked_codes[code].logs.push(line);
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
let device_specifications = {
    device: function(header){
        //DPS 4040E Repeater Firmware V1.04 TEST 15, CRC 0xE976
        //Head of Train Device Firmware V3.00 TEST 5, CRC 0x7929
        //EOT UNIT ID 1321
        let etd = /^EOT UNIT ID/;
        let htd = /^Head of Train Device Firmware/;
        let rpt = /^DPS 4040E Repeater Firmware/;
        for(let line of header){
            let etd_m = line.match(etd);
            if(etd_m != null){
                return "2020 He ETD";
            }
            let htd_m = line.match(htd);
            if(htd_m != null){
                return "HTD"
            }
            let rpt_m = line.match(rpt);
            if(rpt_m != null){
                return "4040E Repeater"
            }
        }
    },
    firmware: function(header){
        //DPS 4040E Repeater Firmware V1.04 TEST 15, CRC 0xE976
        //Head of Train Device Firmware V3.00 TEST 5, CRC 0x7929
        //Firmware V3.45
        let regexes = [
            /(DPS 4040E Repeater Firmware V)([0-9\.]+)/,
            /(Head of Train Device Firmware V)([0-9\.]+)/,
            /(^Firmware V)([0-9\.]+)/
        ]
        let match = matchAgainstHeader(header, regexes, 2);
        if(match == undefined){
            console.log("COULDNT MATCH FIRMWARE!!!")
            console.log(header)
        }
        return match 
    },
    cpld: function(header){
        //CPLD V0.02
        let regex = [/(^CPLD V)([0-9\.]+)/]
        return matchAgainstHeader(header, regex, 2);
    },
    serial_number: function(header){
        //Processor Board Serial Number: 305404176
        let regex = [/(^Processor Board Serial Number: )([0-9A-Z ]+)/]
        return matchAgainstHeader(header, regex, 2);
    },
    unit_number: function(header){
        //4040-E Repeater UNIT ID: 281
        //EOT UNIT ID 1321
        //HOT UNIT ID: 0
        let regexes = [
            /(^4040-E Repeater UNIT ID: )([0-9]+)/,
            /(^EOT UNIT ID )([0-9]+)/,
            /(^HOT UNIT ID: )([0-9]+)/
        ]
        return matchAgainstHeader(header, regexes, 2);
    },
    customer: function(header){
        //Customer ID: UPR
        //same
        let regex = [/(^Customer ID: )([a-zA-Z ]+)/]
        return matchAgainstHeader(header, regex, 2);
    },
    //only EOT
    turbine_time: function(header){
        //Turbine Time: 3036.229492 Hours
        //Battery Time: 4490.164551 Hours
        let regex = [/(^Turbine Time: )([0-9]+\.[0-9]+)( Hours)/]
        return matchAgainstHeader(header, regex, 2);
    },
    battery_time: function(header){
        let regex = [/(^Battery Time: )([0-9]+\.[0-9]+)( Hours)/]
        return matchAgainstHeader(header, regex, 2);
    },
}
// originally the idea was that we would hit the whole header at once,
// but providing the ability to use ^ and $ in the regexes was something
// thought to be important
function matchAgainstHeader(header, regexes, index){
    for(let line of header){
        for(let regex of regexes){
            let match = line.match(regex);
            if(match != undefined){
                if(match[index] != undefined){
                    return match[index]
                }
                return undefined;
            }
        }
    }
    return undefined;
}
function getDataObject(header){
    let keys = Object.keys(device_specifications);
    let data = {}
    for(let key of keys){
        let result = device_specifications[key](header);
        if(result != undefined){
            data[key] = result;
        }
    }
    return data;
}
function parseDeviceFile(reader, device_list) {
    if(!device_list) {
        device_list = [];
    }
    var lines = reader.result.split("\n");
    var line;
    var this_device;
    for (var line_num = 0; line_num < lines.length-1; line_num++) {
        line = lines[line_num];
        // If a log header is found
        // sample top to check for a header
        if(line.substring(0,4) == "----"){
            let count = 1;
            let header = [];
            let error = undefined;
            line = lines[line_num + count];
            // the next time we reach a ---- the header has ended
            while(line.substring(0,4) != "----"){
                header.push(line);
                if(count == 50){
                    error = "No known header matches";
                    break;
                }
                if(line_num + count > lines.length-1){
                    error = "Reached end of file before matching header";
                    break;
                }
                count++;
                line = lines[line_num + count];
            }
            if(error != undefined){
                console.warn(error);
                continue;
            }else{
                console.log("Header found!");
                line_num += count + 2;
                console.log(header)
                let obj = getDataObject(header)
                // we need these values for parsing, consider invalid if not present
                if(obj.firmware == undefined || obj.unit_number == undefined || obj.serial_number == undefined){
                    continue;
                }
                var new_device = createNewDevice(obj);
                // If the device initialized successfully
                if (new_device) {
                    // Scan existing devices for a match with the new device
                    var match_found = false;
                    for (var device_num = 0; device_num < device_list.length; device_num++) {
                        var existing_device = device_list[device_num];
                        // If a match is found, set the existing device at this_device
                        if (new_device.device === existing_device.device
                            && new_device.unit_number === existing_device.unit_number
                            && new_device.firmware === existing_device.firmware
                            && new_device.serial_number === existing_device.serial_number) {
                            match_found = true;
                            this_device = existing_device;
                            existing_device.turbine_time = new_device.turbine_time;
                            existing_device.battery_time = new_device.battery_time;
                            break;
                        }
                    }
                    // If an existing Device could not be found, set the new Device as this_device
                    if (match_found === false) {
                        device_list.push(new_device);
                        this_device = new_device;
                        loadOptions(this_device);
                    }
                }
                continue;
            }
        }else if(this_device){
            this_device.parse(line)
        }
    }
    return device_list;
}
function loadOptions(device) {
    if(document.getElementById("custom-hex-input").value) {
        var codes = document.getElementById("custom-hex-input").value;
        codes = codes.replace("\"",'');
        codes = codes.replace(" ",'');
        codes = codes.split(',');
        for(var i = 0; i < codes.length; i++) {
            device.addCode(codes[i]);
        }
    }
    if(document.querySelector('input[value="0x10A"]').checked) {
        device.addCode("0x10A");
    }
    if(document.querySelector('input[value="0x10B"]').checked) {
        device.addCode("0x10B");
    }
    if(document.querySelector('input[value="0x114"]').checked) {
        device.addCode("0x114");
    }
    if(document.querySelector('input[value="0x115"]').checked) {
        device.addCode("0x115");
    }
    if(document.querySelector('input[value="0x11A"]').checked) {
        if(document.querySelector('input[value="0x11A-extra"]').checked) {
            device.addCode("0x100");
        }else{
            device.addCode("0x11A");
        }
    }
    if(document.querySelector('input[value="0x11B"]').checked) {
        device.addCode("0x11B");
    }
    if(document.querySelector('input[value="0x12C"]').checked) {
        device.addCode("0x12C");
    }
    if(document.querySelector('input[value="0x138"]').checked) {
        device.addCode("0x138");
    }
    if(document.querySelector('input[value="0x139"]').checked) {
        device.addCode("0x139");
    }
    if(document.querySelector('input[value="critical"]').checked) {
        device.addCode("0x1");
        device.addCode("0x3");
        device.addCode("0x4");
        device.addCode("0x5");
        device.addCode("0x6");
        device.addCode("0x7");
        device.addCode("0x8");
        device.addCode("0x9");
        device.addCode("0xA");
        device.addCode("0xB");
        device.addCode("0xC");
        device.addCode("0xD");
        device.addCode("0xE");
        device.addCode("0xF");
        device.addCode("0x10");
        device.addCode("0x11");
        device.addCode("0x12");
        device.addCode("0x13");
        device.addCode("0x14");
        device.addCode("0x15");
        device.addCode("0x16");
        device.addCode("0x17");
        device.addCode("0x1D");
        device.addCode("0x12E");
        device.addCode("0x13B");
        device.addCode("0x13C");
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

var etd_list = [];
var reader = new FileReader();
var pageResultCount = 1000;
//If true, sorting does not take place
var doNotSort = false;
function readFiles(files) {
    etd_list = [];
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
            etd_list = parseETDFile(reader, etd_list);
            if (index + 1 < files.length) {
                reader.readAsText(files[++index]);
            } else {
                document.getElementById("results-panel").innerHTML = "";
                console.log("parsed " + etd_list.length + " unique ETDs");
                for (var i = 0; i < etd_list.length; i++) {
                    addTable(etd_list[i]);
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

//If you pass in a string of the hex code it will return what the hex code means in plain english
function hexToText(hex){
    if(hex === "0x1"){
        return "Real Time Clock Not Set";
    }
    if(hex === "0x2"){
        return "Micro SD Card Not Installed";
    }
    if(hex === "0x3"){
        return "Brake Solenoid Not Connected";
    }
    if(hex === "0x4"){
        return "Pressure Transducer Not Connected";
    }
    if(hex === "0x5"){
        return "HVM Failure";
    }
    if(hex === "0x6"){
        return "GPS Not Connected That Should Be";
    }
    if(hex === "0x7"){
        return "LIS302 Accelerometer Not Present Led Code";
    }
    if(hex === "0x8"){
        return "Real Time Clock Not Functioning";
    }
    if(hex === "0x9"){
        return "HDSP2502 Display Failure";
    }
    if(hex === "0xA"){
        return "LM74CIM Temp Sensor Not Present";
    }
    if(hex === "0xB"){
        return "Voltage 3.3 Out Of Tolerance";
    }
    if(hex === "0xC"){
        return "Voltage 5.0 Out Of Tolerance";
    }
    if(hex === "0xD"){
        return "Voltage 12.0 Out Of Tolerance";
    }
    if(hex === "0xE"){
        return "Brake Solenoid Failed During Blow";
    }
    if(hex === "0xF"){
        return "Turbine Not Spinning";
    }
    if(hex === "0x10"){
        return "Turbine RPM Varying Too Much";
    }
    if(hex === "0x11"){
        return "Turbine RPM Out Of Spec VS Pressure";
    }
    if(hex === "0x12"){
        return "Turbine Voltage Out Of Spec VS RPM";
    }
    if(hex === "0x13"){
        return "CMX469 Modem Not Present";
    }
    if(hex === "0x14"){
        return "Charger Failure";
    }
    if(hex === "0x15"){
        return "Radio Not Connected";
    }
    if(hex === "0x16"){
        return "CPLD Not Present or Not Programmed";
    }
    if(hex === "0x17"){
        return "Micro SD Card Corrupted";
    }
    if(hex === "0x1D") {
        return "12.0 Voltage out of Tolerance";
    }
    if(hex === "0x100"){
        return "0x100 Pressure Data";
    }
    if(hex === "0x101"){
        return "Power On From Sleep Event";
    }
    if(hex === "0x102"){
        return "Power On From Reset Event";
    }
    if(hex === "0x103"){
        return "Power Down From Battery Low Event";
    }
    if(hex === "0x104"){
        return "Power Down From Layed On Side Event";
    }
    if(hex === "0x105"){
        return "E Brake Blow From Two Perfect Packets Event";
    }
    if(hex === "0x106"){
        return "E Brake Blow From One Perfect And One Corrected Packet Event";
    }
    if(hex === "0x107"){
        return "E Brake Blow From One Perfect Packet Event";
    }
    if(hex === "0x108"){
        return "E Brake Blow From Two Corrected Packets Event";
    }
    if(hex === "0x109"){
        return "E Brake Blow From One Corrected Packet Event";
    }
    if(hex === "0x10A"){
        return "Temperature Info Event";
    }
    if(hex === "0x10B"){
        return "External Charger Plugged In Event";
    }
    if(hex === "0x10C"){
        return "Kickstart Circuit Activated Event";
    }
    if(hex === "0x10D"){
        return "ETD Entered Bench Mode Event";
    }
    if(hex === "0x10E"){
        return "ETD Plugged into RS232 Event";
    }
    if(hex === "0x10F"){
        return "Turbine Beyond 10000 RPM Event";
    }
    if(hex === "0x110"){
        return "Good Received Packet Event";
    }
    if(hex === "0x111"){
        return "In Motion Event";
    }
    if(hex === "0x8111") {
        return "Motion Went Away Event";
    }
    if(hex === "0x112"){
        return "Marker Turning On Event";
    }
    if(hex === "0x113"){
        return "Arm Request Event";
    }
    if(hex === "0x114"){
        return "Battery Voltage Info Event";
    }
    if(hex === "0x115"){
        return "Turbine Voltage Info Event";
    }
    if(hex === "0x116"){
        return "Follow Up Data Event";
    }
    if(hex === "0x117"){
        return "Power Down From Button Hold Event";
    }
    if(hex === "0x118"){
        return "Charge Completion Event";
    }
    if(hex === "0x119"){
        return "Power On From Watchdog Reset Event";
    }
    if(hex === "0x11A"){
        return "Pressure Info Event";
    }
    if(hex === "0x11B"){
        return "RPM Info Event";
    }
    if(hex === "0x11C"){
        return "Power Down From No Air Event";
    }
    if(hex === "0x11D"){
        return "Power Down From Charger Unplugged Event";
    }
    if(hex === "0x11E"){
        return "Coordinate Info Event";
    }
    if(hex === "0x11F"){
        return "GPS Doesn't See Satellite";
    }
    if(hex === "0x120"){
        return "Radio Receive Event";
    }
    if(hex === "0x121"){
        return "Radio Power level Set Too High";
    }
    if(hex === "0x122"){
        return "Power Down From RTC GPS Update Event";
    }
    if(hex === "0x123"){
        return "Power Down From Unit Disable";
    }
    if(hex === "0x124"){
        return "Turbine Hours Cleared Event";
    }
    if(hex === "0x125"){
        return "Battery Hours Cleared Event";
    }
    if(hex === "0x126"){
        return "Location Update Sent In Event";
    }
    if(hex === "0x127"){
        return "RTC Updated From GPS Time Event";
    }
    if(hex === "0x128"){
        return "Radio Power Enabled Event";
    }
    if(hex === "0x129"){
        return "GPS Power Enabled Event";
    }
    if(hex === "0x12A"){
        return "Energy Conservation Mode Event";
    }
    if(hex === "0x12B"){
        return "Location Update Failed Event";
    }
    if(hex === "0x12C"){
        return "Accelerometer Info Event";
    }
    if(hex === "0x12D"){
        return "Radio Power Disabled Event";
    }
    if(hex === "0x12E"){
        return "Over PSI Event";
    }
    if(hex === "0x12F"){
        return "Emergency Dump Battery Load test Results Event";
    }
    if(hex === "0x130"){
        return "Charger Shutdown From Over Temperature PCB Event";
    }
    if(hex === "0x131"){
        return "Energy Conservation Enable Reason";
    }
    if(hex === "0x132"){
        return "Energy Conservation Disable Reason";
    }
    if(hex === "0x133"){
        return "GPS Cell Info Event";
    }
    if(hex === "0x134"){
        return "Turbine Shutoff Event";
    }
    if(hex === "0x135"){
        return "Arm Button Pressed Event";
    }
    if(hex === "0x136"){
        return "Battery Voltage Dropped Too Far After Charge Disable";
    }
    if(hex === "0x137"){
        return "Battery Voltage Started Too High";
    }
    if(hex === "0x138"){
        return "3.3 Rail Voltage Info Event";
    }
    if(hex === "0x139"){
        return "5.0 Rail Voltage Info Event";
    }
    if(hex === "0x13A"){
        return "GPS Detected Event";
    }
    if(hex === "0x13B"){
        return "Abuse Detected Freefall Event";
    }
    if(hex === "0x13C"){
        return "Abuse Detected High Impact Event";
    }
    return null;
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
    var element = document.getElementById("results-panel");
    element.appendChild(etdDropdown);
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
//returns true if code is a graphable type - Such as battery voltage, board temp etc.
function isGraphable(hex){
    if(hex == "0x10B"){
        return true;
    }
    if(hex === "0x114"){
        return true;
    }
    if(hex === "0x115"){
        return true;
    }
    if(hex === "0x11A"){
        return true;
    }
    if(hex === "0x11B"){
        return true;
    }
    if(hex === "0x10A"){
        return true;
    }
    if(hex === "0x12C"){
        return true;
    }
    if(hex === "0x138"){
        return true;
    }
    if(hex === "0x139"){
        return true;
    }
    if(hex === "0x100"){
        return true;
    }
    if(hex==="0x13B"){
        return true;
    }
    if(hex==="0x13C"){
        return true;
    }
    return false;
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
    var obj = {};
    try {
        obj.id = id.match(/[0-9]{1,5}/)[0];
        obj.firmware = firmware.match(/[0-9]+.[0-9]+/)[0];
        obj.cpld = cpld.match(/[0-9]+.[0-9]+/)[0];
        obj.sn = sn.match(/(?:Processor Board Serial Number: |\G)(\-*[A-Za-z0-9 ]+)/)[1];
        obj.customer = customer.match(/(?:Customer ID: |\G)([A-Z]+)/)[0];
        obj.turbine_time = turbine_time.match(/(?:Turbine Time: |\G)([0-9]+.[0-9]+)/)[0];
        obj.battery_time = battery_time.match(/(?:Battery Time: |\G)([0-9]+.[0-9]+)/)[0];
    } catch (err) {
        return null;
    }
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
function parseETDFile(reader, etd_list) {
    if(!etd_list) {
        etd_list = [];
    }
    var lines = reader.result.split("\n");
    var line;
    var this_etd;
    for (var line_num = 0; line_num < lines.length-1; line_num++) {
        try {
            line = lines[line_num];
            // If a log header is found
            if (line.charAt(0) === "-" && (line_num + 7 < lines.length) && lines[line_num + 1].charAt(0) === 'E') {
                // Parse the header
                var id = lines[++line_num];
                var firmware = lines[++line_num];
                var cpld = lines[++line_num];
                var sn = lines[++line_num];
                var customer = lines[++line_num];
                var turbine_time = lines[++line_num];
                var battery_time = lines[++line_num];
                //console.log(id + ", " + firmware + ", " + cpld + ", " + sn + ", " + customer + ", " + turbine_time + ", " + battery_time + ", ");

                // Create a new etd Object
                var new_etd = createNewEtd(id, firmware, cpld, sn, customer, turbine_time, battery_time);
                // If the etd initialized successfully
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

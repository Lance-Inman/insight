var etd_list = [];

function readFiles(files) {
    var index = 0;

    var reader = new FileReader();
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
            console.log("parsed file " + index + "/" + files.length);
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
            }
        };
    reader.onloadend =
        function () {
        };

    if (files.length > 0) {
        document.getElementById("status").innerHTML = "Loading files...";
        document.getElementById("grid-input-panel").style.backgroundColor = "#FFEB3B";
        files = [].slice.call(files).sort(chronCompare);
        document.getElementById("status").innerHTML = "Parsing files...";
        document.getElementById("input-panel").style.backgroundColor = "#FFEB3B";
        reader.readAsText(files[0]);
    }
}
function hexToText(hex){
    if(hex === "0x114"){
        return "Battery Voltage"
    }
    if(hex === "0x115"){
        return "Turbine Voltage"
    }
    if(hex === "0x11A"){
        return "Pressure Info"
    }
    if(hex === "0x11B"){
        return "RPM"
    }
    if(hex === "0x10A"){
        return "Board Temp"
    }
    if(hex === "0x100"){
        return "EOT Transmit"
    }
    if(hex === "0x120"){
        return "EOT Receive"
    }
    if(hex === "0x1"){
        return "Real Time Clock Not Set"
    }
    if(hex === "0x2"){
        return "Micro SD Card Not Installed"
    }
    if(hex === "0x3"){
        return "Brake Solenoid Not Detected"
    }
    if(hex === "0x4"){
        return "Pressure Transducer Failure"
    }
    if(hex === "0x5"){
        return "HVM Failure"
    }
    if(hex === "0x6"){
        return "GPS Not Detected"
    }
    if(hex === "0x7"){
        return "Accelerometer Failure"
    }
    if(hex === "0x8"){
        return "Real Time Clock Not Functioning"
    }
    if(hex === "0x9"){
        return "Display Failure"
    }
    if(hex === "0xA"){
        return "Temp Sensor Failure"
    }
    if(hex === "0xB"){
        return "Voltage 3.3 Out Of Tolerance"
    }
    if(hex === "0xC"){
        return "Voltage 5.0 Out Of Tolerance"
    }
    if(hex === "0xD"){
        return "Voltage 12.0 Out Of Tolerance"
    }
    if(hex === "0xE"){
        return "Brake Solenoid Failed During Dump"
    }
    if(hex === "0xF"){
        return "Turbine Not Spinning"
    }
    if(hex === "0x10"){
        return "Turbine RPM Varying Too Much"
    }
    if(hex === "0x11"){
        return "Turbine RPM Out Of Spec VS Pressure"
    }
    if(hex === "0x12"){
        return "Turbine Voltage Out Of Spec VS Pressure"
    }
    if(hex === "0x13"){
        return "Modem Not Present"
    }
    if(hex === "0x14"){
        return "Charger Failure"
    }
    if(hex === "0x15"){
        return "Radio Failure"
    }
    if(hex === "0x16"){
        return "CPLD Electronic Memory Loss"
    }
    if(hex === "0x12E"){
        return "GPS Power Disabled"
    }
    if(hex === "0x17"){
        return "0x17"
    }
    if(hex === "0x1D") {
        return "0x1D";
    }
}
//var alldata = [];
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
    const tempData = [];
    const batteryData = [];
    const turbVData = [];
    const pressureData = [];
    const rpmData = [];
    // For each hex code tracked by the etd
    var isEmpty = true;
    for(var code_num = 0; code_num < etd.tracked_codes.length; code_num++) {
        var tracked_code = etd.tracked_codes[code_num];
        var typegraph = "";
        if(tracked_code.logs.length === 0) continue;

        isEmpty = false;
        // Create a dropdown panel for the hex code
        var hexDropdown = document.createElement("div");
        hexDropdown.setAttribute("class", "hex-dropdown");
        var hexButton = document.createElement("button");
        hexButton.appendChild(document.createTextNode(hexToText(tracked_code.code)+": "+tracked_code.logs.length));
        hexButton.setAttribute("onclick", ("toggleDropdown(\""+(etd.id+"."+etd.firmware.replace('.', '')+"."+etd.sn+"."+code_num)+"\")"));
        hexButton.setAttribute("class", "hex-dropdown-trigger");
        var hexDropdownContent = document.createElement("div");
        hexDropdownContent.setAttribute("id", (""+(etd.id+"."+etd.firmware.replace('.', '')+"."+etd.sn+"."+code_num)));
        hexDropdownContent.setAttribute("class", "hex-dropdown-content");
        hexDropdown.appendChild(hexButton);

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

        // For each log of the tracked code
        for(var log_num = 0; log_num < tracked_code.logs.length; log_num++) {
            // Create a table row
            var row = document.createElement("tr");
            var values = tracked_code.logs[log_num].split('\t');
            td1 = document.createElement("td");
            td2 = document.createElement("td");
            td3 = document.createElement("td");
            td4 = document.createElement("td");
            td1.appendChild(document.createTextNode(values[0]));
            td2.appendChild(document.createTextNode(values[1]));
            td3.appendChild(document.createTextNode(values[2]));
            td4.appendChild(document.createTextNode(values[3]));
            //-----------------------Graphing------------------------------//
            /*we start with the regex commands which need to be unique to each
              set of data so that we don't have overlapping matching, hence the
              Info, and V,
              We then check for matches and cutout the unneeded text using the
              substring method, while adding it to our data section
            */
            //Date Formatting
            var yearRegex = /[0-9]{4}/g;
            var monthRegex = /[a-zA-Z]+/g;
            var dayRegex = /^[0-9]{1,2}/g;
            var timeRegex = /[0-9]{2}:[0-9]{2}:[0-9]{2}/g;
            var yearRegexMatch = yearRegex.exec(values[0]);
            var monthRegexmatch = monthRegex.exec(values[0]);
            var dayRegexmatch = dayRegex.exec(values[0]);
            var timeRegexmatch = timeRegex.exec(values[0]);
            var month = changeMonthtoNumber(monthRegexmatch[0]);
            try{
                if(monthRegexmatch[0] != null && dayRegexmatch[0]!=null && timeRegexmatch[0]!=null && yearRegexMatch[0]){
                    var date = new Date(yearRegexMatch[0]+"/"+ month + "/" + dayRegexmatch[0] + " " + timeRegexmatch);
                } else{
                    console.log(values);
                }
            }catch (err){
                console.log("Error In Log File, Data reads as:");
                console.log(values);
                continue;
            }

            //date.setFullYear(parseInt(yearRegexMatch[0]), month, parseInt(dayRegexmatch[0]));
            //date.setHours(parseInt(timeRegexmatch[0].substring(0,1)),parseInt(timeRegexmatch[0].substring(3,4)), parseInt(timeRegexmatch[0].substring(6,7)));
            //Data Grabbing
            var batteryRegex = /Info, [0-9.]+(?=V)/g;
            var batteryRegex2 = /Battery V, [0-9.]+(?=V)/g;
            var temperatureRegex = /[-]*[0-9.]+(?=F)/g;
            var turbVRegex = /Turbine V, [0-9.]+(?=V)/g;
            var pressureRegex = /[0-9.]+(?=PSI)/g;
            var rpmRegex = /[0-9.]+(?=RPM)/g;
            var matchTurbV = turbVRegex.exec(values[3]);
            if(matchTurbV !== null){
                typegraph = "turbineVoltage";
                turbVData.push(([date,parseFloat(matchTurbV[0].split(" ")[2])]));
            }
            var matchBattery = batteryRegex.exec(values[3]);
            var matchBattery2 = batteryRegex2.exec(values[3]);
            if(matchBattery !== null){
                typegraph = "battery";
                batteryData.push([date,parseFloat(matchBattery[0].substring(6))]);
            }
            if(matchBattery2 !== null){
                typegraph = "battery";
                batteryData.push([date,parseFloat(matchBattery2[0].split(" ")[2])]);
            }
            var matchTemp = temperatureRegex.exec(values[3]);
            if(matchTemp !== null){
                typegraph = "temperature";
                tempData.push([date,parseFloat(matchTemp[0])]);
            }
            var matchPressure = pressureRegex.exec(values[3]);
            if(matchPressure !== null){
                typegraph = "pressure";
                pressureData.push([date,parseFloat(matchPressure[0])]);
            }
            var matchRPM = rpmRegex.exec(values[3]);
            if(matchRPM !== null){
                typegraph = "rpm";
                rpmData.push([date,parseFloat(matchRPM[0])]);
            }
            row.appendChild(td1);
            row.appendChild(td2);
            row.appendChild(td3);
            row.appendChild(td4);
            table.appendChild(row);
        }
        //For each of the if and else if statements we make sure that the graph type (or regex that matched)
        //is of the correct type to make the graph, we then make a div and set up its attributes
        //Finally we add an event listener to create the graph when you click on the graphs table button
        if(tempData[0] !== null) {
            if (typegraph === "temperature") {
                makegraph(tempData,"Temperature over Time","red","Degrees Fahrenheit",hexDropdownContent,hexButton);
            }
        }
        if(turbVData[0] !== null) {
           if (typegraph === "turbineVoltage") {
               makegraph(turbVData,"Turbine voltage over time","blue","Voltage",hexDropdownContent,hexButton);
           }
        }
        if(batteryData[0] !== null) {
            if (typegraph === "battery") {
                makegraph(batteryData,"Battery Voltage over Time","green","Battery Voltage",hexDropdownContent,hexButton);
            }
        }
        if(pressureData[0] !== null) {
            if (typegraph === "pressure") {
                makegraph(pressureData,"Pressure over Time","grey","PSI",hexDropdownContent,hexButton);
            }
        }
        if(rpmData[0] !== null){
            if(typegraph === "rpm"){
                makegraph(rpmData,"Rotations per minute","orange","RPM",hexDropdownContent,hexButton);
            }
        }
        hexDropdownContent.appendChild(table);
        hexDropdown.appendChild(hexDropdownContent);
        etdDropdownContent.appendChild(hexDropdown);
    }

    if(isEmpty) {
        console.log("empty");
        var empty = document.createElement("p");
        empty.appendChild(document.createTextNode("No parsed codes found"));
        etdDropdownContent.appendChild(empty);
    }

    etdDropdown.appendChild(etdDropdownContent);
    var element = document.getElementById("results-panel");
    element.appendChild(etdDropdown);
}
function makegraph(data,name,color,yaxisLabel,parent,dropdown) {
    var newgraph = document.createElement("div");
    newgraph.setAttribute("id", "graphdiv-" + name);
    newgraph.style.width = "100%";
    newgraph.style.color = "black";
    newgraph.style.backgroundColor = "white";
    parent.appendChild(newgraph);
    const nGraph = new Dygraph(
        newgraph,
        data, {
            legend: 'always',
            title: name,
            showRoller: true,
            ylabel: yaxisLabel,
            strokeWidth: .7,
            color: color,
            drawPoints: true
        }
    );
    dropdown.addEventListener("click", function () {
        nGraph.resize();
    });
}
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
        obj.sn = sn.match(/(?:Processor Board Serial Number: |\G)([A-Za-z0-9 ]+)/)[1];
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
        var codes = document.getElementById("custom-hex-input").value.split(", ");
        for(var i = 0; i < codes.length; i++) {
            etd.addCode(codes[i]);
        }
    }
    if(document.querySelector('input[value="0x10A"]').checked) {
        etd.addCode("0x10A");
    }
    if(document.querySelector('input[value="0x114"]').checked) {
        etd.addCode("0x114");
    }
    if(document.querySelector('input[value="0x115"]').checked) {
        etd.addCode("0x115");
    }
    if(document.querySelector('input[value="0x11A"]').checked) {
        etd.addCode("0x11A");
    }
    if(document.querySelector('input[value="0x11B"]').checked) {
        etd.addCode("0x11B");
    }
    if(document.querySelector('input[value="0x100"]').checked) {
        etd.addCode("0x100");
    }
    if(document.querySelector('input[value="0x120"]').checked) {
        etd.addCode("0x120");
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
    }
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
                return 1
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

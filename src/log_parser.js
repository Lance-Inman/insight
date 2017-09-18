var etd_list = [];

function readFiles(files) {
    var index = 0;

    var reader = new FileReader();
    reader.onerror =
        function () {
            console.log("reading operation encountered an error");
            document.getElementById("status").innerHTML = "Error reading file";
            document.getElementById("input-panel").style.backgroundColor = "#F44336";
        };
    reader.onabort =
        function () {
            console.log("Reading operation aborted.");
            document.getElementById("status").innerHTML = "Aborted reading file";
            document.getElementById("input-panel").style.backgroundColor = "#F44336";
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
                document.getElementById("input-panel").style.backgroundColor = "#4CAF50";
                toggleDropdown("options-dropdown-content");
            }
        };
    reader.onloadend =
        function () {
        };

    if (files.length > 0) {
        document.getElementById("status").innerHTML = "Loading files...";
        document.getElementById("input-panel").style.backgroundColor = "#FFEB3B";
        files = [].slice.call(files).sort(chronCompare);
        document.getElementById("status").innerHTML = "Parsing files...";
        document.getElementById("input-panel").style.backgroundColor = "#FFEB3B";
        reader.readAsText(files[0]);
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

    // For each hex code tracked by the etd
    var isEmpty = true;
    for(var code_num = 0; code_num < etd.tracked_codes.length; code_num++) {
        var tracked_code = etd.tracked_codes[code_num];

        if(tracked_code.logs.length === 0) continue;

        isEmpty = false;
        // Create a dropdown panel for the hex code
        var hexDropdown = document.createElement("div");
        hexDropdown.setAttribute("class", "hex-dropdown");
        var hexButton = document.createElement("button");
        hexButton.appendChild(document.createTextNode(tracked_code.code+": "+tracked_code.logs.length));
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
            row.appendChild(td1);
            row.appendChild(td2);
            row.appendChild(td3);
            row.appendChild(td4);
            table.appendChild(row);
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
                console.log(id + ", " + firmware + ", " + cpld + ", " + sn + ", " + customer + ", " + turbine_time + ", " + battery_time + ", ");

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

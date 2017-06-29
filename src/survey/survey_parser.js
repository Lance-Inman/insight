"use strict";
var map;
var comms = [];
var noComms = [];
var repeatedComms = [];
var failures = [];
var commCircles = [];
var noCommCircles = [];
var repeatedCommCircles = [];
var failureMarkers = [];

// Iterate through each line of text in the file and create a point on either the 'noComms' or 'comms' heatmap
function processFile(reader) {
    var lines = reader.result.split("\n");
    var values;
    var previousFailures = 0;
    var firstFailPoint = [0, 0];

    // Iterate over each line in the file
    for (var i = 0; i < lines.length - 1; i++) {
        try {
            values = lines[i].split(",");

            // If the log is a 'Received EOT Packet' event
            if (values[5] === '0x124') {

                // Create a mark after reaching the end of a dead zone
                if (previousFailures > 25) {
                    var failLength = formatTime(values[0], values[1]) - formatTime(firstFailPoint[0], firstFailPoint[1]);


                    if (Math.floor(failLength / 60000) >= 5) {
                        var msg = "High failure rate near (" +
                            formatCoordinates(values[2]) + ", " +
                            formatCoordinates(values[3]) + ")\n " +
                            previousFailures + " successive failures lasting " +
                            (Math.floor(failLength / 60000)) + " minute(s) " + ((failLength / 1000) % 60) + " second(s)";

                        var failure = {
                            lat: averageCoordinate(formatCoordinates(values[2]), formatCoordinates(firstFailPoint[2])),
                            lon: averageCoordinate(formatCoordinates(values[3]), formatCoordinates(firstFailPoint[3])),
                            failures: previousFailures,
                            message: msg
                        };

                        failures.push(failure);
                    }
                }
                previousFailures = 0;

                // Add the location to the comms or repeatedComms list depending on if it was repeated
                if (values.length > 15 && values[16] && values[16].trim() === "Repeated = YES") {
                    repeatedComms.push({
                        location: new google.maps.LatLng(formatCoordinates(values[2]), formatCoordinates(values[3]))
                    });
                } else {
                    comms.push({
                        location: new google.maps.LatLng(formatCoordinates(values[2]), formatCoordinates(values[3]))
                    });
                }

                // If the log is a 'Comm Test Failed' event
            } else if (values[5] === '0x514') {

                // Ignore the first failure to reduce noise
                if (previousFailures) {
                    // Add the location to the noComm list
                    noComms.push({
                        location: new google.maps.LatLng(formatCoordinates(values[2]), formatCoordinates(values[3]))
                    });
                } else {
                    firstFailPoint = values;
                }
                previousFailures++;
            }
        } catch (err) {
            console.log("Skipped " + lines[i]);
        }
    }
}

// Read the Surveyor files and process them depending on the result of FileReader.readAsText()
function readFiles(files) {
    var reader = new FileReader();
    //reader.readAsText(file);
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
            document.getElementById("status").innerHTML = "Loading file...";
            document.getElementById("input-panel").style.backgroundColor = "#FFEB3B";
        };
    reader.onload =
        function () {
            console.log("Reading operation successfully completed");
            // Pass the file to processFile to push comms onto the heatmap
            processFile(reader);
            document.getElementById("status").innerHTML = "Loading map";
            document.getElementById("input-panel").style.backgroundColor = "#FFEB3B";
            initMap();
        };
    for (var i = 0; i < files.length; i++) {
        var file = files.item(i);
        console.log(file.name);
        reader.readAsText(file);
    }
}

// Convert the Surveyor's coordinate format ('XXX.XXXS')  to Google Map's format ('-XXX.XXX')
function formatCoordinates(coord) {
    var result;

    var SWC = coord.slice(9, 10);
    if (SWC === "S" || SWC === "W") {
        result = "-" + coord.substring(0, coord.length - 1);
    } else {
        result = coord.substring(0, coord.length - 1);
    }

    return result;
}

// Convert the Surveyor's time format to epoch time
function formatTime(dateUTC, timeUTC) {
    var map = {};
    map["January"] = 0;
    map["February"] = 1;
    map["March"] = 2;
    map["April"] = 3;
    map["May"] = 4;
    map["June"] = 5;
    map["July"] = 6;
    map["August"] = 7;
    map["September"] = 8;
    map["October"] = 9;
    map["November"] = 10;
    map["December"] = 11;

    // Separate date values
    dateUTC = dateUTC.split(/(\d+)([a-zA-Z]+)(\d+)/);

    // Separate time values (matches ':' and ' ')
    timeUTC = timeUTC.split(/[:\s]/);

    // Get epoch time from log's time value
    return Date.UTC(dateUTC[3], map[dateUTC[2]], dateUTC[1],
        timeUTC[0], timeUTC[1], timeUTC[2], 0);
}

// Return the value between two coordinate comms
function averageCoordinate(coord1, coord2) {
    return (Number(coord1) + Number(coord2)) / 2.0;
}

function initMap() {
    console.log("COMMS:"+comms.length+"; NO-COMMS:"+noComms.length+"; Repeat COMMS:"+repeatedComms.length);

    if (comms.length === 0) {
        document.getElementById("status").innerHTML = "Invalid Survey File";
        document.getElementById("input-panel").style.backgroundColor = "#F44336";
        return;
    }

    document.getElementById("status").innerHTML = "Done";
    document.getElementById("input-panel").style.backgroundColor = "#4CAF50";

    console.log("Heatmap size: " + comms.length);
    console.log(Math.floor(comms.length/2).location);

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 9,
        center: comms[Math.floor(comms.length/2)].location,
        mapTypeId: 'terrain'
    });

    for (i = 0; i < comms.length; i++) {
        commCircles.push(new google.maps.Circle({
            fillColor: '#00FF00',
            fillOpacity: 0.25,
            strokeWeight: 0,
            map: map,
            center: comms[i].location,
            radius: 1000
        }));
    }

    for (i = 0; i < repeatedComms.length; i++) {
        repeatedCommCircles.push(new google.maps.Circle({
            fillColor: '#0000FF',
            fillOpacity: 0.25,
            strokeWeight: 0,
            map: map,
            center: repeatedComms[i].location,
            radius: 1000
        }));
    }

    for (i = 0; i < noComms.length; i++) {
        noCommCircles.push(new google.maps.Circle({
            fillColor: '#FF0000',
            fillOpacity: 0.15,
            strokeWeight: 0,
            map: null,
            center: noComms[i].location,
            radius: 1000
        }));
    }

    for (var i = 0; i < failures.length; i++) {
        failureMarkers.push(new google.maps.Marker({
            position: new google.maps.LatLng(failures[i].lat, failures[i].lon),
            map: map,
            title: failures[i].message
        }));
    }
}

function toggleComms() {
    document.getElementById("comms-button").disabled = true;
    for (var i = 0; i < commCircles.length; i++) {
        commCircles[i].setMap(commCircles[i].getMap() ? null : map);
    }
    if (document.getElementById("comms-button").innerHTML.startsWith("Show")) {
        document.getElementById("comms-button").innerHTML = "Hide COMMs";
    } else {
        document.getElementById("comms-button").innerHTML = "Show COMMs";
    }
    document.getElementById("comms-button").disabled = false;
}

function toggleNoComms() {
    document.getElementById("no-comms-button").disabled = true;
    for (var i = 0; i < noCommCircles.length; i++) {
        noCommCircles[i].setMap(noCommCircles[i].getMap() ? null : map);
    }
    if (document.getElementById("no-comms-button").innerHTML.startsWith("Show")) {
        document.getElementById("no-comms-button").innerHTML = "Hide Failed COMMs";
    } else {
        document.getElementById("no-comms-button").innerHTML = "Show Failed COMMs";
    }
    document.getElementById("no-comms-button").disabled = false;
}

function toggleRepeatedComms() {
    document.getElementById("repeated-comms-button").disabled = true;
    for (var i = 0; i < repeatedCommCircles.length; i++) {
        repeatedCommCircles[i].setMap(repeatedCommCircles[i].getMap() ? null : map);
    }
    if (document.getElementById("repeated-comms-button").innerHTML.startsWith("Show")) {
        document.getElementById("repeated-comms-button").innerHTML = "Hide Repeated COMMs";
    } else {
        document.getElementById("repeated-comms-button").innerHTML = "Show Repeated COMMs";
    }
    document.getElementById("repeated-comms-button").disabled = false;
}
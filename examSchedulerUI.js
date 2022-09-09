//483
//!all spikes have been removed
function processSubmit(myEvent){
    myEvent.preventDefault();
    var request = new XMLHttpRequest();//create a new request object
    request.onreadystatechange = function(){//creates a function that is executed when the readyState of the XMLHttpRequest changes, request is known as a callback function
        processSuccessResult(request);
        processFailResult(request);
    }
    request.open("POST","127.0.0.1:5500",true);
    request.send(new FormData(document.getElementById("uploadForm")));

}

function displayFailResult(serverResponseText) {
    var serverResponse = JSON.parse(serverResponseText);
    document.getElementById("output").innerHTML = "";
    document.getElementById("error").innerHTML = serverResponse.error;
    document.getElementById("upload").style.display = "block";
    document.getElementById("timetable").style.display = "none";
    
}

function processFailResult(request) {
    if (request.readyState == 4 && request.status >= 400) { //checks that the data has been received
        displayFailResult(request.responseText);
    }
}

function displaySuccessResult(serverResponseText) {
    var serverResponse = JSON.parse(serverResponseText);
    document.getElementById("upload").style.display = "none";//makes the instructions and upload form invisible and take up no space
    document.getElementById("error").innerHTML = "";
    document.getElementById("output").innerHTML = serverResponse.success; //puts the data in the element with id of 'output'

    document.getElementById("timetable").style.display = "block";
    populateTimetableHTML(serverResponse);
}

function getExamNameRow(examName){
    return "<tr><td colspan=4 class=subject>" + examName + "</td></tr>"
}

function getExamDataHeadings(){
    return "<tr><td>Room</td><td>Length(mins)</td><td>Students</td></tr>";
}

function getExamDataValues(exam){
    return "<tr><td>" + exam.room + "</td><td>" + exam.examLength + "</td><td>"+ exam.numStudents + "</td></tr>";
}

function getBlankRow(){
    return "<tr><td class=blankrow colspan=4></td></tr>";
}

function getSlotTotalRow(totalStudents){
    return "<tr><td colspan=4>Total number of students: " + totalStudents + "</td></tr>";
}

function buildExam(exam){
    let examSummaryData = [getExamNameRow(exam.name)];
    examSummaryData.push(getExamDataHeadings());
    examSummaryData.push(getExamDataValues(exam));
    examSummaryData.push(getBlankRow());
    return examSummaryData.join(""); 
}

function getSlotClashesRow(clashes){
    var className = "'redBackground clashes'";
    if (clashes.length == 0){
        className = "'greenBackground clashes'";
    } 
    var clashesList = ["<tr><td colspan=4 class=" + className + ">Clashes: " + clashes.length];
    for (currentClash of clashes){
        clashesList.push(currentClash);
    }
    clashesList.push("</td></tr>");
    return clashesList.join("<br/>");

}

function buildExamSlot(examSlot){
    let totalStudents = 0;
    let examSlotArray = ["<td><table class=examslot>"];
    for (currentExam of examSlot.exams){
        examSlotArray.push(buildExam(currentExam));
        totalStudents += currentExam.numStudents;
    }
    examSlotArray.push(getSlotTotalRow(totalStudents));
    examSlotArray.push(getSlotClashesRow(examSlot.clashes));
    examSlotArray.push("</table></td>");
    return examSlotArray.join("");
}

function populateTimetableHTML(serverResultDataObject){
    //heading columns
    let headerRow = ["<th></th>"];
    //AM columns
    let amRow = ["<td>AM</td>"];
    //PM columns
    let pmRow = ["<td>PM</td>"];

    let listOfDates = [];
    let timetable = serverResultDataObject.timetable;

    for (currentExamSlot of timetable) {
        if (currentExamSlot.exams.length > 0){
            let slotDate = currentExamSlot.date;
            if (!(listOfDates.includes(slotDate))){
                listOfDates.push(slotDate);
                headerRow.push("<th>" + getDateToDisplay(slotDate) + "</th>");
            }
            let slotTime = currentExamSlot.time;
            let hour = slotTime.slice(0,2);
            if (hour < 12){
                amRow.push(buildExamSlot(currentExamSlot));
            }
            else {
                pmRow.push(buildExamSlot(currentExamSlot));
            }
        }
    }
    document.getElementById("headings").innerHTML = headerRow.join("");
    document.getElementById("AMRow").innerHTML = amRow.join("");
    document.getElementById("PMRow").innerHTML = pmRow.join(""); 
}
function getDateToDisplay(dateStr) {
    var dateArray = dateStr.split("-");//split to [year,month,day]
    var myDate = new Date(year=dateArray[0],month=dateArray[1]-1,day=dateArray[2]);//*month is 0 based
    var day = new Intl.DateTimeFormat("en-GB",{weekday:"long"}).format(myDate)
    var month = new Intl.DateTimeFormat("en-GB",{month:"long"}).format(myDate)
    return day + " " + dateArray[2] + " " + month  + " " + dateArray[0];

}

function processSuccessResult(request) {
    if (request.readyState == 4 && request.status == 200) { //checks that the data has been received
        displaySuccessResult(request.responseText);
    }
}

function printTimetable(){
    var timetable = document.getElementById("printable").innerHTML;
    var myWindow = window.open('', '', 'height=500, width=500');
    myWindow.document.write('<html><head><link rel="stylesheet" href="examSchedulerStyles.css" type="text/css"></head>');
    myWindow.document.write('<body><div>');
    myWindow.document.write(timetable);
    myWindow.document.write('</div></body></html>');
    myWindow.document.close();
    setTimeout(() => {myWindow.print()},250);
}

function toggleHidden(displayValue){
    if (displayValue == "none"){
        return "";
    }
    return "none";

}

function toggleClashes(){
    var elementArray = document.getElementsByClassName("clashes");
    for (myElement of elementArray){
        myElement.style.display = toggleHidden(myElement.style.display);
    }
}


function init(){
    document.getElementById("upload").style.display = "block";
    document.getElementById("timetable").style.display = "none";
    document.getElementById("uploadForm").addEventListener("submit",processSubmit);//runs the above function when the button to submit the csv is clicked
}
window.onload = init;
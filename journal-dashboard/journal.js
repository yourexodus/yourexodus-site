document.addEventListener("DOMContentLoaded", function(){


console.log("Journal Dashboard Loaded");



const form = document.getElementById("journalForm");


form.addEventListener("submit", function(event){


event.preventDefault();



const title =
document.getElementById("journalTitle").value;


const entry =
document.getElementById("journalEntry").value;



console.log("Journal Entry Submitted:");

console.log(title);

console.log(entry);



alert("Your journal entry has been saved.");



form.reset();



});


});
document.addEventListener("DOMContentLoaded", function(){


console.log("Prayer Dashboard Loaded");



const form = document.getElementById("prayerForm");


form.addEventListener("submit", function(event){


event.preventDefault();



const title =
document.getElementById("title").value;


const prayer =
document.getElementById("prayerText").value;



console.log("Prayer Submitted:");

console.log(title);

console.log(prayer);



alert("Your prayer has been submitted. God hears your heart.");



form.reset();



});


});
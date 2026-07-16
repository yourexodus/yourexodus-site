/* ==========================================
   YOUR EXODUS - MAIN WEBSITE JAVASCRIPT
========================================== */


document.addEventListener("DOMContentLoaded", function () {


    console.log("Your Exodus website loaded");


    /*
    ==========================================
       SMOOTH SCROLLING
       For buttons like:
       #journey
       #mission
       #resources
    ==========================================
    */


    const links = document.querySelectorAll('a[href^="#"]');


    links.forEach(link => {


        link.addEventListener("click", function(e){


            const target = document.querySelector(
                this.getAttribute("href")
            );


            if(target){

                e.preventDefault();


                target.scrollIntoView({

                    behavior:"smooth",

                    block:"start"

                });

            }


        });


    });



    /*
    ==========================================
       DASHBOARD CARD ANIMATION
    ==========================================
    */


    const cards = document.querySelectorAll(
        ".dashboard-card"
    );


    cards.forEach(card => {


        card.addEventListener(
            "mouseenter",
            function(){

                this.style.transition =
                "all .3s ease";

            }

        );


    });



    /*
    ==========================================
       YEAR AUTOMATICALLY UPDATES FOOTER
    ==========================================
    */


    const year = document.querySelector(
        ".current-year"
    );


    if(year){

        year.textContent =
        new Date().getFullYear();

    }



});
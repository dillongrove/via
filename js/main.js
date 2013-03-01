Modernizr.addTest('standalone', function(){
    return window.navigator.standalone;
});

if(navigator.standalone != undefined && !!!navigator.standalone){
    //show notification
    return;
}

$(document).ready(function(){
    /* bind tab change links */
    $("#tab_bar a").click(function(e){
        e.preventDefault();

        /* reset visit history on new tab */
        visits.clear();

        var nextPage = $(e.target.hash);
        transition(nextPage, "fade");

        /* why did I do this again? */
        $("#tab_bar").attr("class", e.target.hash.slice(1));

        /* remove selected class from all tabs... */
        $("#tab_bar li").each(function(){
            $(this).removeClass("tab_selected");
        })

        /* ..and add it back to the one that was just clicked */
        $(e.target).parent().addClass("tab_selected");
    });

    /* bind all other page links */
    $("a.page_link").click(function(e){
        e.preventDefault();
        var nextPage = $(e.target.hash);
        transition(nextPage, "push");
    })

    $("#pages").on("click", ".back", function(){
        var lastPage = visits.back();
        if(lastPage) {
            transition(lastPage, "push", true);
        }
    })

    transition($("#routes_page"), "show");

    var source   = $("#test-template").html();
    var template = Handlebars.compile(source);
    var context  = {dillon: "mike"};
    var html     = template(context);
})

function transition(toPage, type, reverse) {
    var toPage = $(toPage)
    var fromPage = $("#pages .current");
    reverse = reverse ? "reverse" : "";

    visits.add(toPage);

    if(visits.hasBack()){
        toPage.find(".back").addClass("hasBack");
    }

    if(toPage.hasClass("current") || toPage === fromPage){
        return;
    }

    toPage
        .addClass("current " + type + " in " + reverse)
        .one("webkitAnimationEnd", function(){
            fromPage.removeClass("current " + type + " out " + reverse);
            toPage.removeClass(type + " in " + reverse);
        });
        fromPage.addClass(type + " out " + reverse);

    // for non webkit browsers
    if(!("WebKitTransitionEvent" in window)){
        toPage.addClass("current");
        fromPage.removeClass("current");
        return;
    }
}


var visits = {
    history: [],
    add: function(page) {
        this.history.push(page);
    },
    hasBack: function() {
        return this.history.length > 1;
    },
    back: function() {
        if(!this.hasBack()){
            return;
        }
        var curPage = this.history.pop();
        return this.history.pop();
    },
    clear: function() {
        this.history = [];
    }
}
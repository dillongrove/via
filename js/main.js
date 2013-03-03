Modernizr.addTest('standalone', function(){
    return window.navigator.standalone;
});

if(navigator.standalone != undefined && !!!navigator.standalone){
    // TODO: show notification telling users to install app as standalone
    return;
}

/* Global object for storing data, used to simluate a server for the time being
 * This is, after all, only a prototype :)
 */
var Via = {
    lists: [
        { name: "Work Friends",
          length: 6,
          people: [
            { first: "Brandon",
              last: "Kase"
            },
            { first: "Tomer",
              last: "Borenstein",
            },
            { first: "Arthur",
              last: "Lee",
            },
            { first: "Evan",
              last: "Shapiro"
            },
            { first: "Chris",
              last: "Lee",
            },
            { first: "Liz",
              last: "Keller"
            }
          ]
        },
        { name: "College Friends",
          length: 3,
          people: [
            { first: "Mike",
              last: "Darcy"
            },
            { first: "Peter",
              last: "Marino",
            },
            { first: "Nick",
              last: "LaGrow",
            }
          ]
        },
        { name: "Interaction Design Friends",
          length: 3,
          people: [
            { first: "Elina",
              last: "Kim"
            },
            { first: "Soyeon",
              last: "Hwang",
            },
            { first: "Lisa",
              last: "Imas",
            }
          ]
        }
    ],
}

$(document).ready(function(){
    /* bind tab change links */
    $("#tab_bar a").click(function(e){
        e.preventDefault();

        /* reset visit history on new tab */
        visits.clear();

        /* not yet sure if ill need this for styling reasons */
        $("#tab_bar").attr("class", e.target.hash.slice(1));

        /* remove selected class from all tabs... */
        $("#tab_bar li").each(function(){
            $(this).removeClass("tab_selected");
        })

        /* ..and add it back to the one that was just clicked */
        $(e.target).parent().addClass("tab_selected");

        var nextPage = $(e.target.hash);
        load_content(nextPage, e);
        transition(nextPage, "fade");
    });

    /* bind all other page links */
    $("#pages").on("click", "a.page_link", function(e){
        e.preventDefault();

        var nextPage = $(e.target.hash);
        load_content(nextPage, e);
        transition(nextPage, "push");
    });

    /* bind back button click event */
    $("#pages").on("click", ".back", function(e){
        /* find the last page in history, and transition to it, if possible */
        e.preventDefault();
        var lastPage = visits.back();
        if(lastPage) {
            transition(lastPage, "push", true);
        }
    })

    /* register handlebars helpers */
    Handlebars.registerHelper("commaSeparatedNames", function(people) {
        return people.map(function(person){return person.first}).join(", ");
    });

    /* on app start, show the routes page */
    transition($("#routes_page"), "show");
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

/* a load function to simulate responses from a server */
function load_content(nextPage, e){
    var event_target = e.target;
    var page_to_load = event_target.hash.slice(1);
    var load_target = $(nextPage);
    var content;

    switch(page_to_load) {
        case "lists_page":
            content = get_html("lists_template", Via.lists);
            break;
        case "list_detail":
            var list_id = $(event_target).data().id;
            content = get_html("list_detail_template", Via.lists[list_id]);
            break;
    }

    if(content){
        $(load_target).append(content);
    }
}

function get_html(templateID, context){
    var source = $("#" + templateID).html();
    var template = Handlebars.compile(source);
    var html = template(context);
    return html;
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
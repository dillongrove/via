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
          people: [
            { first: "Brandon",
              last: "Kase",
              pic_url: "brandon.jpg"
            },
            { first: "Tomer",
              last: "Borenstein",
              pic_url: "tomer.jpg"
            },
            { first: "Arthur",
              last: "Lee",
              pic_url: "arthur.jpg"
            },
            { first: "Evan",
              last: "Shapiro",
              pic_url: "evan.jpg"
            },
            { first: "Chris",
              last: "Lee",
              pic_url: "chris.jpg"
            },
            { first: "Liz",
              last: "Keller",
              pic_url: "liz.jpg"
            }
          ]
        },
        { name: "College Friends",
          people: [
            { first: "Mike",
              last: "Darcy",
              pic_url: "mike.jpg"
            },
            { first: "Peter",
              last: "Marino",
              pic_url: "peter.jpg"
            },
            { first: "Nick",
              last: "LaGrow",
              pic_url: "nick.jpg"
            }
          ]
        },
        { name: "Interaction Design Friends",
          people: [
            { first: "Elina",
              last: "Kim",
              pic_url: "elina.jpg"
            },
            { first: "Soyeon",
              last: "Hwang",
              pic_url: "soyeon.jpg"
            },
            { first: "Lisa",
              last: "Imas",
              pic_url: "lisa.jpg"
            }
          ]
        }
    ],
    invites: [
        { place: "Rose Tea Cafe",
          time: "today at 12:30pm",
          people: [
            { first: "Elina",
              last: "Kim",
              pic_url: "elina.jpg"
            },
            { first: "Soyeon",
              last: "Hwang",
              pic_url: "soyeon.jpg"
            },
            { first: "Lisa",
              last: "Imas",
              pic_url: "lisa.jpg"
            }
          ]
        },
        { place: "Panera",
          time: "tomorrow at 1:30pm",
          people: [
            { first: "Mike",
              last: "Darcy",
              pic_url: "mike.jpg"
            },
            { first: "Peter",
              last: "Marino",
              pic_url: "peter.jpg"
            },
            { first: "Nick",
              last: "LaGrow",
              pic_url: "nick.jpg"
            }
          ]
        }
    ]
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

    /* bind tab switching events */
    $(".tabbed_content_wrapper").on("click", ".tab", function(e){
        e.preventDefault();
        if($(this).hasClass("active")){
            /* a tab that is already active was clicked, return */
            return false;
        } else {
            var tab_wrapper = $(this).parents(".tabbed_content_wrapper");

            /* hide the existing tab content and show the new one */
            tab_wrapper.find(".tab_content div").removeClass("active");
            var tab_content_to_show = $(e.target.hash);
            tab_content_to_show.addClass("active");

            /* remove active class from all top tabs and add it back to the one we just clicked */
            tab_wrapper.find(".top_tabs a").removeClass("active");
            $(this).addClass("active");
        }
    });

    /* bind via buttons */
    $("#via_buttons a").on("click", function(e){
        e.preventDefault();
        var val = $(this).data().value;
        var via_input = $(this).parents("ul").siblings("input");
        via_input.val(val);

    });

    /* register handlebars helpers */
    Handlebars.registerHelper("commaSeparatedNames", function(people) {
        var comma_list = people.map(function(person){return person.first}).join(", ");
        return new Handlebars.SafeString(comma_list);
    });

    Handlebars.registerHelper("count", function(list) {
        return new Handlebars.SafeString(list.length);
    });

    Handlebars.registerHelper("full_name", function(person) {
        return new Handlebars.SafeString(person.first + " " + person.last);
    });

    /* register handlebars partials */
    Handlebars.registerPartial("person", $("#person_partial").html());

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
    var load_target;
    var content;
    var callback;

    switch(page_to_load) {
        case "lists_page":
            content = get_html("lists_template", Via.lists);
            load_target = $(nextPage).find(".bar_list_wrapper");
            break;
        case "list_detail":
            var list_id = $(event_target).data().id;
            content = get_html("list_detail_template", Via.lists[list_id]);
            load_target = $(nextPage);
            break;
        case "invites_page":
            content = get_html("invites_inbox_template", Via.invites);
            load_target = $(nextPage).find("#inbox");
            break;
        case "invite_detail":
            var invite_id = $(event_target).data().id;
            content = get_html("invite_detail_template", Via.invites[invite_id]);
            load_target = $(nextPage);
            break;
    }

    if(content){
        $(load_target).html(content);
        if(callback){
            callback();
        }
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
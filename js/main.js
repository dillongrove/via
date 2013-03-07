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
    ],
    places: [
        { name: "Rose Tea Cafe",
          street: "111 Main Street",
          city: "Pittsburgh",
          state: "PA",
          zip: "15213",
          phone: "412-421-2238",
          rating: "3",
          time_rating: "3",
          images: [
            "rose_tea_1.jpg",
            "rose_tea_2.jpg",
            "rose_tea_3.jpg"
          ]
        },
        { name: "Cafe du Jour",
          street: "1107 E Carson Street",
          city: "Pittsburgh",
          state: "PA",
          zip: "15213",
          phone: "412-488-9695",
          rating: "5",
          time_rating: "4",
          images: [
            "cafe_du_jour_1.jpg",
            "cafe_du_jour_2.jpg",
            "cafe_du_jour_3.jpg"
          ]
        },
        { name: "Uncle Sam's Sandwich Bar",
          street: "2010 Oakland Ave",
          city: "Pittsburgh",
          state: "PA",
          zip: "15213",
          phone: "412-621-1885",
          rating: "2",
          time_rating: "3",
          images: [
            "uncle_sams_1.jpg",
            "uncle_sams_2.jpg",
            "uncle_sams_3.jpg"
          ]
        }
    ],
    prepop: false,
    prepopGlobals: {
        invite_place: "",
        invite_date: "",
        invite_time: "",
    }
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

        var fromButton = $(this).attr("id");
        console.log(fromButton);

        switch(fromButton){
            case "invite_button":
                $("#invites input").val("");
                toast_notification("invite_sent");
                break;
            case "invite_to_place":
                var place_name = $(this).parents("#place_page").find(".top_bar h1").text()
                Via.prepopGlobals.invite_place = place_name;
                var current_date = dateToMDY(new Date());
                Via.prepopGlobals.invite_date = current_date;
                var invite_time = stringFromTimeObj(getTimeObj(10));
                Via.prepopGlobals.invite_time = invite_time;
                Via.prepop = true;
                break;
        }

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

    /* bind geoloc button on routes form */
    $(".geoloc").on("click", function(e){
        e.preventDefault();
        var input = $(this).siblings("input");
        input.val("5000 Forbes Ave, Pittsburgh PA 15213");
        return false;
    })

    /* bind add list button on invite form */
    $(".invite_list").on("click", function(e){
        e.preventDefault();
        var input = $(this).siblings("input");
        input.val("Work Friends");
        return false;
    });

    /* bind fav button on invite form */
    $(".invite_fav").on("click", function(e){
        e.preventDefault();
        var input = $(this).siblings("input");
        input.val("Rose Tea Cafe");
        return false;
    });

    /* bind date button on invite form */
    $(".invite_date").on("click", function(e){
        e.preventDefault();
        var input = $(this).siblings("input");
        input.val(dateToMDY(new Date()));
    });

    /* bind time button on invite form */
    $(".invite_time").on("click", function(e){
        e.preventDefault();
        var input = $(this).siblings("input");
        var invite_time = stringFromTimeObj(getTimeObj());
        input.val(invite_time);
    });

    /* holy mother of callbacks what the hell is this */
    function toast_notification(notif_text){
        if(notif_text === undefined){
            // don't do anything if no notif text was provided
            return;
        }
        var notif = $("#top_notification");
        var notif_content = notif.find("#notif_content");
        notif.delay(1000).animate(
            {"top": "0px"},
            { duration: 300,
              complete: function(){
                $(this).animate(
                    {"top": "0px"},
                    { duration: 3000,
                      complete: function(){
                        $(this).animate(
                          {"top": "-2em"},
                          { duration: 300,
                            complete: function(){
                                notif_content.text(notif_text);
                            }
                          }
                        );
                      }
                    }
                );
              }
            }
        );
    };

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

    Handlebars.registerHelper("est_time", function(time_rating) {
        switch(time_rating){
            case "0":
                time_string = "0-5 min";
                break;
            case "1":
                time_string = "5-10 min";
                break;
            case "2":
                time_string = "10-20 min";
                break;
            case "3":
                time_string = "20-40 min";
                break;
            case "4":
                time_string = "40-60 min";
                break;
            case "5":
                time_string = "60+ min";
                break;
        }

        return time_string
    })

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
            callback = function(){
                if(Via.prepop){
                    console.log("prepopping");
                    var place_to_go = Via.prepopGlobals.invite_place;
                    $("input[name='invite_place']").val(place_to_go);
                    var invite_date = Via.prepopGlobals.invite_date;
                    $("input[name='invite_date']").val(invite_date);
                    var invite_time = Via.prepopGlobals.invite_time;
                    $("input[name='invite_time']").val(invite_time);
                    Via.prepop = false;
                }
            }
            break;
        case "invite_detail":
            var invite_id = $(event_target).data().id;
            content = get_html("invite_detail_template", Via.invites[invite_id]);
            load_target = $(nextPage);
            break;
        case "place_page":
            var place_id = $(event_target).data().id;
            content = get_html("place_detail_template", Via.places[place_id]);
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

function dateToMDY(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return '' + (m<=9 ? '0' + m : m) + '/' + (d <= 9 ? '0' + d : d) + '/' + y;
}

function getTimeObj(minutes_to_add){
    var date = new Date();
    if(minutes_to_add != undefined){
        date = new Date(date.getTime()+(minutes_to_add*1000*60));
    }
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
    var ampm = "am";

    if(hh > 11){
        ampm = "pm";
    }
    if (hh > 12) {
        hh = hh - 12;
    }
    return {
        hours: hh,
        minutes: mm,
        seconds: ss,
        ampm: ampm,
    }
}

function stringFromTimeObj(time_obj){
    console.log(time_obj);
    if (time_obj.minutes < 10) {time_obj.minutes = "0"+time_obj.minutes;}
    if (time_obj.sseconds < 10) {time_obj.seconds = "0"+time_obj.seconds;}

    return time_obj.hours + ":" + time_obj.minutes + " " + time_obj.ampm;
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
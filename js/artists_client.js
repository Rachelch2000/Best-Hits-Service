function openForm() {
    document.getElementById("myForm").style.display = "block";
}

function closeForm() {
    document.getElementById("myForm").style.display = "none";
}

function loadPage() {
    // print all artists to the screen
    get_artists();

    // add artist
    $(".open-button").click(function(e) {
        openForm()
        formValidation();
    });
    $("#myform").submit(function(event) {
        if (!$("#myform").valid()) return;
        // get the artist detailes from the form
        var art_details = [$("#id").val(), $("#name").val(), $("#birth_year").val(), $("#link_profile_picture").val()];

        addArtist(art_details);

        event.preventDefault();
        //close the form
        closeForm()
    });

}

//validation of the form
function formValidation() {
    $('#myform').validate({
        rules: {
            id: {
                required: true,
                digits: true
            },
            birth_year: {
                required: true,
                digits: true,
                minlength: 4,
                maxlength: 4
            }
        }
    });
}

// Send the artist information to the function associated with the server side
function addArtist(art_details) {
    $.ajax({
        type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
        url: 'http://localhost:3001/artists', // the url where we want to POST
        contentType: 'application/json',
        data: JSON.stringify({
            "id": art_details[0],
            "name": art_details[1],
            "birth_year": art_details[2],
            "link_profile_picture": art_details[3],
            "songs": []
        }),
        processData: false,
        encode: true,
        success: function(data, textStatus, jQxhr) {
            document.getElementById("myform").reset();
            get_artists();
        },
        error: function(jqXhr, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
}

// Get the sorted artists list
function get_artists() {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3001/artists',
        contentType: 'application/json',
        success: function(data) {
            add_artists_html(data);
        },
        error: function(data) {
            alert(data);
        }
    });
}

// send DELETE request to delete an artist
function delArtist(e) {
    $.ajax({
        type: 'DELETE',
        url: 'http://localhost:3001/artists/' + e.target.id,
        contentType: 'application/json',
        processData: false,
        encode: true,
        success: function(data, textStatus, jQxhr) {
            get_artists();
        },
        error: function(jqXhr, textStatus, errorThrown) {
            alert(errorThrown);
        }
    });
}

// send PUT request to add song to an artist
function addSong(e) {
    $.ajax({
        type: 'PUT',
        url: 'http://localhost:3001/songs/' + e.target.id,
        dataType: 'text',
        data: $("#song" + e.target.id).val(),
        processData: false,
        encode: true,
        success: function(data, textStatus, jQxhr) {
            console.log("Song is added: " + data);
            get_artists();
        },
        error: function(jqXhr, textStatus, errorThrown) {
            alert(errorThrown);
        }
    });
}

// send DELETE request to delete song of an artist
function delSong(e) {
    var deleateBtnID = e.target.id;

    matches = deleateBtnID.match(/\d+/g);
    var artID = matches[0];
    var songID = matches[1];

    $.ajax({
        type: 'DELETE',
        url: 'http://localhost:3001/songs/' + artID,
        dataType: 'text',
        data: songID,
        processData: false,
        encode: true,
        success: function(data, textStatus, jQxhr) {
            console.log(data);
            get_artists();
        },
        error: function(jqXhr, textStatus, errorThrown) {
            alert(errorThrown);
        }
    });
}

// Create table for the artists in the Html page
function add_artists_html(data) {
    $("table").remove();
    for (val in data) {
        var mylist = $("<table></table>");
        mylist.append("<br>");
        mylist.append($("<tr></tr>"));
        var button1 = $('<input class="delart" id="' + data[val].id + '" type="button" value="delete artist">');
        mylist.append(button1);
        var button2 = $('<input class="addsong" id="' + data[val].id + '" type="button" value="add song">');
        mylist.append(button2);
        var input = $('<input class="song" id="song' + data[val].id + '" type="input" placeholder="Song name...">');
        mylist.append(input);
        mylist.append($("<tr></tr>"));
        for (i in data[val]) {
            mylist.append($("<tr></tr>"));
            mylist.append($("<th></th>").text(i));

            if (data[val][i] == data[val].link_profile_picture) { //to see the picture
                mylist.append('<img src="' + data[val][i] + '">');
                continue;
            }
            // Create table for the songs lists
            if (Array.isArray(data[val][i])) {
                var songs = $("<table></table>");
                for (j in data[val][i]) {
                    songs.append($("<tr></tr>"));
                    songs.append($("<td></td>").text(data[val][i][j]));
                    songs.append($("<td></td>"));
                    var button = $('<input class="deletebtn" id="' + data[val].id + "deleteBtn" + j + '" type="button" value="delete">');
                    songs.append(button);
                }
                songs.appendTo(mylist);
                continue;
            }
            mylist.append($("<td></td>").text(data[val][i]));
        }

        mylist.append($("<tr></tr>"));
        mylist.append("<br>");
        mylist.appendTo($("#artists_list"));
    }

    // add event listeners
    $(".delart").click(function(e) {
        delArtist(e);
    });
    $(".addsong").click(function(e) {
        if ($("#song" + e.target.id).val() == '') return;
        addSong(e);
    });
    $(".deletebtn").click(function(e) {
        delSong(e);
    });
}
$("document").ready(loadPage);
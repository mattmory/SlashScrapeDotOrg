$(function () {
    //Set a favorite
    $(".favorite").on("click", function (event) {
        var id = $(this).attr("id");
        // Send the PUT request.
        $.ajax("/favorites/" + id, {
            type: "PUT",
            data: {fav: true}
        }).then(
            function () {
                // Reload the page to get the updated list
               location.reload();
            }
        );

    });

    //Remove a favorite
    $(".unfavorite").on("click", function (event) {
        var id = $(this).attr("id");
        // Send the PUT request.
        $.ajax("/favorites/" + id, {
            type: "PUT",
            data: {fav: false}
        }).then(
            function () {
                // Reload the page to get the updated list
                location.reload();
            }
        );

    });

    //Scrape it all
    $("#scrape").on("click", function (event) {
        // Send the PUT request.
        $.ajax("/scrape", {
            type: "get",
        }).then(
            function () {
                // Reload the page to get the updated list
                location.reload();
            }
        );

    });
});

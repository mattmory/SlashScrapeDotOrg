$(function () {
    $(".eat-burger").on("click", function (event) {
        var id = $(this).data("id");
        var eatenField = "#burger-" + id;
        var eatenBy = $(eatenField).val().trim();
        if (eatenBy !== null && eatenBy !== "" && eatenBy.length <= 55) {
            var eatBurger = {
                eaten: true,
                eaten_by: eatenBy
            };

            // Send the PUT request.
            $.ajax("/api/burgers/" + id, {
                type: "PUT",
                data: eatBurger
            }).then(
                function () {
                    // Reload the page to get the updated list
                    location.reload();
                }
            );
        }
        else {
            alert("Eater names cannot be blank or more than 55 characters!");
        }
    });

    $(".create-burger").on("submit", function (event) {
        event.preventDefault();
        var burgerName = $("#burger").val().trim();
        if (burgerName !== null && burgerName !== "" && burgerName.length <= 55) {
            var newBurger = {
                name: burgerName,
                eaten: true
            };

            // Send the POST request.
            $.ajax("/api/burgers", {
                type: "POST",
                data: newBurger
            }).then(
                function () {
                    // Reload the page to get the updated list
                    location.reload();
                }
            );
        }
        else {
            alert("Burger cannot be blank or more than 55 characters!");
        }
    });
});

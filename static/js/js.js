$(function () {
    var updateProgress;

    $(".js-vote_up, .js-vote_down").click(function (evt) {

        evt.preventDefault();
        evt.stopPropagation();
        var $button, $container, deadline_id, vote, user_data;

        $button = $(evt.target);
        if ($button.get(0).tagName.toLowerCase() === 'i') {
            $button = $button.parent('a'); //in case user clicked on arrow
        }

        $container = $button.parent('div');
        deadline_id = $container.attr("data-deadlineId");
        vote = $button.attr("data-vote");
        user_data = {"id": deadline_id, "vote": vote};
        $container.find('.btn').remove();

        $.ajax({
            url: "http://localhost:8080/deadlines/vote",
            type: "POST",
            data: user_data,
            dataType: "json",
            statusCode: {
                401: function () {
                    //show info you must be logged to vote
                    $container.find("span:eq(0)").text("You have to be logged in.").show().addClass("badge bg-error");
                }
            }
        }).done(
            function (data) { //data from server
                $container.find("span:eq(0)").text(data.result + "/" + data.amount).show().addClass("badge bg-success");
            }
        ).fail(
            function (jqXHR, textStatus, errorThrown) {
            }
        );
    });


    updateProgress = function () {
        $("div.js-progress_bar").each(function () {
            var endDate = $(this).attr("data-end"),
                createDate = $(this).attr("data-start"),
                currentDate = new Date().getTime(),
                timeProgress = ((currentDate - createDate) / (endDate - createDate)) * 100;

            $(this).css("width", timeProgress + "%");
        });
    }

    setInterval(function () {
        updateProgress();
    }, 3000);

    $("#datepicker").datepicker({
        changeMonth: true,
        changeYear: true
    });

});
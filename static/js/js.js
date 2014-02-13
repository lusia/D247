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

        deadline_id = $container.parents(".js-deadline").attr("data-deadlineId");
        vote = $button.attr("data-vote");
        user_data = {"id": deadline_id, "vote": vote};
        $container.find('.btn:lt(2)').remove();

        $.ajax({
            url: "/goal/vote",
            type: "POST",
            data: user_data,
            dataType: "json",
            statusCode: {
                401: function () {
                    //show info you must be logged to vote
                    $container.find("span:eq(0)").text("You have to be logged in").show();
                }
            }
        }).done(
            function (data) { //data from server
                $container.find("span:eq(0)").text(data.result + "/" + data.amount).show();
            }
        ).fail(
            function (jqXHR, textStatus, errorThrown) {
            }
        );
    });

    /**
     * update progress bar which show how much project's time was spent
     */
    updateProgress = function () {
        $("div.js-progresses_container").each(function () {
            var $this = $(this),
                endDate = $this.attr("data-end"),
                createDate = $this.attr("data-start"),
                currentDate = new Date().getTime(),
                timeProgress = Math.round(((currentDate - createDate) / (endDate - createDate)) * 100);

            $this.find(".js-progress_bar").css("width", timeProgress + "%");

            $this.find(".js-rounded_progress").data('easyPieChart').update(timeProgress);
            $this.find(".js-rounded_progress").find("span.h2").text(timeProgress);

            $this.find('#getting-started').countdown(endDate, function (event) {
                $(this).html(event.strftime('<strong>%-w</strong>' + ' week%!w ' + '<strong>%-D</strong> ' + 'day%!D' + ' <strong>%-H</strong> ' + 'hour%!H ' + '<strong>%-S</strong> ' + 'second%!S'));
            });
        });
    };

    setInterval(function () {
        updateProgress();
    }, 3000);
    updateProgress();

    $("#datepicker").datepicker({
        changeMonth: true,
        changeYear: true
    });


});
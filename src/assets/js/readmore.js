function name() {
    $(document).ready(function() {
        var abc = document.getElementById('DIV2');
        var MyDiv2 = document.getElementById('DIV2').innerHTML;
        var subs = document.getElementById('DIV2').innerHTML;
        if ($(".content").text().length > 10) {
            abc.innerHTML = subs.substring(0, 10);
        }
        $(".show_hide").on("click", function() {
            var txt = $(".content").is(':visible') ? 'Read More' : 'Read Less';
            $(".show_hide").text("");
            abc.innerHTML = MyDiv2;
            $(this).next('.content');
        });
    });
}
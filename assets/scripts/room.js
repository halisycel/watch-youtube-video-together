let domain = window.location.protocol + "//" + window.location.hostname;
let url = window.location.href;
let url_params = new URL(url);
let nickname = url_params.searchParams.get("n");
let room_id = url_params.searchParams.get("r");

//nicknamesi var mı diye kontrol ediyoruz yoksa yönlendiriyoruz
if ( (nickname === null) || (!((nickname.length >= 3) && (nickname.length <= 30))) ){
    window.location.replace(domain + "/redirect?r=" + room_id);
}else{
    $("body").css("display","block");
}

//oda id'sini ekrana yazıyoruz
$("#room-id").text(room_id);

//odanın paylaşılabilir linkini ekliyoruz
$("#share-link-copy-text").val(window.location.hostname + "/room?r=" + room_id);

//paylaşım linkini kopyalama tuşu
$("#share-link-copy-button").click(function(){
    let copyText = document.getElementById("share-link-copy-text");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
});

// mobilde search kısmını up-down yapıyoruz
$("#search-button-up-down").change(function() {
    if(this.checked) {
        $(".page .header").animate({"top" : "0"});
    }else{
        $(".page .header").animate({"top" : "-48px"});
    }
});

$("#info-button-up-down").change(function() {
    if(this.checked) {
        $(".page-body .yt-player-and-info .yt-in  div  .channel-and-description").fadeIn();
    }else {
        $(".page-body .yt-player-and-info .yt-in  div  .channel-and-description").fadeOut();
    }
})

$("#mobile-users-button input").change(function() {
    if (this.checked) {
        $(".page-body .right-compon .left").css({"display" : "flex"});
        $(".page-body .right-compon .left .users").css({
            "display":"flex",
            "height" : "100%"
        });
        $(".page-body .right-compon .right .messages").css("display","none");
        $(".page-body .right-compon .left .queue").css("display","none");
        $(".page-body .right-compon .right").css({
            "flex" : "none",
            "height" : "70px"
        })
    }
})

$("#mobile-queue-button input").change(function() {
    if (this.checked) {
        $(".page-body .right-compon .left").css({"display" : "flex"});
        $(".page-body .right-compon .left .queue").css({
            "display":"flex",
            "height" : "100%",
            "margin" : "5px"
        });
        $(".page-body .right-compon .right .messages").css("display","none");
        $(".page-body .right-compon .left .users").css("display","none");
        $(".page-body .right-compon .right").css({
            "flex" : "none",
            "height" : "70px"
        })
    }
})

$("#mobile-messages-button input").change(function() {
    if (this.checked) {
        $(".page-body .right-compon .left").css({"display" : "none"});
        $(".page-body .right-compon .right").css({
            "height" : "100%"
        })
        $(".page-body .right-compon .right .messages").css({
            "margin-top" : "5px",
            "display" : "flex",
            "height" : "100%"
        });  
    }
})

//kullanıcıları ayarlıyoruz
function appendUser(nickname,id, isMe = false){
    let user;
    if (isMe){
        user = $("<div class='user-component me' user-id='" + id + "'><div class='no'></div><div class='name'>" + nickname + "</div></div>");
    }else{
        user = $("<div class='user-component' user-id='" + id + "'><div class='no'></div><div class='name'>" + nickname + "</div></div>");
    }
    $(".right-compon .left .users .users-in").append(user);
    let n = 1;
    $(".right-compon .left .users .users-in").children().each(function(){
        $(this).children(".no").text(n);
        n += 1;
    })
}

function removeUser(id){
    $(".right-compon .left .users .users-in").children().each(function(){
        if ($(this).attr("user-id") == id){
            $(this).remove();
        }
    })
    let n = 1;
    $(".right-compon .left .users .users-in").children().each(function(){
        $(this).children(".no").text(n);
        n += 1;
    })
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

//mesajlar kısmı
function sendMessage(){
    let message_content = $("#send-message").val();
    if ( message_content.trim() != "" ){
        socket.emit("send-message",{
            "nickname" : nickname,
            "content" : message_content.trim()
        })
        $("#send-message").val("")
    }
}

$("#send-message-button").click(function(){
    sendMessage();
    
});

$("#send-message").on('keyup', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        sendMessage();
    }
});

//search results
$(".page-body .right-compon .right .results .search-results").css("width",$(".page-body .right-compon .right").width());

$("#search-close-button").click(function(){
    $(".page-body .right-compon .right .results").animate(
        {
            "width":"0px"
        },
        {
            complete: function(){
                $(".page-body .right-compon .right .results .search-results .all_results").empty();
            }
        });
})

function getSearch(){
    let search_query = $("#search-input").val();
    if (search_query.trim() != ""){
        $("#search-loading").css("visibility","visible");
        $.ajax({
            url: domain + "/yt-search?search=" + search_query,
            method: "get",
            success: function(data){
                $("#video-results").empty();
                data.forEach(video => {
                    let video_compon = $("<div class='video' video-id='" + video.id + "'><div class='add-to-queue'>add to queue</div></div>");
                    let thumbnail = $("<img class='video-thumbnail' src='" + video.thumbnail.url + "'>");
                    let video_info = $("<div class='video-info'></div>");
                    let channel_img = $("<div class='channel-img' style='background-image: url(\"" + video.channel.icon + "\")'></div>");
                    let video_title = $("<div class='video-title'><div class='in-title'>" + video.title + "</div></div>")
                    let channel_info = $("<div class='channel-info'>" + video.channel.name + "</div>")

                    video_compon.append(thumbnail);
                    video_info.append(channel_img);
                    video_title.append(channel_info);
                    video_info.append(video_title);
                    video_compon.append(video_info)

                    $("#video-results").append(video_compon);
                });
                videoEvents();
                $("#video-results").animate({scrollTop:0}, 500);
                $(".page-body .right-compon .right .results").animate({"width":"99%"});
                $("#search-loading").css("visibility","hidden");
            }
        })
    }
}

$("#search-button").click(function(){
    getSearch();
})

$("#search-input").on('keyup', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        getSearch();
    }
});






const socket = io();

let uniq_id = null;

appendUser(nickname, uniq_id, isMe = true);


//odaya bağlanıyorum
socket.emit("connection",{
    "nickname" : nickname,
    "room_id": room_id
});

// kendi id'mi alıyorum
socket.on("my-id", (data) => {
    uniq_id = data.uniq_id;
})


// odaya gelen gidenlere baktığım yer
socket.on("get-user",(data) => {
    if(data.recipients_id === uniq_id){
        appendUser(data.nickname,data.uniq_id);
    }
});

// biri çıkarsa haberim oluyor
socket.on("someone-disconnect", (data) => {
    removeUser(data.uniq_id);
    let message = $("<div class='user-message'><div class='content' style='color:#ff0000;'><b>" + data.nickname + "</b> has left us :(</div><hr></div>");
    $(".page-body .right-compon .right .messages .messages-in").append(message);
})

//odaya gelenlere bakıyorum
socket.on("i-am-connected",(data) => {
    appendUser(data.nickname,data.uniq_id);
    socket.emit("send-info",{
        "nickname" : nickname,
        "uniq_id" : uniq_id, 
        "recipients_id" : data.uniq_id
    })

    let message = $("<div class='user-message'><div class='content' style='color:#28B463;'><b>" + data.nickname + "</b> joined us :D</div><hr></div>");
    $(".page-body .right-compon .right .messages .messages-in").append(message);
});

// başkaları var mı? varsa ne izliyorlar diye kontrol edelim bakalım
socket.emit("what-am-i-watching");

socket.on("get-watching-video-id",(data) => {
    socket.emit("send-my-video-id", {"request_id" : data.request_id, "myvideoid" : player.getVideoData()['video_id']})
})

socket.on("get-message",(data) => {
    let message = $("<div class='user-message'><div class='author'>" + data.nickname + "</div><div class='content'>" + data.content + "</div><hr></div>");
    $(".page-body .right-compon .right .messages .messages-in").append(message);
    $(".page-body .right-compon .right .messages .messages-in").animate({scrollTop:99999999}, 500);
})

socket.on("open-video", (data) => {
    if (!is_first_video_open){
        is_first_video_open = true;
        $(".page-body .yt-player-and-info .cover").css("display","none");
        player.loadVideoById(data.video_id);
        first_video_load_time = new Date().getTime();
    }else if ((player.getVideoData()['video_id'] != data.video_id)){
        player.loadVideoById(data.video_id);
    }
})

socket.on("play", () => {
    player.playVideo();
})

socket.on("stop", () => {
    player.pauseVideo();
})

socket.on("client-seek", (data) => {
    player.seekTo(data.time);
    player.playVideo();
})

socket.on("client-correction", (data) => {
    socket.emit("send-my-data",{"uniq_id" : uniq_id, "request_id" : data.request_id, "mytime" : player.getCurrentTime()});
})

let current_users = [];

socket.on("get-current-users", (data) => {
    setTimeout(function(){
        data.users.forEach(e => {
            if (e == uniq_id) {
                current_users.push({
                    "user" : e,
                    "time" : player.getCurrentTime()
                })
            }else{
                current_users.push({
                    "user" : e,
                    "time" : null
                })
            }
        });
    },1000)
})

socket.on("get-users-time", (data) => {
    setTimeout(function(){
        current_users.forEach(e => {
            if (e.user == data.user_id) {
                e.time = data.user_time;
            }
        })
        let i = 0;
        current_users.forEach(e => {
            if (e.time == null){
                i += 1;
            }
        });
        if (i == 0){
            current_users.sort(function(x,y){
                return y.time - x.time; 
            });
            player.seekTo(current_users[0].time + 2);
        }
    },2000)
})

socket.on("load-video-after", (data) => {
    setTimeout(function() {
        if (player.getVideoData()['video_id'] != data.video_id){
            is_first_video_open = true;
            $(".page-body .yt-player-and-info .cover").css("display","none");
            player.loadVideoById(data.video_id);
            first_video_load_time = new Date().getTime();
            socket.emit("request-current-users",{"room" : room_id});
            socket.emit("request-other-users-time", {"uniq_id" : uniq_id});
            createInfo(player.getVideoUrl());
        }
    },2000)
})

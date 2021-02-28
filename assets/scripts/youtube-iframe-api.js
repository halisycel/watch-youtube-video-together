
function videoEvents(){
    $('#video-results .video').on('click', function(e) {
        if (e.target == $(this).children(".add-to-queue")[0]){
            // add to queue
        }else{
            socket.emit("request-open-video",{
                "video_id" : $(this).attr("video-id")
            })
        }
    });
}

function kFormatter(x) {
    if(isNaN(x)) return x;

    else if(x <= 999){
        return x;
    }

	else if(x <= 9999) {
        if(String(x).substring(1,2) == "0"){
            return String(x).substring(0,1) + "K";
        }else{
            return String(x).substring(0,1) + "," + String(x).substring(1,2) + "K";
        }
		
	}

	else if(x <= 1000000) {
		return Math.round(x/1000) + "K";
	}
	else if( x <= 10000000) {
		return (x/1000000).toFixed(2) + "M";
	}

	else if(x <= 1000000000) {
		return Math.round((x/1000000)) + "M";
	}

	else if(x <= 1000000000000) {
		return Math.round((x/1000000000)) + "B";
	}

    else{
        return "1T+";
    }
	
}

function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      return '<a target="_blank" href="' + url + '">' + url + '</a>';
    })
}

let is_first_video_open = false;
let seekList = [];
let first_video_load_time;

//player

let tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;
let current_video_id;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '450',
        width: '800',
        videoId: null,
        playerVars : {
            'autoplay' : 1
        },
        events: {
            'onReady' : onPlayerReady,
            'onStateChange' : stateChange,
        }
    });
}

function onPlayerReady(event) {
    player.mute();
    player.playVideo();
}

function detectSeek(state){
    seekList.push(state);
    if (seekList.length === 4){
        seekList.shift();
    }if ( (seekList[0] == 1) && (seekList[1] == 2) && (seekList[2] == 3) ){
        socket.emit("seek",{"time" : player.getCurrentTime()});
    }else if( (seekList[0] == 1) && (seekList[1] == 2) && (seekList[2] == 1) ){
        socket.emit("seek",{"time" : player.getCurrentTime()});
    }else if( (seekList[0] == -1) && (seekList[1] == 3) && (seekList[2] == 1)){
        let current_time = new Date().getTime();
        if ( (current_time - first_video_load_time) > 3000){
            socket.emit("request-current-users",{"room" : room_id});
            socket.emit("request-other-users-time", {"uniq_id" : uniq_id});
        }
    }
}

function createInfo(url){
    console.log(url);
    $.ajax({
        url : domain + "/yt-meta-data?url=" + url,
        method : "get",
        success: function(data){
            console.log(data);
            $(".page-body .yt-player-and-info .yt-in .info").css("visibility","hidden");
            $("#yt-title").text(data.title);
            $("#yt-title").attr("href",url);
            $("#yt-views").text(data.views);
            $("#yt-upload-date").text(data.uploadedAt);
            $("#yt-like").text(kFormatter(data.likes));
            $("#yt-dislike").text(kFormatter(data.dislikes));
            $("#yt-channel-link").attr("href",data.channel.url);
            $("#yt-channel-img").attr("src",data.channel.icon);
            $("#yt-channel-name").text(data.channel.name);
            $("#yt-channel-subs").text(kFormatter(data.channel.subs));
            $("#yt-description").html(urlify(data.description));
            $(".page-body .yt-player-and-info .yt-in .info").css("visibility","visible");
            $(".page-body .yt-player-and-info .yt-in .info").css("display","block");
        }
    })
}

function stateChange(){
    let state = player.getPlayerState();

    detectSeek(state);
    if (state == 1){
        socket.emit("request-play");
        if (player.getVideoData()['video_id'] != current_video_id){
            current_video_id = player.getVideoData()['video_id'];
            createInfo(player.getVideoUrl());
        }
    }else if (state == 2){
        socket.emit("request-stop");
    }else if (state == -1){
        player.playVideo();
    }
}
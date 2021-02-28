
let domain = window.location.protocol + "//" + window.location.hostname;
let url = window.location.href;
let url_params = new URL(url);
let room_id = url_params.searchParams.get("r");

$("#w2g-room-code").val(room_id);

function join_room() {
    let nickname = $("#w2g-nickname").val();
    if ((3 <= nickname.length)  && (nickname.length <= 30)){
        window.location.replace(domain + "/room?r=" + room_id + "&n=" + nickname);
    }else{
        console.log("nickname başarısız");
    }
}

$("#w2g-join-room").click(function(){
   join_room(); 
})

$("#w2g-nickname").on('keyup', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        join_room();
    }
});
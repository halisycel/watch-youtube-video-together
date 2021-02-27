
let domain = window.location.protocol + "//" + window.location.hostname;

function room_code() {
    return Math.floor(Math.random() * 1000000);
};

function check_nickname(nickname){
    if ((3 <= nickname.length)  && (nickname.length <= 30)){
        return true;
    }else{
        return false;
    }
}

function create_room() {
    let nickname = $("#w2g-nickname").val();
    if (check_nickname(nickname)){
        window.location.replace(domain + "/room?r=" + room_code() + "&n=" + nickname);
    }else{
        console.log("nickname başarısız");
    }
}
function join_room(){
    let nickname = $("#w2g-nickname").val();
    if (check_nickname(nickname)){
        window.location.replace(domain + "/room?r=" + $("#w2g-room-code").val() + "&n=" + nickname);
    }else{
        console.log("nickname başarısız");
    }
}

$("#w2g-create-room").click(function(){
   create_room(); 
})

$("#w2g-room-code").on('keyup', function (e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        if( ($("#w2g-room-code").val() != undefined) && $("#w2g-room-code").val().length != 6){
            join_room();
        }
    }
});

$("#w2g-join-room").click(function(){
    if( ($("#w2g-room-code").val() != undefined) && $("#w2g-room-code").val().length == 6){
        join_room();
    }
})
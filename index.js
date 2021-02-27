const path = require('path');
const express = require('express')
const app = express()
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const YouTube = require('youtube-sr').default;
const ytch = require('yt-channel-info');

//home-page
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

//room
app.get('/room', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/video.html'))
})

// room redirect
app.get('/redirect', (req,res) => {
    res.sendFile(path.join(__dirname + '/views/redirect.html'))
})

// youtube video get meta data
app.get('/yt-meta-data', (req, res) => {
    YouTube.getVideo(req.query.url)
        .then((data) => {
            ytch.getChannelInfo(data.channel.id).then((response) => {
                res.send({
                    title: data.title,
                    views: data.views,
                    likes: data.likes,
                    dislikes: data.dislikes,
                    uploadedAt: data.uploadedAt,
                    description: data.description,
                    channel: {
                        name: data.channel.name,
                        icon: response.authorThumbnails[response.authorThumbnails.length - 1].url,
                        subs: response.subscriberCount,
                        url: response.authorUrl
                    }
                });
            }).catch((err) => {
                console.log(err);
                res.send(data);
            });
        });
})

// youtube search get data
app.get('/yt-search', (req,res) => {
    YouTube.search(req.query.search, { limit: 10 })
    .then(x => {
        res.send(x)
    })
    .catch((err) => {
        console.log(err);
    });
})

// assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

//listening
http.listen(process.env.PORT || 80, () => {
    console.log(`Watch Together App listening`)
})

io.on('connection', function(socket) {
    let nickname;
    let room_id;
    let uniq_id;

    socket.on("connection", (data) => {
        nickname = data.nickname;
        room_id = data.room_id;
        uniq_id = socket.id;

        // odaya bağlandım
        socket.join(room_id);

        // client'e id'sini gönderiyorum
        io.to(socket.id).emit("my-id",{"uniq_id" : uniq_id});

        // odaya bağlandığımı diğer arkadaşlara ilan ediyorum
        socket.to(room_id).emit("i-am-connected",{
            "nickname" : nickname,
            "uniq_id" : uniq_id
        });
    })

    socket.on("send-info",(data) => {
        socket.to(room_id).emit("get-user",data);
    })

    socket.on("send-message", (data) => {
        io.to(room_id).emit("get-message", data);
    })

    socket.on("request-open-video", (data) => {
        io.to(room_id).emit("open-video", data);
    })

    socket.on("request-play", (data) => {
        socket.to(room_id).emit("play", data);
    })

    socket.on("request-stop", (data) => {
        socket.to(room_id).emit("stop", data);
    })

    socket.on("seek",(data) => {
        socket.to(room_id).emit("client-seek",data);
    })

    socket.on("request-other-users-time", (data) => {
        socket.to(room_id).emit("client-correction",{"request_id" : data.uniq_id});
    })

    socket.on("request-current-users", (data) => {
        const clients = Object.fromEntries(io.sockets.adapter.rooms);
        const myRoom = Array.from(clients[data.room]);
        socket.emit("get-current-users",{"users" : myRoom});
    })

    socket.on("send-my-data", (data) => {
        io.to(data.request_id).emit("get-users-time", {"user_id" : data.uniq_id, "user_time" : data.mytime})
    })

    // diğerlerinin ne izlediğini öğreneceğim kısım

    socket.on("what-am-i-watching",() => {
        socket.to(room_id).emit("get-watching-video-id", {"request_id" : socket.id});
    })

    socket.on("send-my-video-id", (data) => {
        io.to(data.request_id).emit("load-video-after",{"video_id" : data.myvideoid})
    })

    socket.on('disconnect', () => {
        socket.to(room_id).emit("someone-disconnect",{
            "nickname" : nickname,
            "uniq_id" : uniq_id
        })
    })
})
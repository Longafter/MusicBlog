// 云函数入口文件
const cloud = require('wx-server-sdk')

const TcbRouter = require('tcb-router')

const rp = require('request-promise')

const BASE_URL = 'http://musicapi.leanapp.cn'

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    const app = new TcbRouter({event})

    // 获取歌单
    app.router('playlist', async(ctx, next) => {
        // ctx.body代替return返回值至小程序端
        ctx.body = await db.collection('playlist')
            .skip(event.start)
            .limit(event.count)
            .orderBy('createTime', 'desc')
            .get()
            .then((res) => {
                console.log('歌单获取成功')
                return res
            })
            .catch((err) => {
                console.log('歌单获取失败')
            })
    })

    // 获取歌单里的歌曲列表
    app.router('musiclist', async(ctx, next) => {
        ctx.body = await rp(BASE_URL + '/playlist/detail?id=' + parseInt(event.playlistId))
        .then((res) => {
            return JSON.parse(res)
        })
    })

    // 获取歌曲列表的单首歌曲
    app.router('musicUrl', async(ctx, next) => {
        ctx.body = await rp(`https://music.163.com/song/media/outer/url?id=${event.musicId}.mp3`)
        .then((res) => {
            console.log("[歌曲音源][获取成功]", res)
            return res
        }).catch((err) => {
            console.log("[歌曲音源][获取失败]", err)
        })
    })

    // 获取歌曲歌词
    app.router('lyric', async(ctx, next) => {
        ctx.body = await rp(`https://music.163.com/api/song/lyric?id=${event.musicId}&lv=1&kv=1&tv=-1`)
        .then((res) => {
            return res
        })
    })

    return app.serve()
}
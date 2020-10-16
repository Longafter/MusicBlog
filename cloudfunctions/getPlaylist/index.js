// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const rp = require('request-promise')

const URL = 'http://musicapi.leanapp.cn/personalized'

const playlistCollection = db.collection('playlist')

// 云函数入口函数
exports.main = async (event, context) => {
    const existdPlaylist = await playlistCollection.get()

    const playlist = await rp(URL)
    .then((res) => {
        // 调用接口返回的数据是字符串，需要转化为json格式
        result = JSON.parse(res).result
        return result
    })
    // console.log(playlist)

    // 歌单去重，如果歌单已经存在，不需要存到数据库
    const newData = []
    for (let i = 0; i < playlist.length; i++) {
        let flag = true  // true表示不重复
        for (let j = 0; j < existdPlaylist.data.length; j++) {
            if (playlist[i].id === existdPlaylist.data[j].id) {
                flag = false
                break
            }
        }
        if (flag) {
            newData.push(playlist[i])
        }
    }

    // 将获取到的歌单信息存储至云数据库
    for (let i = 0; i < newData.length; i++) {
        await playlistCollection.add({
            data: {
                ...newData[i],  // ES6语法，扩展运算符，能取到对象每一个值
                createTime: db.serverDate(),
            }
        }).then((res) => {
            console.log('歌单信息插入成功！')
        }).catch((err) => {
            console.log('歌单信息插入失败...')
        })
    }

    return newData.length
}
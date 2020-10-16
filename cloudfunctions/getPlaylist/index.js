// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const rp = require('request-promise')

const URL = 'http://musicapi.leanapp.cn/personalized'

const playlistCollection = db.collection('playlist')

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
    // const existdPlaylist = await playlistCollection.get()

    // 解决云端请求数据库每次只能返回100条数据的限制
    // 思路：分次数取，再将结果拼接起来
    const countResult = await playlistCollection.count()  // 返回的是对象
    const total = countResult.total  // 将对象转化为总数
    const batchTimes = Math.ceil(total / MAX_LIMIT)  //向上取整，表示分次取数所需次数
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
        // skip: 从第几条数据开始取
        // limit: 每次取得数据条数
        let promise = playlistCollection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
        tasks.push(promise)
    }
    let existdPlaylist = {
        data: []
    }
    if (tasks.length > 0) {
        // 等所有任务都完成后（数据取完）再累加数据
        existdPlaylist = (await (Promise.all(tasks))).reduce((acc, cur) => {
            return {
                data: acc.data.concat(cur.data)
            }
        })
    }

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
// components/playlist/playlist.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        playlist: {
            type: Object
        }
    },

    // 数据监听
    observers: {
        // playlist(value) {
        //     console.log(value)
        // }
        // 监听对象里某项值
        ['playlist.playCount'](count) {
            this.setData({
                _count: this._transNumber(count, 2)
            })
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        _count: 0
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 跳转歌单详情页面
        goToMusiclist() {
            wx.navigateTo({
              // ES6语法，`${}`拼接字符串
              url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`,
            })
        },

        // 数字格式化，num：转化对象 point：保留小数点后几位
        _transNumber(num, point) {
            // 如果 num 有小数点，则取整数部分
            let numStr = num.toString().split('.')[0]
            if (numStr.length < 6) {
                return numStr
            } else if (numStr.length >= 6 && numStr.length <= 8) {
                // substring 截取两个指标之间的字符
                let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point)
                return parseFloat(parseInt(num / 10000)  + '.' + decimal) + '万'
            } else if (numStr.length > 8) {
                let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point)
                return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿'
            }
        }
    }
})

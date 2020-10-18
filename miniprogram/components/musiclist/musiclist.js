// components/musiclist/musiclist.js
const app = getApp()

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        musiclist: {
            type: Array
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        playingId: -1
    },
    
    /**
     * 组件所在页面的生命周期
     */
    pageLifetimes: {
        // 组件所在的页面被展示时执行
        show() {
          this.setData({
            playingId: parseInt(app.getPlayingMusicId())
          })
    
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        onSelectMusic(event) {
            const musicid = event.currentTarget.dataset.musicid
            const index = event.currentTarget.dataset.index
            // console.log("被选中歌曲", musicid)
            this.setData({
                playingId: musicid
            })
            wx.navigateTo({
              url: `../../pages/player/player?musicId=${musicid}&index=${index}`,
            })
        }
    }
})

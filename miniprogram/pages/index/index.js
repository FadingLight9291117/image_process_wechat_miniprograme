// index.js
Page({
  data: {
    serverIpAndPort: '',
    isAccess: '',
    imagePathList: [],
  },
  onLoad() {
    const serverIpAndPort = wx.getStorageSync('serverIpAndPort') ?? ''
    this.setData({
      serverIpAndPort: serverIpAndPort
    })
  },


  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  onIpInputChange(e) {
    const ipAndPort = e.detail.value
    this.setData({
      serverIpAndPort: ipAndPort,
    })
    wx.setStorageSync('serverIpAndPort', ipAndPort); // 存储到本地缓存
  },

  onSelectImage(e) {
    console.log('onSelectImage')
    wx.chooseMedia({
      count: 99,
      mediaType: ['image', 'video'],
      sourceType: ['album', 'camera'],
      maxDuration: 30,
      camera: 'back',
      success: (res) => {
        console.log('选择图片数量: ' + res.tempFiles.length)
        const filePaths = res.tempFiles.map(item => {
          return {
            path: item.tempFilePath,
            result: "",
          }
        })
        this.setData({
          imagePathList: filePaths
        })
      }
    })
  },

  onTestServerAccess(e) {
    console.log('submit button click.')
    wx.showLoading({
      title: '连接中...',
    })
    wx.request({
      url: `http://${this.data.serverIpAndPort}/ping`,
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        this.setData({
          isAccess: true,
        })
        wx.hideLoading()
      },
      fail: () => {
        this.setData({
          isAccess: false,
        })
        wx.hideLoading()
      }
    })
  },

  onSubmitClick(e) {
    console.log('submit button click.')
    wx.showLoading({
      title: '上传...',
    });

    const imagePathList = this.data.imagePathList
    for (let imagePath of imagePathList) {
      const path = imagePath.path
      this.uploadOneImage(path,
        (res) => {
          const result = res.res
          console.log(result)
          imagePath.result = result
          this.setData({
            imagePathList: [...imagePathList],
          })
          if (imagePath === imagePathList[imagePathList.length - 1]) {
            wx.hideLoading();
          }
        },
        () => {
          imagePath.result = 'Fail'
          this.setData({
            imagePathList: [...imagePathList],
          })
          if (imagePath === imagePathList[imagePathList.length - 1]) {
            wx.hideLoading();
          }
        })
    }
  },

  // 一次只能上传一个图片
  uploadOneImage(imagePath, success, fail) {
    wx.uploadFile({
      url: `http://${this.data.serverIpAndPort}/upload`,
      filePath: imagePath,
      name: 'file',
      formData: {
        'user': 'test'
      },
      success(res) {
        const data = JSON.parse(res.data)
        success(data[0])
      },
      fail(e) {
        console.error(e)
        fail()
      }
    })
  },
})
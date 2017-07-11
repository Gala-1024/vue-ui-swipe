/**
 * todolist
 * 1:左右滑动开始的回调方法
 * 2:左右滑动结束的回调方法
 * 3:设置默认图片
 */
// 构造函数
var VueUiSwipe = function (el, params) {
  this.config = {
    el: el,
    elm: el.querySelector('.ui-swiper'),
    delay: params.delay || 3000,
    autoPlay: (params.autoPlay === undefined) ? true : params.autoPlay,
    playTimeOut: '',
    bOrder: true,
    index: 0,
    startX: 0,
    median: 0,
    transform: 0,
    swiperLength: el.querySelector('.ui-swiper').querySelectorAll('.ui-swiper-box').length,
    isMobile: !!navigator.userAgent.match(/Android|Phone|iPad|iPod/i)
  }
}
// touchStart
VueUiSwipe.prototype.touchStart = function (el) {
  el.preventDefault()
  var touches = el.touches ? el.touches[0] : el
  this.config.startX = touches.pageX
  clearInterval(this.config.playTimeOut)
}
// touchEnd
VueUiSwipe.prototype.touchEnd = function (el) {
  el.preventDefault()
  var touches = el.changedTouches ? el.changedTouches[0] : el
  this.config.median = touches.pageX - this.config.startX
  // Slide from left to right
  if (this.config.median < -30) {
    if ((this.config.swiperLength - 1) > this.config.index) {
      this.config.index++
      this.setTransform()
    }
    // Slide from right to left
  } else if (this.config.median > 30) {
    if (this.config.index > 0) {
      this.config.index--
      this.setTransform()
    }
  }
  this.config.playTimeOut = setInterval(this.play.bind(this), this.config.delay)
}
// touchMove
VueUiSwipe.prototype.touchMove = function (event) {
  event.preventDefault()
}
// mouseOver
VueUiSwipe.prototype.mouseOver = function (event) {
  clearInterval(this.config.playTimeOut)
}
// mouseOut
VueUiSwipe.prototype.mouseOut = function (event) {
  clearInterval(this.config.playTimeOut)
  this.config.playTimeOut = setInterval(this.play.bind(this), this.config.delay)
}
// init
VueUiSwipe.prototype.init = function () {
  // swiper nav
  var elParentNode = this.config.el.parentNode
  if (elParentNode.getElementsByTagName('ul').length > 0) {
    elParentNode.removeChild(elParentNode.getElementsByTagName('ul')[0])
  }
  var ul = document.createElement('ul')
  for (var i = 0; i < this.config.swiperLength; i++) {
    var li = document.createElement('li')
    li.setAttribute('data-index', i)
    if (parseInt(this.config.index) === i) {
      li.classList.add('ui-swiper-active')
    } else {
      li.classList.add('ui-swiper-nav-li')
    }
    // bind
    var liAddList = function (e) {
      if (parseInt(this.config.index) === parseInt(e.toElement.dataset.index)) {
        return
      }
      clearInterval(this.config.playTimeOut)
      this.config.index = parseInt(e.toElement.dataset.index)
      this.setTransform()
      this.config.playTimeOut = setInterval(this.play.bind(this), this.config.delay)
    }
    li.addEventListener('click', liAddList.bind(this), false)
    ul.appendChild(li)
    ul.classList.add('ui-swiper-nav')
  }
  elParentNode.appendChild(ul)
  // bind touch event handling
  if (this.config.isMobile === true) {
    this.config.el.addEventListener('touchstart', this.touchStart.bind(this), false)
    this.config.el.addEventListener('touchend', this.touchEnd.bind(this), false)
    this.config.el.addEventListener('touchmove', this.touchMove.bind(this), false)
  } else {
    this.config.el.addEventListener('mousedown', this.touchStart.bind(this), false)
    this.config.el.addEventListener('mouseup', this.touchEnd.bind(this), false)
    this.config.el.parentNode.addEventListener('mouseover', this.mouseOver.bind(this), false)
    this.config.el.parentNode.addEventListener('mouseout', this.mouseOut.bind(this), false)
  }
  this.imageLazy()
  this.config.playTimeOut = setInterval(this.play.bind(this), this.config.delay)
}
// autoPlay
VueUiSwipe.prototype.play = function () {
  if (this.config.autoPlay === true) {
    // 判断播放顺序
    this.config.bOrder ? this.config.index++ : this.config.index--
    // 正序
    this.config.index >= this.config.swiperLength && (this.config.index = this.config.swiperLength - 2, this.config.bOrder = false)
    // 倒序
    this.config.index <= 0 && (this.config.index = 0, this.config.bOrder = true)
    this.setTransform()
  }
}
// image lazy
VueUiSwipe.prototype.imageLazy = function () {
  var imgIndex = this.config.el.querySelectorAll('.ui-swiper-box')[this.config.index].getElementsByTagName('img')[0]
  if (imgIndex === undefined) {
    return
  }
  if (imgIndex.classList.contains('ui-swiper-filter') === false) {
    return
  }
  var img = new Image()
  img.src = imgIndex.dataset.src
  img.onload = function (data) {
    imgIndex.setAttribute('src', imgIndex.dataset.src)
    imgIndex.classList.remove('ui-swiper-filter')
  }
}
// change Transform value
VueUiSwipe.prototype.setTransform = function () {
  // set active
  var navLiLength = this.config.el.parentNode.querySelector('.ui-swiper-nav').querySelectorAll('li')
  for (var i = 0; i < navLiLength.length; i++) {
    navLiLength[i].classList.remove('ui-swiper-active')
  }
  navLiLength[this.config.index].classList.add('ui-swiper-active')
  // image lazy
  this.imageLazy()
  // set transform
  this.config.transform = this.config.index * this.config.elm.clientWidth
  this.config.elm.style.transform = 'translate3d(-' + this.config.transform + 'px, 0px, 0px)'
}
export default {
  componentUpdated: function (el, binding) {
    var params
    if (binding.value) {
      params = {
        delay: binding.value.delay || 3000,
        autoPlay: (binding.value.autoPlay === undefined) ? true : binding.value.autoPlay
      }
    } else {
      params = {
        delay: 3000,
        autoPlay: true
      }
    }
    var vueUiSwiper = new VueUiSwipe(el, params)
    vueUiSwiper.init()
  }
}

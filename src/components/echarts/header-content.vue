<template>
<section class="header-container">
<div class="header-center">
  <img src="/dolphinweb/resource/themes/floodforecast/BG.svg" style="pointer-events: none;-webkit-user-drag: none;user-select: none" alt="">
  <span class="label">{{title}}</span>
</div>
<div class="header-left">
  <div class="header-item-left header-item" :class="itemIndex === index ? 'is-active' : ''" v-for="(item, index) in leftItems" @click="setIndex(index)" :key="index">
    <div class="menu-btn"></div>
    <div class="menu">
      <div class="light-point"></div>
      {{item.name}}
    </div>
  </div>
</div>
<div class="header-right">
  <div class="header-item-right header-item" :class="itemIndex === (leftItems.length + index) ? 'is-active' : ''" v-for="(item, index) in rightItems" @click="setIndex(leftItems.length + index)" :key="leftItems.length + index">
    <div class="menu-btn"></div>
    <div class="menu">
      <div class="light-point"></div>
      {{item.name}}
    </div>
  </div>
</div>
</section>
</template>

<script>
export default {
  name: 'header-content',
  components: {},
  props: {
    title: {
      type: String,
      default: '水库洪水预报防洪系统'
    },
    leftItems: {
      type: Array,
      default: () => {
        return [
          { name: '防洪研判', type: 0, toPath: '/situation' },
          { name: '调度研判', type: 1, toPath: '/reservoir' },
          { name: '洪水演进', type: 2, toPath: '/flood' },
          { name: '避险转移', type: 3, toPath: '/escape' }
        ]
      }
    },
    rightItems: {
      type: Array,
      default: () => {
        return [
          { name: '方案比选', type: 4, toPath: '/schemecompare' },
          { name: '模拟预报', type: 5, toPath: '/simulationForecasting' },
          { name: '预警发布', type: 6, toPath: '/earlyWarning' },
          { name: '抢险支持', type: 7, toPath: '/rescueSupport' }
        ]
      }
    },
    currentIndex: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      itemIndex: 0
    }
  },
  mounted () {
    this.itemIndex = this.currentIndex
  },
  methods: {
    setIndex (val) {
      if (this.itemIndex === val) return
      const menu = [
        ...this.leftItems,
        ...this.rightItems
      ][val]
      if (menu?.isBlank) { // 跳转到外部页面
        window.open(menu.toPath, '_blank')
      } else {
        this.itemIndex = val
        this.$emit('setIndex', menu)
        this.$nextTick(() => {
          this.$router.push({ path: menu.toPath })
        })
      }
    }
  }

}
</script>

<style lang="scss" scoped>
.header-container {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 32px);
  margin-left: 16px;
  height: 85px;
  z-index: 99;
  .header-center{
    position: absolute;
    overflow: hidden;
    width: 700px;
    left: 50%;
    height: 100%;
    top: 0;
    margin-left: -350px;
    img {
      position: absolute;
      left: 50%;
      top: 0;
      margin-left: -960px;
    }
    .label{
      position: absolute;
      left: 0;
      top: 15px;
      width: 100%;
      text-align: center;
      font-family: 'youshebiaotihei';
      color: #E2F3FF;
      font-size: 48px;
      text-shadow: 0 0 20px #009DFF, 0 0 20px #009DFF;
    }
  }
  .header-left,.header-right {
    display: flex;
    position: absolute;
    justify-content: space-between;
    width: calc(50% - 350px);
    padding: 0 30px;
    height: 100%;
    z-index: 100;
  }
  .header-item {
    width: calc(100% - 8px);
    height: 100%;
    z-index: 100;
    .menu {
      position: absolute;
      top: 0;
      left: 0;
      cursor: pointer;
      width: calc(100% - 10px);
      height: 100%;
      text-align: center;
      line-height: 46px;
      font-size: 26px;
      color: #00A6F0;
      transition: all 0.2s linear;
      font-family: 'pangmenzhengdao';
      box-shadow: inset 0 0 10px 5px #004391;
      background: linear-gradient(to top, #000307, #004DA7FF);
      z-index: 100;
      .light-point {
        position: absolute;
        bottom: -5px;
        left: 40%;
        width: 20%;
        height: 1px;
        box-shadow:
          0 0 30px 8px #36D1FF;
        background-color: #fff;
      }
    }
    .menu-btn{
      width: calc(100% - 10px);
      height: 100%;
      transform: perspective(1px) scaleX(1.01) scaleY(1.04);
      transform-origin: center center;
      //background-color: #249AFF;
      background: linear-gradient(70deg, #36D1FF, #005CB7, #36D1FF 43%, #005CB7, #36D1FF);
      z-index: 99;
    }
  }
  .is-active {
    .menu {
      background-image: radial-gradient(#00F5FF 20%, #0045C6 100%);
      color: #FFF;
      text-shadow: 0 0 10px #00B1FF;
      z-index: 97;
    }
    .menu-btn{
      background: linear-gradient(to bottom right, #36D1FF, #005CB7, #36D1FF, #005CB7);
      z-index: 96;
    }
  }
  .header-left {
    left: 0;
    .header-item-left {
      position: relative;
      height: 46px;
      top: 20px;
      .menu {
        clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%, 0 0);
      }
      .menu-btn{
        clip-path: polygon(0 0, 90% 0, 100% 100%, 10% 100%, 0 0);
      }
    }
  }
  .header-right {
    right: -30px;
    .header-item-right {
      position: relative;
      height: 46px;
      top: 20px;
      .menu {
        clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%, 10% 0);
      }
      .menu-btn{
        clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%, 10% 0);
      }
    }
  }
}
</style>

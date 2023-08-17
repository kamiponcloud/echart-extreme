<template>
  <!-- <div> -->
    <!-- model-section -->
    <div class="header-content">
      <div class="model" :class="{'model-select': currentModelIndex === item.type}" v-for="item in modelList" :key="item.type" @click="switchAction(item.type)">{{item.name}}</div>
    </div>
</template>
<script>

export default {
  name: 'HeaderContent',
  props: {
    currentIndex: {
      default: 0,
      type: Number
    },
    modelList: {
      type: Array,
      default: () => {
        return [
          // { name: '形势分析', type: 0, toPath: '/situation' },
          { name: '防洪研判', type: 0, toPath: '/situation' },
          { name: '调度研判', type: 1, toPath: '/reservoir' },
          { name: '洪水演进', type: 2, toPath: '/flood' },
          { name: '避险转移', type: 3, toPath: '/escape' },
          { name: '方案比选', type: 4, toPath: '/schemecompare' }
        ]
      }
    }
  },
  data () {
    return {
      currentModelIndex: this.currentIndex,
      lastPath: ''
    }
  },
  created () {
  },
  mounted () {
    this.lastPath = this.modelList[this.currentIndex].toPath
  },
  watch: {
    currentIndex (val) {
      this.switchAction(val)
    }
  },
  methods: {
    switchAction (index) {
      this.currentModelIndex = index
      let item = this.modelList[index]
      if (this.lastPath === item.toPath) return
      item.lastPath = this.lastPath
      this.lastPath = item.toPath
      this.$emit('handleClick', item)
      let geturl = window.location.href
      let getqyinfo = geturl.split('?')[1] || ''
      this.$router.push({ path: item.toPath + '?' + getqyinfo })
      // this.$router.push({ path: item.toPath })
    }
  }
}
</script>
<style lang="scss" scoped>
// 模块切换
.header-content{
  // display: flex;
  // align-items: center;
  // flex-wrap: wrap;
  // margin-left: 10px;
  // max-width: calc(100% - 528px * 2);

  transition-property: all;
  transition-duration: 0.5s;

  .model{
    margin-right: 10px;
    margin-bottom: 10px;
    width: 135px;
    height: 46px;
    line-height: 46px;
    clip-path: polygon(15px 0%, calc(100% - 15px) 0%, 100% 50%, calc(100% - 15px) 100%, 15px 100%, 0% 50%);
    background-image: linear-gradient(to bottom, rgba(0, 54, 100, 0.96), rgba(0, 38, 100, 0.45));
    color: #36C1FF;
    font-size: 26px;
    text-align: center;
    cursor: pointer;
    font-family: 'pangmenzhengdao';
  }
  .model::before {
    width: 135px;
    height: 46px;
    content: '';
    display: block;
    position: absolute;
    clip-path: polygon(
      15px 0,
      calc(100% - 15px) 0,
      100% 50%,
      calc(100% - 15px) 100%,
      15px 100%,
      15px calc(100% - 1.5px),
      calc(100% - 16px) calc(100% - 1.5px),
      calc(100% - 2px) 50%,
      calc(100% - 16px) 1.5px,
      16px 1.5px,
      2px 50%,
      16px calc(100% - 1.5px),
      15px 100%,
      0 50%,
      15px 0
    );
    background-color: rgba($color: #00BAFF, $alpha: 0.8);
  }
  .model-select{
    color: #ffffff;
    text-shadow: -2px 2px 10px #72cdff;
    box-shadow: 0 0 30px  #009DFF inset, 0 0 30px  #009DFF;
  }
  .model-select::before {
    box-shadow: 0 0 30px  #009DFF;
    background-color: rgba($color: #72CDFF, $alpha: 0.8);
  }
}
</style>

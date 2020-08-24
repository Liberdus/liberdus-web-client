<template>
  <a-layout id="components-layout-demo-responsive">
    <a-layout-sider
      breakpoint="lg"
      collapsed-width="0"
      @collapse="onCollapse"
      @breakpoint="onBreakpoint"
    >
      <div class="header-logo">
        <a-row type="flex" align="middle" :gutter="16">
          <a-col flex="30px">
            <img src="icon.png" class="main-logo" />
          </a-col>

          <a-col flex="auto">Liberdus</a-col>
        </a-row>
      </div>

      <a-menu theme="dark" mode="inline" :default-selected-keys="['home']">
        <a-menu-item key="home">
          <a-icon type="home" />
          <span class="nav-text">Home</span>
        </a-menu-item>

        <a-sub-menu key="settings">
          <span slot="title"><a-icon type="setting" />Settings</span>
          <a-menu-item key="network">
            <a-icon type="wifi" />
            <span class="nav-text">Network</span>
          </a-menu-item>

          <a-menu-item key="toll">
            <a-icon type="share-alt" />
            <span class="nav-text">Toll</span>
          </a-menu-item>
        </a-sub-menu>

        <a-sub-menu key="account">
          <span slot="title"><a-icon type="user" />My Account</span>

          <a-menu-item key="export-accout">
            <a-icon type="export" />
            <span class="nav-text">Export Account</span>
          </a-menu-item>

          <a-menu-item key="register-email">
            <a-icon type="mail" />
            <span class="nav-text">Register Email</span>
          </a-menu-item>
        </a-sub-menu>

        <a-menu-item key="friends">
          <a-icon type="usergroup-add" />
          <span class="nav-text">Friends</span>
        </a-menu-item>

        <a-menu-item key="stake">
          <a-icon type="dollar" />
          <span class="nav-text">Stake</span>
        </a-menu-item>

        <a-menu-item key="about">
          <a-icon type="pic-left" />
          <span class="nav-text">About</span>
        </a-menu-item>

        <a-menu-item key="sign-out">
          <a-icon type="logout" />
          <span class="nav-text">Sign out</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header :style="{ background: '#fff', padding: 0 }">
        <a-avatar
          shape="square"
          size="large"
          :style="{ backgroundColor: '#87d068', verticalAlign: 'middle' }"
          icon="user"
        />
      </a-layout-header>
      <a-layout-content :style="{ margin: '24px 16px 0' }">
        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          <nuxt />
        </div>
      </a-layout-content>
      <a-layout-footer style="textAlign: center">
        Liberdus ©2020 Created by Shardus team
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>
<script>
export default {
  methods: {
    onCollapse(collapsed, type) {
      console.log(collapsed, type);
    },
    onBreakpoint(broken) {
      console.log(broken);
    },
  },
};
</script>

<style lang="scss">
#components-layout-demo-responsive {
  min-height: 100vh;

  .ant-avatar {
    position: absolute;
    right: 16px;
    top: 12px;
  }
}

#components-layout-demo-responsive .header-logo {
  height: 30px;
  margin: 16px;
}

.header-logo {
  img {
    width: 30px;
  }

  font-size: 20px;
  font-weight: bold;
  color: white;
}

</style>
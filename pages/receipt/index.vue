<template>
  <div>
    <notifications
      group="new-message"
      position="bottom left"
      width="100%"
      classes="my-notification-style"
    />

    <portal to="navigation-tags">
      <a-breadcrumb>
        <a-breadcrumb-item>
          Transaction Receipts
        </a-breadcrumb-item>
      </a-breadcrumb>
    </portal>
    <p style="display: none">
      {{ isUIReady }}
    </p>
    <receipt />
  </div>
</template>

<script>
import Vue from 'vue'
import Receipt from '~/components/Receipt'
import { mapGetters, mapActions } from 'vuex'

export default {
  components: {
    Receipt,
  },
  layout: 'dashboard',
  computed: {
    ...mapGetters({
      isUIReady: 'chat/isUIReady',
    }),
  },
}
</script>

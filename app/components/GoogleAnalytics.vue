<script setup lang="ts">
useHead({
  script: [
    {
      src: 'https://www.googletagmanager.com/gtag/js?id=G-KM3WXGYLML',
      async: true
    },
    {
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-KM3WXGYLML');
      `,
      type: 'text/javascript'
    }
  ]
})
</script>

<template>
  <div v-if="false"></div>
</template>

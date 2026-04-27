<script setup lang="ts">
useHead({ title: 'FAQ' })
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-12">
    <h1 class="text-4xl font-black text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h1>
    <div class="space-y-8">
      <div class="bg-white dark:bg-surface-card p-6 rounded-xl border border-gray-200 dark:border-surface-border">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">What is Moo Tasks?</h2>
        <p class="text-gray-600 dark:text-gray-400">Moo Tasks is a kanban board that helps you manage tasks and collaborate with AI agents.</p>
      </div>
      <div class="bg-white dark:bg-surface-card p-6 rounded-xl border border-gray-200 dark:border-surface-border">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">How does it work?</h2>
        <p class="text-gray-600 dark:text-gray-400">Each board is an MCP server. You can connect your AI agent to the board and let it manage your tasks.</p>
      </div>
      <div class="bg-white dark:bg-surface-card p-6 rounded-xl border border-gray-200 dark:border-surface-border">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">How do I set it up?</h2>
        <p class="text-gray-600 dark:text-gray-400">Go to the board page, click "Show MCP Config", copy the JSON, and paste it into your MCP client's configuration file.</p>
      </div>
    </div>
  </div>
</template>

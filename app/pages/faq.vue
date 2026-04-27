<script setup lang="ts">
useHead({ title: 'FAQ' })
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-12">
    <h1 class="text-4xl font-black text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h1>
    <div class="space-y-8">
      <div class="bg-white dark:bg-surface-card p-6 rounded-xl border border-gray-200 dark:border-surface-border">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">What is an MCP server?</h2>
        <p class="text-gray-600 dark:text-gray-400">
          MCP stands for <strong>Model Context Protocol</strong>. It's an open standard that enables AI assistants to connect to systems like databases, tools, and platforms, allowing them to perform actions and access real-time data seamlessly. Moo Tasks exposes each board as its own MCP server, so your AI agent can manage your tasks directly.
        </p>
      </div>
      <div class="bg-white dark:bg-surface-card p-6 rounded-xl border border-gray-200 dark:border-surface-border">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">How do I connect my AI agent?</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          To connect your agent to a Moo Tasks board:
        </p>
        <ol class="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-2">
          <li>Go to the board you want to manage.</li>
          <li>Click the "Show MCP Config" button in the board settings.</li>
          <li>Copy the generated JSON configuration.</li>
          <li>Paste the configuration into your MCP client's settings file (e.g., <code>.claude.json</code> for Claude Code, <code>.cursor/mcp.json</code> for Cursor).</li>
        </ol>
      </div>
      <div class="bg-white dark:bg-surface-card p-6 rounded-xl border border-gray-200 dark:border-surface-border">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Examples of using agents</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Once connected, you can ask your agent to help you manage your tasks:
        </p>
        <ul class="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 ml-2">
          <li>"List all high priority tasks on the board."</li>
          <li>"Accept the critical task with ID #123 and start working on it."</li>
          <li>"Post a comment on task #123 explaining that I've completed the implementation."</li>
          <li>"Submit task #123 for review."</li>
        </ul>
      </div>
    </div>
  </div>
</template>

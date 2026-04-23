<script setup lang="ts">
const props = defineProps<{ boardId: string; isOwner: boolean }>()

interface Member {
  userId: string
  name: string
  email: string
  role: string
  joinedAt: string
}

interface Invitation {
  id: string
  email: string
  createdAt: string
}

const members = ref<Member[]>([])
const invitations = ref<Invitation[]>([])
const inviteEmail = ref('')
const inviting = ref(false)
const error = ref('')

const { user } = useUserSession()

async function fetchMembers() {
  const res = await $fetch<{ members: Member[], invitations: Invitation[] }>(`/api/boards/${props.boardId}/members`)
  members.value = res.members
  invitations.value = res.invitations
}

async function leave() {
  if (!confirm('Are you sure you want to leave this board?')) return
  await removeMember(user.value!.id)
  await navigateTo('/dashboard')
}

async function invite() {
  if (!inviteEmail.value.trim()) return
  error.value = ''
  inviting.value = true
  try {
    await $fetch(`/api/boards/${props.boardId}/members`, {
      method: 'POST',
      body: { email: inviteEmail.value.trim() },
    })
    inviteEmail.value = ''
    await fetchMembers()
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || 'Failed to invite'
  } finally {
    inviting.value = false
  }
}

async function removeMember(userId: string) {
  error.value = ''
  try {
    await $fetch(`/api/boards/${props.boardId}/members/${userId}`, { method: 'DELETE' })
    await fetchMembers()
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || 'Failed to remove member'
  }
}

async function cancelInvitation(invitationId: string) {
  error.value = ''
  try {
    await $fetch(`/api/boards/${props.boardId}/invitations/${invitationId}`, { method: 'DELETE' })
    await fetchMembers()
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || 'Failed to cancel invitation'
  }
}

onMounted(() => fetchMembers())
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 ml-1">Members</h3>

    <div v-if="isOwner" class="flex gap-2">
      <input v-model="inviteEmail" type="email" placeholder="Invite by email" class="flex-1 border border-gray-200 dark:border-surface-border dark:bg-surface-raised dark:text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-neon-cyan/30 focus:border-neon-cyan/50 outline-none transition-all placeholder:text-gray-400" />
      <button @click="invite" :disabled="inviting || !inviteEmail.trim()" class="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-neon-cyan text-cyan-950 dark:text-gray-900 rounded-xl hover:bg-neon-cyan/90 disabled:opacity-50 transition-all shadow-md shadow-neon-cyan/10 active:scale-95">
        {{ inviting ? '...' : 'Invite' }}
      </button>
    </div>
    <div v-if="error" class="bg-red-50 dark:bg-neon-red/10 text-red-600 dark:text-neon-red text-[11px] font-bold rounded-xl px-4 py-2 border border-red-200 dark:border-neon-red/20">{{ error }}</div>

    <ul class="grid grid-cols-1 gap-2">
      <li v-for="m in members" :key="m.userId" class="flex items-center justify-between bg-white dark:bg-surface-raised/40 rounded-xl border border-gray-100 dark:border-surface-border/50 px-4 py-3 shadow-sm">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-raised border border-gray-200 dark:border-surface-border flex items-center justify-center text-xs font-black uppercase text-gray-500 dark:text-gray-400 shrink-0">
            {{ m.name.charAt(0) }}
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-bold text-gray-900 dark:text-white truncate">{{ m.name }}</span>
              <span v-if="m.userId === user?.id" class="text-[9px] font-black uppercase tracking-widest text-neon-cyan leading-none">(You)</span>
            </div>
            <span class="text-[10px] font-medium text-gray-400 dark:text-gray-500 truncate">{{ m.email }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span v-if="m.role === 'owner'" class="text-[9px] font-black uppercase tracking-[0.15em] bg-neon-orange/10 text-orange-600 dark:text-neon-orange px-2 py-0.5 rounded border border-neon-orange/20">owner</span>
          <button v-if="isOwner && m.role !== 'owner'" @click="removeMember(m.userId)" class="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 dark:text-neon-red/60 dark:hover:text-neon-red transition-all">Remove</button>
          <button v-else-if="m.userId === user?.id && m.role !== 'owner'" @click="leave" class="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 dark:text-neon-red/60 dark:hover:text-neon-red transition-all">Leave</button>
        </div>
      </li>
      <li v-for="i in invitations" :key="i.id" class="flex items-center justify-between bg-gray-50/50 dark:bg-surface-card rounded-xl border border-dashed border-gray-200 dark:border-surface-border px-4 py-3">
        <div class="flex flex-col">
          <span class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 italic">Pending Invite</span>
          <span class="text-xs font-medium text-gray-400 dark:text-gray-500">{{ i.email }}</span>
        </div>
        <button v-if="isOwner" @click="cancelInvitation(i.id)" class="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 dark:hover:text-neon-red transition-all">Cancel</button>
      </li>
    </ul>
  </div>
</template>

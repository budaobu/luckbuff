import { useProfilesStore } from '~/stores/profiles'

export function useProfiles() {
  const store = useProfilesStore()
  return {
    profiles: computed(() => store.list),
    defaultProfile: computed(() => store.defaultProfile),
    getById: (id: string) => store.list.find(p => p.id === id),
  }
}

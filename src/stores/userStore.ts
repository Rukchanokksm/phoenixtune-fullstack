import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { PREMIUM_ENABLED } from "@/lib/premium";
import type { UserProfile } from "@/types";

// ─── Store interface ──────────────────────────────────────────────────────────
interface UserStore {
  // ── Auth / Profile ────────────────────────────────────────────────────────
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // ── Computed ──────────────────────────────────────────────────────────────
  isPremium: () => boolean;

  // ── Saved tunes ───────────────────────────────────────────────────────────
  savedTuneIds: string[];
  setSavedTuneIds: (ids: string[]) => void;
  toggleSavedTune: (tuneId: string) => void;
  isTuneSaved: (tuneId: string) => boolean;
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useUserStore = create<UserStore>()(
  devtools(
    (set, get) => ({
      // ── Auth ────────────────────────────────────────────────────────────
      user: null,

      setUser: (user) => set({ user }, false, "setUser"),

      isLoading: true,

      setIsLoading: (isLoading) => set({ isLoading }, false, "setIsLoading"),

      // ── Computed: isPremium ──────────────────────────────────────────────
      isPremium: () => {
        // Master kill-switch — premium features are held until enabled site-wide
        if (!PREMIUM_ENABLED) return false;

        const { user } = get();
        if (!user?.isPremium) return false;
        // Also check premiumUntil expiry if present
        if (user.premiumUntil) {
          return new Date(user.premiumUntil) > new Date();
        }
        return true;
      },

      // ── Saved tunes ──────────────────────────────────────────────────────
      savedTuneIds: [],

      setSavedTuneIds: (ids) =>
        set({ savedTuneIds: ids }, false, "setSavedTuneIds"),

      toggleSavedTune: (tuneId) =>
        set(
          (state) => ({
            savedTuneIds: state.savedTuneIds.includes(tuneId)
              ? state.savedTuneIds.filter((id) => id !== tuneId)
              : [...state.savedTuneIds, tuneId],
          }),
          false,
          "toggleSavedTune",
        ),

      isTuneSaved: (tuneId) => get().savedTuneIds.includes(tuneId),
    }),
    { name: "UserStore" },
  ),
);

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectUser = (s: UserStore) => s.user;
export const selectIsLoading = (s: UserStore) => s.isLoading;
export const selectSavedIds = (s: UserStore) => s.savedTuneIds;

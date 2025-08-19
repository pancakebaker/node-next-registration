// registration-ui/src/components/forms/ProfileUserForm/profileUserFormController.ts
import { useCallback, useMemo } from 'react';
import type { UseFormReset, UseFormSetValue } from 'react-hook-form';
import type { UserPersonalInfo, ProfileAccountInfo } from '@/schemas/user.schema';
import { UserService } from '@/services/user.service';
import { AuthError } from '@/services/api.types';
import { useNotice } from '@/hooks/useNotice';
import { USER_MESSAGES } from '@/lib/constants';

/**
 * Controller hook for the Profile form.
 *
 * Coordinates:
 * - Initial data load (`/api/profile/me`) and hydration of two RHF forms
 *   (personal info and account info) via the `reset(...)` functions passed in.
 * - Save flows for personal info and account settings.
 * - User-facing notices (success/error) using {@link useNotice}.
 *
 * Error handling:
 * - Auth-related failures (`AuthError`) surface a session-expired message.
 * - Other failures surface a generic, user-friendly message from {@link USER_MESSAGES}.
 *
 * @param resetPersonal React Hook Form `reset` for the Personal Info form.
 * @param resetAccount  React Hook Form `reset` for the Account Info form.
 * @param setAccountValue React Hook Form `setValue` for the Account Info form (used to clear passwords on success).
 *
 * @returns An object with:
 * - `personalNotice` / `accountNotice`: reactive notice state for each section.
 * - `initialize()`: loads the current user and hydrates both forms.
 * - `onSavePersonal(values)`: saves personal info; sets notices accordingly.
 * - `onSaveAccount(values)`: saves account info; clears password fields on success; sets notices accordingly.
 *
 * @example
 * ```tsx
 * const {
 *   personalNotice,
 *   accountNotice,
 *   initialize,
 *   onSavePersonal,
 *   onSaveAccount,
 * } = useProfileUserFormController(resetPersonal, resetAccount, setAccountValue);
 *
 * useEffect(() => { void initialize(); }, [initialize]);
 * ```
 */
export function useProfileUserFormController(
  resetPersonal: UseFormReset<UserPersonalInfo>,
  resetAccount: UseFormReset<ProfileAccountInfo>,
  setAccountValue: UseFormSetValue<ProfileAccountInfo>
) {
  const personal = useNotice();
  const account = useNotice();

  const {
    notice: personalNotice,
    clear: personalClear,
    error: personalError,
    success: personalSuccess,
  } = personal;
  const {
    notice: accountNotice,
    clear: accountClear,
    error: accountError,
    success: accountSuccess,
  } = account;

  /**
   * Loads the current user's profile and hydrates both RHF forms.
   *
   * - On success: resets both forms with fetched values and clears notices.
   * - On failure: sets both personal/account notices with an appropriate message.
   */
  const initialize = useCallback(async () => {
    try {
      const me: UserPersonalInfo = await UserService.getMe();
      resetPersonal({
        name: me.name ?? '',
        middleName: me.middleName ?? '',
        familyName: me.familyName ?? '',
        mobile: me.mobile ?? '',
        email: me.email ?? '',
      });

      resetAccount({
        username: me.username ?? '',
        password: '',
        confirmPassword: '',
      });

      personalClear();
      accountClear();
    } catch (err: unknown) {
      const message =
        err instanceof AuthError
          ? USER_MESSAGES.SESSION_EPIRED
          : err instanceof Error
            ? err.message
            : USER_MESSAGES.PROFILE_LOAD_ERROR;
      personalError(message);
      accountError(message);
    }
  }, [resetPersonal, resetAccount, personalClear, accountClear, personalError, accountError]);

  /**
   * Persists personal information.
   *
   * @param values Personal info form values.
   * - On success: shows success notice.
   * - On failure: shows an error or session-expired notice.
   */
  const onSavePersonal = useCallback(async (values: UserPersonalInfo) => {
    personalClear();
    try {
      await UserService.updatePersonal({
        name: values.name,
        middleName: values.middleName?.trim() || null,
        familyName: values.familyName,
        mobile: values.mobile ?? '',
        email: values.email,
      });
      personalSuccess(USER_MESSAGES.PROFILE_SAVE_SUCCESS);
    } catch (err: unknown) {
      const message =
        err instanceof AuthError
          ? USER_MESSAGES.SESSION_EPIRED
          : err instanceof Error
            ? err.message
            : USER_MESSAGES.PROFILE_SAVE_ERROR;
      personalError(message);
    }
  }, [personalClear, personalSuccess, personalError]);

  /**
   * Persists account settings (username/password).
   *
   * @param values Account info form values.
   * - On success: shows success notice and clears password fields.
   * - On failure: shows an error or session-expired notice.
   */
  const onSaveAccount = useCallback(async (values: ProfileAccountInfo) => {
    accountClear();
    try {
      await UserService.updateAccount({
        username: values.username,
        password: values.password || undefined,
        confirmPassword: values.confirmPassword || undefined,
      });
      accountSuccess(USER_MESSAGES.ACCOUNT_SAVE_SUCCESS);
      setAccountValue('password', '');
      setAccountValue('confirmPassword', '');
    } catch (err: unknown) {
      const message =
        err instanceof AuthError
          ? USER_MESSAGES.SESSION_EPIRED
          : err instanceof Error
            ? err.message
            : USER_MESSAGES.ACCOUNT_SAVE_ERROR;
      accountError(message);
    }
  }, [accountClear, accountSuccess, accountError, setAccountValue]);

  return useMemo(
    () => ({
      personalNotice,
      accountNotice,
      initialize,
      onSavePersonal,
      onSaveAccount,
    }),
    [personalNotice, accountNotice, initialize, onSavePersonal, onSaveAccount]
  );
}

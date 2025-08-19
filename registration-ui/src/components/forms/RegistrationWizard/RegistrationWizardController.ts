// registration-ui/src/components/forms/RegistrationWizard/RegistrationWizardController.ts
'use client';

import type { StepIndex, UserDetails } from '@/schemas/user.schema';
import type { UserServiceImpl } from '@/services/user.service'; // we exported this type

/** A narrowed surface of the UserService used by the controller. */
type UserSvc = Pick<UserServiceImpl, 'register'>; // only what we need

/**
 * External dependencies the controller needs to operate.
 *
 * The controller is intentionally UI-framework-agnostic and communicates
 * via these callbacks/state accessors, keeping it easy to test.
 */
type Deps = {
  /** Returns the current wizard step (0 = Personal, 1 = Account). */
  getStep: () => StepIndex;
  /** Sets the current wizard step. */
  setStep: (s: StepIndex) => void;
  /** Sets a user-visible error message (or clears when `null`). */
  setServerError: (msg: string | null) => void;
  /** Sets a user-visible success message (or clears when `null`). */
  setServerSuccess: (msg: string | null) => void;
  /**
   * Triggers validation for the provided field names.
   * Should return `true` when all fields are valid.
   */
  trigger: (names?: (keyof UserDetails)[]) => Promise<boolean>;
  /** Resets the form to given values. */
  reset: (values: Partial<UserDetails>) => void;
  /** Immutable defaults used to reset the wizard on success. */
  defaults: Readonly<UserDetails>;
  /** User-facing messages used for success/failure. */
  messages: {
    REGISTRATION_SUCCESS: string;
    REGISTRATION_FAILED: string;
    NETWORK_ERROR: string;
  };
  /** Service used to call the registration API. */
  userSvc: UserSvc; // ← narrower surface keeps things simpler
};

/**
 * Orchestrates the two-step Registration Wizard:
 * - Step 0: Personal Information
 * - Step 1: Account Information
 *
 * Handles per-step validation, navigation, submission, and server messages
 * without coupling to React directly (relies on injected `Deps`).
 *
 * @example
 * ```ts
 * const ctrl = new RegistrationWizardController({
 *   getStep: () => step,
 *   setStep,
 *   setServerError,
 *   setServerSuccess,
 *   trigger: (fields) => formTrigger(fields),
 *   reset: (vals) => formReset(vals),
 *   defaults: USER_DEFAULTS,
 *   messages: USER_MESSAGES,
 *   userSvc: UserService,
 * });
 *
 * // Next button:
 * await ctrl.onNext();
 *
 * // Submit:
 * await ctrl.onSubmit(formValues);
 * ```
 */
export class RegistrationWizardController {
  private readonly getStep: Deps['getStep'];
  private readonly setStep: Deps['setStep'];
  private readonly setServerError: Deps['setServerError'];
  private readonly setServerSuccess: Deps['setServerSuccess'];
  private readonly trigger: Deps['trigger'];
  private readonly reset: Deps['reset'];
  private readonly defaults: Deps['defaults'];
  private readonly messages: Deps['messages'];
  private readonly userSvc: Deps['userSvc'];

  /**
   * Creates a new controller instance.
   * @param deps See {@link Deps} for required callbacks and services.
   */
  constructor(deps: Deps) {
    this.getStep = deps.getStep;
    this.setStep = deps.setStep;
    this.setServerError = deps.setServerError;
    this.setServerSuccess = deps.setServerSuccess;
    this.trigger = deps.trigger;
    this.reset = deps.reset;
    this.defaults = deps.defaults;
    this.messages = deps.messages;
    this.userSvc = deps.userSvc;
  }

  /**
   * Validates only the fields for the current step.
   * @returns `true` if all fields in the current step are valid, otherwise `false`.
   */
  async validateCurrentStep(): Promise<boolean> {
    const step = this.getStep();
    if (step === 0) {
      return this.trigger(['name', 'middleName', 'familyName', 'email', 'mobile']);
    }
    return this.trigger(['username', 'password', 'confirmPassword']);
  }

  /**
   * Advances the wizard to the next step if the current step is valid.
   * Clears any prior server error before validating.
   * @returns A promise that resolves when navigation is completed.
   */
  async onNext(): Promise<void> {
    this.setServerError(null);
    const ok = await this.validateCurrentStep();
    if (ok) this.setStep(1);
  }

  /**
   * Returns to the previous step (from Account → Personal).
   * Clears any prior server error.
   */
  onPrev(): void {
    this.setServerError(null);
    this.setStep(0);
  }

  /**
   * Submits the full registration payload to the API.
   *
   * Behavior:
   * - Clears server messages.
   * - Calls `userSvc.register(...)` with normalized payload.
   * - On success: shows success message, resets the form to defaults, and moves to step 0.
   * - On failure: shows an error message (server message if present, otherwise a generic one).
   *
   * @param data The complete user details collected across steps.
   * @returns `true` on success; `false` if the submission failed.
   */
  async onSubmit(data: UserDetails): Promise<boolean> {
    this.setServerError(null);
    this.setServerSuccess(null);

    const payload: UserDetails = {
      name: data.name,
      middleName: data.middleName ?? undefined,
      familyName: data.familyName,
      email: data.email,
      mobile: data.mobile,
      username: data.username,
      password: data.password,
      confirmPassword: data.confirmPassword,
    };

    try {
      const res = await this.userSvc.register(payload);
      // res.success is normalized in the service; treat “missing” as OK:
      const success = res.success !== false;
      if (!success) {
        this.setServerError(res.message ?? this.messages.REGISTRATION_FAILED);
        return false;
      }

      this.setServerSuccess(this.messages.REGISTRATION_SUCCESS);
      this.reset(this.defaults);
      this.setStep(0);
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : this.messages.NETWORK_ERROR;
      this.setServerError(msg);
      return false;
    }
  }
}

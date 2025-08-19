// utils/schema_rules.ts
export const SCHEMA_RULES = {
  USER: {
    NAME: {
        MIN: 1,
        MIN_ERR: 'First name is required',
        MAX: 100,
        MAX_ERR: 'Name must be at most 100 characters',
    },
    FAMILY_NAME: {
        MIN: 1,
        MIN_ERR: 'Family name is required',
        MAX: 100,
        MAX_ERR: 'Family name must be at most 100 characters',
    },
    MIDDLE_NAME: {
        MAX: 100,
        MAX_ERR: 'Middle name must be at most 100 characters',
    },
    EMAIL: {
        MIN: 0,
        MIN_ERR: 'Please enter a valid email address',
        MAX: 255,
        MAX_ERR: 'Email must be at most 255 characters',
    },
    MOBILE: {
        MIN: 1,
        MIN_ERR: 'Mobile number is required',
        MAX: 20,
        MAX_ERR: 'Mobile must be at most 20 characters',
    },
    USERNAME: {
        MIN: 5,
        MIN_ERR: 'Username must be at least 5 characters',
        MAX: 50,
        MAX_ERR: 'Username must be at most 50 characters',
    },
    PASSWORD: {
        MIN: 6,
        MIN_ERR: 'Password must be at least 6 characters',
        MAX: 255,
        MAX_ERR: 'Password must be at most 255 characters',
    },
    IDENTIFIER: {
        MIN: 1,
        MIN_ERR: 'Username or email is required',
        INVALID: 'Must be a valid email or username',
    }
  }
} as const;


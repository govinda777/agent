import '@testing-library/jest-dom'

process.env.ENCRYPTION_KEY = '12345678901234567890123456789012';
process.env.NEXT_PUBLIC_FREE_PLAN_CHANNELS = 'web';
process.env.NEXT_PUBLIC_FREE_PLAN_MAX_AGENTS = '1';
process.env.FREE_PLAN_TRIAL_DAYS = '7';
process.env.FREE_PLAN_MAX_EXECUTIONS = '1000';


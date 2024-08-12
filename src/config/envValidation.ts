import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = ['JWT_SECRET', 'MY_PEPPER'];

export const getEnv = (envName: string): string => {
  const value = process.env[envName];
  if (!value) {
    console.error(`環境変数${envName}が設定されていません！`);
    return process.exit(1);
  }
  return value;
};

export const checkAllEnv = (): void => {
  for (const env of requiredEnv) {
    getEnv(env);
  }
};

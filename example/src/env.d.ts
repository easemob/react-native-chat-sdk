// 打包期环境变量声明（由 babel 插件内联 process.env.API_SCRIPT / API_CONFIG）
declare var process: {
  env: {
    API_SCRIPT?: string;
    API_CONFIG?: string;
    [key: string]: string | undefined;
  };
};

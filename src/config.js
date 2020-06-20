let config = {
    API_PREFIX: 'https://api.stage.qjy1.com', // 接口域名前缀
};

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production') {
    config.API_PREFIX = 'https://api.qjy-edu.com';
}

export default config;

/** @type {import('next').NextConfig} */
const path = require("node:path");
const dotenv = require("dotenv");

const { resolve } = path;

const nextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": resolve(__dirname, "src"),
      "~bootstrap": resolve(__dirname, "node_modules/bootstrap"),
      "~bootstrap-icons": resolve(__dirname, "node_modules/bootstrap-icons"),
      "~perfect-scrollbar": resolve(
        __dirname,
        "node_modules/perfect-scrollbar"
      ),
      "~@fontsource": resolve(__dirname, "node_modules/@fontsource"),
    };

    return config;
  },
};

// setting env
dotenv.config();
module.exports = nextConfig;
module.exports = {
  env: {
    SECRET_KEY: process.env.SECRET_KEY,
    AUTHSERVICE_URL: process.env.AUTHSERVICE_URL,
  },
};

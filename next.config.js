/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  transpilePackages: ["geist"],

  output: "export",
  distDir: "./dist",

  images: {
    unoptimized: true,
  },
};

export default config;

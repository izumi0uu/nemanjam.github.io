/**
 * @file astro.config.ts
 * @description Astro 框架的核心配置文件。
 * 想象一下，这是你用 Astro 建造网站的"总控制室"。
 * 你可以在这里配置网站的各种设置，比如网站地址、要使用的工具（集成）、Markdown 如何处理等等。
 */

// 导入需要的模块和集成
// 就像准备建造乐高需要的各种特殊积木块
import mdx from '@astrojs/mdx'; // 让 Astro 支持 MDX 文件 (Markdown + JSX)
import partytown from '@astrojs/partytown'; // 用于将第三方脚本移到 Web Worker 中运行，提高主线程性能
import react from '@astrojs/react'; // 让 Astro 支持 React 组件
import tailwind from '@astrojs/tailwind'; // 集成 Tailwind CSS 框架
import icon from 'astro-icon'; // 方便在 Astro 中使用 SVG 图标
import { defineConfig } from 'astro/config'; // Astro 提供的配置辅助函数，能提供类型提示和自动补全

// 导入自定义插件和配置
// 注意：这里必须使用相对路径导入，并且这些文件及其依赖不能导入包含环境变量的 CONFIG
// 这是为了避免在配置文件解析阶段就过早地依赖环境变量，可能导致问题
import { rehypeExternalLinks } from './plugins/rehype-external-links'; // 自定义 Rehype 插件，用于处理外部链接
import { remarkReadingTime } from './plugins/remark-reading-time.mjs'; // 自定义 Remark 插件，用于计算文章阅读时间
//
// 确保这些导入及其子依赖不导入包含环境变量的 CONFIG
import { envSchema, PROCESS_ENV } from './src/config/process-env'; // 导入环境变量处理和校验相关的配置
import { expressiveCodeIntegration } from './src/libs/integrations/expressive-code'; // 导入 Expressive Code 集成，用于代码块高亮和增强
import { sitemapIntegration } from './src/libs/integrations/sitemap'; // 导入站点地图 (Sitemap) 集成

// 从处理过的环境变量中获取网站 URL
// 确保配置使用的是经过校验和处理的环境变量
const { SITE_URL } = PROCESS_ENV;

// 定义 Markdown/MDX 处理插件
// Remark 插件处理 Markdown 抽象语法树 (AST)
const remarkPlugins = [remarkReadingTime];
// Rehype 插件处理 HTML 抽象语法树 (AST)
const rehypePlugins = [rehypeExternalLinks];

// 使用 defineConfig 包裹配置对象，获取类型提示
export default defineConfig({
  /**
   * @property {string} site - 网站的最终部署 URL。
   * Astro 会用这个 URL 来生成站点地图、规范链接 (canonical URLs) 和其他绝对链接。
   * 比如你的网站发布在 `https://example.com`，就填这个。
   */
  site: SITE_URL,
  /**
   * @property {'always' | 'never' | 'ignore'} trailingSlash - 控制 URL 末尾是否添加斜杠。
   * - 'always': 始终添加斜杠 (e.g., /about/)
   * - 'never': 从不添加斜杠 (e.g., /about)
   * - 'ignore': 不强制，由 Astro 自行决定，通常用于静态输出。
   */
  trailingSlash: 'ignore',
  /**
   * @property {object} env - 用于校验环境变量的 Zod schema。
   * 这可以确保项目运行所需的环境变量都已设置且类型正确。
   */
  env: envSchema,
  /**
   * @property {boolean} compressHTML - 是否在构建时压缩 HTML 文件。
   * 开启可以减小文件体积，加快加载速度。
   */
  compressHTML: true, // 默认为 true
  /**
   * @property {object} server - 开发服务器的配置。
   * - port: 指定开发服务器监听的端口号。
   */
  server: { port: 3000 },
  /**
   * @property {object} devToolbar - Astro 开发工具栏的配置。
   * - enabled: 是否启用开发工具栏。
   */
  devToolbar: { enabled: false },
  /**
   * @property {Array<object>} integrations - 要在项目中使用的 Astro 集成。
   * 集成就像给 Astro 添加的"插件"或"扩展功能"。
   */
  integrations: [
    expressiveCodeIntegration(), // 代码高亮和增强功能
    sitemapIntegration(), // 自动生成站点地图 (sitemap.xml)
    react(), // 启用 React 组件支持
    // 注意：这里不要传递任何插件给 mdx()，否则可能会覆盖上面 expressive-code 等集成对 MDX 的处理。
    // MDX 会自动复用下面 markdown 配置中的 rehypePlugins。
    mdx(), // 启用 MDX 支持
    // applyBaseStyles: false 阻止 Tailwind 注入基础样式，因为可能已经在全局 CSS 或其他地方处理了，避免重复加载。
    tailwind({ applyBaseStyles: false }), // 集成 Tailwind CSS
    icon({ iconDir: 'src/assets/icons' }), // 配置 astro-icon 从指定目录加载图标
    partytown({
      // 配置 Partytown，forward 属性用于指定哪些全局变量或函数调用需要转发到主线程执行
      // 这里配置了 dataLayer.push，常用于 Google Tag Manager 等分析工具。
      config: { forward: ['dataLayer.push'] },
    }),
  ],
  /**
   * @property {object} markdown - Markdown 和 MDX 的处理配置。
   * - remarkPlugins: 应用于 Markdown 处理流程的 Remark 插件。
   * - rehypePlugins: 应用于 HTML 处理流程的 Rehype 插件 (MDX 会复用这里的设置)。
   */
  // 注意：只在这里传递 rehype 插件，mdx() 集成会自动复用它们。
  markdown: { remarkPlugins, rehypePlugins },
  /**
   * @property {object} vite - 底层打包工具 Vite 的配置。
   * Astro 使用 Vite 进行开发和构建，可以在这里覆盖或添加 Vite 的配置。
   */
  vite: {
    build: {
      /**
       * @property {boolean} sourcemap - 是否在生产构建时生成 Source Map。
       * Source Map 可以帮助调试压缩后的代码，但会增加构建时间和文件大小。
       * 在生产环境中通常禁用以优化性能和安全性。
       */
      sourcemap: false,
    },
    server: {
      /**
       * @property {Array<string>} allowedHosts - 配置 Vite 开发服务器允许访问的主机名。
       * 这是一种安全措施，防止未授权的域名访问开发服务器。
       */
      // 这个配置只对 Vite 开发服务器生效
      allowedHosts: ['localhost', 'preview1.amd1.nemanjamitic.com'],
    },
  },
});

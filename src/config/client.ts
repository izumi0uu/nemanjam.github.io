/**
 * @file src/config/client.ts
 * @description 定义客户端代码可以安全访问的配置常量和环境变量。
 * 这个文件整合了从 Astro 环境模块 (`astro:env/client`) 获取的公共环境变量
 * 和一些硬编码的客户端常量，并使用 Zod schema 进行校验。
 * 这样做的好处是：
 * 1. 集中管理客户端所需的所有配置。
 * 2. 确保客户端使用的环境变量是经过 Astro 构建过程安全处理和暴露的。
 * 3. 对所有客户端配置（包括硬编码的）进行类型校验。
 */

// 从 Astro 提供的客户端环境模块导入公共环境变量
// 这些变量是在 `astro.config.ts` 的 `envSchema` 中标记为 `access: 'public'` 并且 `context: 'client'` 的变量。
// Astro 会在构建时将这些变量的值注入到客户端代码中，确保敏感信息不会泄露。
import { PLAUSIBLE_DOMAIN, PLAUSIBLE_SCRIPT_URL, SITE_URL } from 'astro:env/client';

// 导入 Zod schema 和校验工具
import { configClientSchema } from '@/schemas/config'; // 用于校验客户端配置对象的 schema
import { validateData } from '@/utils/validation'; // 数据校验函数

// 导入客户端配置对象的 TypeScript 类型
import type { ConfigClientType } from '@/types/config';

// 定义包含所有客户端配置的原始数据对象
const configClientData: ConfigClientType = {
  /**
   * @property {string} SITE_URL - 网站的公开访问 URL (从环境变量获取)。
   * 注意：所有 URL 格式都不带末尾的斜杠 '/'。
   */
  SITE_URL,
  /**
   * @property {string} SITE_URL_CANONICAL - 网站的规范 URL (硬编码)。
   * 规范 URL 是搜索引擎用来识别主要页面版本的地址，通常是最终的、首选的域名。
   * 这个值在所有环境中都相同，所以直接在此处定义，而不是通过环境变量。
   */
  SITE_URL_CANONICAL: 'https://nemanjamitic.com',
  /** @property {string} SITE_TITLE - 网站的标题。 */
  SITE_TITLE: 'Nemanja Mitic',
  /** @property {string} SITE_DESCRIPTION - 网站的描述。 */
  SITE_DESCRIPTION: 'I am Nemanja, a full stack developer',
  /**
   * @property {string | undefined} PLAUSIBLE_SCRIPT_URL - Plausible 分析脚本的 URL (从环境变量获取，可选)。
   */
  PLAUSIBLE_SCRIPT_URL,
  /**
   * @property {string | undefined} PLAUSIBLE_DOMAIN - Plausible 分析使用的域名 (从环境变量获取，可选)。
   */
  PLAUSIBLE_DOMAIN,
  /** @property {number} PAGE_SIZE_POST_CARD - 博客文章卡片列表每页显示的数量。 */
  PAGE_SIZE_POST_CARD: 3,
  /** @property {number} PAGE_SIZE_POST_CARD_SMALL - 小型博客文章卡片列表每页显示的数量。 */
  PAGE_SIZE_POST_CARD_SMALL: 6,
  /** @property {number} PAGE_SIZE_PROJECT_CARD - 项目卡片列表每页显示的数量。 */
  PAGE_SIZE_PROJECT_CARD: 6,
  /** @property {number} MORE_POSTS_COUNT - 相关文章或"更多文章"区域显示的文章数量。 */
  MORE_POSTS_COUNT: 3,
  /** @property {'light' | 'dark'} DEFAULT_MODE - 默认的颜色模式 (亮色/暗色)。 */
  DEFAULT_MODE: 'light',
  /** @property {string} DEFAULT_THEME - 默认的 CSS 主题名称。 */
  DEFAULT_THEME: 'default-light',
  /** @property {string} AUTHOR_NAME - 作者姓名。 */
  AUTHOR_NAME: 'Nemanja Mitic',
  /** @property {string} AUTHOR_EMAIL - 作者邮箱 (待办：使用真实邮箱)。 */
  AUTHOR_EMAIL: 'email@email.com', // todo: use email
  /** @property {string} AUTHOR_GITHUB - 作者 GitHub 链接。 */
  AUTHOR_GITHUB: 'https://github.com/nemanjam',
  /** @property {string} AUTHOR_LINKEDIN - 作者 LinkedIn 链接。 */
  AUTHOR_LINKEDIN: 'https://www.linkedin.com/in/nemanja-mitic',
  /** @property {string} AUTHOR_TWITTER - 作者 Twitter (X) 链接。 */
  AUTHOR_TWITTER: 'https://x.com/nemanja_codes',
  /** @property {string} AUTHOR_YOUTUBE - 作者 YouTube 链接。 */
  AUTHOR_YOUTUBE: 'https://www.youtube.com/@nemanja_codes',
  /** @property {string} REPO_URL - 项目仓库 URL。 */
  REPO_URL: 'https://github.com/nemanjam/nemanjam.github.io',
};

/**
 * @constant CONFIG_CLIENT
 * @description 经过 Zod schema (`configClientSchema`) 校验后的客户端配置对象。
 * 这个对象包含了所有客户端代码可以安全使用的配置信息，类型安全且经过验证。
 * 在客户端组件或脚本中导入并使用这个对象。
 */
export const CONFIG_CLIENT = validateData(configClientData, configClientSchema);

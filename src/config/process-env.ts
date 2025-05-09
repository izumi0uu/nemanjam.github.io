/**
 * @file src/config/process-env.ts
 * @description 处理和校验 Node.js 进程环境变量 (process.env)。
 * 在 Astro 项目中，尤其是在 `astro.config.ts` 文件加载阶段，环境变量的处理需要特别注意。
 * 这个文件负责：
 * 1. 根据 `NODE_ENV` (如 development, production) 加载对应的 `.env` 文件。
 * 2. 从 `process.env` 读取环境变量。
 * 3. 使用 Zod schema (`processEnvSchema`) 校验环境变量的类型和存在性。
 * 4. 导出经过校验的环境变量对象 `PROCESS_ENV`。
 * 5. 定义 Astro 配置中 `experimental.env.schema` 所需的结构，用于进一步的类型安全和客户端暴露。
 */

// 导入 Astro 配置相关的工具，用于定义环境变量 schema
import { envField } from 'astro/config';
// 导入 dotenv 库，用于从 .env 文件加载环境变量到 process.env
import dotenv from 'dotenv';

// 导入自定义的 schema、工具函数和类型
import { nodeEnvValues, processEnvSchema } from '../schemas/config'; // Zod schema 用于校验环境变量
import { prettyPrintObject } from '../utils/log'; // 用于在控制台友好地打印对象
import { getHostnameFromUrl } from '../utils/urls'; // 从 URL 中提取主机名的工具函数
import { validateData } from '../utils/validation'; // 使用 Zod schema 校验数据的工具函数
import type { ProcessEnvType } from '../types/config'; // 环境变量对象的 TypeScript 类型

/*------------------ 加载 .env 文件 -----------------*/

// 重要说明：
// 在 `astro.config.ts` (或其导入的文件) 中，`import.meta.env` 是不可用的，因为它需要 Astro 配置加载完成后才能填充。
// 因此，在 `astro.config.ts` 或其依赖项中如果需要访问环境变量，**必须** 使用 Node.js 的 `process.env`。
// Astro 在加载配置文件之前，不会自动加载 `.env` 文件到 `process.env`。
// 所以我们需要手动使用 `dotenv` 库来加载。
// 参考 Astro GitHub Issue: https://github.com/withastro/astro/issues?q=.env+file+not+loaded

// 获取当前的 Node.js 环境 (development, production, test 等)
const NODE_ENV = process.env.NODE_ENV;

// 校验 NODE_ENV 是否为预期的值之一
if (!nodeEnvValues.includes(NODE_ENV)) {
  // 如果 NODE_ENV 无效，打印错误并抛出异常，阻止应用启动
  // eslint-disable-next-line no-console
  console.error('无效的 process.env.NODE_ENV: ', NODE_ENV);
  throw new Error('无效的 process.env.NODE_ENV');
}

// 根据 NODE_ENV 确定要加载的 .env 文件名
// 例如，如果 NODE_ENV 是 'development'，则加载 `.env.development`
const envFileName = `.env.${NODE_ENV}`;
// 使用 dotenv 加载指定路径的 .env 文件，将其中的变量添加到 `process.env`
dotenv.config({ path: envFileName });

/*------------------ 校验 processEnv 数据 -----------------*/

// 从 `process.env` 中提取项目所需的环境变量
// 注意：此时 dotenv 已经将对应 .env 文件中的变量加载到了 process.env
const processEnvData: ProcessEnvType = {
  NODE_ENV: process.env.NODE_ENV,
  PREVIEW_MODE: process.env.PREVIEW_MODE, // 是否启用预览模式 (可能用于查看草稿文章)
  SITE_URL: process.env.SITE_URL, // 网站的公开访问 URL
  PLAUSIBLE_SCRIPT_URL: process.env.PLAUSIBLE_SCRIPT_URL, // Plausible 分析脚本的 URL (可选)
  PLAUSIBLE_DOMAIN: process.env.PLAUSIBLE_DOMAIN, // Plausible 分析对应的域名 (可选)
};

// 在控制台打印读取到的原始环境变量，方便调试
prettyPrintObject(processEnvData, '读取到的 PROCESS_ENV');

/**
 * @constant PROCESS_ENV
 * @description 经过 Zod schema (`processEnvSchema`) 校验后的环境变量对象。
 * 这个对象包含了类型安全且经过验证的环境变量，可以在项目的服务端代码中使用，
 * 特别是在 `astro.config.ts` 及其依赖项中。
 */
export const PROCESS_ENV = validateData(processEnvData, processEnvSchema);

/*------------------ 定义 Astro 环境 Schema (experimental.env.schema) -----------------*/

/**
 * @constant envSchema
 * @description 定义了供 Astro `experimental.env.schema` 使用的结构。
 * 这个 schema 用于：
 * 1. 提供更精细的环境变量类型校验 (虽然这里已经用 Zod 校验了一次，但这是 Astro 的内置机制)。
 * 2. 控制哪些环境变量可以安全地暴露给客户端代码 (`access: 'public'`)。
 * 3. 指定环境变量的作用域 (`context: 'server' | 'client')。
 * 4. 提供默认值 (`default`) 或标记为可选 (`optional`)。
 */
export const envSchema = {
  schema: {
    // 服务端环境变量 (仅在服务端可用)
    NODE_ENV: envField.string({
      context: 'server', // 指定只在服务端上下文可用
      access: 'public', // 允许在客户端通过 import.meta.env.PUBLIC_NODE_ENV 访问 (如果需要的话，但通常 NODE_ENV 是服务端的)
      default: 'development', // 如果未设置，默认为 'development'
    }),
    PREVIEW_MODE: envField.boolean({
      context: 'server',
      access: 'public',
      default: false, // 默认禁用预览模式
    }),
    // 客户端环境变量 (会暴露给客户端)
    SITE_URL: envField.string({
      context: 'client', // 指定在客户端和服务端都可用
      access: 'public', // 允许在客户端通过 import.meta.env.PUBLIC_SITE_URL 访问
      // default: 省略 default 以强制进行显式校验，确保 SITE_URL 必须被设置
    }),
    PLAUSIBLE_SCRIPT_URL: envField.string({
      context: 'client',
      access: 'public',
      optional: true, // 标记为可选变量
    }),
    PLAUSIBLE_DOMAIN: envField.string({
      context: 'client',
      access: 'public',
      optional: true,
      // 如果未设置 PLAUSIBLE_DOMAIN，则从 SITE_URL 自动推断主机名作为默认值
      default: getHostnameFromUrl(PROCESS_ENV.SITE_URL),
    }),
  },
};

/**
 * @file src/config/server.ts
 * @description 定义和校验服务端代码使用的配置常量和环境变量。
 * 这个文件主要负责从 Astro 的服务端环境模块 (`astro:env/server`) 获取环境变量，
 * 并结合其他配置进行校验和整合。
 * 与 `client.ts` 不同，这里的配置主要用于服务端渲染 (SSR) 或构建时 (SSG)。
 */

// 从 Astro 提供的服务端环境模块导入环境变量
// 这些是在 `astro.config.ts` 的 `envSchema` 中定义的变量，默认情况下 `context` 为 'server' 的变量会在这里可用。
// `astro:env/server` 只能在服务端代码中访问，确保了敏感信息的安全。
import { NODE_ENV as NODE_ENV_STRING, PREVIEW_MODE } from 'astro:env/server';

// 导入 Zod schema、客户端配置、日志和校验工具
import { configServerSchema } from '@/schemas/config'; // 用于校验服务端配置的 Zod schema
import { CONFIG_CLIENT } from '@/config/client'; // 导入已经校验过的客户端配置
import { prettyPrintObject } from '@/utils/log'; // 打印日志的工具函数
import { validateData } from '@/utils/validation'; // 数据校验函数

// 导入服务端配置对象的 TypeScript 类型
import type { ConfigServerType } from '@/types/config';

// 类型转换 (Type Casting)
// 从 `astro:env/server` 导入的 `NODE_ENV_STRING` 类型可能比较通用 (string)，
// 这里将其显式转换为我们在 `ConfigServerType` 中定义的更具体的类型 ('development' | 'production' | 'test')。
// 这有助于 TypeScript 进行更精确的类型检查。
const NODE_ENV = NODE_ENV_STRING as ConfigServerType['NODE_ENV'];

/**
 * @constant configServerData
 * @description 包含原始服务端配置数据的对象。
 * 对于静态站点生成 (SSG)，所有环境变量仅在构建时使用。
 */
const configServerData: ConfigServerType = { NODE_ENV, PREVIEW_MODE };

/**
 * @constant CONFIG_SERVER
 * @description 经过 Zod schema (`configServerSchema`) 校验后的服务端配置对象。
 * 这个对象包含了服务端代码可以安全使用的配置信息，类型安全且经过验证。
 */
export const CONFIG_SERVER = validateData(configServerData, configServerSchema);

// 合并服务端和客户端配置
/**
 * @constant MERGED_CONFIG
 * @description 合并了服务端 (`CONFIG_SERVER`) 和客户端 (`CONFIG_CLIENT`) 的配置对象。
 * 提供一个统一的访问点来获取所有经过校验的配置信息。
 * 注意：这样做是为了方便，但在实际使用中仍需注意区分哪些配置只应在服务端访问。
 */
export const MERGED_CONFIG = { ...CONFIG_SERVER, ...CONFIG_CLIENT };

// 打印最终合并和解析后的配置
// 建议将此日志记录移至应用程序加载时的处理程序 (onAppLoad handler) 或类似地方，
// 以确保它在配置完全准备好后执行，并避免在模块导入时产生副作用。
prettyPrintObject(MERGED_CONFIG, '解析后的 CONFIG');

/**
 * @file tailwind.config.ts
 * @description Tailwind CSS 框架的配置文件。
 * Tailwind 是一个功能类优先 (utility-first) 的 CSS 框架。
 * 这个文件就像是你为 Tailwind 这个"样式工具箱"量身定做的说明书。
 * 你可以在这里定义自己的颜色、字体、间距、断点（屏幕尺寸），
 * 添加自定义的功能类，或者引入 Tailwind 插件来扩展功能。
 */

// 导入 Tailwind CSS 的默认主题和插件辅助函数
// 这样我们可以在默认设置的基础上进行扩展
import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';

// 导入 Tailwind 配置和插件工具的 TypeScript 类型
// 这有助于在编写配置时获得类型检查和自动补全
import type { Config } from 'tailwindcss';
import type { PluginUtils } from 'tailwindcss/types/config';

// 定义 Tailwind 配置对象，并指定类型为 Config
const config: Config = {
  /**
   * @property {string[]} content - 指定 Tailwind 需要扫描的文件路径。
   * Tailwind 会扫描这些文件，找出所有用到的功能类 (utility classes)，
   * 然后只生成这些用到的 CSS，从而大大减小最终 CSS 文件的体积。
   * 这里配置扫描 `src` 目录下所有指定扩展名的文件以及 `astro.config.mjs`。
   */
  content: ['src/**/*.{astro,md,mdx,tsx,ts}', 'astro.config.mjs'],
  /**
   * @property {'media' | 'class' | ['selector', string]} darkMode - 配置暗黑模式的切换方式。
   * - 'media': 基于操作系统的 prefers-color-scheme 媒体查询。
   * - 'class': 通过在 HTML 根元素上添加 'dark' 类来切换。
   * - ['selector', string]: 通过指定的 CSS 选择器来触发暗黑模式，这里使用 `selector` 表示通过父元素上的 `.dark` 类来控制。
   * 这个配置只激活 `dark:` 修饰符，具体的颜色主题需要在 theme 中定义或通过 CSS 变量实现。
   */
  // 仅激活 dark: 修饰符，不自动应用颜色主题
  darkMode: ['selector'],
  /**
   * @property {Array<object|string>} plugins - 要使用的 Tailwind 插件。
   * 插件可以添加新的功能类、组件样式或变体 (variants)。
   */
  plugins: [
    // 引入官方的排版插件 (`@tailwindcss/typography`)
    // 这个插件提供了一套预设的富文本样式 (prose 类)，用于美化 Markdown 或 CMS 生成的内容。
    require('@tailwindcss/typography'),
    // 使用 Tailwind 的 plugin 函数创建一个自定义插件
    plugin(({ addVariant }: PluginUtils) => {
      // 添加自定义变体 (variants)
      // 变体允许我们根据特定条件应用样式，比如 hover, focus 等。
      // 这里添加了 `not-first` 和 `not-last` 变体，
      // 分别对应 `:not(:first-child)` 和 `:not(:last-child)` 选择器。
      // 例如，可以用 `not-first:border-t` 来给除第一个元素外的所有元素添加上边框。
      addVariant('not-first', '&:not(:first-child)');
      addVariant('not-last', '&:not(:last-child)');
    }),
  ],
  /**
   * @property {object} theme - 定义项目的设计系统，如颜色、字体、间距、断点等。
   * `theme` 对象下的配置会覆盖 Tailwind 的默认设置。
   * 使用 `extend` 对象可以在默认设置的基础上添加新的值或覆盖部分默认值。
   */
  theme: {
    /**
     * @property {object} tabSize - 定义 `tab-*` 功能类的值。
     * 用于控制代码块等元素的制表符宽度。
     */
    tabSize: {
      1: '1',
      2: '2',
      4: '4',
      8: '8',
    },
    /**
     * @property {object} screens - 定义响应式断点。
     * 这些断点用于媒体查询，允许你为不同屏幕尺寸应用不同的样式。
     * 注意：这里没有使用 `extend`，而是直接定义 `screens` 对象，
     * 这意味着我们完全覆盖了 Tailwind 的默认断点设置，但通过 `...defaultTheme.screens` 保留了默认断点，
     * 并添加了一个自定义的 `xs` 断点。
     * 如果放在 `extend` 中，`xs` 会被添加到默认断点的末尾，顺序可能不符合预期。
     */
    // 注意：不能使用 extend，否则 xs 会被加到最后
    screens: {
      xs: '475px', // 自定义超小屏幕断点
      ...defaultTheme.screens, // 继承 Tailwind 的默认断点 (sm, md, lg, xl, 2xl)
    },
    /**
     * @property {object} extend - 在 Tailwind 默认主题的基础上进行扩展。
     * 这里定义的设置会与默认主题合并。
     */
    extend: {
      /**
       * @property {object} fontFamily - 定义字体族。
       * `sans` 对应无衬线字体。
       * 这里将 'Inter Variable' 和 'Inter' 添加到默认无衬线字体列表的最前面。
       */
      fontFamily: {
        sans: ['Inter Variable', 'Inter', ...defaultTheme.fontFamily.sans],
      },
      /**
       * @property {object} colors - 定义颜色调色板。
       * 这里使用了 CSS 变量 (`var(--th-...)`) 来定义颜色。
       * 这使得颜色可以根据不同的主题 (如亮色/暗色模式) 动态改变。
       * 实际的颜色值定义在 CSS 文件中 (通常在 :root 或特定的主题类下)。
       * - `base-*`: 背景相关颜色。
       * - `content`, `headings`, `captions`: 文本相关颜色。
       * - `links`: 链接颜色及其状态 (默认, hover, visited)。
       * - `primary`, `secondary`, `accent`: 品牌主色调、次色调和强调色，以及它们的 hover 状态和对应的文本颜色。
       */
      colors: {
        // 背景色
        'base-100': 'var(--th-base-100)', // 主要背景
        'base-200': 'var(--th-base-200)', // 次要背景 (稍深/浅)
        'base-300': 'var(--th-base-300)', // 更深/浅的背景
        'base-code': 'var(--th-base-code)', // 代码块背景
        // 文本色
        content: 'var(--th-content)', // 主要文本颜色
        headings: 'var(--th-headings)', // 标题颜色
        captions: 'var(--th-captions)', // 辅助说明文本颜色
        links: {
          DEFAULT: 'var(--th-links)', // 默认链接颜色
          hover: 'var(--th-links-hover)', // 链接悬停颜色
          visited: 'var(--th-links-visited)', // 已访问链接颜色
        },
        // 品牌色
        primary: {
          DEFAULT: 'var(--th-primary)', // 主要品牌色
          hover: 'var(--th-primary-hover)', // 主要品牌色悬停
          content: 'var(--th-primary-content)', // 在主要品牌色背景上的文本颜色
          'base-200': 'var(--th-primary-base-200)', // 基于主要品牌色的次要背景
          'base-300': 'var(--th-primary-base-300)', // 基于主要品牌色的更深/浅背景
        },
        secondary: {
          DEFAULT: 'var(--th-secondary)', // 次要品牌色
          hover: 'var(--th-secondary-hover)', // 次要品牌色悬停
          content: 'var(--th-secondary-content)', // 在次要品牌色背景上的文本颜色
        },
        accent: {
          DEFAULT: 'var(--th-accent)', // 强调色
          hover: 'var(--th-accent-hover)', // 强调色悬停
          content: 'var(--th-accent-content)', // 在强调色背景上的文本颜色
        },
      },
      /**
       * @property {object} borderRadius - 定义边框圆角大小。
       * 使用 CSS 变量定义，方便主题化。
       */
      borderRadius: {
        box: 'var(--th-rounded-box)', // 用于容器、卡片等
        button: 'var(--th-rounded-button)', // 用于按钮
        tag: 'var(--th-rounded-tag)', // 用于标签
      },
      /**
       * @property {function} typography - 配置 `@tailwindcss/typography` 插件。
       * 允许我们自定义 `prose` 类生成的样式。
       * @param {PluginUtils} utils - 包含 theme 函数等工具的对象。
       */
      typography: ({ theme }: PluginUtils) => ({
        // 默认的 `prose` 样式配置
        DEFAULT: {
          css: {
            // 移除代码块前后默认添加的引号
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            // 可以在这里添加更多自定义的 `prose` 样式
            // 例如：
            // h1: { color: theme('colors.headings') },
            // a: { color: theme('colors.links.DEFAULT'), '&:hover': { color: theme('colors.links.hover') } },
          },
        },
        // 自定义一个名为 `prose-a-img` 的排版变体 (虽然注释说是 nonsense，但展示了如何创建变体)
        // 使用方式：<div class="prose prose-a-img">...</div>
        'a-img': {
          css: {
            // 给 `prose-a-img` 容器内的链接图片在悬停时添加蓝色轮廓
            'a:hover img': {
              outline: `4px solid ${theme('colors.blue.500')}`,
            },
          },
        },
      }),
    },
  },
};

// 导出配置对象
export default config;

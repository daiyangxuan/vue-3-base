const Vue3 = require('@efox/plugin-vue-3')
const {defineConfig} = require('@efox/emp')
const Components = require('unplugin-vue-components/webpack')
const {AntDesignVueResolver} = require('unplugin-vue-components/resolvers')

module.exports = defineConfig(({mode, env}) => {
  const target = 'es5'
  return {
    plugins: [Vue3],
    appEntry: 'main.ts',
    server: {port: 9001},
    html: {title: 'EMP Vue3 Base'},
    build: {target},
    empShare: {
      name: 'vue3Base',
      exposes: {
        './ButtonComponent': './src/components/ButtonComponent',
        './TableComponent': './src/components/TableComponent',
        './JSXComponent': './src/components/JSXComponent',
        './HomeView': './src/views/Home',
        './AboutView': './src/views/About',
        './View404': './src/views/404',
        "./types": "./src/components/SjBasicLayout/SjSider/types.ts",
        "./SjBasicLayout": "./src/components/SjBasicLayout/SjBasicLayout.vue",
        "./createAsyncRouterView": "./src/components/SjBasicLayout/createAsyncRouterView.tsx",
        "./useAsyncRouterView": "./src/components/SjBasicLayout/useAsyncRouterView.ts",
        "./SjTable": "./src/components/SjTable/SjTable.vue",
        "./FilterableSelect": "./src/components/FilterableSelect/FilterableSelect.vue",
        "./SjSelectForTable": "./src/components/SjSelectForTable.vue",
        "./customTooltip": "./src/components/SjTable/customTooltip.ts",
        "./style": "./src/assets/style/index.less",
        "./utils": "./src/utils/index.ts"
      },
      shareLib: {
        vue: 'Vue@https://cdn.jsdelivr.net/npm/vue@3.2.30/dist/vue.global.js',
        dayjs: 'dayjs@https://unpkg.com/dayjs/dayjs.min.js',
        'ant-design-vue': 'antd@https://cdn.jsdelivr.net/npm/ant-design-vue@3.2.0/dist/antd.min.js',
      },
    },
    webpackChain(chain) {
      chain.plugin('components').use(
        Components({
          resolvers: [
            AntDesignVueResolver({
              resolveIcons: true,
              importStyle: 'less',
            }),
            // extensions: ['\*', '.js', '.jsx', '.vue'],
            // symlinks: false,
            // alias: {
            // "@/": path.resolve(__dirname, '../src/'),
            //   'vue$': 'vue/dist/vue.esm-bundler.js',
            //   vue: path.resolve(__dirname, `../node_modules/vue`)
            // },
          ],
        }),
      )
    },
  }
})

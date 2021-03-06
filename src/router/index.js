import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '@/components/Login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '@/components/Login.vue')
// import Home from '@/components/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '@/components/Home.vue')
// import Welcome from '@/components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '@/components/Welcome.vue')

// import Users from '@/components/user/Users.vue'
const Users = () => import(/* webpackChunkName: "user_rights_roles" */ '@/components/user/Users.vue')
// import Rights from '@/components/power/Rights.vue'
const Rights = () => import(/* webpackChunkName: "user_rights_roles" */ '@/components/power/Rights.vue')
// import Roles from '@/components/power/Roles.vue'
const Roles = () => import(/* webpackChunkName: "user_rights_roles" */ '@/components/power/Roles.vue')

// import Cate from '@/components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "cate_params" */ '@/components/goods/Cate.vue')
// import Params from '@/components/goods/Params.vue'
const Params = () => import(/* webpackChunkName: "cate_params" */ '@/components/goods/Params.vue')

// import GoodsList from '@/components/goods/List.vue'
const GoodsList = () => import(/* webpackChunkName: "goodslist_add_edit" */ '@/components/goods/List.vue')
// import Add from '@/components/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "goodslist_add_edit" */ '@/components/goods/Add.vue')
// import Edit from '@/components/goods/Edit.vue'
const Edit = () => import(/* webpackChunkName: "goodslist_add_edit" */ '@/components/goods/Edit.vue')

// import Order from '@/components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "order_report" */ '@/components/order/Order.vue')
// import Report from '@/components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "order_report" */ '@/components/report/Report.vue')

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users, meta: ['用户管理', '用户列表'] },
        { path: '/rights', component: Rights, meta: ['权限管理', '权限列表'] },
        { path: '/roles', component: Roles, meta: ['权限管理', '角色列表'] },
        { path: '/categories', component: Cate, meta: ['商品管理', '商品分类'] },
        { path: '/params', component: Params, meta: ['商品管理', '参数管理'] },
        { path: '/goods', component: GoodsList, meta: ['商品管理', '商品列表'] },
        { path: '/goods/add', component: Add, meta: ['商品管理', '添加商品'] },
        { path: '/goods/edit/:id', component: Edit, meta: ['商品管理', '修改商品'] },
        { path: '/orders', component: Order, meta: ['订单管理', '订单列表'] },
        { path: '/reports', component: Report, meta: ['数据统计', '数据报表'] }
      ],
      redirect: '/welcome'
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  // next() 放行，next('/login') 强制跳转
  if (to.path === '/login') return next()

  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router

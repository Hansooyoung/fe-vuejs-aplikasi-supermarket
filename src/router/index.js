import { createRouter, createWebHistory } from 'vue-router'
import { jwtDecode } from 'jwt-decode'
import api from '@/api'

    const routes = [
      {
        path: '/',
        name: 'Main',
        beforeEnter: (to, from, next) => {
          // const role = localStorage.getItem('userRole')
          const userToken = localStorage.getItem('token')
          if (!userToken) {
            next({ name: 'login' })
            return
          }

          const getRole = jwtDecode(userToken)
          const role = getRole.role

          switch (role) {
            case 'admin':
              next({ name: 'dashboard-admin' })
              break
            case 'member':
              next({ name: 'dashboard-member' })
              break
            case 'super':
              next({ name: 'dashboard-super' })
              break
            case 'user':
              next({ name: 'dashboard-user' })
              break
          }
        }
      },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "home" */ '../views/Authentication/SigninView.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import(/* webpackChunkName: "home" */ '../views/Authentication/SignupView.vue')
  },
  {
    path: '/admin/dashboard',
    name: 'dashboard-admin',
    component: () => import(/* webpackChunkName: "home" */ '../views/Admin/ECommerceView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/super/dashboard',
    name: 'dashboard-super',
    component: () => import(/* webpackChunkName: "home" */ '../views/Super/ECommerceView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/user/dashboard',
    name: 'dashboard-user',
    component: () => import(/* webpackChunkName: "home" */ '../views/User/ECommerceView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/member/dashboard',
    name: 'dashboard-member',
    component: () => import(/* webpackChunkName: "home" */ '../views/Member/ECommerceView.vue'),
    meta: { role: 'member' }
  },
  {
    path: '/admin/dashboard/kategori',
    name: 'kategori',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/Kategori/IndexView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/super/dashboard/kategori',
    name: 'kategori-super',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Super/Kategori/IndexView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/admin/dashboard/kategori/create',
    name: 'kategori.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/Kategori/CreateView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/super/dashboard/kategori/create',
    name: 'kategori-super.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Super/Kategori/CreateView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/admin/dashboard/kategori/update/:id',
    name: 'kategori.update',
    component: () => import('../views/Admin/Kategori/UpdateView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/super/dashboard/kategori/update/:id',
    name: 'kategori-super.update',
    component: () => import('../views/Admin/Kategori/UpdateView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/admin/dashboard/daftar-pengguna',
    name: 'daftar-pengguna',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/DaftarPengguna/IndexView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/super/dashboard/daftar-pengguna',
    name: 'daftar-pengguna-super',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Super/DaftarPengguna/IndexView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/admin/dashboard/daftar-pengguna/create',
    name: 'daftar-pengguna.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/DaftarPengguna/CreateView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/super/dashboard/daftar-pengguna/create',
    name: 'daftar-pengguna-super.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Super/DaftarPengguna/CreateView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/admin/dashboard/daftar-pengguna/update/:id',
    name: 'daftar-pengguna.update',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/DaftarPengguna/UpdateView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/super/dashboard/daftar-pengguna/update/:id',
    name: 'daftar-pengguna-super.update',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Super/DaftarPengguna/UpdateView.vue'),
    meta: { role: 'super' }
  },

  {
    path: '/admin/dashboard/satuan',
    name: 'satuan',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/Satuan/IndexView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/super/dashboard/satuan',
    name: 'satuan-super',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Super/Kelas/IndexView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/admin/dashboard/satuan/create',
    name: 'satuan.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/Satuan/CreateView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/super/dashboard/satuan/create',
    name: 'satuan-super.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Super/Kelas/CreateView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/admin/dashboard/satuan/update/:id',
    name: 'satuan.update',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/Satuan/UpdateView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/super/dashboard/satuan/update/:id',
    name: 'satuan-super.update',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Super/Kelas/UpdateView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/admin/dashboard/vendor',
    name: 'vendor',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/Vendor/IndexView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/admin/dashboard/laporan-penjualan',
    name: 'laporan-penjualan',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/Laporan/PenjualanView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/admin/dashboard/laporan-penjualan/:id',
    name: 'laporan-penjualan.detail',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/Laporan/DetailPenjualanView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/admin/dashboard/laporan-pembelian/:id',
    name: 'laporan-pembelian.detail',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/Laporan/DetailPembelianView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/admin/dashboard/laporan-pembelian',
    name: 'laporan-pembelian',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/Laporan/PembelianView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/admin/dashboard/laporan-penjualan-barang',
    name: 'laporan-penjualan-barang',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/Laporan/PenjualanBarangView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/super/dashboard/vendor',
    name: 'vendor-super',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Super/Vendor/IndexView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/admin/dashboard/vendor/create',
    name: 'vendor.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/Vendor/CreateView.vue'),
    meta: { role: 'admin' }
  },
  {
    path: '/super/dashboard/vendor/create',
    name: 'vendor-super.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Super/Vendor/CreateView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/admin/dashboard/vendor/update/:id',
    name: 'vendor.update',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Admin/Vendor/UpdateView.vue'),
    meta: { role: 'admin' }
  },

  {
    path: '/super/dashboard/vendor/update/:id',
    name: 'vendor-super.update',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Super/Vendor/UpdateView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/user/dashboard/pembelian',
    name: 'pembelian',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Pembelian/IndexView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/user/dashboard/pembelian/:id',
    name: 'pembelian.detail',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Pembelian/DetailView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/user/dashboard/pembelian/create',
    name: 'pembelian.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Pembelian/CreateView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/user/dashboard/penjualan',
    name: 'penjualan',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Penjualan/IndexView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/user/dashboard/penjualan/struk/:id',
    name: 'struk',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Penjualan/StrukView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/user/dashboard/penjualan/create',
    name: 'penjualan.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Penjualan/CreateView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/user/dashboard/penjualan/:id',
    name: 'penjualan.detail',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Penjualan/DetailView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/user/dashboard/barang',
    name: 'barang',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Barang/IndexView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/super/dashboard/barang',
    name: 'barang-super',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Super/Vendor/IndexView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/user/dashboard/barang/create',
    name: 'barang.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Barang/CreateView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/user/dashboard/pengajuan-barang',
    name: 'pengajuan-barang',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Pengajuan/IndexView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/user/dashboard/pengajuan-barang/create',
    name: 'pengajuan-barang.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Pengajuan/CreateView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/super/dashboard/barang/create',
    name: 'barang-super.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Super/Vendor/CreateView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/user/dashboard/barang/update/:kode_barang',
    name: 'barang.update',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Barang/UpdateView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/user/dashboard/barang/detail/:kode_barang',
    name: 'barang.detail',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Barang/DetailView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/super/dashboard/barang/update/:kode_barang',
    name: 'barang-super.update',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Super/Vendor/UpdateView.vue'),
    meta: { role: 'super' }
  },
  {
    path: '/user/dashboard/member',
    name: 'member',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Member/IndexView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/user/dashboard/member/create',
    name: 'member.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/Member/CreateView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/member/dashboard/pengajuan',
    name: 'pengajuan',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Member/Pengajuan/IndexView.vue'),
    meta: { role: 'member' }
  },
  {
    path: '/member/dashboard/pengajuan/create',
    name: 'pengajuan.create',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Member/Pengajuan/CreateView.vue'),
    meta: { role: 'member' }
  },
  {
    path: '/member/dashboard/pengajuan/update/:id',
    name: 'pengajuan.update',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Member/Pengajuan/UpdateView.vue'),
    meta: { role: 'member' }
  },
  {
    path: '/user/dashboard/riwayat-aktifitas',
    name: 'riwayat-user',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/User/RiwayatView.vue'),
    meta: { role: 'user' }
  },
  {
    path: '/member/dashboard/riwayat-aktifitas',
    name: 'riwayat-member',
    component: () =>
      import(/* webpackChunkName: "home" */ '../views/Member/RiwayatView.vue'),
    meta: { role: 'member' }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  console.log('Navigating to:', to.name) // Debugging

  const token = localStorage.getItem('token')

  if (to.name === 'login' || to.name === 'register') {
    next() // Izinkan akses ke login & register tanpa token
    return
  }

  if (!token) {
    console.log('No token found, redirecting to login')
    next({ name: 'login' })
    return
  }

  try {
    const decodedToken = jwtDecode(token)
    const userRole = decodedToken.role

    checkAuth(token).then((status) => {
      if (status === 0 || status === 2) { 
        console.error('Token tidak valid atau tidak dapat diverifikasi')
        localStorage.removeItem('token')
        next({ name: 'login' })
      } else if (status === 1) {
        if (to.meta.role && to.meta.role !== userRole) {
          console.log(`Akses ditolak untuk role ${userRole} ke rute ${to.name}`)
          next({ name: 'login' })  
        } else {
          next()  
        }
      } else {
        next()
      }
    })
  } catch (error) {
    console.error('Token tidak valid:', error)
    localStorage.removeItem('token')
    next({ name: 'login' })
  }
})


async function checkAuth(token) {
  try {
    const response = await api.request({
      method: 'GET',
      url: '/user',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
        Authorization: `Bearer ${token}`,  // Perbaiki pengiriman token
      }
    })

    return response.status === 200 ? 1 : 0
  } catch (error) {
    console.log(error)
    return error.response ? 0 : 2
  }
}

export default router

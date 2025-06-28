import { createRouter, createWebHistory } from 'vue-router'
import ImageProcessor from '../components/ImageProcessor.vue'

const router = createRouter({
  history: createWebHistory('/image-text-mosaic/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: ImageProcessor,
    }
  ],
})

export default router

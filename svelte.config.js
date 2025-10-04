import adapterVercel from '@sveltejs/adapter-vercel';
import adapterNode from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const useNode = process.env.ADAPTER === 'node';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: useNode ? adapterNode() : adapterVercel()
  }
};

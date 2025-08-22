import { error } from '@sveltejs/kit';
import products from '$lib/data/products.json';

export const prerender = true;

export function load({ params }) {
  const product = products.find((p) => p.slug === params.slug);
  if (!product) throw error(404, 'Product not found');
  return { product };
}

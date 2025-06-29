import { apiService } from "./api.service";

export async function getProductSpecifications(productId) {
  return await apiService.get(`/dashboard/products/${productId}/specifications/`);
}

export async function updateProductSpecification(productId, specId, data) {
  return await apiService.put(`/dashboard/products/${productId}/specifications/${specId}/`, data);
}

export async function deleteProductSpecification(productId, specId) {
  return await apiService.delete(`/dashboard/products/${productId}/specifications/${specId}/`);
}

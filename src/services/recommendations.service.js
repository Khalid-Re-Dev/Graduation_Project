// Service to fetch recommendations from the backend
import { apiService } from "../services/api.service";

export async function fetchRecommendations() {
  // Endpoint: http://localhost:5000/api/recommendations/
  // If you use a different port, update accordingly
  return apiService.get("/recommendations/");
}

// لا تضع أي كود JSX هنا. واجهة المستخدم يجب أن تكون فقط في ملفات React Components (مثل HomePage.jsx)

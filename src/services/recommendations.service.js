// Service to fetch recommendations from the backend
import { apiService } from "../services/api.service";

export async function fetchRecommendations() {
  // Endpoint: http://localhost:8000/api/recommendations/foryou/
  return apiService.get("/recommendations/foryou/", { withAuth: true });
}

// لا تضع أي كود JSX هنا. واجهة المستخدم يجب أن تكون فقط في ملفات React Components (مثل HomePage.jsx)

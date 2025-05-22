from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('core.urls')),
    path('api/shop/', include('products.urls_shop')),  # إضافة مسار API للمتجر
    path('api/products/', include('products.urls')),  # إضافة مسار API للمنتجات
    path('api/products/', include('products.urls_reactions')),  # إضافة مسار API لتفاعلات المنتجات
    path('api/products/', include('reviews.urls_product_reviews')),  # إضافة مسار API لتقييمات المنتجات
    path('api/comparison/', include('comparison.urls')),  # إضافة مسار API للمقارنة
    path('api/dashboard/', include('products.urls_dashboard')),  # إضافة مسار API للوحة التحكم
    path('api/categories/', include('products.urls_categories')),  # إضافة مسار API للتصنيفات
    path('products/', include('products.urls')),
    path('categories/', include('products.urls_categories')),
    path('promotions/', include('promotions.urls')),
    path('reviews/', include('reviews.urls')),
    path('api/recommendations/', include('recommendations.urls')),
    path('api/notifications/', include('core.urls_notifications')),  # إضافة مسار API للإشعارات
]

# إضافة مسارات للملفات الوسائط في بيئة التطوير
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

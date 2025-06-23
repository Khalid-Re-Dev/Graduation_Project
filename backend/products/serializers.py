from rest_framework import serializers
from django.contrib.auth import get_user_model
from reviews.serializers import ReviewSerializer
from core.models import Category, Product, Shop, Customer, Brand, SpecificationCategory, Specification, ProductSpecification

User = get_user_model()

#----------------------------------------------------------------
#                 Category Serializer
#----------------------------------------------------------------
class CategorySerializer(serializers.ModelSerializer):

    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'product_count')

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()

#----------------------------------------------------------------

#                   ProductList Serializer
#----------------------------------------------------------------
class ProductListSerializer(serializers.ModelSerializer):

    category = CategorySerializer(read_only=True)
    discount = serializers.SerializerMethodField()
    rating = serializers.FloatField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = ('id', 'name', 'price', 'original_price', 'discount',
                  'category', 'image_url', 'rating', 'in_stock', 'is_active')

    def get_discount(self, obj):
        return obj.discount_percentage

#----------------------------------------------------------------
#                   Brand Serializer
#----------------------------------------------------------------
class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = ('id', 'name', 'popularity', 'rating', 'likes', 'dislikes', 'product_count')

    def get_product_count(self, obj):
        return obj.products.count()

#----------------------------------------------------------------
#                   Product Detail Serializer
#----------------------------------------------------------------
class ProductDetailSerializer(serializers.ModelSerializer):

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category', write_only=True)
    brand = BrandSerializer(read_only=True)
    brand_id = serializers.PrimaryKeyRelatedField(queryset=Brand.objects.all(), source='brand', write_only=True, required=True)
    # shop = ShopSerializer(read_only=True) # Commented out to avoid circular import
    shop_id = serializers.PrimaryKeyRelatedField(queryset=Shop.objects.all(), source='shop', write_only=True, required=False)
    reviews = ReviewSerializer(many=True, read_only=True)
    discount = serializers.SerializerMethodField()
    rating = serializers.FloatField(read_only=True, required=False)
    in_stock = serializers.BooleanField(read_only=True, required=False)
    stock = serializers.IntegerField(required=False)

    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'price', 'original_price',
                  'discount', 'category', 'category_id', 'brand', 'brand_id', 'shop_id',
                  'image_url', 'in_stock', 'rating', 'is_active', 'created_at', 'stock',
                  'reviews', 'video_url', 'release_date', 'likes', 'dislikes', 'neutrals',
                  'views', 'is_banned')
        extra_kwargs = {
            'brand': {'required': False},
            'rating': {'required': False, 'default': 0},
            'original_price': {'required': False},
            'is_active': {'default': True}
        }

    def get_discount(self, obj):
        return obj.discount_percentage

    def create(self, validated_data):
        # حذف الحقول غير الموجودة في الموديل
        validated_data.pop('stock', None)
        print('validated_data before create:', validated_data)
        return super().create(validated_data)

    def to_internal_value(self, data):
        # معالجة brand_id لقبول int أو UUID
        brand_id = data.get('brand_id')
        if brand_id is not None:
            from uuid import UUID
            try:
                # إذا كان int، حوّله إلى Brand ثم UUID
                if isinstance(brand_id, int) or (isinstance(brand_id, str) and brand_id.isdigit()):
                    from core.models import Brand
                    brand_obj = Brand.objects.get(id=int(brand_id))
                    data['brand_id'] = str(brand_obj.id)
                else:
                    # تحقق من صحة الـ UUID
                    data['brand_id'] = str(UUID(str(brand_id)))
            except Exception:
                pass  # سيظهر خطأ لاحقًا إذا لم يوجد البراند
        # معالجة category_id بنفس الطريقة إذا رغبت
        return super().to_internal_value(data)

#----------------------------------------------------------------
#                   Shop Serializer
#----------------------------------------------------------------
class ShopSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = ('id', 'name', 'address', 'description', 'logo', 'banner', 'url',
                 'phone', 'email', 'social_media', 'owner_name', 'product_count',
                 'completion_percentage')
        read_only_fields = ('id', 'owner_name', 'product_count', 'completion_percentage')

    def get_owner_name(self, obj):
        if obj.owner and obj.owner.user:
            return obj.owner.user.username
        return None

    def get_product_count(self, obj):
        return obj.products.count()

    def get_completion_percentage(self, obj):
        required_fields = ['name', 'address', 'description', 'logo', 'url', 'phone', 'email']
        completed = sum(1 for field in required_fields if getattr(obj, field))
        return int((completed / len(required_fields)) * 100)


#----------------------------------------------------------------
#                   ProductList Serializer
#----------------------------------------------------------------
class ProductListSerializer(serializers.ModelSerializer):

    category = CategorySerializer(read_only=True)
    discount = serializers.SerializerMethodField()
    rating = serializers.FloatField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    shop_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ('id', 'name', 'price', 'original_price', 'discount',
                  'category', 'image_url', 'rating', 'likes','dislikes',
                  'neutrals', 'is_active', 'shop_name', 'in_stock', 'views')

    def get_discount(self, obj):
        if obj.original_price and obj.price and obj.original_price > obj.price:
            return int(((obj.original_price - obj.price) / obj.original_price) * 100)
        return 0

    def get_shop_name(self, obj):
        if obj.shop:
            return obj.shop.name
        return None

#----------------------------------------------------------------
#                   Brand Serializer
#----------------------------------------------------------------
class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Brand
        fields = ('id', 'name', 'popularity', 'rating', 'likes', 'dislikes', 'product_count')

    def get_product_count(self, obj):
        return obj.products.count()

#----------------------------------------------------------------
#                   Product Detail Serializer
#----------------------------------------------------------------
class ProductDetailSerializer(serializers.ModelSerializer):

    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), source='category', write_only=True)
    brand = BrandSerializer(read_only=True)
    brand_id = serializers.PrimaryKeyRelatedField(queryset=Brand.objects.all(), source='brand', write_only=True, required=True)
    shop_name = serializers.SerializerMethodField()
    shop_id = serializers.PrimaryKeyRelatedField(queryset=Shop.objects.all(), source='shop', write_only=True, required=False)
    reviews = ReviewSerializer(many=True, read_only=True)
    discount = serializers.SerializerMethodField()
    rating = serializers.FloatField(read_only=True, required=False)
    in_stock = serializers.BooleanField(read_only=True, required=False)
    stock = serializers.IntegerField(required=False)

    def get_shop_name(self, obj):
        if obj.shop:
            return obj.shop.name
        return None

    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'price', 'original_price',
                  'discount', 'category', 'category_id', 'brand', 'brand_id', 'shop_id', 'shop_name',
                  'image_url', 'in_stock', 'rating', 'is_active', 'created_at', 'stock',
                  'reviews', 'video_url', 'release_date', 'likes', 'dislikes', 'neutrals',
                  'views', 'is_banned')
        extra_kwargs = {
            'brand': {'required': False},
            'rating': {'required': False, 'default': 0},
            'original_price': {'required': False},
            'is_active': {'default': True}
        }

    def get_discount(self, obj):
        if obj.original_price and obj.price and obj.original_price > obj.price:
            return int(((obj.original_price - obj.price) / obj.original_price) * 100)
        return 0

    def create(self, validated_data):
        # حذف الحقول غير الموجودة في الموديل
        validated_data.pop('stock', None)
        print('validated_data before create:', validated_data)
        return super().create(validated_data)

    def to_internal_value(self, data):
        # معالجة brand_id لقبول int أو UUID
        brand_id = data.get('brand_id')
        if brand_id is not None:
            from uuid import UUID
            try:
                # إذا كان int، حوّله إلى Brand ثم UUID
                if isinstance(brand_id, int) or (isinstance(brand_id, str) and brand_id.isdigit()):
                    from core.models import Brand
                    brand_obj = Brand.objects.get(id=int(brand_id))
                    data['brand_id'] = str(brand_obj.id)
                else:
                    # تحقق من صحة الـ UUID
                    data['brand_id'] = str(UUID(str(brand_id)))
            except Exception:
                pass  # سيظهر خطأ لاحقًا إذا لم يوجد البراند
        # معالجة category_id بنفس الطريقة إذا رغبت
        return super().to_internal_value(data)

#----------------------------------------------------------------
#                   Customer Serializer
#----------------------------------------------------------------
class CustomerSerializer(serializers.ModelSerializer):
    user_email = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = ('id', 'category', 'specification_name')

#----------------------------------------------------------------
#                   Specification Serializer
#----------------------------------------------------------------
class SpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specification
        fields = ('id', 'name')

#----------------------------------------------------------------
#                   Product Specification Serializer
#----------------------------------------------------------------
class ProductSpecificationSerializer(serializers.ModelSerializer):
    specification = SpecificationSerializer(read_only=True)
    specification_id = serializers.PrimaryKeyRelatedField(
        queryset=Specification.objects.all(),
        source='specification',
        write_only=True
    )

    class Meta:
        model = ProductSpecification
        fields = ('id', 'specification', 'specification_id', 'specification_value')
        read_only_fields = ('id',)
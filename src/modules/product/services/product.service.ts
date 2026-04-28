import { HttpStatus, Injectable, HttpException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Prisma } from '@prisma/client';

import { DatabaseService } from 'src/common/database/services/database.service';
import { HelperPaginationService } from 'src/common/helper/services/helper.pagination.service';
import { OrderByInput } from 'src/common/helper/interfaces/pagination.interface';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import { ApiPaginatedDataDto } from 'src/common/response/dtos/response.paginated.dto';

import { ProductCreateDto } from '../dtos/request/product.create.request';
import { ProductUpdateDto } from '../dtos/request/product.update.request';
import { ProductSearchDto } from '../dtos/request/product.search.request';
import {
    ProductResponseDto,
    ProductListResponseDto,
    ProductDetailResponseDto,
} from '../dtos/response/product.response';
import { IProductService } from '../interfaces/product.service.interface';
import {
    buildProductTags,
    computeFromPrice,
    computePrimaryImageUrl,
    generateSlug,
} from '../utils/product.util';
import {
    AdminProductVariantCreateDto,
    AdminProductVariantUpdateDto,
} from '../dtos/request/product.admin.subresource.request';

const productImageOrderBy = [
    { isPrimary: 'desc' as const },
    { sortOrder: 'asc' as const },
];

const listInclude = {
    category: true,
    images: {
        where: { deletedAt: null },
        orderBy: productImageOrderBy,
    },
    variants: {
        where: { deletedAt: null },
        orderBy: { sortOrder: 'asc' as const },
    },
} satisfies Prisma.ProductInclude;

const detailInclude = {
    ...listInclude,
} satisfies Prisma.ProductInclude;

const adminInclude = {
    category: true,
    images: {
        where: { deletedAt: null },
        orderBy: productImageOrderBy,
    },
    variants: {
        where: { deletedAt: null },
        orderBy: { sortOrder: 'asc' as const },
    },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductService implements IProductService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly paginationService: HelperPaginationService,
        private readonly logger: PinoLogger
    ) {
        this.logger.setContext(ProductService.name);
    }

    private mapToListDto(
        product: Prisma.ProductGetPayload<{ include: typeof listInclude }>
    ): ProductListResponseDto {
        const primaryImageUrl = computePrimaryImageUrl(product.images);
        const fromPrice = computeFromPrice(product.price, product.variants);
        const tags = buildProductTags();
        const variants = product.variants.filter(
            v => v.isActive && v.deletedAt === null
        );
        return {
            ...product,
            variants,
            primaryImageUrl,
            fromPrice,
            tags,
        } as ProductListResponseDto;
    }

    private mapToDetailDto(
        product: Prisma.ProductGetPayload<{ include: typeof detailInclude }>
    ): ProductDetailResponseDto {
        const list = this.mapToListDto(product);
        return {
            ...list,
            heroImageUrl: list.primaryImageUrl,
            variants: product.variants.filter(
                v => v.isActive && v.deletedAt === null
            ),
        };
    }

    private mapToAdminDto(
        product: Prisma.ProductGetPayload<{ include: typeof adminInclude }>
    ): ProductResponseDto {
        return { ...product } as ProductResponseDto;
    }

    private async ensureUniqueSlug(
        baseSlug: string,
        excludeId?: string
    ): Promise<string> {
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await this.databaseService.product.findFirst({
                where: {
                    slug,
                    ...(excludeId && { id: { not: excludeId } }),
                    deletedAt: null,
                },
            });

            if (!existing) {
                return slug;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    private buildListWhere(
        options: {
            categoryId?: string;
            categorySlug?: string;
            isActive?: boolean;
            isFeatured?: boolean;
        },
        base: Prisma.ProductWhereInput = { deletedAt: null }
    ): Prisma.ProductWhereInput {
        const where: Prisma.ProductWhereInput = { ...base };

        if (options.categoryId) {
            where.categoryId = options.categoryId;
        }

        if (options.categorySlug) {
            where.category = { slug: options.categorySlug };
        }

        if (options.isActive !== undefined) {
            where.isActive = options.isActive;
        }

        if (options.isFeatured !== undefined) {
            where.isFeatured = options.isFeatured;
        }

        return where;
    }

    private listOrderBy(): Prisma.ProductOrderByWithRelationInput[] {
        return [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    }

    async create(data: ProductCreateDto): Promise<ProductResponseDto> {
        try {
            const category =
                await this.databaseService.productCategory.findFirst({
                    where: {
                        id: data.categoryId,
                        deletedAt: null,
                    },
                });

            if (!category) {
                throw new HttpException(
                    'product.error.categoryNotFound',
                    HttpStatus.NOT_FOUND
                );
            }

            const slug = data.slug
                ? await this.ensureUniqueSlug(generateSlug(data.slug))
                : await this.ensureUniqueSlug(generateSlug(data.name));

            const product = await this.databaseService.product.create({
                data: {
                    name: data.name,
                    slug,
                    description: data.description,
                    price: data.price,
                    currency: data.currency ?? 'USD',
                    isActive: data.isActive ?? true,
                    isFeatured: data.isFeatured ?? false,
                    sortOrder: data.sortOrder ?? 0,
                    categoryId: data.categoryId,
                    features: data.features as Prisma.JsonValue | undefined,
                    included: data.included as Prisma.JsonValue | undefined,
                    sessionMeta: data.sessionMeta as Prisma.JsonValue | undefined,
                    howItWorks: data.howItWorks as Prisma.JsonValue | undefined,
                    variants: data.variants?.length
                        ? {
                              create: data.variants.map((v, i) => ({
                                  label: v.label,
                                  price: v.price,
                                  currency: v.currency ?? 'USD',
                                  isActive: v.isActive ?? true,
                                  sortOrder: v.sortOrder ?? i,
                              })),
                          }
                        : undefined,
                },
                include: adminInclude,
            });

            if (data.images && data.images.length > 0) {
                const imageData = data.images.map((img, index) => ({
                    productId: product.id,
                    key: img.key,
                    isPrimary: img.isPrimary ?? index === 0,
                    sortOrder: img.sortOrder ?? index,
                }));

                if (imageData.some(img => img.isPrimary)) {
                    await this.databaseService.productImage.createMany({
                        data: imageData,
                    });
                } else {
                    imageData[0].isPrimary = true;
                    await this.databaseService.productImage.createMany({
                        data: imageData,
                    });
                }
            }

            const full = await this.databaseService.product.findUnique({
                where: { id: product.id },
                include: adminInclude,
            });

            this.logger.info({ productId: product.id }, 'Product created');
            return this.mapToAdminDto(full!);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Failed to create product: ${error.message}`);
            throw new HttpException(
                'product.error.createProductFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findAll(options?: {
        page?: number;
        limit?: number;
        categoryId?: string;
        categorySlug?: string;
        isActive?: boolean;
        isFeatured?: boolean;
    }): Promise<ApiPaginatedDataDto<ProductListResponseDto>> {
        try {
            const where = this.buildListWhere({
                categoryId: options?.categoryId,
                categorySlug: options?.categorySlug,
                isActive: options?.isActive,
                isFeatured: options?.isFeatured,
            });

            const orderBy = this.listOrderBy();

            type ListPayload = Prisma.ProductGetPayload<{
                include: typeof listInclude;
            }>;

            const result = await this.paginationService.paginate<ListPayload>(
                this.databaseService.product,
                {
                    page: options?.page ?? 1,
                    limit: options?.limit ?? 10,
                },
                {
                    where,
                    include: listInclude,
                    orderBy: orderBy as OrderByInput[],
                }
            );

            return {
                ...result,
                items: result.items.map(p => this.mapToListDto(p)),
            };
        } catch (error) {
            this.logger.error(`Failed to list products: ${error.message}`);
            throw new HttpException(
                'product.error.listProductsFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async search(
        query: ProductSearchDto
    ): Promise<ApiPaginatedDataDto<ProductListResponseDto>> {
        try {
            const where = this.buildListWhere({
                categoryId: query.categoryId,
                categorySlug: query.categorySlug,
                isActive: query.isActive,
                isFeatured: query.isFeatured,
            });

            if (query.minPrice !== undefined || query.maxPrice !== undefined) {
                where.price = {};
                if (query.minPrice !== undefined) {
                    where.price.gte = query.minPrice.toString();
                }
                if (query.maxPrice !== undefined) {
                    where.price.lte = query.maxPrice.toString();
                }
            }

            if (query.searchQuery) {
                where.OR = [
                    {
                        name: {
                            contains: query.searchQuery,
                            mode: 'insensitive',
                        },
                    },
                    {
                        description: {
                            contains: query.searchQuery,
                            mode: 'insensitive',
                        },
                    },
                    {
                        slug: {
                            contains: query.searchQuery,
                            mode: 'insensitive',
                        },
                    },
                ];
            }

            let orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
            if (query.sortBy) {
                const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';
                orderBy.push({
                    [query.sortBy]: sortOrder,
                } as Prisma.ProductOrderByWithRelationInput);
            } else {
                orderBy = this.listOrderBy({
                });
            }

            type ListPayload = Prisma.ProductGetPayload<{
                include: typeof listInclude;
            }>;

            const result = await this.paginationService.paginate<ListPayload>(
                this.databaseService.product,
                {
                    page: query.page ?? 1,
                    limit: query.limit ?? 10,
                },
                {
                    where,
                    include: listInclude,
                    orderBy: orderBy as OrderByInput[],
                }
            );

            return {
                ...result,
                items: result.items.map(p => this.mapToListDto(p)),
            };
        } catch (error) {
            this.logger.error(`Failed to search products: ${error.message}`);
            throw new HttpException(
                'product.error.searchProductsFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findOne(id: string): Promise<ProductResponseDto> {
        try {
            const product = await this.databaseService.product.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
                include: adminInclude,
            });

            if (!product) {
                throw new HttpException(
                    'product.error.productNotFound',
                    HttpStatus.NOT_FOUND
                );
            }

            return this.mapToAdminDto(product);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Failed to find product: ${error.message}`);
            throw new HttpException(
                'product.error.findProductFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findBySlug(slug: string): Promise<ProductDetailResponseDto> {
        try {
            const product = await this.databaseService.product.findFirst({
                where: {
                    slug,
                    deletedAt: null,
                },
                include: detailInclude,
            });

            if (!product) {
                throw new HttpException(
                    'product.error.productNotFound',
                    HttpStatus.NOT_FOUND
                );
            }

            return this.mapToDetailDto(product);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(
                `Failed to find product by slug: ${error.message}`
            );
            throw new HttpException(
                'product.error.findProductFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async syncVariants(
        productId: string,
        variants: ProductUpdateDto['variants']
    ): Promise<void> {
        if (!variants) {
            return;
        }

        const existing = await this.databaseService.productVariant.findMany({
            where: { productId, deletedAt: null },
        });

        const incomingWithId = new Set(
            variants.filter(v => v.id).map(v => v.id as string)
        );

        for (const row of existing) {
            if (!incomingWithId.has(row.id)) {
                await this.databaseService.productVariant.update({
                    where: { id: row.id },
                    data: { deletedAt: new Date() },
                });
            }
        }

        for (const v of variants) {
            if (v.id) {
                const updated =
                    await this.databaseService.productVariant.updateMany({
                        where: { id: v.id, productId },
                        data: {
                            label: v.label,
                            price: v.price,
                            currency: v.currency ?? 'USD',
                            isActive: v.isActive ?? true,
                            sortOrder: v.sortOrder ?? 0,
                        },
                    });
                if (updated.count === 0) {
                    throw new HttpException(
                        'product.error.variantNotFound',
                        HttpStatus.NOT_FOUND
                    );
                }
            } else {
                await this.databaseService.productVariant.create({
                    data: {
                        productId,
                        label: v.label,
                        price: v.price,
                        currency: v.currency ?? 'USD',
                        isActive: v.isActive ?? true,
                        sortOrder: v.sortOrder ?? 0,
                    },
                });
            }
        }
    }

    async update(
        id: string,
        data: ProductUpdateDto
    ): Promise<ProductResponseDto> {
        try {
            await this.findOne(id);

            if (data.categoryId) {
                const category =
                    await this.databaseService.productCategory.findFirst({
                        where: {
                            id: data.categoryId,
                            deletedAt: null,
                        },
                    });

                if (!category) {
                    throw new HttpException(
                        'product.error.categoryNotFound',
                        HttpStatus.NOT_FOUND
                    );
                }
            }

            let slug = data.slug;
            if (data.name && !data.slug) {
                slug = await this.ensureUniqueSlug(generateSlug(data.name), id);
            } else if (data.slug) {
                slug = await this.ensureUniqueSlug(generateSlug(data.slug), id);
            }

            const { variants, ...rest } =
                data as ProductUpdateDto & Record<string, unknown>;

            const updateData: Prisma.ProductUpdateInput = {};

            const assignScalar = <K extends keyof Prisma.ProductUpdateInput>(
                key: K,
                value: Prisma.ProductUpdateInput[K]
            ) => {
                if (value !== undefined) {
                    updateData[key] = value;
                }
            };

            assignScalar('name', rest.name);
            assignScalar('description', rest.description);
            assignScalar('price', rest.price);
            assignScalar('currency', rest.currency);
            assignScalar('isActive', rest.isActive);
            assignScalar('isFeatured', rest.isFeatured);
            assignScalar('sortOrder', rest.sortOrder);
            assignScalar('features', rest.features as Prisma.JsonValue);
            assignScalar('included', rest.included as Prisma.JsonValue);
            assignScalar('sessionMeta', rest.sessionMeta as Prisma.JsonValue);
            assignScalar('howItWorks', rest.howItWorks as Prisma.JsonValue);

            if (slug) {
                updateData.slug = slug;
            }

            if (rest.categoryId !== undefined) {
                updateData.category = {
                    connect: { id: rest.categoryId },
                };
            }

            await this.databaseService.$transaction([
                this.databaseService.product.update({
                    where: { id },
                    data: updateData,
                }),
            ]);

            await this.syncVariants(id, variants);

            const product = await this.databaseService.product.findUnique({
                where: { id },
                include: adminInclude,
            });

            this.logger.info({ productId: id }, 'Product updated');
            return this.mapToAdminDto(product!);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Failed to update product: ${error.message}`);
            throw new HttpException(
                'product.error.updateProductFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async delete(id: string): Promise<ApiGenericResponseDto> {
        try {
            await this.findOne(id);

            const orderItemCount = await this.databaseService.orderItem.count({
                where: {
                    productId: id,
                },
            });

            if (orderItemCount > 0) {
                throw new HttpException(
                    'product.error.productHasOrders',
                    HttpStatus.BAD_REQUEST
                );
            }

            await this.databaseService.$transaction([
                this.databaseService.product.update({
                    where: { id },
                    data: { deletedAt: new Date() },
                }),
                this.databaseService.productImage.updateMany({
                    where: { productId: id },
                    data: { deletedAt: new Date() },
                }),
            ]);

            this.logger.info({ productId: id }, 'Product deleted');
            return {
                success: true,
                message: 'product.success.productDeleted',
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Failed to delete product: ${error.message}`);
            throw new HttpException(
                'product.error.deleteProductFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async toggleActive(id: string): Promise<ProductResponseDto> {
        try {
            const product = await this.findOne(id);

            const updated = await this.databaseService.product.update({
                where: { id },
                data: {
                    isActive: !product.isActive,
                },
                include: adminInclude,
            });

            this.logger.info(
                { productId: id, isActive: updated.isActive },
                'Product active status toggled'
            );
            return this.mapToAdminDto(updated);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(
                `Failed to toggle product active status: ${error.message}`
            );
            throw new HttpException(
                'product.error.toggleProductActiveFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async toggleFeatured(id: string): Promise<ProductResponseDto> {
        try {
            const product = await this.findOne(id);

            const updated = await this.databaseService.product.update({
                where: { id },
                data: {
                    isFeatured: !product.isFeatured,
                },
                include: adminInclude,
            });

            this.logger.info(
                { productId: id, isFeatured: updated.isFeatured },
                'Product featured status toggled'
            );
            return this.mapToAdminDto(updated);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(
                `Failed to toggle product featured status: ${error.message}`
            );
            throw new HttpException(
                'product.error.toggleProductFeaturedFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async addImage(
        productId: string,
        imageKey: string,
        isPrimary: boolean = false
    ): Promise<ProductResponseDto> {
        try {
            await this.findOne(productId);

            if (isPrimary) {
                await this.databaseService.productImage.updateMany({
                    where: {
                        productId,
                        isPrimary: true,
                        deletedAt: null,
                    },
                    data: { isPrimary: false },
                });
            }

            const maxSortOrder =
                await this.databaseService.productImage.findFirst({
                    where: {
                        productId,
                        deletedAt: null,
                    },
                    orderBy: { sortOrder: 'desc' },
                    select: { sortOrder: true },
                });

            const sortOrder = maxSortOrder ? maxSortOrder.sortOrder + 1 : 0;

            await this.databaseService.productImage.create({
                data: {
                    productId,
                    key: imageKey,
                    isPrimary,
                    sortOrder,
                },
            });

            return this.findOne(productId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Failed to add image: ${error.message}`);
            throw new HttpException(
                'product.error.addImageFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async removeImage(
        productId: string,
        imageId: string
    ): Promise<ProductResponseDto> {
        try {
            await this.findOne(productId);

            const image = await this.databaseService.productImage.findFirst({
                where: {
                    id: imageId,
                    productId,
                    deletedAt: null,
                },
            });

            if (!image) {
                throw new HttpException(
                    'product.error.imageNotFound',
                    HttpStatus.NOT_FOUND
                );
            }

            await this.databaseService.productImage.update({
                where: { id: imageId },
                data: { deletedAt: new Date() },
            });

            if (image.isPrimary) {
                const nextImage =
                    await this.databaseService.productImage.findFirst({
                        where: {
                            productId,
                            deletedAt: null,
                        },
                        orderBy: { sortOrder: 'asc' },
                    });

                if (nextImage) {
                    await this.databaseService.productImage.update({
                        where: { id: nextImage.id },
                        data: { isPrimary: true },
                    });
                }
            }

            return this.findOne(productId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Failed to remove image: ${error.message}`);
            throw new HttpException(
                'product.error.removeImageFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async setPrimaryImage(
        productId: string,
        imageId: string
    ): Promise<ProductResponseDto> {
        try {
            await this.findOne(productId);

            const image = await this.databaseService.productImage.findFirst({
                where: {
                    id: imageId,
                    productId,
                    deletedAt: null,
                },
            });

            if (!image) {
                throw new HttpException(
                    'product.error.imageNotFound',
                    HttpStatus.NOT_FOUND
                );
            }

            await this.databaseService.productImage.updateMany({
                where: {
                    productId,
                    isPrimary: true,
                    deletedAt: null,
                },
                data: { isPrimary: false },
            });

            await this.databaseService.productImage.update({
                where: { id: imageId },
                data: { isPrimary: true },
            });

            return this.findOne(productId);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`Failed to set primary image: ${error.message}`);
            throw new HttpException(
                'product.error.setPrimaryImageFailed',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async addVariant(
        productId: string,
        dto: AdminProductVariantCreateDto
    ): Promise<ProductResponseDto> {
        await this.findOne(productId);
        await this.databaseService.productVariant.create({
            data: {
                productId,
                label: dto.label,
                price: dto.price,
                currency: dto.currency ?? 'USD',
                isActive: dto.isActive ?? true,
                sortOrder: dto.sortOrder ?? 0,
            },
        });
        return this.findOne(productId);
    }

    async updateVariant(
        productId: string,
        variantId: string,
        dto: AdminProductVariantUpdateDto
    ): Promise<ProductResponseDto> {
        await this.findOne(productId);
        const v = await this.databaseService.productVariant.findFirst({
            where: { id: variantId, productId, deletedAt: null },
        });
        if (!v) {
            throw new HttpException(
                'product.error.variantNotFound',
                HttpStatus.NOT_FOUND
            );
        }
        await this.databaseService.productVariant.update({
            where: { id: variantId },
            data: {
                ...(dto.label !== undefined && { label: dto.label }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.currency !== undefined && { currency: dto.currency }),
                ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                ...(dto.sortOrder !== undefined && {
                    sortOrder: dto.sortOrder,
                }),
            },
        });
        return this.findOne(productId);
    }

    async deleteVariant(
        productId: string,
        variantId: string
    ): Promise<ProductResponseDto> {
        await this.findOne(productId);
        const v = await this.databaseService.productVariant.findFirst({
            where: { id: variantId, productId, deletedAt: null },
        });
        if (!v) {
            throw new HttpException(
                'product.error.variantNotFound',
                HttpStatus.NOT_FOUND
            );
        }
        await this.databaseService.productVariant.update({
            where: { id: variantId },
            data: { deletedAt: new Date() },
        });
        return this.findOne(productId);
    }

}

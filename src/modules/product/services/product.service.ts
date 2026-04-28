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
import { generateSlug } from '../utils/product.util';

const listInclude = { category: true } satisfies Prisma.ProductInclude;
const detailInclude = { category: true } satisfies Prisma.ProductInclude;
const adminInclude = { category: true } satisfies Prisma.ProductInclude;

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
        return {
            ...product,
        } as ProductListResponseDto;
    }

    private mapToDetailDto(
        product: Prisma.ProductGetPayload<{ include: typeof detailInclude }>
    ): ProductDetailResponseDto {
        return this.mapToListDto(product) as ProductDetailResponseDto;
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
        }
    ): Prisma.ProductWhereInput {
        const where: Prisma.ProductWhereInput = {};

        if (options.categoryId) {
            where.categoryId = options.categoryId;
        }

        if (options.categorySlug) {
            where.category = { slug: options.categorySlug };
        }

        if (options.isActive !== undefined) {
            where.isActive = options.isActive;
        }

        return where;
    }

    private listOrderBy(): Prisma.ProductOrderByWithRelationInput[] {
        return [{ createdAt: 'desc' }];
    }

    async create(data: ProductCreateDto): Promise<ProductResponseDto> {
        try {
            const category =
                await this.databaseService.productCategory.findFirst({
                    where: {
                        id: data.categoryId,
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
                    categoryId: data.categoryId,
                    features: data.features as Prisma.JsonValue | undefined,
                    included: data.included as Prisma.JsonValue | undefined,
                    sessionMeta: data.sessionMeta as Prisma.JsonValue | undefined,
                    howItWorks: data.howItWorks as Prisma.JsonValue | undefined,
                },
                include: adminInclude,
            });

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
    }): Promise<ApiPaginatedDataDto<ProductListResponseDto>> {
        try {
            const where = this.buildListWhere({
                categoryId: options?.categoryId,
                categorySlug: options?.categorySlug,
                isActive: options?.isActive,
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
                orderBy = this.listOrderBy();
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
                where: { id },
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
                where: { slug },
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

            const rest = data as ProductUpdateDto & Record<string, unknown>;

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

            await this.databaseService.product.delete({ where: { id } });

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

}

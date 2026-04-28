import { ApiPaginatedDataDto } from 'src/common/response/dtos/response.paginated.dto';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import { ProductCreateDto } from '../dtos/request/product.create.request';
import { ProductUpdateDto } from '../dtos/request/product.update.request';
import { ProductSearchDto } from '../dtos/request/product.search.request';
import {
    ProductResponseDto,
    ProductListResponseDto,
    ProductDetailResponseDto,
} from '../dtos/response/product.response';

export interface IProductService {
    create(data: ProductCreateDto): Promise<ProductResponseDto>;
    findAll(options?: {
        page?: number;
        limit?: number;
        categoryId?: string;
        categorySlug?: string;
        isActive?: boolean;
    }): Promise<ApiPaginatedDataDto<ProductListResponseDto>>;
    search(
        query: ProductSearchDto
    ): Promise<ApiPaginatedDataDto<ProductListResponseDto>>;
    findOne(id: string): Promise<ProductResponseDto>;
    findBySlug(slug: string): Promise<ProductDetailResponseDto>;
    update(id: string, data: ProductUpdateDto): Promise<ProductResponseDto>;
    delete(id: string): Promise<ApiGenericResponseDto>;
    toggleActive(id: string): Promise<ProductResponseDto>;
}

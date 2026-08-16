// ============================================================================
// dto.ts — shared Data Transfer Object helpers.
// ----------------------------------------------------------------------------
// DTOs are the typed boundary between HTTP and our service layer. Every
// controller accepts/returns a DTO, never a raw Prisma model. This keeps
// the API contract explicit and validation-centralized.
//
// We use class-validator decorators so Nest's ValidationPipe enforces them.
// Docs:
//   - NestJS ValidationPipe: https://docs.nestjs.com/techniques/validation
//   - class-validator: https://github.com/typestack/class-validator
// ==========================================================================
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsBoolean, IsArray } from "class-validator";
import { Type } from "class-transformer";

// ----------------------------------------------------------------------------
// Pagination — every list endpoint accepts these query params.
// ----------------------------------------------------------------------------
export class PaginationDto {
  // Page number, 1-indexed. Min 1 prevents negative offsets.
  // @Type(() => Number) transforms the string query param to a number BEFORE
  // validation runs. Required because query strings are always strings.
  // Docs: https://github.com/typestack/class-transformer#basic-usage
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  // Page size. Capped implicitly by the service to avoid huge responses.
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number = 20;
}

// ----------------------------------------------------------------------------
// Generic ID param — used by /:id routes.
// ----------------------------------------------------------------------------
export class IdParamDto {
  @IsString()
  @IsNotEmpty()
  id!: string;
}

// ----------------------------------------------------------------------------
// Article DTOs
// ----------------------------------------------------------------------------
export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  // Tags arrive as a single comma-separated string (SQLite has no array type).
  @IsString()
  @IsOptional()
  tags?: string;

  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;
}

export class UpdateArticleDto extends CreateArticleDto {}

// ----------------------------------------------------------------------------
// Forum DTOs
// ----------------------------------------------------------------------------
export class CreateThreadDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsString()
  @IsOptional()
  category?: string;
}

export class CreateReplyDto {
  @IsString()
  @IsNotEmpty()
  body!: string;
}

// ----------------------------------------------------------------------------
// Auth DTOs
// ----------------------------------------------------------------------------
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsOptional()
  name?: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

// ----------------------------------------------------------------------------
// Shop DTOs (placeholder — full set added when shop is implemented)
// ----------------------------------------------------------------------------
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

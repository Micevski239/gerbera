// Database types - auto-generated from schema

// Language type for bilingual support
export type Language = 'mk' | 'en'

// Product status type
export type ProductStatus = 'draft' | 'published' | 'sold'

// Homepage Section Types
export type HomepageSectionType = 'product_grid' | 'category_grid' | 'banner' | 'text_image' | 'trust_badges' | 'gallery'
export type LayoutStyle = 'grid-2' | 'grid-3' | 'grid-4' | 'grid-5' | 'grid-6' | 'carousel' | 'masonry'
export type ItemShape = 'square' | 'circle' | 'rectangle' | 'card'
export type BackgroundStyle = 'solid' | 'gradient' | 'image'
export type PaddingSize = 'small' | 'medium' | 'large'
export type SectionShape = 'circle' | 'square'

// Product filter types for product grid sections
export type ProductFilterType = 'best_seller' | 'on_sale' | 'new_arrival' | 'featured' | `category:${string}`

// Config types for different section types
export interface ProductGridConfig {
  filter?: ProductFilterType
  limit?: number
  show_price?: boolean
  show_badge?: boolean
  show_add_to_cart?: boolean
  show_inquiry_button?: boolean
}

export interface CategoryGridConfig {
  category_type?: 'occasion' | 'flower_type' | 'custom'
}

export interface BannerConfig {
  image_path?: string
  link?: string
  height?: 'small' | 'medium' | 'large'
  text_position?: 'left' | 'center' | 'right'
  overlay_opacity?: number
  cta_text_mk?: string
  cta_text_en?: string
  cta_link?: string
}

export interface TextImageConfig {
  image_position?: 'left' | 'right'
  image_path?: string
  content_mk?: string
  content_en?: string
  cta_text_mk?: string
  cta_text_en?: string
  cta_link?: string
}

export interface GalleryConfig {
  columns?: number
}

export interface TrustBadgesConfig {
  icon_size?: 'small' | 'medium' | 'large'
}

export type HomepageSectionConfig =
  | ProductGridConfig
  | CategoryGridConfig
  | BannerConfig
  | TextImageConfig
  | GalleryConfig
  | TrustBadgesConfig
  | Record<string, unknown>

type BaseTable = {
  Row: Record<string, unknown>
  Insert: Record<string, unknown>
  Update: Record<string, unknown>
}

type BaseView = {
  Row: Record<string, unknown>
}

type SupabaseTable<Table extends BaseTable> = Table & { Relationships: never[] }
type SupabaseView<View extends BaseView> = View & { Relationships: never[] }

export type Database = {
  public: {
    Tables: {
      categories: SupabaseTable<{
        Row: {
          id: string
          name: string
          name_mk: string
          name_en: string | null
          slug: string
          description: string | null
          description_mk: string | null
          description_en: string | null
          category_image_path: string | null
          display_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_mk: string
          name_en?: string | null
          slug: string
          description?: string | null
          description_mk?: string | null
          description_en?: string | null
          category_image_path?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_mk?: string
          name_en?: string | null
          slug?: string
          description?: string | null
          description_mk?: string | null
          description_en?: string | null
          category_image_path?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
      products: SupabaseTable<{
        Row: {
          id: string
          category_id: string
          name: string
          name_mk: string
          name_en: string | null
          description: string | null
          description_mk: string | null
          description_en: string | null
          image_url: string
          price_text: string | null
          price: number | null
          sale_price: number | null
          status: ProductStatus
          is_on_sale: boolean
          is_best_seller: boolean
          display_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          name_mk: string
          name_en?: string | null
          description?: string | null
          description_mk?: string | null
          description_en?: string | null
          image_url: string
          price_text?: string | null
          price?: number | null
          sale_price?: number | null
          status?: ProductStatus
          is_on_sale?: boolean
          is_best_seller?: boolean
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          name_mk?: string
          name_en?: string
          description?: string | null
          description_mk?: string | null
          description_en?: string | null
          image_url?: string
          price_text?: string | null
          price?: number | null
          sale_price?: number | null
          status?: ProductStatus
          is_on_sale?: boolean
          is_best_seller?: boolean
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
      product_images: SupabaseTable<{
        Row: {
          id: string
          product_id: string
          storage_path: string
          display_order: number
          alt_text: string | null
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          storage_path: string
          display_order?: number
          alt_text?: string | null
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          storage_path?: string
          display_order?: number
          alt_text?: string | null
          is_primary?: boolean
          created_at?: string
        }
      }>
      product_occasions: SupabaseTable<{
        Row: {
          product_id: string
          occasion_id: string
          created_at: string
        }
        Insert: {
          product_id: string
          occasion_id: string
          created_at?: string
        }
        Update: {
          product_id?: string
          occasion_id?: string
          created_at?: string
        }
      }>
      homepage_hero_slides: SupabaseTable<{
        Row: {
          id: string
          title_mk: string
          title_en: string | null
          subtitle_mk: string | null
          subtitle_en: string | null
          button_text_mk: string | null
          button_text_en: string | null
          button_link: string | null
          image_path: string
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title_mk: string
          title_en?: string | null
          subtitle_mk?: string | null
          subtitle_en?: string | null
          button_text_mk?: string | null
          button_text_en?: string | null
          button_link?: string | null
          image_path: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title_mk?: string
          title_en?: string
          subtitle_mk?: string | null
          subtitle_en?: string | null
          button_text_mk?: string | null
          button_text_en?: string | null
          button_link?: string | null
          image_path?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
      homepage_grid_images: SupabaseTable<{
        Row: {
          id: string
          image_path: string
          alt_text_mk: string | null
          alt_text_en: string | null
          link: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          image_path: string
          alt_text_mk?: string | null
          alt_text_en?: string | null
          link?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          image_path?: string
          alt_text_mk?: string | null
          alt_text_en?: string | null
          link?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
      welcome_tiles: SupabaseTable<{
        Row: {
          id: string
          title_mk: string
          title_en: string | null
          subtitle_mk: string | null
          subtitle_en: string | null
          image_path: string
          link: string
          background_color: string
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title_mk: string
          title_en?: string | null
          subtitle_mk?: string | null
          subtitle_en?: string | null
          image_path: string
          link: string
          background_color?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title_mk?: string
          title_en?: string
          subtitle_mk?: string | null
          subtitle_en?: string | null
          image_path?: string
          link?: string
          background_color?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
      announcement_lines: SupabaseTable<{
        Row: {
          id: string
          text_mk: string
          text_en: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          text_mk: string
          text_en?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          text_mk?: string
          text_en?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
      sections: SupabaseTable<{
        Row: {
          id: string
          title_mk: string
          title_en: string | null
          shape: SectionShape
          category_id: string
          product_limit: number
          order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title_mk: string
          title_en?: string | null
          shape?: SectionShape
          category_id: string
          product_limit?: number
          order: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title_mk?: string
          title_en?: string
          shape?: SectionShape
          category_id?: string
          product_limit?: number
          order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
      hero_tiles: SupabaseTable<{
        Row: {
          id: string
          slot: string
          label_mk: string
          label_en: string | null
          tagline_mk: string
          tagline_en: string | null
          image_url: string
          url: string
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slot: string
          label_mk: string
          label_en?: string | null
          tagline_mk?: string
          tagline_en?: string | null
          image_url: string
          url?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slot?: string
          label_mk?: string
          label_en?: string
          tagline_mk?: string
          tagline_en?: string
          image_url?: string
          url?: string
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }>
      about_stats: SupabaseTable<{
        Row: {
          id: string
          value: string
          label_mk: string
          label_en: string | null
          icon: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          value: string
          label_mk: string
          label_en?: string | null
          icon?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          value?: string
          label_mk?: string
          label_en?: string | null
          icon?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
      about_content: SupabaseTable<{
        Row: {
          id: string
          section_key: string
          title_mk: string | null
          title_en: string | null
          content_mk: string
          content_en: string | null
          author_mk: string | null
          author_en: string | null
          image_path: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_key: string
          title_mk?: string | null
          title_en?: string | null
          content_mk: string
          content_en?: string | null
          author_mk?: string | null
          author_en?: string | null
          image_path?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_key?: string
          title_mk?: string | null
          title_en?: string | null
          content_mk?: string
          content_en?: string
          author_mk?: string | null
          author_en?: string | null
          image_path?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
      about_gallery: SupabaseTable<{
        Row: {
          id: string
          image_path: string
          caption_mk: string | null
          caption_en: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          image_path: string
          caption_mk?: string | null
          caption_en?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          image_path?: string
          caption_mk?: string | null
          caption_en?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
      testimonials: SupabaseTable<{
        Row: {
          id: string
          customer_name: string
          customer_location_mk: string | null
          customer_location_en: string | null
          content_mk: string
          content_en: string | null
          rating: number
          avatar_path: string | null
          is_featured: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_name: string
          customer_location_mk?: string | null
          customer_location_en?: string | null
          content_mk: string
          content_en?: string | null
          rating?: number
          avatar_path?: string | null
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_name?: string
          customer_location_mk?: string | null
          customer_location_en?: string | null
          content_mk?: string
          content_en?: string
          rating?: number
          avatar_path?: string | null
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
      homepage_sections: SupabaseTable<{
        Row: {
          id: string
          section_type: HomepageSectionType
          title_mk: string | null
          title_en: string | null
          subtitle_mk: string | null
          subtitle_en: string | null
          layout_style: LayoutStyle
          item_shape: ItemShape
          config: HomepageSectionConfig
          background_color: string
          background_style: BackgroundStyle
          padding_size: PaddingSize
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_type: HomepageSectionType
          title_mk?: string | null
          title_en?: string | null
          subtitle_mk?: string | null
          subtitle_en?: string | null
          layout_style?: LayoutStyle
          item_shape?: ItemShape
          config?: HomepageSectionConfig
          background_color?: string
          background_style?: BackgroundStyle
          padding_size?: PaddingSize
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_type?: HomepageSectionType
          title_mk?: string | null
          title_en?: string | null
          subtitle_mk?: string | null
          subtitle_en?: string | null
          layout_style?: LayoutStyle
          item_shape?: ItemShape
          config?: HomepageSectionConfig
          background_color?: string
          background_style?: BackgroundStyle
          padding_size?: PaddingSize
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
      homepage_section_items: SupabaseTable<{
        Row: {
          id: string
          section_id: string
          title_mk: string | null
          title_en: string | null
          subtitle_mk: string | null
          subtitle_en: string | null
          image_path: string | null
          link: string | null
          icon: string | null
          background_color: string | null
          text_color: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          title_mk?: string | null
          title_en?: string | null
          subtitle_mk?: string | null
          subtitle_en?: string | null
          image_path?: string | null
          link?: string | null
          icon?: string | null
          background_color?: string | null
          text_color?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          title_mk?: string | null
          title_en?: string | null
          subtitle_mk?: string | null
          subtitle_en?: string | null
          image_path?: string | null
          link?: string | null
          icon?: string | null
          background_color?: string | null
          text_color?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
      occasions: SupabaseTable<{
        Row: {
          id: string
          name: string
          name_mk: string
          name_en: string | null
          slug: string
          icon: string | null
          occasion_image_path: string | null
          description_mk: string | null
          description_en: string | null
          display_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_mk: string
          name_en?: string | null
          slug: string
          icon?: string | null
          occasion_image_path?: string | null
          description_mk?: string | null
          description_en?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_mk?: string
          name_en?: string
          slug?: string
          icon?: string | null
          occasion_image_path?: string | null
          description_mk?: string | null
          description_en?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
      site_stats: SupabaseTable<{
        Row: {
          id: string
          label_mk: string
          label_en: string | null
          value: string
          suffix_mk: string | null
          suffix_en: string | null
          icon: string | null
          display_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          label_mk: string
          label_en?: string | null
          value: string
          suffix_mk?: string | null
          suffix_en?: string | null
          icon?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          label_mk?: string
          label_en?: string
          value?: string
          suffix_mk?: string | null
          suffix_en?: string | null
          icon?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }>
    }
    Views: {
      products_with_details: SupabaseView<{
        Row: {
          id: string
          name: string
          name_mk: string
          name_en: string | null
          description: string | null
          description_mk: string | null
          description_en: string | null
          price_text: string | null
          price: number | null
          sale_price: number | null
          status: ProductStatus
          is_on_sale: boolean
          is_best_seller: boolean
          display_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
          category_id: string
          category_name: string
          category_name_mk: string
          category_name_en: string | null
          category_slug: string
          primary_image_path: string | null
        }
      }>
      homepage_sections_with_items: SupabaseView<{
        Row: {
          id: string
          section_type: HomepageSectionType
          title_mk: string | null
          title_en: string | null
          subtitle_mk: string | null
          subtitle_en: string | null
          layout_style: LayoutStyle
          item_shape: ItemShape
          config: HomepageSectionConfig
          background_color: string
          background_style: BackgroundStyle
          padding_size: PaddingSize
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
          items: HomepageSectionItem[]
        }
      }>
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type ProductOccasion = Database['public']['Tables']['product_occasions']['Row']
export type ProductWithDetails = Database['public']['Views']['products_with_details']['Row']
export type HeroSlide = Database['public']['Tables']['homepage_hero_slides']['Row']
export type GridImage = Database['public']['Tables']['homepage_grid_images']['Row']
export type WelcomeTile = Database['public']['Tables']['welcome_tiles']['Row']
export type AnnouncementLine = Database['public']['Tables']['announcement_lines']['Row']
export type AboutStat = Database['public']['Tables']['about_stats']['Row']
export type AboutContent = Database['public']['Tables']['about_content']['Row']
export type AboutGalleryImage = Database['public']['Tables']['about_gallery']['Row']
export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type HomepageSection = Database['public']['Tables']['homepage_sections']['Row']
export type Section = Database['public']['Tables']['sections']['Row']
export type SectionInsert = Database['public']['Tables']['sections']['Insert']
export type SectionUpdate = Database['public']['Tables']['sections']['Update']
export type HeroTile = Database['public']['Tables']['hero_tiles']['Row']
export type HomepageSectionItem = Database['public']['Tables']['homepage_section_items']['Row']
export type HomepageSectionWithItems = Database['public']['Views']['homepage_sections_with_items']['Row']
export type Occasion = Database['public']['Tables']['occasions']['Row']
export type SiteStat = Database['public']['Tables']['site_stats']['Row']

// Insert types
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductImageInsert = Database['public']['Tables']['product_images']['Insert']
export type ProductOccasionInsert = Database['public']['Tables']['product_occasions']['Insert']
export type HeroSlideInsert = Database['public']['Tables']['homepage_hero_slides']['Insert']
export type GridImageInsert = Database['public']['Tables']['homepage_grid_images']['Insert']
export type WelcomeTileInsert = Database['public']['Tables']['welcome_tiles']['Insert']
export type AnnouncementLineInsert = Database['public']['Tables']['announcement_lines']['Insert']
export type AboutStatInsert = Database['public']['Tables']['about_stats']['Insert']
export type AboutContentInsert = Database['public']['Tables']['about_content']['Insert']
export type AboutGalleryImageInsert = Database['public']['Tables']['about_gallery']['Insert']
export type TestimonialInsert = Database['public']['Tables']['testimonials']['Insert']
export type HeroTileInsert = Database['public']['Tables']['hero_tiles']['Insert']
export type HomepageSectionInsert = Database['public']['Tables']['homepage_sections']['Insert']
export type HomepageSectionItemInsert = Database['public']['Tables']['homepage_section_items']['Insert']
export type OccasionInsert = Database['public']['Tables']['occasions']['Insert']
export type SiteStatInsert = Database['public']['Tables']['site_stats']['Insert']

// Update types
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']
export type ProductUpdate = Database['public']['Tables']['products']['Update']
export type ProductImageUpdate = Database['public']['Tables']['product_images']['Update']
export type ProductOccasionUpdate = Database['public']['Tables']['product_occasions']['Update']
export type HeroSlideUpdate = Database['public']['Tables']['homepage_hero_slides']['Update']
export type GridImageUpdate = Database['public']['Tables']['homepage_grid_images']['Update']
export type WelcomeTileUpdate = Database['public']['Tables']['welcome_tiles']['Update']
export type AnnouncementLineUpdate = Database['public']['Tables']['announcement_lines']['Update']
export type AboutStatUpdate = Database['public']['Tables']['about_stats']['Update']
export type AboutContentUpdate = Database['public']['Tables']['about_content']['Update']
export type AboutGalleryImageUpdate = Database['public']['Tables']['about_gallery']['Update']
export type TestimonialUpdate = Database['public']['Tables']['testimonials']['Update']
export type HeroTileUpdate = Database['public']['Tables']['hero_tiles']['Update']
export type HomepageSectionUpdate = Database['public']['Tables']['homepage_sections']['Update']
export type HomepageSectionItemUpdate = Database['public']['Tables']['homepage_section_items']['Update']
export type OccasionUpdate = Database['public']['Tables']['occasions']['Update']
export type SiteStatUpdate = Database['public']['Tables']['site_stats']['Update']

// Helper type for getting localized content
export type LocalizedField<T extends string> = {
  [K in `${T}_mk`]: string
} & {
  [K in `${T}_en`]: string | null
}

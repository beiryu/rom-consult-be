import { Injectable } from '@nestjs/common';
import { Prisma, Product, ProductCategory } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { Command } from 'nestjs-command';
import { DatabaseService } from 'src/common/database/services/database.service';

type CategorySlug =
    | 'ecommerce'
    | 'crm'
    | 'seo'
    | 'analytics'
    | 'paid-media'
    | 'cloud-aws'
    | 'email-marketing'
    | 'ai-automation';

type ProductSlug =
    | 'store-architecture-review'
    | 'conversion-funnel-optimization'
    | 'payment-cart-diagnostics'
    | 'crm-pipeline-cleanup'
    | 'sales-workflow-automation'
    | 'customer-retention-playbook'
    | 'technical-seo-deep-audit'
    | 'content-gap-strategy'
    | 'local-seo-optimization'
    | 'ga4-tracking-reliability-audit'
    | 'executive-kpi-dashboard-setup'
    | 'attribution-insight-session'
    | 'google-ads-account-audit'
    | 'meta-ads-creative-testing-plan'
    | 'cross-channel-budget-reallocation'
    | 'aws-cost-optimization-sprint'
    | 'cloud-architecture-health-check'
    | 'serverless-migration-planning'
    | 'lifecycle-email-strategy-session'
    | 'klaviyo-automation-optimization'
    | 'deliverability-domain-setup'
    | 'ai-workflow-discovery-workshop'
    | 'prompt-agent-design-review'
    | 'internal-ai-assistant-rollout-plan';

type ProductSeedDef = {
    slug: ProductSlug;
    name: string;
    categorySlug: CategorySlug;
    description: string;
    features: string[];
};

const CATEGORY_SEEDS: Array<{
    slug: CategorySlug;
    name: string;
    icon: string;
}> = [
    { slug: 'ecommerce', name: 'E-commerce', icon: 'IconShoppingBag' },
    { slug: 'crm', name: 'CRM', icon: 'IconUsersGroup' },
    { slug: 'seo', name: 'SEO', icon: 'IconSearch' },
    { slug: 'analytics', name: 'Analytics', icon: 'IconChartBar' },
    { slug: 'paid-media', name: 'Paid Media', icon: 'IconSpeaker' },
    { slug: 'cloud-aws', name: 'AWS Cloud', icon: 'IconCloud' },
    { slug: 'email-marketing', name: 'Email Marketing', icon: 'IconMail' },
    { slug: 'ai-automation', name: 'AI Automation', icon: 'IconBrain' },
];

const DEFAULT_INCLUDED = [
    'Live 1-on-1 video consultation with screen sharing',
    'Personalized strategies tailored to your business',
    'Expert guidance from certified professionals',
    'Q&A session to address your specific questions',
    'Post-session documentation and action items',
    'Recording available upon request',
];

const DEFAULT_SESSION_META = [
    { id: 'live-video', label: 'Live Video Session' },
    { id: 'one-hour', label: '1 Hour' },
    { id: 'expert', label: 'Expert Consultant' },
];

const DEFAULT_HOW_IT_WORKS = [
    {
        id: 'book',
        title: 'Book Your Session',
        description:
            'Select your tier and complete payment to reserve your 1-hour slot.',
    },
    {
        id: 'confirm',
        title: 'Get Confirmation',
        description:
            'Receive your session confirmation and meeting details by email.',
    },
    {
        id: 'join',
        title: 'Join The Call',
        description:
            'Connect with your consultant at the scheduled time for the live session.',
    },
    {
        id: 'results',
        title: 'Get Results',
        description:
            'Leave with actionable recommendations tailored to your business goals.',
    },
];

const PRODUCT_DEFS: ProductSeedDef[] = [
    {
        slug: 'store-architecture-review',
        name: 'Store Architecture Review',
        categorySlug: 'ecommerce',
        description:
            'Work with a consultant to improve your store architecture review approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Checkout flow audit',
            'Catalog structure recommendations',
            'Performance improvement roadmap',
        ],
    },
    {
        slug: 'conversion-funnel-optimization',
        name: 'Conversion Funnel Optimization',
        categorySlug: 'ecommerce',
        description:
            'Work with a consultant to improve your conversion funnel optimization approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Session recording analysis',
            'A/B test hypothesis pack',
            'Conversion KPI dashboard setup',
        ],
    },
    {
        slug: 'payment-cart-diagnostics',
        name: 'Payment & Cart Diagnostics',
        categorySlug: 'ecommerce',
        description:
            'Work with a consultant to improve your payment & cart diagnostics approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Abandonment reason mapping',
            'Payment error investigation',
            'Priority fix list',
        ],
    },
    {
        slug: 'crm-pipeline-cleanup',
        name: 'CRM Pipeline Cleanup',
        categorySlug: 'crm',
        description:
            'Work with a consultant to improve your crm pipeline cleanup approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Stage redesign',
            'Lead scoring baseline',
            'Automation trigger cleanup',
        ],
    },
    {
        slug: 'sales-workflow-automation',
        name: 'Sales Workflow Automation',
        categorySlug: 'crm',
        description:
            'Work with a consultant to improve your sales workflow automation approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Automation blueprint',
            'Opportunity routing setup',
            'Follow-up sequence templates',
        ],
    },
    {
        slug: 'customer-retention-playbook',
        name: 'Customer Retention Playbook',
        categorySlug: 'crm',
        description:
            'Work with a consultant to improve your customer retention playbook approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Renewal risk signals',
            'Lifecycle email strategy',
            'Retention metrics reporting',
        ],
    },
    {
        slug: 'technical-seo-deep-audit',
        name: 'Technical SEO Deep Audit',
        categorySlug: 'seo',
        description:
            'Work with a consultant to improve your technical seo deep audit approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Crawlability and indexing checks',
            'Core Web Vitals diagnostics',
            'Fix backlog prioritization',
        ],
    },
    {
        slug: 'content-gap-strategy',
        name: 'Content Gap Strategy',
        categorySlug: 'seo',
        description:
            'Work with a consultant to improve your content gap strategy approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Keyword clustering',
            'Competitor coverage analysis',
            'Topic roadmap creation',
        ],
    },
    {
        slug: 'local-seo-optimization',
        name: 'Local SEO Optimization',
        categorySlug: 'seo',
        description:
            'Work with a consultant to improve your local seo optimization approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Profile health review',
            'Local citation improvement',
            'Location page recommendations',
        ],
    },
    {
        slug: 'ga4-tracking-reliability-audit',
        name: 'GA4 & Tracking Reliability Audit',
        categorySlug: 'analytics',
        description:
            'Work with a consultant to improve your ga4 & tracking reliability audit approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Event model validation',
            'Tag implementation review',
            'Data quality monitoring setup',
        ],
    },
    {
        slug: 'executive-kpi-dashboard-setup',
        name: 'Executive KPI Dashboard Setup',
        categorySlug: 'analytics',
        description:
            'Work with a consultant to improve your executive kpi dashboard setup approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Stakeholder metric mapping',
            'Dashboard architecture',
            'Automated weekly reporting',
        ],
    },
    {
        slug: 'attribution-insight-session',
        name: 'Attribution Insight Session',
        categorySlug: 'analytics',
        description:
            'Work with a consultant to improve your attribution insight session approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Channel contribution analysis',
            'Conversion path breakdown',
            'Budget allocation recommendations',
        ],
    },
    {
        slug: 'google-ads-account-audit',
        name: 'Google Ads Account Audit',
        categorySlug: 'paid-media',
        description:
            'Work with a consultant to improve your google ads account audit approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Campaign structure review',
            'Keyword intent alignment',
            'Budget waste reduction plan',
        ],
    },
    {
        slug: 'meta-ads-creative-testing-plan',
        name: 'Meta Ads Creative Testing Plan',
        categorySlug: 'paid-media',
        description:
            'Work with a consultant to improve your meta ads creative testing plan approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Audience segmentation map',
            'Creative test matrix',
            'Performance benchmark setup',
        ],
    },
    {
        slug: 'cross-channel-budget-reallocation',
        name: 'Cross-Channel Budget Reallocation',
        categorySlug: 'paid-media',
        description:
            'Work with a consultant to improve your cross-channel budget reallocation approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Channel efficiency analysis',
            'Scenario-based budget splits',
            '90-day optimization roadmap',
        ],
    },
    {
        slug: 'aws-cost-optimization-sprint',
        name: 'AWS Cost Optimization Sprint',
        categorySlug: 'cloud-aws',
        description:
            'Work with a consultant to improve your aws cost optimization sprint approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Resource rightsizing review',
            'Reserved savings recommendations',
            'Cost governance checklist',
        ],
    },
    {
        slug: 'cloud-architecture-health-check',
        name: 'Cloud Architecture Health Check',
        categorySlug: 'cloud-aws',
        description:
            'Work with a consultant to improve your cloud architecture health check approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Availability risk assessment',
            'Security baseline review',
            'Scalability improvement priorities',
        ],
    },
    {
        slug: 'serverless-migration-planning',
        name: 'Serverless Migration Planning',
        categorySlug: 'cloud-aws',
        description:
            'Work with a consultant to improve your serverless migration planning approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Workload suitability review',
            'Migration timeline draft',
            'Operational readiness checklist',
        ],
    },
    {
        slug: 'lifecycle-email-strategy-session',
        name: 'Lifecycle Email Strategy Session',
        categorySlug: 'email-marketing',
        description:
            'Work with a consultant to improve your lifecycle email strategy session approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Lifecycle stage mapping',
            'High-impact flow recommendations',
            'Content cadence blueprint',
        ],
    },
    {
        slug: 'klaviyo-automation-optimization',
        name: 'Klaviyo Automation Optimization',
        categorySlug: 'email-marketing',
        description:
            'Work with a consultant to improve your klaviyo automation optimization approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Flow logic cleanup',
            'Segmentation uplift opportunities',
            'Revenue tracking validation',
        ],
    },
    {
        slug: 'deliverability-domain-setup',
        name: 'Deliverability & Domain Setup',
        categorySlug: 'email-marketing',
        description:
            'Work with a consultant to improve your deliverability & domain setup approach. This session focuses on practical actions you can apply right away.',
        features: [
            'SPF, DKIM, DMARC checks',
            'Inbox placement diagnostics',
            'Sender reputation action plan',
        ],
    },
    {
        slug: 'ai-workflow-discovery-workshop',
        name: 'AI Workflow Discovery Workshop',
        categorySlug: 'ai-automation',
        description:
            'Work with a consultant to improve your ai workflow discovery workshop approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Use-case prioritization',
            'Tool stack recommendations',
            'Implementation quick wins',
        ],
    },
    {
        slug: 'prompt-agent-design-review',
        name: 'Prompt & Agent Design Review',
        categorySlug: 'ai-automation',
        description:
            'Work with a consultant to improve your prompt & agent design review approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Prompt quality audit',
            'Guardrail design suggestions',
            'Evaluation checklist setup',
        ],
    },
    {
        slug: 'internal-ai-assistant-rollout-plan',
        name: 'Internal AI Assistant Rollout Plan',
        categorySlug: 'ai-automation',
        description:
            'Work with a consultant to improve your internal ai assistant rollout plan approach. This session focuses on practical actions you can apply right away.',
        features: [
            'Rollout governance model',
            'Knowledge source integration',
            'Team adoption framework',
        ],
    },
];

@Injectable()
export class ProductsSeedService {
    constructor(
        private readonly logger: PinoLogger,
        private readonly databaseService: DatabaseService
    ) {
        this.logger.setContext(ProductsSeedService.name);
    }

    @Command({
        command: 'seed:products',
        describe: 'Seed product categories and products matching browse-services page',
    })
    async seed(): Promise<void> {
        this.logger.info('Starting product seeding...');

        try {
            const categories = await this.createCategories();
            this.logger.info(
                `Ensured ${Object.keys(categories).length} categories`
            );

            const products = await this.createProducts(categories);
            this.logger.info(`Ensured ${products.length} products`);

            this.logger.info('Product seeding completed successfully');
        } catch (error) {
            this.logger.error(`Error seeding products: ${error.message}`);
            throw error;
        }
    }

    private async createCategories(): Promise<
        Record<CategorySlug, ProductCategory>
    > {
        const map = {} as Record<CategorySlug, ProductCategory>;

        for (const row of CATEGORY_SEEDS) {
            const existing =
                await this.databaseService.productCategory.findUnique({
                    where: { slug: row.slug },
                });

            if (existing) {
                this.logger.info(`Category ${row.slug} already exists`);
                map[row.slug] = existing;
            } else {
                const created =
                    await this.databaseService.productCategory.create({
                        data: {
                            name: row.name,
                            slug: row.slug,
                            icon: row.icon,
                        },
                    });
                map[row.slug] = created;
                this.logger.info(`Created category: ${row.name}`);
            }
        }

        return map;
    }

    private async createProducts(
        categories: Record<CategorySlug, ProductCategory>
    ): Promise<Product[]> {
        const products: Product[] = [];

        for (const def of PRODUCT_DEFS) {
            const existing = await this.databaseService.product.findUnique({
                where: { slug: def.slug },
            });

            if (existing) {
                this.logger.info(`Product ${def.slug} already exists`);
                products.push(existing);
                continue;
            }

            const category = categories[def.categorySlug];

            const product = await this.databaseService.product.create({
                data: {
                    name: def.name,
                    slug: def.slug,
                    description: def.description,
                    price: new Prisma.Decimal('5.00'),
                    currency: 'USD',
                    isActive: true,
                    categoryId: category.id,
                    features: def.features,
                    included: DEFAULT_INCLUDED,
                    sessionMeta: DEFAULT_SESSION_META,
                    howItWorks: DEFAULT_HOW_IT_WORKS,
                },
            });

            products.push(product);
            this.logger.info(`Created product: ${def.name}`);
        }

        return products;
    }
}

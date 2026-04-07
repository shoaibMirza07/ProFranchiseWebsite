export default function ApiReferencePage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Reference</h1>
        <p className="text-sm text-gray-500 mt-1">All available API endpoints. Admin routes require authentication. Public routes are open.</p>
      </div>

      {API_GROUPS.map(group => (
        <section key={group.name} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
            <span className="text-base font-bold text-gray-800">{group.name}</span>
            <span className="text-xs text-gray-400 font-mono">{group.base}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {group.endpoints.map((ep, i) => (
              <div key={i} className="px-5 py-3.5 flex items-start gap-4">
                <div className="flex gap-1.5 shrink-0 pt-0.5">
                  {ep.methods.map(m => (
                    <span key={m} className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${METHOD_COLORS[m] ?? 'bg-gray-100 text-gray-600'}`}>{m}</span>
                  ))}
                </div>
                <div className="min-w-0">
                  <code className="text-sm font-mono text-gray-700">{ep.path}</code>
                  <p className="text-xs text-gray-500 mt-0.5">{ep.description}</p>
                  {ep.auth && <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-xs rounded border border-amber-200">Auth required</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-green-100 text-green-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  PATCH: 'bg-orange-100 text-orange-700',
  DELETE: 'bg-red-100 text-red-700',
}

const API_GROUPS = [
  {
    name: 'Pages & CMS',
    base: '/api/pages',
    endpoints: [
      { methods: ['GET'], path: '/api/pages', description: 'List all pages with their slugs, titles, and publish status', auth: false },
      { methods: ['POST'], path: '/api/pages', description: 'Create a new page (slug, titleEn, titleAr)', auth: true },
      { methods: ['GET'], path: '/api/pages/:id', description: 'Get a page including all its sections', auth: true },
      { methods: ['POST'], path: '/api/pages/:id/sections', description: 'Add a section to a page (type, order, isVisible, contentEn, contentAr)', auth: true },
      { methods: ['PUT'], path: '/api/pages/:id/sections/:sectionId', description: 'Full update of section content (contentEn, contentAr)', auth: true },
      { methods: ['PATCH'], path: '/api/pages/:id/sections/:sectionId', description: 'Partial update: isVisible, order, or type', auth: true },
      { methods: ['DELETE'], path: '/api/pages/:id/sections/:sectionId', description: 'Delete a section', auth: true },
    ],
  },
  {
    name: 'Settings',
    base: '/api/settings',
    endpoints: [
      { methods: ['GET'], path: '/api/settings', description: 'Get all settings grouped by category (general, branding, contact, social, stats)', auth: true },
      { methods: ['POST', 'PUT'], path: '/api/settings', description: 'Upsert settings — accepts array of { key, value, group } objects', auth: true },
      { methods: ['GET'], path: '/api/public/settings', description: 'Public flat key→value settings map. Keys: siteNameEn, siteNameAr, taglineEn, taglineAr, logoUrl, faviconUrl, colorPrimary, colorForest, addressEn, addressAr, footerTaglineEn, footerTaglineAr, phone, email, whatsapp, mapEmbedUrl, linkedIn, instagram, twitter, facebook, stat1Number, stat1LabelEn, stat1LabelAr, stat2Number, stat2LabelEn, stat2LabelAr, stat3Number, stat3LabelEn, stat3LabelAr, stat4Number, stat4LabelEn, stat4LabelAr', auth: false },
    ],
  },
  {
    name: 'Navigation',
    base: '/api/nav',
    endpoints: [
      { methods: ['GET'], path: '/api/nav', description: 'Public: list active nav items ordered by order field', auth: false },
    ],
  },
  {
    name: 'Brands',
    base: '/api/brands',
    endpoints: [
      { methods: ['GET'], path: '/api/brands', description: 'List all brands with location count (admin)', auth: true },
      { methods: ['POST'], path: '/api/brands', description: 'Create brand (nameEn, nameAr, slug, description, logoUrl, displayOnWeb, order, investment fields, whyPoints)', auth: true },
      { methods: ['GET', 'PUT', 'DELETE'], path: '/api/brands/:id', description: 'Get/update/delete brand with locations and contacts', auth: true },
      { methods: ['GET'], path: '/api/brands/:id/locations', description: 'List brand locations (city, area, type in EN/AR)', auth: true },
      { methods: ['GET', 'POST', 'PATCH'], path: '/api/brands/:id/contacts', description: 'List/link/update contacts for a brand. POST body: contactId or {nameEn,nameAr,title,email,phone} for new + role. PATCH: update role', auth: true },
      { methods: ['GET'], path: '/api/public/brands', description: 'Public: displayOnWeb brands with all fields', auth: false },
      { methods: ['GET'], path: '/api/public/brands/:slug', description: 'Public: single brand by slug with locations', auth: false },
    ],
  },
  {
    name: 'Partners',
    base: '/api/partners',
    endpoints: [
      { methods: ['GET'], path: '/api/partners', description: 'List all partners', auth: true },
      { methods: ['POST'], path: '/api/partners', description: 'Create partner (nameEn, nameAr, description, logoUrl, displayOnWeb, order)', auth: true },
      { methods: ['GET', 'PUT', 'DELETE'], path: '/api/partners/:id', description: 'Get/update/delete partner', auth: true },
      { methods: ['GET', 'POST', 'PATCH'], path: '/api/partners/:id/contacts', description: 'List/link/update contacts for a partner (same pattern as brands)', auth: true },
      { methods: ['GET'], path: '/api/public/partners', description: 'Public: displayOnWeb partners', auth: false },
    ],
  },
  {
    name: 'Contacts',
    base: '/api/contacts',
    endpoints: [
      { methods: ['GET'], path: '/api/contacts', description: 'List contacts with optional ?status= filter. Returns linked brands/partners with role', auth: true },
      { methods: ['POST'], path: '/api/contacts', description: 'Create contact (nameEn, nameAr, title, email, phone, status, notes)', auth: true },
      { methods: ['GET', 'PUT', 'DELETE'], path: '/api/contacts/:id', description: 'Get/update/delete contact. PUT accepts status, notes, all name/contact fields', auth: true },
    ],
  },
  {
    name: 'Customers',
    base: '/api/customers',
    endpoints: [
      { methods: ['GET'], path: '/api/customers', description: 'List all customers', auth: true },
      { methods: ['POST'], path: '/api/customers', description: 'Create customer (nameEn, nameAr, email, phone, industry, notes, status)', auth: true },
      { methods: ['GET', 'PUT', 'DELETE'], path: '/api/customers/:id', description: 'Get/update/delete customer', auth: true },
      { methods: ['GET', 'POST'], path: '/api/customers/:id/contacts', description: 'List/link contacts for a customer', auth: true },
    ],
  },
  {
    name: 'CRM Pipeline',
    base: '/api/pipeline',
    endpoints: [
      { methods: ['GET'], path: '/api/pipeline', description: 'List leads with optional ?stage=, ?assignedTo=, ?search= filters', auth: true },
      { methods: ['POST'], path: '/api/pipeline', description: 'Create lead (fullName, email, phone, inquiryType, company, message, source, stage, priority, contactId, brandId, partnerId, customerId, assignedToId)', auth: true },
      { methods: ['GET', 'PUT', 'DELETE'], path: '/api/pipeline/:id', description: 'Get/update/delete lead', auth: true },
      { methods: ['GET', 'POST'], path: '/api/pipeline/:id/activities', description: 'List/add activities (type: NOTE|CALL|EMAIL|MEETING|STATUS_CHANGE, note)', auth: true },
    ],
  },
  {
    name: 'Team',
    base: '/api/team',
    endpoints: [
      { methods: ['GET'], path: '/api/team', description: 'List all team members', auth: true },
      { methods: ['POST'], path: '/api/team', description: 'Create member (nameEn, nameAr, titleEn, titleAr, bioEn, bioAr, testimonialEn, testimonialAr, photoUrl, displayOnWeb, isLeadership, order, linkedIn, xHandle)', auth: true },
      { methods: ['GET', 'PUT', 'DELETE'], path: '/api/team/:id', description: 'Get/update/delete team member', auth: true },
      { methods: ['GET'], path: '/api/public/team', description: 'Public: displayOnWeb members. Optional ?leadership=true/false filter', auth: false },
    ],
  },
  {
    name: 'Gallery',
    base: '/api/gallery',
    endpoints: [
      { methods: ['GET'], path: '/api/gallery', description: 'List gallery images', auth: true },
      { methods: ['GET'], path: '/api/public/gallery', description: 'Public: active gallery images ordered by order field', auth: false },
    ],
  },
  {
    name: 'Jobs & Applications',
    base: '/api/jobs',
    endpoints: [
      { methods: ['GET'], path: '/api/jobs', description: 'List job applicants with optional ?status= filter', auth: true },
      { methods: ['GET', 'PUT', 'DELETE'], path: '/api/jobs/:id', description: 'Get/update/delete applicant. PUT: status, notes', auth: true },
      { methods: ['POST'], path: '/api/public/apply', description: 'Public: submit job application (fullName, email, phone, nationality, gender, experience, companiesWorked, cvUrl, jobAppliedFor)', auth: false },
    ],
  },
  {
    name: 'Contact Form',
    base: '/api/public/contact',
    endpoints: [
      { methods: ['POST'], path: '/api/public/contact', description: 'Public: submit contact inquiry (fullName, email, phone, inquiryType, message). Creates a Lead automatically', auth: false },
    ],
  },
  {
    name: 'Users',
    base: '/api/users',
    endpoints: [
      { methods: ['GET'], path: '/api/users', description: 'List all users (admin only)', auth: true },
      { methods: ['POST'], path: '/api/users', description: 'Create user (name, email, password, role: ADMIN|MANAGER|SALES|WEB_ADMIN)', auth: true },
      { methods: ['GET', 'PUT', 'DELETE'], path: '/api/users/:id', description: 'Get/update/delete user', auth: true },
    ],
  },
  {
    name: 'File Upload',
    base: '/api/upload',
    endpoints: [
      { methods: ['POST'], path: '/api/upload', description: 'Upload file (multipart/form-data, field: file). Returns { url: "/uploads/filename" }', auth: true },
    ],
  },
  {
    name: 'Footer',
    base: '/api/footer',
    endpoints: [
      { methods: ['GET'], path: '/api/footer', description: 'Get footer sections (LEFT, CENTER, RIGHT) with their links', auth: true },
      { methods: ['POST'], path: '/api/footer', description: 'Upsert footer sections and links', auth: true },
    ],
  },
]

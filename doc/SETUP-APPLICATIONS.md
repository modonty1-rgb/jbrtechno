# Job Application System Setup Guide

## Overview
The job application system allows candidates to apply for positions online, upload their CVs, and enables administrators to review applications through a dashboard.

## Prerequisites
- MongoDB database (Atlas or local)
- Cloudinary account for CV storage
- All dependencies installed via `pnpm install`

## Environment Variables Setup

### 1. Create `.env` file
Copy the `.env.example` file to create your `.env`:

```bash
cp .env.example .env
```

### 2. Configure MongoDB

#### Option A: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Replace in `.env`:
```
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/jbrtechno?retryWrites=true&w=majority"
```

#### Option B: Local MongoDB
```
DATABASE_URL="mongodb://localhost:27017/jbrtechno"
```

### 3. Configure Cloudinary

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Get your credentials from the Dashboard
4. Add to `.env`:
```
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Database Setup

### 1. Generate Prisma Client
```bash
npx prisma generate
```

### 2. Push Schema to Database
```bash
npx prisma db push
```

This will create the `Application` collection in your MongoDB database.

### 3. (Optional) View Database in Prisma Studio
```bash
npx prisma studio
```

## Testing the System

### 1. Start Development Server
```bash
pnpm dev
```

### 2. Test Application Flow

#### As a Candidate:
1. Navigate to http://localhost:3000/ar/careers
2. Click "Apply Now" on any vacant position
3. Review requirements and check acknowledgement
4. Fill in the application form:
   - Personal information
   - Years of experience
   - Optional portfolio/social links
   - Skills (comma-separated)
   - Cover letter (50-2000 characters)
   - Upload CV (PDF or DOCX, max 5MB)
5. Submit application

#### As an Administrator:
1. Navigate to http://localhost:3000/ar/admin
2. Login with admin password (default: "admin")
3. Click "Applications" in the sidebar
4. View all applications with statistics
5. Click on any application to see full details
6. Update application status:
   - Pending (default)
   - Reviewed
   - Accepted
   - Rejected
7. Add admin notes
8. Download/view candidate CV

## File Structure

### Created Files
```
prisma/
  └── schema.prisma                    # Database schema

lib/
  ├── prisma.ts                        # Prisma client singleton
  ├── cloudinary.ts                    # Cloudinary helpers
  └── validations/
      └── application.ts               # Zod validation schemas

app/
  ├── api/
  │   ├── upload/route.ts             # CV upload endpoint
  │   └── applications/[id]/route.ts  # Get single application
  └── [locale]/
      ├── (public)/
      │   └── careers/
      │       └── apply/[position]/page.tsx  # Application form
      └── admin/
          └── applications/
              ├── page.tsx            # Applications list
              └── [id]/page.tsx       # Application detail

actions/
  ├── submitApplication.ts            # Submit application server action
  └── updateApplicationStatus.ts      # Update status server action

components/
  ├── CVUpload.tsx                    # File upload component
  ├── ApplicationCard.tsx             # Application card for list
  └── ApplicationStatusBadge.tsx      # Status badge component
```

### Modified Files
```
app/[locale]/(public)/careers/page.tsx  # Added Apply Now links
components/AdminSidebar.tsx             # Added Applications nav item
i18n/routing.ts                         # Added application routes
messages/en.json                        # Added English translations
messages/ar.json                        # Added Arabic translations
```

## Features

### For Candidates
- ✅ View position requirements before applying
- ✅ Acknowledgement checkbox for requirements
- ✅ Bilingual form (Arabic/English)
- ✅ File upload with drag & drop
- ✅ Real-time validation
- ✅ Progress indicators

### For Administrators
- ✅ Dashboard with statistics
- ✅ View all applications
- ✅ Filter by status (pending/reviewed/accepted/rejected)
- ✅ View full application details
- ✅ Download candidate CVs
- ✅ Update application status
- ✅ Add private admin notes
- ✅ Protected admin routes

## Security Features

- ✅ Server-side file validation
- ✅ File type restrictions (PDF, DOCX only)
- ✅ File size limits (5MB max)
- ✅ Server actions for all mutations
- ✅ Admin authentication required
- ✅ Environment variables secured
- ✅ SQL injection safe (Prisma ORM)

## Production Deployment Checklist

### 1. Environment Variables
- [ ] Set `DATABASE_URL` with production MongoDB connection string
- [ ] Set Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)

### 2. Database
- [ ] Run `npx prisma generate` in production
- [ ] Run `npx prisma db push` to create collections

### 3. Admin Password
- [ ] Update admin password in `helpers/adminAuth.ts` (currently: "admin")
- [ ] Consider implementing proper authentication system for production

### 4. Cloudinary Setup
- [ ] Configure upload presets if needed
- [ ] Set up backup policies
- [ ] Monitor storage usage

### 5. Testing
- [ ] Test complete application flow
- [ ] Test file uploads (various formats and sizes)
- [ ] Test admin dashboard on mobile devices
- [ ] Verify email validation
- [ ] Test bilingual functionality

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check MongoDB Atlas whitelist (allow all IPs for development: 0.0.0.0/0)
- Ensure MongoDB service is running (local installations)

### File Upload Errors
- Verify Cloudinary credentials are correct
- Check file size is under 5MB
- Ensure file type is PDF or DOCX
- Check network connectivity

### Build Errors
- Run `npx prisma generate` after installing dependencies
- Clear `.next` folder and rebuild
- Verify all environment variables are set

## API Endpoints

### POST /api/upload
Upload CV file to Cloudinary
- **Body**: FormData with `file` field
- **Response**: `{ url: string, publicId: string }`

### GET /api/applications/[id]
Get single application by ID
- **Response**: Application object

## Database Schema

### Application Model
```prisma
model Application {
  id                String            @id @default(auto()) @map("_id") @db.ObjectId
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  applicantName     String
  email             String
  phone             String
  position          String
  yearsOfExperience Int
  portfolioUrl      String?
  githubUrl         String?
  linkedinUrl       String?
  skills            String[]
  coverLetter       String
  cvUrl             String
  cvPublicId        String
  status            ApplicationStatus @default(PENDING)
  adminNotes        String?
  locale            String            @default("ar")
}

enum ApplicationStatus {
  PENDING
  REVIEWED
  ACCEPTED
  REJECTED
}
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Prisma logs: `npx prisma studio`
3. Check Cloudinary dashboard for upload issues
4. Review browser console for client-side errors
5. Check server logs for API errors

## Next Steps

Consider implementing:
- Email notifications to candidates
- Email notifications to admin on new applications
- Application filters and search in admin dashboard
- Export applications to CSV/Excel
- Interview scheduling system
- Application status tracking for candidates
- Rate limiting for submissions


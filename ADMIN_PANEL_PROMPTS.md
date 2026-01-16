# Prompts para Criação do Painel Administrativo (VariaGen)

Este documento contém os prompts detalhados para gerar cada seção do Painel Administrativo do VariaGen. Você pode copiar e colar estes prompts individualmente para gerar as telas com alta fidelidade.

## 1. Layout Global & Sidebar
```markdown
Create a collapsible sidebar navigation for SaaS admin panel, dark theme.

**SIDEBAR (Expanded - 260px width):**

**Logo Section:**
- VariaGen logo (stylized V with gradient purple-cyan)
- Text "VariaGen" in bold
- Subtitle "Admin Panel" smaller, gray

**Navigation Items (vertical list):**
Each item has: Icon (left), Label (center), Badge (right, optional)

1. Dashboard - Home icon - No badge
2. Users - Users icon - Badge "2.3k"
3. Subscriptions - Credit card icon - Badge "847"
4. AI Usage - Activity/CPU icon - No badge
5. System Config - Settings cog icon - No badge

**Divider line**

6. Documentation - Book icon - External link indicator
7. Support - Headphones icon - No badge

**Bottom Section:**
- User profile mini card:
  - Avatar
  - Name "Ortiz"
  - Role "Super Admin"
  - Dropdown arrow (opens: Profile Settings, Logout)

**COLLAPSED STATE (72px width):**
- Only icons visible, centered
- Logo becomes just the "V" icon
- Hover on icons shows tooltip with label
- User section becomes just avatar

**TOGGLE BUTTON:**
- Circular button at sidebar edge
- Arrow icon pointing left (collapse) or right (expand)
- Subtle glow on hover

**ACTIVE STATE:**
- Active nav item has:
  - Purple background gradient (subtle)
  - Left border accent (3px purple)
  - Icon and text slightly brighter

**HOVER STATE:**
- Background lightens slightly
- Smooth transition

**TOP HEADER BAR (Fixed, full width minus sidebar):**
- Left: Breadcrumb navigation "Admin / Dashboard"
- Center: Global search bar (Cmd+K shortcut hint)
- Right: 
  - Notification bell with red badge (3)
  - Theme toggle (sun/moon)
  - User avatar (opens same dropdown as sidebar)

**DESIGN:**
- Sidebar background: #0d0b14 (slightly lighter than page)
- Sidebar has subtle right border glow
- Smooth width transition on collapse/expand (300ms ease)
- Icons use Lucide or Phosphor icon set
- All transitions smooth, 200-300ms
```

## 2. Dashboard Principal (Home)
```markdown
Create a SaaS Admin Dashboard homepage for "VariaGen" with dark theme.

**HEADER:**
- Left: Breadcrumb "Admin / Dashboard"
- Right: Search bar, notification bell with red dot (3), user avatar dropdown

**FINANCIAL METRICS ROW (4 cards, horizontal):**

Card 1 - MRR:
- Label: "Monthly Recurring Revenue"
- Value: "$12,450" (large, white)
- Badge: "+12.5% vs last month" (green pill)
- Mini sparkline chart showing upward trend
- Icon: Dollar sign in purple circle

Card 2 - ARR:
- Label: "Annual Recurring Revenue"  
- Value: "$149,400"
- Subtext: "Projected based on current MRR"
- Icon: Calendar in cyan circle

Card 3 - Active Subscribers:
- Value: "847"
- Mini donut chart inside card (Pro 45%, Basic 40%, Enterprise 15%)
- Icon: Users in purple circle

Card 4 - Churn Rate:
- Value: "2.3%"
- Badge: "-0.5%" (green, good = down)
- Subtext: "23 cancellations this month"
- Icon: Trending down in green circle

**USER METRICS ROW (3 cards):**

Card 1 - Total Users:
- Value: "2,341"
- Subtext: "All registered accounts"
- Small bar showing: 847 paying, 1494 free

Card 2 - New Signups:
- Value: "156"
- Label: "Last 30 days"
- Mini bar chart (7 bars for last 7 days)

Card 3 - Average Ticket:
- Value: "$14.70"
- Badge: "+$1.20 vs last month"

**CHARTS SECTION (2 columns, equal width):**

Left Chart - "Revenue Trend":
- Line chart with gradient fill (purple to transparent)
- X-axis: Last 6 months
- Y-axis: Revenue in dollars
- Hover tooltip showing exact values

Right Chart - "Plan Distribution":
- Donut chart with legend below
- Segments: Free (gray), Pro (purple), Enterprise (cyan)
- Center text: "2,341 total"

**RECENT ACTIVITY (Bottom section):**
- Title: "Recent Activity"
- List of 5 items with avatar, action text, timestamp
- Example: "João Silva upgraded to Pro plan • 2 hours ago"

**DESIGN:**
- Background: #0a0a0f with subtle grid pattern
- Cards: Glass effect with rgba(255,255,255,0.03) background, 1px border rgba(255,255,255,0.1)
- Accent gradients: Purple (#8b5cf6) to Cyan (#06b6d4)
- All cards have subtle hover lift animation
- Charts use gradient fills matching brand colors
```

## 3. User Management
```markdown
Create a User Management page for SaaS admin panel, dark theme.

**HEADER:**
- Title: "User Management" with users icon
- Subtext: "Manage all registered users"
- Right side: "Export CSV" button (outline), "Add User" button (purple filled)

**FILTERS BAR:**
- Search input with magnifying glass icon, placeholder "Search by email or name..."
- Filter pills/tabs: All (2341), Active (847), Free (1494), Canceled (89), Past Due (12)
- Sort dropdown: "Newest first", "Oldest first", "Name A-Z"

**DATA TABLE:**
Columns:
1. Checkbox (for bulk actions)
2. User (avatar + email + name stacked)
3. Plan (badge style):
   - Free = gray badge
   - Pro = purple badge with glow
   - Enterprise = cyan badge with glow
4. Status (dot + text):
   - Active = green dot
   - Canceled = red dot
   - Past Due = yellow dot
5. MRR Contribution: "$0" for free, "$19" for Pro, "$99" for Enterprise
6. Joined: "Jan 15, 2025" format
7. Last Active: "2 hours ago" format
8. Actions: Three-dot menu icon

**TABLE ROWS (show 5 example rows):**
- Mix of Free, Pro, Enterprise users
- Different statuses
- Realistic Brazilian names and emails

**ACTIONS DROPDOWN (on click):**
- View Profile (eye icon)
- View Usage Logs (activity icon)
- Change Plan (arrow up icon)
- Send Email (mail icon)
- Divider line
- Ban User (red, ban icon)

**PAGINATION:**
- Left: "Showing 1-10 of 2,341 users"
- Right: Page numbers with arrows

**BULK ACTIONS BAR (appears when checkboxes selected):**
- "3 users selected"
- Buttons: "Export Selected", "Send Bulk Email", "Delete" (red)

**DESIGN:**
- Table rows have hover state with subtle purple glow
- Alternating row backgrounds (very subtle)
- Sticky header on scroll
- Smooth transitions on filter changes
```

## 4. Subscriptions
```markdown
Create a Subscriptions management page for SaaS admin, dark theme.

**HEADER:**
- Title: "Subscriptions"
- Subtext: "Monitor and manage all active subscriptions"

**STATS ROW (4 mini cards):**
- Active: 847 (green accent)
- Trial: 34 (yellow accent)
- Past Due: 12 (orange accent)
- Canceled (30d): 23 (red accent)

**PLANS OVERVIEW SECTION:**
Title: "Plan Performance"

3 Plan Cards side by side:

Card 1 - Basic Plan:
- Price: "$9/mo"
- Subscribers: 340
- MRR: "$3,060"
- Bar showing % of total
- "View subscribers" link

Card 2 - Pro Plan (highlighted with purple border glow):
- Price: "$19/mo"
- Subscribers: 456
- MRR: "$8,664"
- Badge: "Most Popular"
- Bar showing % of total

Card 3 - Enterprise Plan:
- Price: "$99/mo"
- Subscribers: 51
- MRR: "$5,049"
- Bar showing % of total

**SUBSCRIPTIONS TABLE:**
Columns:
1. Customer (avatar + name + email)
2. Plan (badge)
3. Status (Active/Past Due/Canceled with colored dot)
4. Started: Date
5. Renews: Date (or "Canceled" in red)
6. Lifetime Value: "$228"
7. Stripe ID: "sub_1234..." (truncated, copy button)
8. Actions menu

**FILTERS:**
- Tabs: All, Active, Past Due, Canceled, Trial
- Date range picker
- Plan filter dropdown

**DESIGN:**
- Plan cards have gradient borders on hover
- "Most Popular" badge glows
- Past Due rows have subtle orange left border
- Canceled rows are slightly dimmed
```

## 5. AI Usage Logs
```markdown
Create an AI Usage Logs page for SaaS admin panel, dark theme.

**HEADER:**
- Title: "AI Usage Logs" with activity/cpu icon
- Subtext: "Track all AI processing requests"
- Right: Date range picker, "Export Logs" button

**USAGE OVERVIEW (4 metric cards):**

Card 1 - Total Requests (30d):
- Value: "12,847"
- Sparkline showing daily volume
- vs last month: "+23%"

Card 2 - Total Tokens Used:
- Value: "2.4M"
- Cost estimate: "~$48.00"

Card 3 - Image Cloning Requests:
- Value: "8,234"
- Icon: Image icon

Card 4 - Video Processing:
- Value: "4,613"
- Icon: Video icon

**USAGE BY FEATURE CHART:**
- Horizontal bar chart
- Features: "Image Cloning", "Video Variations", "Style Transfer"
- Each bar shows request count

**USAGE BY PROVIDER:**
- Donut chart
- Segments: Google Gemini (80%), Local Processing (20%)

**LOGS TABLE:**
Columns:
1. Timestamp: "Jan 15, 2025 14:32:05"
2. User (email, clickable)
3. Feature: Badge (Image Clone = purple, Video Gen = cyan)
4. Provider: "Google Gemini" or "Local"
5. Tokens: "1,247"
6. Cost: "$0.02"
7. Status: Success (green check), Failed (red x), Pending (yellow spinner)
8. Duration: "2.3s"
9. Actions: "View Details"

**FILTERS:**
- Search by user email
- Feature dropdown: All, Image Clone, Video Gen
- Status: All, Success, Failed
- Provider: All, Google Gemini, Local

**DETAILS MODAL (when clicking View Details):**
- Request ID
- Full timestamp
- User info
- Input preview (thumbnail)
- Output preview (thumbnail)
- Full token breakdown
- Raw API response (collapsible JSON)

**DESIGN:**
- Failed rows have red left border accent
- Success status has subtle green glow
- Tokens column has mini bar visualization
- Real-time feel with subtle pulse animation on recent entries
```

## 6. System Configuration
```markdown
Create a System Configuration page for SaaS admin, dark theme.

**HEADER:**
- Title: "System Configuration" with settings cog icon
- Subtext: "Manage API keys, providers and system settings"
- Warning banner: "Changes here affect the entire platform. Be careful."

**LAYOUT:** Two-column grid

**LEFT COLUMN:**

**Section 1 - Payment Gateway (Card):**
- Title: "Stripe Configuration" with Stripe logo
- Status indicator: "Connected" (green dot) or "Not configured" (red)

Fields:
- Stripe Secret Key: Masked input (•••••••sk_live_xxx), eye toggle to reveal, copy button
- Stripe Webhook Secret: Masked input
- Webhook URL: Read-only field showing "https://variagen.com/api/webhooks/stripe" with copy button

Buttons: "Test Connection", "Save Changes"

**Section 2 - AI Providers (Card):**
- Title: "Google AI (Gemini)" with Google logo
- Status: "Active" with green dot

Fields:
- API Key: Masked input with reveal toggle
- Default Model: Dropdown selector
  - Options: "gemini-1.5-pro-latest", "gemini-1.5-flash", "gemini-pro-vision"
- Max Tokens per Request: Number input (default: 4096)
- Temperature: Slider 0-1 (default: 0.7)

Buttons: "Test API", "Save"

**RIGHT COLUMN:**

**Section 3 - Usage Limits (Card):**
- Title: "Plan Limits Configuration"

Table/Form:
| Plan       | Daily Requests | Monthly Tokens | Max File Size |
| Free       | 10             | 50,000         | 5MB           |
| Pro        | 100            | 500,000        | 50MB          |
| Enterprise | Unlimited      | Unlimited      | 500MB         |

Each cell is editable input.

**Section 4 - System Settings (Card):**
- Title: "General Settings"

Fields:
- Maintenance Mode: Toggle switch (ON = shows maintenance page to users)
- Allow New Signups: Toggle switch
- Default User Plan: Dropdown (Free/Pro)
- Session Timeout: Number input in minutes
- Max Upload Size (Global): Number input in MB

**Section 5 - Danger Zone (Card with red border):**
- Title: "Danger Zone" in red
- "Clear All Logs" button (outline red)
- "Reset Rate Limits" button (outline red)
- "Purge Cached Data" button (outline red)

Each has confirmation modal.

**DESIGN:**
- Cards have section dividers
- Masked inputs show dots with monospace font
- Toggle switches are purple when ON
- Test buttons show loading spinner, then success/error toast
- Danger zone has red-tinted background
- Save buttons have success animation (checkmark morph)

**TOAST NOTIFICATIONS:**
- Success: "Settings saved successfully" (green)
- Error: "Failed to connect to Stripe" (red)
- Warning: "API key format invalid" (yellow)
```

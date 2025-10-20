# Visual Component Guide 🎨

## All 18 Components - Visual Reference

---

## 🧭 Navigation Components

### 1. Navbar
```
┌──────────────────────────────────────────────────────────┐
│  🔧 FixBuddy  [Search...]  [Ask Question]  [@user ▼]   │
└──────────────────────────────────────────────────────────┘
```
**Features:** Search bar, auth buttons, user dropdown, sticky header

### 2. Sidebar
```
┌─────────────────────┐
│ 🏷️ Popular Tags     │
│ ┌─────────────────┐ │
│ │ 🧊 refrigerator │ │
│ │ 🌀 washing      │ │
│ │ 🍽️ dishwasher   │ │
│ └─────────────────┘ │
│                     │
│ 👥 Top Contributors │
│ ┌─────────────────┐ │
│ │ 🥇 john (850)   │ │
│ │ 🥈 sarah (620)  │ │
│ │ 🥉 mike (450)   │ │
│ └─────────────────┘ │
└─────────────────────┘
```
**Features:** Top tags, top users, community stats

---

## ❓ Question Components

### 3. QuestionCard
```
┌──────────────────────────────────────────┐
│ ⬆ 12 ⬇  My dishwasher won't drain      │
│          Water stays at the bottom...   │
│          [🧊 tag1] [💧 tag2]            │
│          👤 john • 2h • 👁️ 150 • 💬 3   │
│          [🟢 Open]                      │
└──────────────────────────────────────────┘
```
**Features:** Vote buttons, title, excerpt, tags, author, stats, status

### 4. QuestionList
```
┌──────────────────────────────────────────┐
│ [Newest] [Active] [Popular] [Unanswered]│
│                                          │
│  [QuestionCard 1]                       │
│  [QuestionCard 2]                       │
│  [QuestionCard 3]                       │
│                                          │
│  [← Previous] [1][2][3] [Next →]        │
└──────────────────────────────────────────┘
```
**Features:** Sort tabs, pagination, loading states, empty state

### 5. QuestionForm
```
┌──────────────────────────────────────────┐
│ Title: [                              ] │
│                                          │
│ Content:                                 │
│ [B][I][H] | [List][Code] | [👁️ Preview]│
│ ┌────────────────────────────────────┐  │
│ │ Write your question here...        │  │
│ │                                    │  │
│ └────────────────────────────────────┘  │
│                                          │
│ Tags: [refrigerator] [x] [drainage] [x] │
│       [Type to add...]                  │
│                                          │
│                    [Post Question]      │
└──────────────────────────────────────────┘
```
**Features:** Title input, rich editor, tag autocomplete, validation

---

## 💬 Answer & Comment Components

### 6. AnswerCard
```
┌──────────────────────────────────────────┐
│ ✅ Accepted Answer                       │
│                                          │
│ ⬆ 15 ⬇  Check the drain filter first.  │
│  ✓      Steps to clean:                 │
│         1. Turn off the dishwasher      │
│         2. Remove the lower rack        │
│                                          │
│         👤 sarah • 1 day ago            │
└──────────────────────────────────────────┘
```
**Features:** Vote buttons, accept badge, markdown content, author info

### 7. CommentSection
```
┌──────────────────────────────────────────┐
│ 2 Comments                               │
│ ┌──────────────────────────────────────┐│
│ │ 👤 mike (450) • 3h ago               ││
│ │ Did you check the drain hose?        ││
│ └──────────────────────────────────────┘│
│ ┌──────────────────────────────────────┐│
│ │ 👤 lisa (280) • 1h ago               ││
│ │ Could be a clogged filter            ││
│ └──────────────────────────────────────┘│
│ [Add a comment]                          │
└──────────────────────────────────────────┘
```
**Features:** Comment list, add form, character counter, validation

### 8. RichTextEditor
```
┌──────────────────────────────────────────┐
│ [B][I][H] | [•][1.] | [</>][```]["] | 👁️│
│ ┌────────────────────────────────────┐  │
│ │ **Bold** *Italic* `code`           │  │
│ │                                    │  │
│ │ ## Heading                         │  │
│ │ - List item                        │  │
│ └────────────────────────────────────┘  │
│ Markdown supported: **bold**, *italic*   │
└──────────────────────────────────────────┘
```
**Features:** Formatting toolbar, preview mode, markdown support

---

## 👤 User Components

### 9. LoginForm
```
┌──────────────────────────────────┐
│      Welcome Back               │
│  Login to your FixBuddy account │
│                                 │
│  Email: [                    ] │
│  Password: [                 ] │
│                                 │
│         [Login]                │
│                                 │
│  Don't have an account? Sign up │
│                                 │
│  Test: john@fixbuddy.com       │
│  Pass: password123             │
└──────────────────────────────────┘
```
**Features:** Email/password inputs, validation, test credentials

### 10. RegisterForm
```
┌──────────────────────────────────┐
│      Create Account             │
│  Join the FixBuddy community    │
│                                 │
│  Username: [                 ] │
│  Email: [                    ] │
│  Password: [                 ] │
│  Confirm: [                  ] │
│                                 │
│      [Create Account]          │
│                                 │
│  Already have an account? Login │
└──────────────────────────────────┘
```
**Features:** Multi-field validation, password matching, error display

### 11. UserAvatar
```
Sizes:
XS: 👤      SM: 👤       MD: 👤🌱     LG: 👤⭐    XL: 👤🏆
    (6px)      (8px)        (10px)       (16px)      (24px)

With Reputation:
┌─────────────────┐
│ 👤🏆 john_repairman │
│    850 reputation   │
└─────────────────┘
```
**Features:** 5 sizes, reputation badges (🌱🔰⭐🏆), clickable

### 12. UserProfileCard
```
┌──────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ Gradient
│                                          │
│   👤🏆                     [Edit Profile]│
│                                          │
│   john_repairman                        │
│   Expert appliance repair specialist    │
│   📍 New York • 🔗 website.com          │
│   📅 Joined January 2024                │
│                                          │
│  ┌───────┬────────┬──────────┬─────────┐│
│  │  45   │  128   │    32    │   850  ││
│  │ Quest │Answers │ Accepted │  Rep   ││
│  └───────┴────────┴──────────┴─────────┘│
│                                          │
│  Achievements:                           │
│  🏆 Expert  ⭐ Advanced  ✓ Solution Master│
└──────────────────────────────────────────┘
```
**Features:** Stats grid, achievements, bio, social links, edit button

---

## 🔧 Utility Components

### 13. LoadingSpinner
```
Sizes & Colors:
XS: ⚪ (16px)    Blue:  🔵    White: ⚪
SM: ⚪ (24px)    Gray:  ⚫    Green: 🟢
MD: ⚪ (32px)    Red:   🔴
LG: ⚪ (48px)
XL: ⚪ (64px)

With Text:
    ⚪
  Loading...
```
**Features:** 5 sizes, 5 colors, optional text, full-screen mode

### 14. Toast Notifications
```
Types:
┌────────────────────────────┐
│ ✓ Success message here!   │ Success (Green)
└────────────────────────────┘

┌────────────────────────────┐
│ ✗ Error message here!     │ Error (Red)
└────────────────────────────┘

┌────────────────────────────┐
│ ⚠ Warning message here!   │ Warning (Yellow)
└────────────────────────────┘

┌────────────────────────────┐
│ ℹ Info message here!      │ Info (Blue)
└────────────────────────────┘
```
**Features:** 4 types, auto-dismiss, close button, stacked

### 15. SkeletonLoader
```
Types:

Text:     ████████████
Title:    ████████████████████
Avatar:   ⭕

Card:     ┌──────────────────┐
          │ ████████████     │
          │ ████████         │
          │ ████████████████ │
          │ ⭕ ██████         │
          └──────────────────┘

List:     [Card] [Card] [Card]

Profile:  [Profile Card with gradient]

Question: [Full question layout]
```
**Features:** 7 types, pulse animation, realistic layouts

### 16. TagBadge
```
Variants:
[🧊 refrigerator]     Default (Gray)
[🌀 washing machine]  Primary (Blue)
[🍽️ dishwasher]       Secondary (Purple)
[✓ solved]            Success (Green)
[⚠ needs-help]        Warning (Yellow)

With Count:
[🧊 refrigerator × 45]

With Remove:
[🧊 refrigerator ×]
```
**Features:** 5 variants, icons, usage count, removable, clickable

### 17. ErrorBoundary
```
┌──────────────────────────────────┐
│        ⚠️                        │
│                                  │
│  Oops! Something went wrong     │
│                                  │
│  We encountered an unexpected   │
│  error. Please try refreshing.  │
│                                  │
│  ┌────────────────────────────┐│
│  │ Error: Cannot read...      ││
│  └────────────────────────────┘│
│                                  │
│  [Refresh Page]  [Go Home]      │
│      [Try Again]                │
└──────────────────────────────────┘
```
**Features:** Error display, refresh/home buttons, retry option

---

## 🎛️ Interactive Components

### 18. VoteButton
```
Sizes:
Small:   ⬆        Medium:  ⬆        Large:   ⬆
         12                12                 12
         ⬇                 ⬇                  ⬇

States:
Normal:    ⬆ 12 ⬇
Upvoted:   🟢 13 ⬇
Downvoted: ⬆ 11 🔴
```
**Features:** 3 sizes, color-coded states, loading, error handling

---

## Page Layouts

### Home Page
```
┌──────────────────────────────────────────────────────────┐
│  [Navbar]                                                 │
├──────────────────────────────────────────────────────────┤
│                                          ┌──────────────┐│
│  Welcome to FixBuddy                    │  [Sidebar]   ││
│                                          │              ││
│  [Newest][Active][Popular]              │  Popular     ││
│                                          │  Tags        ││
│  [QuestionCard 1]                       │              ││
│  [QuestionCard 2]                       │  Top         ││
│  [QuestionCard 3]                       │  Contributors││
│                                          │              ││
│  [← Previous] [1][2][3] [Next →]       │  Stats       ││
│                                          └──────────────┘│
└──────────────────────────────────────────────────────────┘
```

### Login Page
```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│                     🔧 FixBuddy                          │
│              The home appliance repair community         │
│                                                           │
│                  [LoginForm]                             │
│                                                           │
│                  ← Back to Home                          │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### Ask Question Page
```
┌──────────────────────────────────────────────────────────┐
│  [Navbar]                                                 │
├──────────────────────────────────────────────────────────┤
│  Home / Ask a Question                                    │
│                                                           │
│  Ask a Public Question                                    │
│  Get help from our community of experts                   │
│                                                           │
│  [QuestionForm with RichTextEditor]                      │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## Component Sizes Comparison

### Avatar Sizes
```
XS:  👤 (24px)
SM:  👤  (32px)
MD:  👤   (40px)
LG:  👤     (64px)
XL:  👤       (96px)
```

### Spinner Sizes
```
XS: ⚪ (16px)
SM: ⚪  (24px)
MD: ⚪   (32px)
LG: ⚪     (48px)
XL: ⚪       (64px)
```

### Tag Badge Sizes
```
XS: [tag] (px-2 py-0.5 text-xs)
SM: [tag] (px-2 py-1 text-xs)
MD: [tag] (px-3 py-1 text-sm)
LG: [tag] (px-4 py-2 text-base)
```

---

## Color Schemes

### Status Colors
- 🟢 **Success/Open**: Green-500
- 🔴 **Error/Closed**: Red-500
- 🟡 **Warning**: Yellow-500
- 🔵 **Info**: Blue-500
- ⚫ **Gray**: Gray-500

### Tag Variants
- **Default**: Gray-100/Gray-700
- **Primary**: Blue-100/Blue-800
- **Secondary**: Purple-100/Purple-800
- **Success**: Green-100/Green-800
- **Warning**: Yellow-100/Yellow-800

### Reputation Badges
- 🌱 **Beginner** (0-99): Gray-400
- 🔰 **Intermediate** (100-499): Green-500
- ⭐ **Advanced** (500-999): Blue-500
- 🏆 **Expert** (1000+): Yellow-500

---

## Responsive Breakpoints

```
Mobile:   < 768px   (sm)
Tablet:   768-1024px (md)
Desktop:  > 1024px   (lg)
```

### Mobile Adaptations
- Navbar: Hamburger menu
- Sidebar: Hidden or bottom sheet
- QuestionCard: Stacked layout
- QuestionForm: Full width
- UserProfileCard: Single column stats

---

## Animation Types

1. **Pulse**: SkeletonLoader
2. **Spin**: LoadingSpinner
3. **Slide**: Toast (right to left)
4. **Fade**: Modal overlays
5. **Hover**: All interactive elements

---

## Icon Library

### Emojis Used
- 🔧 FixBuddy logo
- 🧊 Refrigerator
- 🌀 Washing machine
- 🍽️ Dishwasher
- 🏆 Expert badge
- ⭐ Advanced badge
- 🔰 Intermediate badge
- 🌱 Beginner badge
- 👁️ Views
- 💬 Comments
- 👤 User
- 📍 Location
- 🔗 Website
- 📅 Calendar
- ⬆️ Upvote
- ⬇️ Downvote
- ✓ Accepted
- ⚠️ Warning
- ℹ️ Info

### SVG Icons Used
- Search
- Menu
- Settings
- Logout
- Close (×)
- Check (✓)
- Arrow up/down
- Link
- Location
- Calendar

---

## Quick Reference Card

```
Component Usage Quick Reference:

Auth:       <LoginForm /> <RegisterForm />
User:       <UserAvatar user={u} size="md" />
            <UserProfileCard user={u} stats={s} />
Question:   <QuestionList sort="newest" />
            <QuestionCard question={q} />
            <QuestionForm mode="create" />
Answer:     <AnswerCard answer={a} />
Comment:    <CommentSection itemId={id} itemType="question" />
Editor:     <RichTextEditor value={v} onChange={set} />
Vote:       <VoteButton itemId={id} itemType="question" />
Loading:    <LoadingSpinner size="md" />
            <SkeletonLoader type="list" count={5} />
Toast:      const toast = useToast()
            toast.success("Done!")
Tag:        <TagBadge tag={t} variant="primary" />
Error:      <ErrorBoundary><App /></ErrorBoundary>
```

---

## All Components at a Glance

| # | Component | Type | Size | Status |
|---|-----------|------|------|--------|
| 1 | Navbar | Nav | 267 | ✅ |
| 2 | Sidebar | Nav | 198 | ✅ |
| 3 | QuestionCard | Q | 214 | ✅ |
| 4 | QuestionList | Q | 287 | ✅ |
| 5 | QuestionForm | Q | 435 | ✅ |
| 6 | AnswerCard | A | 214 | ✅ |
| 7 | CommentSection | C | 274 | ✅ |
| 8 | RichTextEditor | E | 276 | ✅ |
| 9 | LoginForm | U | 164 | ✅ |
| 10 | RegisterForm | U | 239 | ✅ |
| 11 | UserAvatar | U | 141 | ✅ |
| 12 | UserProfileCard | U | 181 | ✅ |
| 13 | LoadingSpinner | Util | 68 | ✅ |
| 14 | Toast | Util | 158 | ✅ |
| 15 | SkeletonLoader | Util | 169 | ✅ |
| 16 | TagBadge | Util | 110 | ✅ |
| 17 | ErrorBoundary | Util | 99 | ✅ |
| 18 | VoteButton | Int | 177 | ✅ |

**Total: 3,671 lines of production code! 🎉**

---

**All components are visually consistent, fully responsive, and production-ready!**

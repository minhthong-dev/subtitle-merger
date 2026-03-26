# Subtitle Merger - Design Brainstorm

## Project Overview
Ứng dụng web cho phép ghép đôi hai file phụ đề (SRT/VTT) lại với nhau để tạo thành phụ đề song ngữ. Người dùng sẽ tải lên hai file, xem trước, chỉnh sửa và tải xuống kết quả.

---

## Design Approach 1: Minimalist & Functional (Probability: 0.08)

**Design Movement:** Swiss Design / Bauhaus Modernism
- Emphasis on clarity, function, and geometric precision
- Clean typography hierarchy with generous whitespace
- Neutral color palette with strategic accent colors

**Core Principles:**
1. **Clarity First**: Every element serves a purpose; no decorative elements
2. **Geometric Precision**: Grid-based layout with strict alignment
3. **Functional Minimalism**: Maximum usability with minimum visual noise
4. **Accessibility**: High contrast, clear visual hierarchy

**Color Philosophy:**
- Primary: Cool grays (charcoal, light gray)
- Accent: Vibrant teal/cyan for interactive elements
- Background: Pure white with subtle light gray sections
- Rationale: Reduces cognitive load, emphasizes content

**Layout Paradigm:**
- Vertical flow with clear sections
- Two-column layout: file upload on left, preview on right
- Minimal borders; rely on spacing and typography for separation

**Signature Elements:**
1. Geometric upload zones with dashed borders
2. Monospace font for subtitle text (code-like appearance)
3. Subtle grid background in preview areas

**Interaction Philosophy:**
- Instant feedback on file upload
- Smooth transitions between states
- Clear loading states with progress indicators

**Animation:**
- Fade-in for content sections
- Subtle slide-up for file preview
- Smooth color transitions on hover (200ms)

**Typography System:**
- Display: Inter Bold (24-28px) for headings
- Body: Inter Regular (14-16px)
- Monospace: JetBrains Mono for subtitle content

---

## Design Approach 2: Modern & Playful (Probability: 0.07)

**Design Movement:** Contemporary Digital Design with Glassmorphism
- Soft, rounded corners with blur effects
- Gradient accents and layered depth
- Friendly, approachable aesthetic

**Core Principles:**
1. **Approachability**: Friendly, inviting interface
2. **Depth & Layering**: Multiple visual layers with blur and shadows
3. **Smooth Transitions**: Fluid animations throughout
4. **Color Harmony**: Complementary gradients and soft tones

**Color Philosophy:**
- Primary: Soft blue-purple gradient
- Secondary: Warm peach/coral accents
- Background: Subtle gradient from light blue to lavender
- Rationale: Creates warm, welcoming atmosphere

**Layout Paradigm:**
- Centered card-based layout
- Floating panels with glassmorphism effect
- Asymmetric positioning of elements for visual interest

**Signature Elements:**
1. Glassmorphic cards with backdrop blur
2. Rounded corners (20-24px radius)
3. Soft gradient backgrounds in sections
4. Floating action buttons with shadows

**Interaction Philosophy:**
- Playful micro-interactions on hover
- Smooth scale animations on buttons
- Delightful feedback animations

**Animation:**
- Bounce effect on button clicks
- Floating animation for cards
- Gradient shift on hover
- Staggered fade-in for list items

**Typography System:**
- Display: Poppins Bold (26-32px) for headings
- Body: Poppins Regular (15-17px)
- Monospace: Fira Code for subtitle content

---

## Design Approach 3: Professional & Sophisticated (Probability: 0.09)

**Design Movement:** Premium SaaS / Enterprise Design
- Elegant typography with careful hierarchy
- Sophisticated color palette with metallic accents
- Professional yet approachable aesthetic

**Core Principles:**
1. **Sophistication**: Premium, polished appearance
2. **Trust & Reliability**: Professional design language
3. **Elegant Simplicity**: Complex features presented simply
4. **Refined Details**: Attention to micro-interactions

**Color Philosophy:**
- Primary: Deep navy blue (trust, professionalism)
- Secondary: Gold/amber accents (premium feel)
- Background: Off-white with subtle texture
- Rationale: Conveys professionalism and reliability

**Layout Paradigm:**
- Sidebar navigation on left
- Main content area with clear sections
- Hierarchical card-based layout
- Ample padding and breathing room

**Signature Elements:**
1. Elegant dividers with subtle gradients
2. Premium typography with varied weights
3. Subtle background texture (noise/grain)
4. Gold accent lines and borders

**Interaction Philosophy:**
- Refined hover states with color shifts
- Smooth, purposeful animations
- Clear visual feedback without being playful

**Animation:**
- Smooth slide transitions between sections
- Subtle scale on interactive elements
- Fade-in with slight delay for staggered appearance
- Smooth color transitions (300ms)

**Typography System:**
- Display: Playfair Display Bold (28-36px) for headings
- Body: Lato Regular (15-17px)
- Monospace: IBM Plex Mono for subtitle content

---

## Selected Design Approach: **Professional & Sophisticated**

We will implement **Design Approach 3** - Professional & Sophisticated SaaS style. This approach is most suitable for a subtitle tool because:

1. **Trust**: Users are uploading files and expecting reliable processing
2. **Clarity**: Professional design helps users understand the workflow
3. **Premium Feel**: Elevates the tool's perceived quality
4. **Accessibility**: Clear hierarchy aids usability

### Implementation Details:

**Color Palette:**
- Primary Blue: `#1a3a52` (deep navy)
- Accent Gold: `#d4a574` (warm amber)
- Background: `#f9f8f6` (off-white)
- Text: `#2d3e50` (dark slate)
- Border: `#e0dcd8` (light gray)

**Typography:**
- Headings: Playfair Display (Google Fonts)
- Body: Lato (Google Fonts)
- Code: IBM Plex Mono (Google Fonts)

**Key Design Elements:**
- Sidebar navigation with gold accents
- Elegant card-based sections
- Subtle texture background
- Refined hover states
- Premium spacing and padding

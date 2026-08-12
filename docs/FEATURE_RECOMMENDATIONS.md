# Mixwise Feature Recommendations

**Date**: January 2026  
**Goal**: Improve UX, user stickiness, and overall value

Based on analysis of the current Mixwise platform, here are strategic feature recommendations organized by impact and implementation complexity.

---

## 🎯 High Impact / Quick Wins

These features can be implemented relatively quickly and have significant impact on user engagement.

### 1. **Recipe Notes & Personal Adjustments**
**Impact**: ⭐⭐⭐⭐⭐ | **Complexity**: Medium | **Stickiness**: High

**What**: Allow users to add personal notes to recipes and save custom variations (e.g., "less simple syrup", "add mint", "shaken not stirred").

**Why**: 
- Personal investment in recipes increases return visits
- Users love documenting what works for them
- Creates unique value that competitors don't offer

**Implementation**:
- New table: `recipe_notes` (user_id, cocktail_id, notes, adjustments JSON)
- Add note icon/button on recipe pages
- Modal or inline editor for notes
- Display user's notes prominently on recipe pages

**User Flow**:
```
User views recipe → Clicks "Add Note" → Types adjustment → Saves → Note appears on recipe
```

---

### 2. **"Last Made" Tracking & History**
**Impact**: ⭐⭐⭐⭐ | **Complexity**: Low | **Stickiness**: Medium-High

**What**: Track when users make cocktails (manual entry or "I Made This" button), show history, and suggest revisiting favorites they haven't made recently.

**Why**:
- Creates habit loops (users see what they made last week/month)
- Provides social proof ("You made this 3 times!")
- Enables personalized recommendations based on activity

**Implementation**:
- New table: `cocktail_history` (user_id, cocktail_id, made_at, rating?)
- Simple "I Made This" button on recipe pages
- Dashboard section: "Recently Made" and "Make Again?"
- Optional: Calendar view of cocktail making activity

---

### 3. **Smart Shopping List Enhancements**
**Impact**: ⭐⭐⭐⭐ | **Complexity**: Medium | **Stickiness**: Medium-High

**What**: Enhance the existing shopping list with:
- **Store location hints** (e.g., "Usually in produce section")
- **Quantity suggestions** (e.g., "Buy 750ml bottle")
- **Price tracking** (optional, user-entered)
- **Bulk add from "Almost There" cocktails** (already partially implemented)
- **Shopping list export** (text, PDF, or shareable link)

**Why**:
- Makes shopping list actionable, not just informational
- Reduces friction in the "discovery → shopping → making" loop
- Store hints reduce decision fatigue at the store

**Implementation**:
- Extend `shopping_list` table with optional fields
- Add ingredient metadata (category, typical location)
- Export functionality (generate text/PDF)
- Bulk add from dashboard "Almost There" section

---

### 4. **Cocktail Collections (User-Created)**
**Impact**: ⭐⭐⭐⭐ | **Complexity**: Medium | **Stickiness**: High

**What**: Allow users to create and share custom collections (e.g., "Summer BBQ Cocktails", "Holiday Party Drinks", "Low-ABV Options").

**Why**:
- User-generated content increases engagement
- Shareable collections create viral loops
- Perfect for events/occasions (birthdays, holidays)
- Collections are highly searchable/discoverable

**Implementation**:
- Extend existing collections system (you already have curated collections)
- New table: `user_collections` (user_id, name, description, is_public, cocktail_ids JSON)
- Collection creation UI
- Public collection discovery page
- Share buttons (URLs, social)

**Note**: You already have a collections system - this extends it to user-created ones.

---

### 5. **Ingredient Expiration/Inventory Tracking**
**Impact**: ⭐⭐⭐⭐ | **Complexity**: Medium-High | **Stickiness**: High

**What**: Let users track when they bought ingredients and get reminders to use them (e.g., "Your vermouth expires in 3 days - make a Manhattan!").

**Why**:
- Practical utility that solves real problems
- Creates return visits (expiration notifications)
- Reduces waste, increases user satisfaction
- Encourages more frequent cocktail making

**Implementation**:
- Extend `bar_ingredients` with optional `purchased_at`, `expires_at`, `quantity`
- Ingredient database with typical shelf life
- Dashboard alerts for expiring ingredients
- "Use Before" recommendations on dashboard
- Optional: Photo upload for bottles (advanced)

---

## 🎮 Engagement & Retention

Features that create habitual usage and increase lifetime value.

### 6. **Daily/Weekly Challenges**
**Impact**: ⭐⭐⭐⭐ | **Complexity**: Medium | **Stickiness**: High

**What**: Daily or weekly cocktail challenges (e.g., "Make a cocktail with gin and citrus", "Try a new technique this week", "Make 3 cocktails this weekend").

**Why**:
- Creates consistent engagement (users check back for challenges)
- Builds skills and confidence
- Gamification increases completion rates
- Shareable achievements (social proof)

**Implementation**:
- New table: `challenges` (type, description, requirements, start_date, end_date)
- New table: `user_challenge_completions` (user_id, challenge_id, completed_at, proof_image?)
- Dashboard widget showing current challenge
- Badge rewards for completing challenges
- Leaderboard (optional, for competitive users)

---

### 7. **Cocktail Planning/Meal Planning Integration**
**Impact**: ⭐⭐⭐ | **Complexity**: Medium-High | **Stickiness**: Medium-High

**What**: Plan cocktails for the week/month, pair with meals, create "drink menus" for events.

**Why**:
- Integrates cocktail making into broader lifestyle
- Useful for entertaining/events
- Encourages bulk shopping (better margins for users)
- Creates forward-looking engagement (planning future sessions)

**Implementation**:
- New table: `cocktail_plans` (user_id, date, cocktail_id, meal_pairing, notes)
- Calendar view of planned cocktails
- Meal pairing suggestions (based on cocktail profiles)
- Event planning templates (birthday, dinner party, etc.)
- Shopping list generation from plans

---

### 8. **Personalized Recipe Recommendations Engine**
**Impact**: ⭐⭐⭐⭐⭐ | **Complexity**: High | **Stickiness**: Very High

**What**: ML-powered recommendations based on:
- Previously made/favorited cocktails
- Bar ingredients
- Time of day/season
- User preferences (spirit preferences, difficulty level, flavor profiles)

**Why**:
- Personalized content dramatically increases engagement
- Reduces decision paralysis
- Surfaces hidden gems users might not discover
- Creates "wow" moments when recommendations are perfect

**Implementation**:
- Build recommendation algorithm (collaborative filtering + content-based)
- Track user preferences (implicit: views, favorites, makes; explicit: ratings)
- Dashboard section: "Recommended For You"
- Recipe page: "You might also like" (enhance existing similar recipes)
- Weekly email with personalized picks

**Current State**: You have basic similar recipes - this elevates it to true personalization.

---

### 9. **Cocktail Journal/Diary**
**Impact**: ⭐⭐⭐ | **Complexity**: Medium | **Stickiness**: Medium

**What**: Let users keep a journal of cocktails they've made with photos, ratings, notes, and tags.

**Why**:
- Creates emotional connection (memories)
- Encourages experimentation
- Beautiful shareable content
- Builds a personal cocktail library

**Implementation**:
- Extend `cocktail_history` with photos, detailed notes, tags
- Photo upload (Supabase Storage)
- Journal view (timeline, grid, or list)
- Export/print journal entries
- Optional: Social sharing of journal entries

---

## 👥 Social & Community

Features that create network effects and community engagement.

### 10. **User Reviews & Ratings (Enhanced)**
**Impact**: ⭐⭐⭐⭐ | **Complexity**: Medium | **Stickiness**: Medium-High

**What**: Expand ratings to full reviews with:
- Written reviews
- Photo uploads (users showing their cocktails)
- Helpful/not helpful votes
- Review filtering (by rating, date, verified makers)

**Why**:
- User-generated content increases SEO
- Social proof increases conversion (users trust peer reviews)
- Creates community engagement
- Reviews provide feedback loop for recipe improvements

**Implementation**:
- Extend ratings system (you already have ratings)
- New table: `cocktail_reviews` (user_id, cocktail_id, rating, review_text, photo_url, helpful_count)
- Review display on recipe pages
- Photo upload to Supabase Storage
- Review moderation (admin approval, or auto-approve)

---

### 11. **Follow Other Mixologists**
**Impact**: ⭐⭐⭐⭐ | **Complexity**: Medium | **Stickiness**: High

**What**: Let users follow other users, see their activity (favorites, collections, reviews), and get a feed of their discoveries.

**Why**:
- Social features dramatically increase engagement
- Creates influencer opportunities
- Users discover new cocktails through others
- Network effects (more users = more value)

**Implementation**:
- New table: `user_follows` (follower_id, followee_id)
- User profiles (public view)
- Activity feed (favorites, reviews, collections)
- Dashboard section: "Following" feed
- Optional: Notifications when followed users add favorites/reviews

---

### 12. **Community Challenges & Competitions**
**Impact**: ⭐⭐⭐ | **Complexity**: Medium-High | **Stickiness**: Medium-High

**What**: Monthly community challenges (e.g., "Best Margarita Variation", "Most Creative Garnish") with voting and winners.

**Why**:
- Creates excitement and FOMO
- User-generated content (photos, recipes)
- Builds brand loyalty
- Shareable content (winners, entries)

**Implementation**:
- Challenge system (extend #6)
- Photo submission
- Voting mechanism
- Leaderboard and winners
- Email notifications for challenge launches/results

---

## 🔧 Advanced Features

Complex features with high value for power users.

### 13. **Recipe Scaling Calculator**
**Impact**: ⭐⭐⭐ | **Complexity**: Low-Medium | **Stickiness**: Medium

**What**: Scale recipes up/down (e.g., make 4 servings, or scale to available ingredient quantities).

**Why**:
- Practical utility for parties/events
- Reduces waste (scale to what you have)
- Professional feature that sets you apart

**Implementation**:
- Client-side calculator on recipe pages
- Ingredient quantity math (proportions)
- Batch scaling (make 8 servings)
- Save scaled versions to notes

---

### 14. **Substitution Suggestions**
**Impact**: ⭐⭐⭐⭐ | **Complexity**: High | **Stickiness**: Medium-High

**What**: When a user is missing an ingredient, suggest substitutions (e.g., "Use Cointreau instead of Triple Sec", "Lemon juice works as a substitute for lime").

**Why**:
- Reduces friction (users can make cocktails with what they have)
- Educational (teaches ingredient relationships)
- Increases "ready to make" cocktail count

**Implementation**:
- Ingredient substitution database (manual curation or ML)
- Show substitutions in "Almost There" cocktails
- Substitution picker UI (select which substitution to use)
- Update recipe display with substituted ingredient

**Current State**: You show missing ingredients - this adds "what can I use instead?"

---

### 15. **Advanced Search & Filtering**
**Impact**: ⭐⭐⭐ | **Complexity**: Medium | **Stickiness**: Low-Medium

**What**: Enhanced search with:
- Multiple filters (spirit + technique + difficulty + glass + occasion)
- Saved searches
- Search by flavor profile (sweet, sour, bitter, strong, weak)
- Search by ingredients you have/don't have

**Why**:
- Power users love advanced search
- Reduces time to find recipes
- Better discovery for specific needs

**Implementation**:
- Enhanced filter UI on cocktails page
- Filter state management
- Saved searches (user preferences)
- Flavor profile tagging (needs ingredient/cocktail metadata)

---

### 16. **Bar Inventory Analytics**
**Impact**: ⭐⭐⭐ | **Complexity**: Medium | **Stickiness**: Medium

**What**: Dashboard insights:
- "You have $X worth of ingredients"
- "Most versatile ingredient" (used in most cocktails)
- "Underutilized ingredients" (in bar but rarely used)
- "Cocktails per dollar" (efficiency metric)

**Why**:
- Fun insights increase engagement
- Helps users optimize their bar
- Educational (shows ingredient value)

**Implementation**:
- Analytics queries (aggregate user bar data)
- Dashboard widgets with insights
- Optional: Price tracking (user-entered or API integration)

---

### 17. **Recipe Cost Calculator**
**Impact**: ⭐⭐⭐ | **Complexity**: Medium-High | **Stickiness**: Low-Medium

**What**: Calculate cost per cocktail based on ingredient prices (user-entered or average prices).

**Why**:
- Practical utility (users want to know cost)
- Helps with budgeting
- Comparison tool (which cocktails are cheaper?)

**Implementation**:
- User-entered ingredient prices (stored in bar_ingredients)
- Recipe cost calculation (sum of ingredient costs per serving)
- Display on recipe pages
- Optional: Average price database (scraping or manual)

---

## 🎓 Educational & Skill Building

Features that help users learn and improve.

### 18. **Technique Tutorials & Videos**
**Impact**: ⭐⭐⭐⭐ | **Complexity**: Medium-High | **Stickiness**: High

**What**: Embedded tutorials for techniques (shaking, stirring, muddling, garnishing) with videos or step-by-step guides.

**Why**:
- Educational content increases value perception
- Reduces intimidation (users learn skills)
- Increases recipe success rate
- SEO value (tutorial content ranks well)

**Implementation**:
- Technique database (stored in Sanity)
- Video embedding (YouTube/Vimeo)
- Tutorial pages
- Link techniques to recipes (show technique on recipe page)
- Optional: User progress tracking (which techniques have they learned?)

---

### 19. **Ingredient Education Pages**
**Impact**: ⭐⭐⭐ | **Complexity**: Low-Medium | **Stickiness**: Medium

**What**: Rich ingredient pages with:
- History/background
- Flavor profile
- Common uses
- Storage tips
- Substitution suggestions
- Popular cocktails using this ingredient

**Why**:
- Educational content builds authority
- Increases time on site
- Helps users understand ingredients better
- SEO value (ingredient pages rank well)

**Implementation**:
- Enhance existing ingredient pages (you have ingredient pages)
- Add rich content (history, flavor profile)
- Link to cocktails using ingredient
- Optional: User-generated content (tips, experiences)

---

### 20. **Progressive Skill Building**
**Impact**: ⭐⭐⭐ | **Complexity**: Medium | **Stickiness**: Medium-High

**What**: Track user progress through difficulty levels, unlock advanced recipes as they master basics, suggest next challenges.

**Why**:
- Gamification increases engagement
- Reduces overwhelm (structured learning path)
- Builds confidence
- Creates long-term engagement

**Implementation**:
- Track cocktails made by difficulty level
- Progress badges (Novice, Intermediate, Advanced, Expert)
- Unlock system (advanced recipes locked until basics completed)
- Dashboard progress tracker

---

## 📱 Mobile & Convenience

Features that improve mobile experience and accessibility.

### 21. **Progressive Web App (PWA)**
**Impact**: ⭐⭐⭐⭐ | **Complexity**: Medium | **Stickiness**: High

**What**: Make Mixwise installable as a PWA with offline recipe access.

**Why**:
- Better mobile experience (app-like feel)
- Offline access (recipes work without internet - crucial in kitchen)
- Increased engagement (home screen icon = more visits)
- Reduces friction (no app store needed)

**Implementation**:
- Service worker for offline caching
- Web app manifest
- Install prompt
- Offline recipe storage (IndexedDB)
- Push notifications (optional, for challenges/reminders)

---

### 22. **Voice Commands (Alexa/Google Home)**
**Impact**: ⭐⭐⭐ | **Complexity**: High | **Stickiness**: Medium

**What**: "Alexa, how do I make a Margarita?" or "Hey Google, what cocktails can I make?"

**Why**:
- Hands-free in kitchen (practical utility)
- Unique feature (competitors don't have this)
- Increases accessibility
- Brand awareness (voice assistants are growing)

**Implementation**:
- Alexa Skill / Google Action
- API endpoints for voice queries
- Natural language processing
- Recipe voice responses

---

### 23. **QR Code Recipe Sharing**
**Impact**: ⭐⭐⭐ | **Complexity**: Low | **Stickiness**: Low-Medium

**What**: Generate QR codes for recipes that users can print or share.

**Why**:
- Physical sharing (party menus, printed recipes)
- Reduces friction (scan to view)
- Brand visibility (QR codes in the wild)
- Useful for events

**Implementation**:
- QR code generation library
- Recipe page: "Generate QR Code" button
- Print-friendly recipe view
- Optional: Custom QR codes with branding

---

## 💰 Monetization-Friendly Features

Features that create value while supporting potential monetization.

### 24. **Premium Features Tier**
**Impact**: ⭐⭐⭐⭐⭐ | **Complexity**: Varies | **Stickiness**: Very High

**Suggested Premium Features**:
- Unlimited collections (free: 3 collections)
- Advanced analytics (bar inventory insights, cost tracking)
- Ad-free experience
- Early access to new features
- Premium badge/status
- Priority support
- Export recipes (PDF, print)
- Unlimited recipe notes
- Custom recipe creation (user-created recipes)

**Why**:
- Creates revenue stream
- Free tier remains valuable
- Premium tier adds clear value
- Common pattern users understand

**Implementation**:
- User tier tracking (already have `role` field: 'free', 'paid', 'admin')
- Feature gating (check role before showing premium features)
- Pricing page
- Payment integration (Stripe)

---

### 25. **Affiliate Ingredient Links**
**Impact**: ⭐⭐⭐ | **Complexity**: Medium | **Stickiness**: Low

**What**: Link to purchase ingredients online (Drizly, Total Wine, Amazon) with affiliate links.

**Why**:
- Revenue stream (affiliate commissions)
- User convenience (one-click shopping)
- Reduces friction (direct path to purchase)
- Win-win (users get convenience, you get revenue)

**Implementation**:
- Affiliate link database (store links for ingredients)
- "Buy Ingredients" button on recipes/shopping list
- Tracking (affiliate IDs, clicks)
- Optional: Price comparison

---

## 🎯 Implementation Priority Recommendations

Based on impact, stickiness, and implementation complexity, here's a suggested roadmap:

### Phase 1: Quick Wins (1-2 months)
1. Recipe Notes & Personal Adjustments
2. "Last Made" Tracking & History
3. Smart Shopping List Enhancements
4. User-Created Collections

### Phase 2: Engagement Boost (2-3 months)
5. Daily/Weekly Challenges
6. Enhanced Recommendations Engine
7. User Reviews & Ratings (Enhanced)
8. Ingredient Expiration Tracking

### Phase 3: Community & Social (3-4 months)
9. Follow Other Mixologists
10. Community Challenges
11. Recipe Scaling Calculator
12. Substitution Suggestions

### Phase 4: Advanced & Premium (4-6 months)
13. Technique Tutorials
14. PWA
15. Premium Features Tier
16. Bar Inventory Analytics

---

## 📊 Success Metrics to Track

For each feature, track:
- **Engagement**: DAU/MAU, time on site, pages per session
- **Stickiness**: Return visits, feature usage rate
- **Conversion**: Free → Premium (if applicable)
- **Retention**: 7-day, 30-day, 90-day retention
- **Viral**: Shares, collections created, reviews written
- **Value**: User satisfaction (surveys), NPS

---

## 🎨 Design Principles

When implementing features:
1. **Mobile-first**: Most users will use this on phones in the kitchen
2. **Progressive disclosure**: Don't overwhelm - show advanced features when needed
3. **Personalization**: Make it feel like "my Mixwise"
4. **Social proof**: Show what others are doing (reviews, favorites, collections)
5. **Gamification**: Use badges, challenges, progress tracking (but don't overdo it)
6. **Practical utility**: Solve real problems (shopping, planning, tracking)

---

## 💡 Final Thoughts

**Current Strengths**:
- Solid foundation (190+ recipes, good UX, working auth)
- Strong core features (Mix tool, favorites, shopping list)
- Good technical architecture (Next.js, Supabase, Sanity)

**Key Opportunities**:
- **Personalization**: Turn generic into personalized
- **Community**: Add social features to increase engagement
- **Utility**: Solve practical problems (expiration, planning, scaling)
- **Education**: Help users learn and improve

**Recommended Starting Point**:
Start with **Recipe Notes** and **Last Made Tracking** - these are quick to implement, highly sticky, and create immediate value. Then move to **Smart Shopping List Enhancements** and **User-Created Collections** to build engagement.

The biggest opportunity is **personalization** - your recommendation engine could be a key differentiator if done well.

---

*This document is a living guide - prioritize based on user feedback, analytics, and business goals.*

